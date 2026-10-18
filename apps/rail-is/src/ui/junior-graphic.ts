import {
  readJuniorGraphicHop,
  reduceSceneState,
  type JuniorGraphicHop,
  type TimelineJSON,
} from "@yetkin/junior-graphic/runtime";

export { readJuniorGraphicHop, reduceSceneState };
export type { JuniorGraphicHop, TimelineJSON };

/** Aynı saf indirgeyici. Hop gövdesi kare listesini taşımaz; anlık state buradan katlanır. */
export function juniorGraphicAt(timeline: TimelineJSON, atMs: number) {
  return reduceSceneState(timeline, atMs);
}
