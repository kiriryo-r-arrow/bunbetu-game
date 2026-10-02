import { useState, useEffect } from "react";
import GamePlayBin from "./GamePlayBin";
import GamePlaySink from "./GamePlaySink";
import { DndContext, rectIntersection, useSensor, useSensors, PointerSensor, type DragOverEvent, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { BINS } from "../data/bins";
import { GAME_LEVEL_PARAMETER_DATA } from "../data/difficulty";
import GamePlayConveyor from "./GamePlayConveyor";
import { useConveyItems, ConveyItemsProvider } from "../contexts/ConveyItems";

import { Waste } from "../data/waste";
import type { BackgroundType, BinDef, ConveyItem, FeedBack, GameLevelParameter, GameStatus, WasteDef } from "../types/game";

import { SPECIAL_FEEDBACK_MESSAGES, type SpecialFeedbackMessage } from "../data/feedback";
import { useGameSound } from "../contexts/SoundContext";

import './GamePlay.css';

type GamePlayProps = {
  gameProgress: GameStatus;
  setFeedBackItem: React.Dispatch<React.SetStateAction<FeedBack | undefined>>;
  setGameProgress: React.Dispatch<React.SetStateAction<GameStatus>>;
  setControlBackground: React.Dispatch<React.SetStateAction<BackgroundType>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  gameLevel: number;
};

// 指定した範囲 of ランダムな整数を生成する関数
const getRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const GamePlayContent = (props: GamePlayProps) => {
  const { gameProgress, setFeedBackItem, setHealth, setScore, gameLevel } = props;
  const { conveyItems, setConveyItems } = useConveyItems();
  const { playSE } = useGameSound();
  const [activeOver, setActiveOver] = useState<UniqueIdentifier | null>(null); // 現在ドラッグ中で重なっている領域をハイライトするために管理

  // ゲーム終了時またはスタート画面への遷移時に conveyItems をリセット
  useEffect(() => {
    if (gameProgress === "end" || gameProgress === "start") {
      setConveyItems([]);
    }
  }, [gameProgress, setConveyItems]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // ドラッグ中のリアルタイム判定（ハイライト & 洗浄処理）
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    setActiveOver(over ? over.id : null);

    if (over && over.id === 'sink' && active) {
      const activeItem = conveyItems.find((item: ConveyItem) => item.id === active.id);
      if (activeItem && activeItem.def.isWash && activeItem.def.washTargetKey) {
        const targetDef = Waste.find((w: WasteDef) => w.key === activeItem.def.washTargetKey);
        if (targetDef) {
          setConveyItems((prevItems: ConveyItem[]) =>
            prevItems.map((item: ConveyItem) =>
              item.id === active.id
                ? { ...item, def: targetDef }
                : item
            )
          );
        }
      }
    }
  };

  // ドラッグ終了時の処理（確定処理）
  const handleDragEnd = (_event: DragEndEvent) => {
    // ハイライト状態をリセット
    setActiveOver(null);
    const { active, over } = _event;
    if (!active || !over) {
      return;
    }

    // シンクの上にドロップされた場合は分別ではないため処理を終了（洗浄された状態で維持）
    if (over.id === 'sink') {
      return;
    }

    const activeItem = conveyItems.find((item: ConveyItem) => item.id === active.id);
    if (!activeItem) {
      return;
    }

    // item の bin とドロップ先の id が一致すれば正解とみなし、アイテムを削除
    if (activeItem.def.bin === over.id) {
      setScore((prevScore: number) => prevScore + activeItem.def.score);
      setConveyItems((prevItems: ConveyItem[]) => prevItems.filter((item: ConveyItem) => item.id !== active.id));
      playSE('correct');
    } else {
      setHealth((prevHealth: number) => Math.max(0, prevHealth - 1));
      playSE('incorrect');

      const feedBackId = activeItem.def.feedBackId ?? 'simple_mistake';
      const binInfo = BINS.find((b: BinDef) => b.id === activeItem.def.bin);
      const whereText = binInfo ? binInfo.label : activeItem.def.bin;

      let specialMessage = "";
      if (feedBackId !== 'simple_mistake') {
        const matchedMsg = SPECIAL_FEEDBACK_MESSAGES.find(
          (msg: SpecialFeedbackMessage) => msg.feedBackId === feedBackId
        );
        if (matchedMsg) {
          specialMessage = matchedMsg.message;
        }
      }
      setFeedBackItem({
        id: feedBackId,
        who: activeItem.def.label,
        where: whereText,
        special_message: specialMessage,
        wasteImg: activeItem.def.img,
        binImg: binInfo ? binInfo.img : undefined,
      });
    }
  };

  useEffect(() => {
    if (gameProgress !== "playing") {
      return;
    }

    const levelNum = gameLevel;
    const currentParam = GAME_LEVEL_PARAMETER_DATA.find((p: GameLevelParameter) => p.level === levelNum) ?? GAME_LEVEL_PARAMETER_DATA[0];

    // 出現可能なゴミ一覧（wasteLevel 以下に絞り込み）
    const availableWastes = Waste.filter((w: WasteDef) => w.wasteLevel <= currentParam.wasteLevel);
    const wasteList = availableWastes.length > 0 ? availableWastes : Waste;

    const intervalId = setInterval(() => {
      const itemId = Date.now() + Math.random();
      const itemY = 0;
      const index = getRandomNumber(0, wasteList.length - 1);
      const travelMs = Math.round(10000 / currentParam.wasteSpeed);

      const newItem: ConveyItem = {
        id: itemId, // 重複を避けるために一意のIDを生成
        def: wasteList[index],
        coordinateX: 980,
        coordinateY: itemY,
        toX: -100,
        travelMs: travelMs, // スピードに応じた移動ミリ秒
        startedAt: Date.now(),
      };

      setConveyItems((prevItems: ConveyItem[]) => [...prevItems, newItem]);
    }, currentParam.itemInterval * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [gameProgress, gameLevel, setConveyItems]);

  return (
    <div className="game-play-container">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="game-play-main-area">
          <div className="conveyor-section">
            <div className="sink-wrapper">
              <GamePlaySink isOver={activeOver === 'sink'} />
            </div>
            <GamePlayConveyor setHealth={setHealth} setScore={setScore} />
          </div>
        </div>

        <div className="bottom-bins-bar">
          <div className="bins-container">
            <div className="bins-grid">
              {BINS.map((bin: BinDef) => {
                return (
                  <GamePlayBin
                    key={bin.id}
                    bin={bin}
                    activeOver={activeOver}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
};

const GamePlay = (props: GamePlayProps) => {
  return (
    <ConveyItemsProvider>
      <GamePlayContent {...props} />
    </ConveyItemsProvider>
  );
};

export default GamePlay;