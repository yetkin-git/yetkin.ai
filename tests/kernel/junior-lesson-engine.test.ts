import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnimatedSimulationStudio } from "@/components/junior/animated-simulations";
import { JuniorEngineProductionLesson } from "@/components/junior/lesson-engine/JuniorEngineProductionLesson";
import { JuniorLessonEngine } from "@/components/junior/lesson-engine/JuniorLessonEngine";
import {
  getJuniorLessonBlueprint,
  hasJuniorLessonBlueprint,
  listJuniorMatLessonBlueprints,
  resolveJuniorEngineTimeline,
  resolveStickyFrame,
  sceneHasRenderableContent,
} from "@/lib/junior/lesson-engine";
import {
  isJuniorEngineProductionKey,
  isKnownJuniorLessonKey,
  JUNIOR_ENGINE_PRODUCTION_KEYS,
} from "@/lib/junior/lesson-index";
import { reduceSceneState } from "@/lib/junior/pilot-engine/state-reducer";

describe("JuniorLessonEngine — Boilerplate Engine & 6. Sınıf Matematik Modülleri", () => {
  it("jr_06_mat-1..5 ders şablonlarını (içerik, rozet, koç ve simülasyonlar) eksiksiz yükler", () => {
    const blueprints = listJuniorMatLessonBlueprints();
    expect(blueprints.map((b) => b.lessonKey)).toEqual([
      "jr_06_mat-1",
      "jr_06_mat-2",
      "jr_06_mat-3",
      "jr_06_mat-4",
      "jr_06_mat-5",
    ]);

    for (const bp of blueprints) {
      expect(bp.grade).toBe(6);
      expect(bp.subject).toBe("Matematik");
      expect(bp.content.heroQuestion.length).toBeGreaterThan(15);
      expect(bp.content.heroFocus.length).toBeGreaterThan(15);
      expect(bp.content.outcomes.length).toBeGreaterThanOrEqual(3);
      expect(bp.badge.chipLabel).toContain("🏅");
      expect(bp.tutor.quickChips.length).toBeGreaterThanOrEqual(3);
      expect(bp.simulations.length).toBeGreaterThan(0);

      const timeline = resolveJuniorEngineTimeline(bp.lessonKey);
      expect(timeline, bp.lessonKey).not.toBeNull();
      expect(timeline?.lessonKey).toBe(bp.lessonKey);
      expect(timeline?.cues.length).toBeGreaterThan(0);
    }

    const mat1 = getJuniorLessonBlueprint("jr_06_mat-1");
    expect(mat1.badge.chipLabel).toBe("🏅 Üs Kulesi Mimarı");
    expect(mat1.simulations.map((tab) => tab.id)).toEqual(["exponent-tower"]);
    expect(mat1.tutor.quickChips.map((chip) => chip.id)).toEqual(["exponent", "zero-one", "tens"]);
    expect(mat1.tactileRules?.rocketRules?.e103).toEqual(["r-ten"]);
    expect(mat1.notes?.example).toContain("10³");
  });

  it("jr_06_mat-1..4 konuya özel interaktif simülasyon panellerini render eder", () => {
    const cases = [
      { lessonKey: "jr_06_mat-1", simId: "exponent-tower", expectedText: "Üs Kulesi Simülasyonu" },
      { lessonKey: "jr_06_mat-2", simId: "ops-priority", expectedText: "İşlem Önceliği Robotu" },
      { lessonKey: "jr_06_mat-3", simId: "distribute-area", expectedText: "Dikdörtgen Bahçe Dağılma" },
      { lessonKey: "jr_06_mat-4", simId: "problem-steps", expectedText: "İki Adımlı Problem Terazisi" },
      { lessonKey: "jr_06_mat-5", simId: "marble", expectedText: "12 Bilye Dağıtım Simülasyonu" },
    ] as const;

    for (const item of cases) {
      const bp = getJuniorLessonBlueprint(item.lessonKey);
      expect(bp.simulations[0]?.id).toBe(item.simId);

      const html = renderToStaticMarkup(
        createElement(AnimatedSimulationStudio, { lessonKey: item.lessonKey }),
      );
      expect(html).toContain(`data-junior-sim-mode="${item.simId}"`);
      expect(html).toContain(`data-junior-sim-canvas="${item.simId}"`);
      expect(html).toContain(item.expectedText);
    }
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

  it("matematik 1-5 tek sayfa sözleşmesindedir; katalog dışı şablon üretim rotasıdır", () => {
    const root = process.cwd();
    const blueprintKeys = listJuniorMatLessonBlueprints().map((row) => row.lessonKey);
    const production = blueprintKeys.filter((key) => !isKnownJuniorLessonKey(key));
    expect([...JUNIOR_ENGINE_PRODUCTION_KEYS]).toEqual(production);
    expect(production).toEqual(["jr_06_mat-1", "jr_06_mat-2", "jr_06_mat-3", "jr_06_mat-4"]);
    expect(isKnownJuniorLessonKey("jr_06_mat-5")).toBe(true);
    expect(isJuniorEngineProductionKey("jr_06_mat-5")).toBe(false);
    expect(hasJuniorLessonBlueprint("jr_06_mat-5")).toBe(true);
    expect(hasJuniorLessonBlueprint("jr_06_fen-1")).toBe(false);

    expect(existsSync(join(root, "app/junior/ders/jr_06_mat-1/page.tsx"))).toBe(false);
    const page = readFileSync(join(root, "app/junior/ders/[lessonKey]/page.tsx"), "utf8");
    expect(page).toContain("isJuniorEngineProductionKey");
    expect(page).toContain("JuniorEngineProductionLesson");
    expect(page).toContain("LessonChain");
    expect(page).toContain('data-junior-lesson-contract="engine-production"');
    expect(page).toContain('data-junior-lesson-contract="catalog"');
  });

  it("üretim dersi aynı JuniorLessonEngine kabuğunu basar", () => {
    const booklet = {
      concept: "Taban çarpılan sayıdır.",
      example: "2³ = 8",
      warning: "2³ ile 2×3 aynı değildir.",
      recap: ["Üs tekrar sayısıdır."],
      hint: "trap" as const,
      heroQuestion: "Bir sayıyı kendisiyle defalarca çarpmayı nasıl yazarız?",
      heroFocus: "Taban ve üs kavramlarını tekrarlı çarpımdan ayır.",
    };
    const html = renderToStaticMarkup(
      createElement(JuniorEngineProductionLesson, {
        lessonKey: "jr_06_mat-2",
        title: "İşlem Önceliği",
        outcomes: ["Önce çarpma yapılır."],
        lifeUse: "Günlük hesapta sıra değişince sonuç değişir.",
        booklet,
        activities: [],
      }),
    );
    expect(html).toContain('data-junior-lesson-engine="jr_06_mat-2"');
    expect(html).toContain("data-junior-quick-tools");
    expect(html).toContain("data-junior-sim-mode");
  });
});
