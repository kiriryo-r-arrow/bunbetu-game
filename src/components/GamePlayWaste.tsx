import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useDraggable, type UniqueIdentifier } from '@dnd-kit/core';
import { Waste } from '../data/waste';
import { useConveyItems } from '../contexts/ConveyItems';
import { LANE_OFFSET_STEP } from '../data/layout';
import type { ConveyItem, WasteDef } from '../types/game';
import './GamePlayWaste.css';

/** タップとドラッグを判別する移動量のしきい値(px) */
const TAP_SLOP_PX = 8;

interface DraggableItemProps {
  id: UniqueIdentifier;
  children: ReactNode;
  /** 0 = ベルト右端の外側 / 1 = ベルト左端の外側 */
  progress: number;
  /** ベルト面高さに対する縦方向オフセット(%) */
  laneOffset: number;
}

// 1．ドラッグできるコンポーネント
const DraggableItem = ({ id, children, progress, laneOffset }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  });
  // ドラッグ中はベルトの進行を止めて見せる（指から位置が逃げないように）
  const [frozenProgress, setFrozenProgress] = useState<number | null>(null);

  useEffect(() => {
    if (isDragging && frozenProgress === null) {
      setFrozenProgress(progress);
    } else if (!isDragging && frozenProgress !== null) {
      setFrozenProgress(null);
    }
  }, [isDragging, frozenProgress, progress]);

  const p = isDragging && frozenProgress !== null ? frozenProgress : progress;

  /*
   * 割合ベースの座標計算。
   *   left        : 親(ベルト面)の幅に対する %
   *   translateX  : 自分自身の幅に対する %
   * この 2 つを組み合わせることで、
   *   p = 0 … 要素の左端がベルトの右端に一致（完全に画面外）
   *   p = 1 … 要素の右端がベルトの左端に一致（完全に画面外）
   * となり、画面幅が何 px でも必ず「右端外 → 左端外」を完走する。
   * JS 側で画面幅を測る必要がないため、リサイズ・端末回転にも自動追従する。
   */
  const leftPercent = (1 - p) * 100;
  const selfShiftPercent = -p * 100;

  const translateX = transform
    ? `calc(${selfShiftPercent}% + ${transform.x}px)`
    : `${selfShiftPercent}%`;
  const translateY = transform ? `calc(-50% + ${transform.y}px)` : '-50%';

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${leftPercent}%`,
    top: `${50 + laneOffset}%`,
    transform: `translate3d(${translateX}, ${translateY}, 0)`,
    zIndex: isDragging ? 1000 : 10,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="draggable-waste-container">
      {children}
    </div>
  );
};

interface GamePlayWasteProps {
  id: UniqueIdentifier;
  label: string;
  parts: string[];
  isSimple: boolean;
  progress: number;
  laneOffset: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const GamePlayWaste = ({ id, label, parts, isSimple, progress, laneOffset, setScore }: GamePlayWasteProps) => {
  const { conveyItems, setConveyItems } = useConveyItems();
  const currentItem = conveyItems.find((item: ConveyItem) => item.id === id);
  const wasteDef = currentItem?.def;
  // タップ開始位置。ドラッグとの競合を避けるため、移動量が小さいときだけ分解とみなす。
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleSeparate = (partKey: string) => {
    if (isSimple) {
      return;
    }

    if (!currentItem) {
      return;
    }

    const selectedPartDef = Waste.find((item: WasteDef) => item.key === partKey);
    if (!selectedPartDef) {
      return;
    }

    setScore((prevScore: number) => prevScore + currentItem.def.score);

    /*
     * 分解後の 2 片は、親の startedAt / travelMs をそのまま引き継ぐ。
     * 進行度は時間だけで決まるので、これだけで分解地点から途切れずに流れ続ける。
     */
    const separatedItems: ConveyItem[] = [
      {
        id: Date.now() + Math.random(),
        def: selectedPartDef,
        laneOffset: currentItem.laneOffset - LANE_OFFSET_STEP,
        travelMs: currentItem.travelMs,
        startedAt: currentItem.startedAt,
      },
    ];

    const remainingParts = currentItem.def.parts.filter((part: string) => part !== partKey);
    if (remainingParts.length > 0) {
      const combinedKey = [
        ...remainingParts,
        ...(currentItem.def.isWash ? ['drink'] : []),
      ].join('_');
      const remainingDef = Waste.find((item: WasteDef) => item.key === combinedKey);
      if (remainingDef) {
        separatedItems.push({
          id: Date.now() + Math.random(),
          def: remainingDef,
          laneOffset: currentItem.laneOffset + LANE_OFFSET_STEP,
          travelMs: currentItem.travelMs,
          startedAt: currentItem.startedAt,
        });
      }
    }

    setConveyItems((prevItems: ConveyItem[]) =>
      prevItems.filter((item: ConveyItem) => item.id !== currentItem.id).concat(separatedItems)
    );
  };

  const handlePartPointerDown = (event: React.PointerEvent) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY };
  };

  const handlePartPointerUp = (event: React.PointerEvent, partKey: string) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start) {
      return;
    }

    // 指が動いていればドラッグ操作とみなし、分解しない
    const movedX = Math.abs(event.clientX - start.x);
    const movedY = Math.abs(event.clientY - start.y);
    if (movedX > TAP_SLOP_PX || movedY > TAP_SLOP_PX) {
      return;
    }

    event.stopPropagation();
    handleSeparate(partKey);
  };

  const renderVisual = () => {
    if (!wasteDef) {
      return <div className="waste-label-tag">{label}</div>;
    }

    const isImageFile = wasteDef.img && (wasteDef.img.endsWith('.png') || wasteDef.img.endsWith('.jpg') || wasteDef.img.endsWith('.jpeg') || wasteDef.img.endsWith('.svg'));

    if (isImageFile) {
      return (
        <img
          src={`/${wasteDef.img}`}
          alt={wasteDef.label}
          className="waste-image"
        />
      );
    }

    if (wasteDef.img && wasteDef.img !== 'ここに挿入') {
      return <span className="waste-emoji">{wasteDef.img}</span>;
    }

    return <div className="waste-label-tag">{wasteDef.label}</div>;
  };

  return (
    <DraggableItem id={id} progress={progress} laneOffset={laneOffset}>
      {isSimple ? (
        renderVisual()
      ) : (
        <div className="waste-parts-container">
          {parts.map((partKey: string, index: number) => {
            const matchedWaste = Waste.find((item: WasteDef) => item.key === partKey);
            const isImg = matchedWaste?.img && (matchedWaste.img.endsWith('.png') || matchedWaste.img.endsWith('.jpg'));

            return (
              <div
                key={`${partKey}-${index}`}
                className="waste-part-chip"
                onPointerDown={handlePartPointerDown}
                onPointerUp={(event) => handlePartPointerUp(event, partKey)}
              >
                {isImg ? (
                  <img src={`/${matchedWaste.img}`} alt={matchedWaste.label} className="waste-image waste-part-image" />
                ) : (
                  <span>{matchedWaste?.img && matchedWaste.img !== 'ここに挿入' ? matchedWaste.img : matchedWaste?.label ?? partKey}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DraggableItem>
  );
};

export default GamePlayWaste;
