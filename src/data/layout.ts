import type { ConveyItem } from '../types/game';

/**
 * ごみがベルト上を流れ切るまでの基準時間(ms)。
 * 実際の travelMs は BASE_TRAVEL_MS / wasteSpeed で求める。
 *
 * 座標は割合ベース（進行度 0〜1）で扱うため、この時間は画面幅に依存しない。
 * 言い換えると「ごみがコンベア上に乗っている秒数」は端末によらず一定で、
 * 見かけの速度 px/秒 のほうが画面幅から自動的に決まる。
 */
export const BASE_TRAVEL_MS = 10000;

/**
 * 分解時に子アイテムを上下へずらす量。
 * ベルト面の高さに対する % で指定する（px だと縮尺時にずれるため）。
 */
export const LANE_OFFSET_STEP = 12;

/**
 * 経過時間から進行度(0〜1)を求める。
 * 0 = ベルト右端の外側 / 1 = ベルト左端の外側。
 */
export const getProgress = (item: ConveyItem, now: number = Date.now()): number => {
  if (item.travelMs <= 0) {
    return 1;
  }
  return Math.min(1, Math.max(0, (now - item.startedAt) / item.travelMs));
};

/** 流れ切った（ミスライン到達）かどうか。 */
export const isExpired = (item: ConveyItem, now: number = Date.now()): boolean =>
  now - item.startedAt >= item.travelMs;
