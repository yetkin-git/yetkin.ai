import { describe, expect, it } from "vitest";
import { JR_06_MAT_5_TIMELINE } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { reduceSceneState } from "@/lib/junior/pilot-engine/state-reducer";
import {
  resolveStickyFrame,
  sceneHasRenderableContent,
} from "@/lib/junior/pilot-engine/sticky-frame";

const TIMELINE = JR_06_MAT_5_TIMELINE;

function cueById(id: string) {
  const cue = TIMELINE.cues.find((row) => row.id === id);
  if (!cue) {
    throw new Error(`cue yok: ${id}`);
  }
  return cue;
}

describe("junior sticky frame retention", () => {
  it("cue-01 açılışında bilye yokken renderable değildir", () => {
    const early = reduceSceneState(TIMELINE, cueById("cue-01").startMs + 20);
    expect(early.layout).toBe("marble-tray");
    expect(sceneHasRenderableContent(early)).toBe(false);
  });

  it("SPAWN sonrası bilye tepsi dolu kabul edilir", () => {
    const spawn = cueById("cue-01").keyframes.find((kf) => kf.op === "SPAWN_MARBLES");
    expect(spawn).toBeDefined();
    const after = reduceSceneState(TIMELINE, spawn!.atMs);
    expect(sceneHasRenderableContent(after)).toBe(true);
  });

  it("cue-04 SET_STAGE boş factor panelinde önceki bilye karesini asılı tutar", () => {
    const spawn = cueById("cue-01").keyframes.find((kf) => kf.op === "SPAWN_MARBLES")!;
    const held = reduceSceneState(TIMELINE, spawn.atMs + 50);
    expect(sceneHasRenderableContent(held)).toBe(true);

    const gap = reduceSceneState(TIMELINE, cueById("cue-04").startMs + 40);
    expect(gap.layout).toBe("factor-vs-multiple");
    expect(gap.factorTree.visible).toBe(false);
    expect(sceneHasRenderableContent(gap)).toBe(false);

    const sticky = resolveStickyFrame(gap, held);
    expect(sticky.sticky).toBe(true);
    expect(sticky.display.layout).toBe("marble-tray");
    expect(sticky.display.marblesSpawned).toBe(true);
  });

  it("cue-06 SET_STAGE boş dedektifte önceki factor karesini asılı tutar", () => {
    const showTree = cueById("cue-04").keyframes.find((kf) => kf.op === "SHOW_FACTOR_TREE")!;
    const held = reduceSceneState(TIMELINE, showTree.atMs + 20);
    expect(held.layout).toBe("factor-vs-multiple");
    expect(sceneHasRenderableContent(held)).toBe(true);

    const gap = reduceSceneState(TIMELINE, cueById("cue-06").startMs + 40);
    expect(gap.layout).toBe("detective-last-digit");
    expect(gap.detective.digits).toEqual([]);
    expect(sceneHasRenderableContent(gap)).toBe(false);

    const sticky = resolveStickyFrame(gap, held);
    expect(sticky.sticky).toBe(true);
    expect(sticky.display.layout).toBe("factor-vs-multiple");
    expect(sticky.display.factorTree.visible).toBe(true);
  });

  it("yeni görsel cue gelince sticky kalkar", () => {
    const held = reduceSceneState(
      TIMELINE,
      cueById("cue-04").keyframes.find((kf) => kf.op === "SHOW_FACTOR_TREE")!.atMs,
    );
    const inspect = cueById("cue-06").keyframes.find((kf) => kf.op === "INSPECT_NUMBER")!;
    const live = reduceSceneState(TIMELINE, inspect.atMs);
    expect(sceneHasRenderableContent(live)).toBe(true);

    const sticky = resolveStickyFrame(live, held);
    expect(sticky.sticky).toBe(false);
    expect(sticky.display.layout).toBe("detective-last-digit");
    expect(sticky.display.detective.digits).toEqual(["2", "4"]);
  });

  it("forceClear asılı kareyi düşürür", () => {
    const held = reduceSceneState(
      TIMELINE,
      cueById("cue-01").keyframes.find((kf) => kf.op === "SPAWN_MARBLES")!.atMs,
    );
    const gap = reduceSceneState(TIMELINE, cueById("cue-06").startMs + 20);
    const cleared = resolveStickyFrame(gap, held, { forceClear: true });
    expect(cleared.sticky).toBe(false);
    expect(cleared.nextHeld).toBeNull();
    expect(cleared.display.layout).toBe("detective-last-digit");
  });
});
