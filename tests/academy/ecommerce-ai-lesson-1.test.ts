import { describe, expect, it } from "vitest";
import { academyCitizenPlayerLayer } from "@/lib/academy/citizen-player-layer";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { hasAcademyLessonCues } from "@/lib/academy/lesson-cues";
import { hasAcademyLessonVisualStage } from "@/lib/academy/lesson-visual-stage";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";
import { isAcademySpokenScriptLessonKey, loadAcademySpokenScriptProse } from "@/lib/academy/spoken-scripts";

const SLUG = "02_ecommerce_ai";

describe("02_ecommerce_ai nihai iskelet — taze ingest bekler", () => {
  it("ders gövdesi, karaoke, cue ve spoken script boştur", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toEqual([]);
    expect(isAcademySpokenScriptLessonKey(`${SLUG}-1`)).toBe(false);
    expect(loadAcademySpokenScriptProse(`${SLUG}-1`)).toBe("");
    expect(hasAcademyLessonCues(`${SLUG}-1`)).toBe(false);
    expect(hasAcademyLessonVisualStage(`${SLUG}-1`)).toBe(false);
    expect(isAcademyLessonAudioSealed(SLUG, `${SLUG}-1`)).toBe(false);
    expect(academyCitizenPlayerLayer(SLUG, `${SLUG}-1`)).toEqual({ kind: "article" });
  });
});
