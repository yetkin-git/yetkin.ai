import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS,
  academyCinemaSlideForCue,
  loadAcademyCinemaCueSlides,
} from "@/lib/academy/cinema-cue-catalog";
import {
  academyVisualCompareStage,
  academyVisualWaiterSlide,
} from "@/lib/academy/excel-workspace";
import { academyCinemaEyeFallbackPublicPath } from "@/lib/academy/lesson-visual-stage";
import {
  academyHowtoSteps,
  academyOff201SpokenVisualCueAtTime,
  academyPocketChecklistSteps,
  ACADEMY_BUSINESS_AI_BEAT_VISUAL,
  ACADEMY_BUSINESS_AI_LESSON_KEYS,
  ACADEMY_BUSINESS_AI_PUNCHCARD_COUNT,
  ACADEMY_OFFICE_AI_1_POCKET_STEPS,
  ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL,
  ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL,
  academyBusinessAiBeatVisual,
} from "@/lib/academy/lesson-beat-visual";
import { loadAcademyKaraokeStrip } from "@/lib/academy/lesson-teleprompter-flow";
import { academyOff201FrameSlide, loadOff201SpokenVisualCues } from "@/lib/academy/off201-spoken-visual";
import { loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import {
  CURRICULUM_LESSON_KEYS_BY_SLUG,
  PHASE2_DRAFT_LESSON_KEYS_BY_SLUG,
  curriculumLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";
import { ACADEMY_PUNCHCARD_MAX_WORDS } from "@/lib/academy/punchcard-from-sealed-json";

const STUDIO_BANNED = [/Kirli/u, /kapı/iu, /taşıma su/iu, /punchcard/iu];

function wordCount(label: string): number {
  return label
    .trim()
    .split(/\s+/u)
    .filter((part) => part.length > 0).length;
}

describe("OFF-201 taslak reji", () => {
  it("altı ders gövde anahtarı canlı sınav yolundadır", () => {
    expect([...ACADEMY_BUSINESS_AI_LESSON_KEYS]).toEqual([
      ...curriculumLessonKeysForSlug("01_office_ai_ileri"),
    ]);
    expect(PHASE2_DRAFT_LESSON_KEYS_BY_SLUG["01_office_ai_ileri"]).toBeUndefined();
    expect(CURRICULUM_LESSON_KEYS_BY_SLUG["01_office_ai_ileri"]).toHaveLength(6);
    expect(CURRICULUM_LESSON_KEYS_BY_SLUG["02_business_ai"]).toBeUndefined();
    expect(curriculumLessonKeysForSlug("01_office_ai_ileri")).toHaveLength(6);
    expect(curriculumLessonKeysForSlug("02_business_ai")).toEqual([]);
    for (const key of ACADEMY_BUSINESS_AI_LESSON_KEYS) {
      expect(ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS).not.toContain(key);
      const cues = loadAcademyLessonCues(key);
      expect(cues.map((cue) => cue.text)).toEqual(
        ACADEMY_BUSINESS_AI_BEAT_VISUAL[key].punchcards.map((card) => card.label),
      );
      expect(academyHowtoSteps(key)?.map((step) => step.label)).toEqual([
        ...ACADEMY_BUSINESS_AI_BEAT_VISUAL[key].pocketSteps,
      ]);
      const pocket = ACADEMY_BUSINESS_AI_BEAT_VISUAL[key].punchcards.find((card) => card.beat === "pocket");
      expect(academyPocketChecklistSteps(key, pocket?.section ?? "")).toEqual([
        ...ACADEMY_BUSINESS_AI_BEAT_VISUAL[key].pocketSteps,
      ]);
    }
  });

  it("Amiral Gemisi Ders 2 split etiketleri yerinde kalır", () => {
    expect(ACADEMY_OFFICE_AI_2_COMPARE_BEFORE_LABEL).toBe("ÖNCE (10 SAYFALIK DÖKÜM)");
    expect(ACADEMY_OFFICE_AI_2_COMPARE_AFTER_LABEL).toBe("SONRA (3 MADDELİK YÖNETİM ÖZETİ - AI)");
    expect(academyPocketChecklistSteps("01_office_ai-1", "CEBİNE KOY")).toEqual([
      ...ACADEMY_OFFICE_AI_1_POCKET_STEPS,
    ]);
  });

  it("her derste sekiz rozet ve bir split sahne vardır", () => {
    for (const key of ACADEMY_BUSINESS_AI_LESSON_KEYS) {
      const visual = academyBusinessAiBeatVisual(key);
      expect(visual).not.toBeNull();
      expect(visual!.lessonKey).toBe(key);
      expect(visual!.punchcards).toHaveLength(ACADEMY_BUSINESS_AI_PUNCHCARD_COUNT);
      expect(visual!.punchcards.map((card) => card.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(visual!.punchcards.map((card) => card.beat)).toEqual([
        "bridge",
        "warmup",
        "warmup",
        "command",
        "command",
        "comparison",
        "pocket",
        "task",
      ]);
      expect(visual!.punchcards[1]?.label).toBe("ÜÇ ADIM");
      expect(visual!.punchcards[5]?.label).not.toBe("FARK ORTADA");
      expect(visual!.punchcards[5]?.label.split(/\s+/u).length).toBeLessThanOrEqual(3);
      expect(visual!.punchcards[5]?.section).toBe("YANLIŞ VE DOĞRU");
      for (const card of visual!.punchcards) {
        expect(wordCount(card.label)).toBeGreaterThan(0);
        expect(wordCount(card.label)).toBeLessThanOrEqual(ACADEMY_PUNCHCARD_MAX_WORDS);
        for (const pattern of STUDIO_BANNED) {
          expect(card.label).not.toMatch(pattern);
        }
      }
      expect(visual!.split.visualMode).toBe("split");
      expect(visual!.split.section).toBe("YANLIŞ VE DOĞRU");
      expect(visual!.split.beforeLabel.startsWith("ÖNCE (")).toBe(true);
      expect(visual!.split.afterLabel.startsWith("SONRA (")).toBe(true);
      expect(visual!.split.beforeScene.trim().length).toBeGreaterThan(0);
      expect(visual!.split.afterScene.trim().length).toBeGreaterThan(0);
      expect(visual!.split.withheldUntilSplit.trim().length).toBeGreaterThan(0);
      expect(visual!.pocketSteps).toHaveLength(3);
      const scene = `${visual!.split.beforeLabel} ${visual!.split.afterLabel} ${visual!.split.beforeScene} ${visual!.split.afterScene}`;
      for (const pattern of STUDIO_BANNED) {
        expect(scene).not.toMatch(pattern);
      }
    }
    expect(Object.keys(ACADEMY_BUSINESS_AI_BEAT_VISUAL)).toEqual([...ACADEMY_BUSINESS_AI_LESSON_KEYS]);
  });

  it("canlı sinema kataloğu OFF-201 gövdesini bu dosyaya gömmez", () => {
    const source = readFileSync(join(process.cwd(), "lib/academy/cinema-cue-catalog.ts"), "utf8");
    expect(source).not.toContain("02_business_ai");
    expect(source).not.toContain("ACADEMY_BUSINESS_AI_");
    expect(source).toContain("loadOff201CinemaCueSlides");
  });

  it("altı derste her cue slaytı değişir ve Y mührü sahne plakası değildir", () => {
    for (const key of ACADEMY_BUSINESS_AI_LESSON_KEYS) {
      const slides = loadAcademyCinemaCueSlides(key);
      expect(slides).toHaveLength(8);
      expect(academyCinemaEyeFallbackPublicPath(key)).not.toBe("/icon.svg");
      const signatures = slides.map(
        (slide) => `${slide.headline}|${slide.sheetName}|${slide.visualMode}|${slide.table?.rows[0]?.join(",")}`,
      );
      expect(new Set(signatures).size).toBe(8);
      expect(slides[5]?.visualMode).toBe("split");
      expect(academyVisualCompareStage(key, "cue-06")?.beforeLabel).toBe(
        ACADEMY_BUSINESS_AI_BEAT_VISUAL[key].split.beforeLabel,
      );
      expect(academyVisualCompareStage(key, "cue-06")?.after.table?.rows.length).toBeGreaterThan(0);
      for (const cueId of ["cue-01", "cue-02", "cue-03", "cue-04", "cue-05", "cue-07", "cue-08"]) {
        const slide = academyCinemaSlideForCue(key, cueId);
        expect(slide?.table?.rows.length).toBeGreaterThan(0);
        expect(academyVisualWaiterSlide(key, cueId)).not.toBeNull();
      }
      expect(academyVisualWaiterSlide(key, "cue-05")?.copilot?.prompt.length).toBeGreaterThan(20);
      expect(academyVisualCompareStage(key, "cue-05")).toBeNull();
    }
  });

  it("konuşulan örnek satırı cümle başında slayta biner", () => {
    for (const key of ACADEMY_BUSINESS_AI_LESSON_KEYS) {
      const sentences = loadAcademyKaraokeStrip(key);
      const cues = loadOff201SpokenVisualCues(key);
      expect(cues.length).toBeGreaterThan(0);
      for (const cue of cues) {
        const sentence = sentences.find(
          (line) => line.cueId === cue.cueId && line.start === cue.start && line.end === cue.end,
        );
        expect(sentence?.text.toLocaleLowerCase("tr-TR")).toContain(cue.needle.toLocaleLowerCase("tr-TR"));
        expect(academyOff201SpokenVisualCueAtTime(cues, cue.start)?.needle).toBe(cue.needle);
        const base = academyCinemaSlideForCue(key, cue.cueId);
        expect(base).not.toBeNull();
        const at = cue.start + 0.01;
        const panes =
          base!.visualMode === "split" && base!.compare
            ? [
                academyOff201FrameSlide(
                  loadAcademyCinemaCueSlides(key).find((slide) => slide.cueIndex === base!.compare!.beforeCueIndex)!,
                  at,
                  { allowSwap: false },
                ),
                academyOff201FrameSlide(base!, at, { allowSwap: false }),
              ]
            : [academyOff201FrameSlide(base!, at)];
        const visible = panes.find((slide) =>
          (slide.table?.rows.flat().join(" ") ?? "").toLocaleLowerCase("tr-TR").includes(cue.needle.toLocaleLowerCase("tr-TR")),
        );
        expect(visible, `${key} ${cue.cueId} ${cue.needle}`).toBeTruthy();
        expect(visible!.highlightCell).toBe(cue.highlightCell);
      }
    }
    const marmara = loadOff201SpokenVisualCues("01_office_ai_ileri-1").find((cue) =>
      cue.needle.includes("Kaya Un 1 kg, 120 sipariş"),
    );
    expect(marmara?.cueId).toBe("cue-01");
    const generic = academyCinemaSlideForCue("01_office_ai_ileri-1", "cue-01");
    expect(generic?.table?.rows[0]?.join(" ")).toContain("Rol");
    const framed = academyOff201FrameSlide(generic!, marmara!.start + 0.01);
    expect(framed.table?.rows[0]?.join(" ")).toContain("Marmara");
    expect(framed.highlightCell).toBe("A2");
  });
});
