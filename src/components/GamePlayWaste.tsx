import { useEffect, useState, type ReactNode } from 'react';
import { useDraggable, type UniqueIdentifier } from '@dnd-kit/core';
import { Waste } from '../data/waste';
import { useConveyItems } from '../contexts/ConveyItems';
import type { ConveyItem, WasteDef } from '../types/game';
import './GamePlayWaste.css';

interface DraggableItemProps {
  id: UniqueIdentifier;
  children: ReactNode;
  baseX: number;
  baseY: number;
}

// 1．ドラッグできるコンポーネント
const DraggableItem = ({ id, children, baseX, baseY }: DraggableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
  });
  const [fixedDragBaseX, setFixedDragBaseX] = useState<number | null>(null);

  useEffect(() => {
    if (isDragging && fixedDragBaseX === null) {
      setFixedDragBaseX(baseX);
    } else if (!isDragging && fixedDragBaseX !== null) {
      setFixedDragBaseX(null);
    }
  }, [isDragging, fixedDragBaseX, baseX]);

  const currentLeft = isDragging && fixedDragBaseX !== null ? fixedDragBaseX : baseX;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${currentLeft}px`,
    top: `calc(50% + ${baseY}px)`,
    transform: transform
      ? `translate3d(${transform.x}px, calc(-50% + ${transform.y}px), 0)`
      : 'translateY(-50%)',
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
  baseX: number;
  baseY: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
}

const GamePlayWaste = ({ id, label, parts, isSimple, baseX, baseY, setScore }: GamePlayWasteProps) => {
  const { conveyItems, setConveyItems } = useConveyItems();
  const currentItem = conveyItems.find((item: ConveyItem) => item.id === id);
  const wasteDef = currentItem?.def;

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

    const elapsedMs = Date.now() - currentItem.startedAt;
    const progress = Math.min(1, elapsedMs / currentItem.travelMs);
    const currentX = currentItem.coordinateX + (currentItem.toX - currentItem.coordinateX) * progress;
    const remainingTravelMs = Math.max(0, currentItem.travelMs - elapsedMs);

    setScore((prevScore: number) => prevScore + currentItem.def.score);

    const separatedItems: ConveyItem[] = [
      {
        id: Date.now() + Math.random(),
        def: selectedPartDef,
        coordinateX: currentX,
        coordinateY: currentItem.coordinateY - 12,
        toX: currentItem.toX,
        travelMs: remainingTravelMs,
        startedAt: Date.now(),
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
          coordinateX: currentX,
          coordinateY: currentItem.coordinateY + 12,
          toX: currentItem.toX,
          travelMs: remainingTravelMs,
          startedAt: Date.now(),
        });
      }
    }

    setConveyItems((prevItems: ConveyItem[]) =>
      prevItems.filter((item: ConveyItem) => item.id !== currentItem.id).concat(separatedItems)
    );
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
    <DraggableItem id={id} baseX={baseX} baseY={baseY}>
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
                onClick={(event) => {
                  event.stopPropagation();
                  handleSeparate(partKey);
                }}
              >
                {isImg ? (
                  <img src={`/${matchedWaste.img}`} alt={matchedWaste.label} className="waste-image" style={{ width: 100, height: 100 }} />
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
