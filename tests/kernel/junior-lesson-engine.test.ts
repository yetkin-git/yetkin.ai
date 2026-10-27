import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnimatedSimulationStudio } from "@/components/junior/animated-simulations";
import { JuniorLessonEngine } from "@/components/junior/lesson-engine/JuniorLessonEngine";
import {
  getJuniorLessonBlueprint,
  hasJuniorLessonBlueprint,
  listJuniorMatLessonBlueprints,
  listQuarantinedJuniorMatBlueprints,
  resolveJuniorEngineTimeline,
  resolveJuniorTactileRules,
  resolveStickyFrame,
  sceneHasRenderableContent,
} from "@/lib/junior/lesson-engine";
import { isKnownJuniorLessonKey } from "@/lib/junior/lesson-index";
import { reduceSceneState } from "@/lib/junior/pilot-engine/state-reducer";

describe("JuniorLessonEngine — Boilerplate Engine & 6. Sınıf Matematik Modülleri", () => {
  it("canlı matematik şablonu jr_06_mat-1; karantina listesi boştur", () => {
    const blueprints = listJuniorMatLessonBlueprints();
    expect(blueprints.map((b) => b.lessonKey)).toEqual(["jr_06_mat-1"]);
    expect(blueprints[0]?.content.mebCode).toContain("MAT.6.1.1");
    expect(blueprints[0]?.content.mebCode).not.toContain("MAT.6.1.01");
    expect(listQuarantinedJuniorMatBlueprints()).toEqual([]);
    expect(hasJuniorLessonBlueprint("jr_06_mat-1")).toBe(true);

    const timeline = resolveJuniorEngineTimeline("jr_06_mat-1");
    expect(timeline?.lessonKey).toBe("jr_06_mat-1");
    expect(timeline?.cues.length).toBeGreaterThan(0);
  });

  it("canlı simülasyon jr_06_mat-1 bilye tepsisini basar", () => {
    const bp = getJuniorLessonBlueprint("jr_06_mat-1");
    expect(bp?.simulations[0]?.id).toBe("marble");
    expect(getJuniorLessonBlueprint("jr_06_fen-1")).toBeNull();
    const html = renderToStaticMarkup(
      createElement(AnimatedSimulationStudio, { lessonKey: "jr_06_mat-1" }),
    );
    expect(html).toContain('data-junior-sim-mode="marble"');
    expect(html).toContain('data-junior-sim-canvas="marble"');
    expect(html).toContain("12 Bilye Dağıtım Simülasyonu");
  });

  it("JuniorLessonEngine bileşeni StickyFrame ve QuickTools ile modüler sahneyi kurar", () => {
    const timeline = resolveJuniorEngineTimeline("jr_06_mat-1");
    expect(timeline).not.toBeNull();
    const exampleCue = timeline!.cues.find((c) => c.chapterId === "ch-2") ?? timeline!.cues[2]!;
    const state = reduceSceneState(timeline!, exampleCue.endMs - 20);
    expect(sceneHasRenderableContent(state)).toBe(true);
    const sticky = resolveStickyFrame(state, null);
    expect(sticky.sticky).toBe(false);

    const html = renderToStaticMarkup(
      createElement(JuniorLessonEngine, {
        lessonKey: "jr_06_mat-1",
        profileId: "test-profile",
      }),
    );
    expect(html).toContain('data-junior-lesson-engine="jr_06_mat-1"');
    expect(html).toContain("data-junior-quick-tools");
  });

  it("karantina listesi boştur; katalog jr_06_mat-1 ile açılır", () => {
    const root = process.cwd();
    expect(listJuniorMatLessonBlueprints().map((row) => row.lessonKey)).toEqual(["jr_06_mat-1"]);
    expect(isKnownJuniorLessonKey("jr_06_mat-1")).toBe(true);
    expect(hasJuniorLessonBlueprint("jr_06_mat-1")).toBe(true);
    expect(hasJuniorLessonBlueprint("jr_06_fen-1")).toBe(false);

    expect(existsSync(join(root, "app/junior/ders/jr_06_mat-1/page.tsx"))).toBe(false);
    const page = readFileSync(join(root, "app/junior/ders/[lessonKey]/page.tsx"), "utf8");
    expect(page).not.toContain("JUNIOR_ENGINE_PRODUCTION_KEYS");
    expect(page).not.toContain("isJuniorEngineProductionKey");
    expect(page).not.toContain("JuniorEngineProductionLesson");
    expect(page).toContain("LessonChain");
    expect(page).not.toContain('data-junior-lesson-contract="engine-production"');
    expect(page).toContain('data-junior-lesson-contract="catalog"');
  });

  it("atıl JuniorEngineProductionLesson bileşeni kaldırılmıştır; tek kabuk JuniorLessonEngine'dir", () => {
    const root = process.cwd();
    expect(
      existsSync(join(root, "components/junior/lesson-engine/JuniorEngineProductionLesson.tsx")),
    ).toBe(false);
    const html = renderToStaticMarkup(
      createElement(JuniorLessonEngine, {
        lessonKey: "jr_06_mat-4",
        profileId: "",
        title: "İşlem Önceliği",
        outcomes: ["Önce çarpma yapılır."],
        lifeUse: "Günlük hesapta sıra değişince sonuç değişir.",
      }),
    );
    expect(html).toContain('data-junior-lesson-engine="jr_06_mat-4"');
    expect(html).toContain("data-junior-quick-tools");
    expect(html).not.toContain("data-junior-sim-mode");
    expect(resolveJuniorTactileRules("jr_06_mat-4").matchTargets).toEqual({});
    expect(Object.keys(resolveJuniorTactileRules("jr_06_mat-1").matchTargets ?? {}).length).toBeGreaterThan(0);
    const other = renderToStaticMarkup(
      createElement(AnimatedSimulationStudio, { lessonKey: "jr_06_fen-1" }),
    );
    expect(other).toBe("");
  });
});
