import { useEffect, useState } from "react";
import GamePlayWaste from "./GamePlayWaste";
import { useConveyItems } from "../contexts/ConveyItems";
import { getProgress, isExpired } from "../data/layout";
import type { ConveyItem } from "../types/game";
import "./GamePlayConveyor.css";

type GamePlayConveyorProps = {
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  setScore: React.Dispatch<React.SetStateAction<number>>;
};

const GamePlayConveyor = ({ setHealth, setScore }: GamePlayConveyorProps) => {
  const { conveyItems, setConveyItems } = useConveyItems();
  const [, setTick] = useState(0);

  useEffect(() => {
    let frameId = window.requestAnimationFrame(function animate() {
      setTick((prev: number) => prev + 1);
      frameId = window.requestAnimationFrame(animate);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const now = Date.now();
    const expiredItemIds = conveyItems
      .filter((item: ConveyItem) => isExpired(item, now))
      .map((item: ConveyItem) => item.id);

    if (expiredItemIds.length > 0) {
      setHealth((prevHealth: number) => Math.max(0, prevHealth - expiredItemIds.length));
      setConveyItems((prevItems: ConveyItem[]) => prevItems.filter((item: ConveyItem) => !expiredItemIds.includes(item.id)));
    }
  }, [conveyItems, setConveyItems, setHealth]);

  return (
    <div className="conveyor-wrapper">
      <div className="conveyor-assembly">
        {/* イラスト画像のビューポート（中央揃え・--conveyor-h に合わせて縮尺） */}
        <div className="conveyor-image-viewport">
          <img
            src="/ごみデータ/ベルトコンベア.png"
            alt="ベルトコンベア"
            className="conveyor-illustration"
          />
        </div>

        {/* ベルト面上のアイテム描画領域 */}
        <div className="conveyor-items-plane">
          {conveyItems.map((conveyItem: ConveyItem) => (
            <GamePlayWaste
              key={conveyItem.id}
              id={conveyItem.id}
              label={conveyItem.def.label}
              isSimple={conveyItem.def.isSimple}
              parts={conveyItem.def.parts}
              progress={getProgress(conveyItem)}
              laneOffset={conveyItem.laneOffset}
              setScore={setScore}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GamePlayConveyor;
