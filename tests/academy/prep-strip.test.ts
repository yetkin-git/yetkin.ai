import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyCitizenLessonOrdinal,
  curriculumLessonKeysForSlug,
} from "@/lib/academy/curricula/lesson-index";
import { officeAiSections, OFFICE_AI_PREP_STRIP_KEY } from "@/lib/academy/curricula/office_ai";
import {
  academyPrepStripForSlug,
  isAcademyPrepStripKey,
} from "@/lib/academy/prep-strip";
import { isAcademySpokenScriptLessonKey } from "@/lib/academy/spoken-scripts";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

const SLUG = "01_office_ai";

describe("01_office_ai Ders 0 — Başlamadan Önce hazırlık şeridi", () => {
  it("lesson-index, compact 9'lu ve spoken-script anahtarına girmez", () => {
    expect(OFFICE_AI_PREP_STRIP_KEY).toBe("01_office_ai-0");
    expect(isAcademyPrepStripKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(true);
    expect(curriculumLessonKeysForSlug(SLUG)).toHaveLength(9);
    expect(curriculumLessonKeysForSlug(SLUG)).not.toContain(OFFICE_AI_PREP_STRIP_KEY);
    expect(officeAiSections).toHaveLength(9);
    expect(officeAiSections.some((row) => row.lessonKey === OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
    expect(curriculumForCourseSlug(SLUG).map((row) => row.key)).not.toContain(OFFICE_AI_PREP_STRIP_KEY);
    expect(academyCitizenLessonOrdinal(SLUG, OFFICE_AI_PREP_STRIP_KEY)).toBeNull();
    expect(isAcademySpokenScriptLessonKey(OFFICE_AI_PREP_STRIP_KEY)).toBe(false);
  });

  it("antre rozeti ve kapsama alanı sınav yolunu bozmaz", () => {
    const strip = academyPrepStripForSlug(SLUG);
    expect(strip).not.toBeNull();
    expect(strip?.badge).toBe(ACADEMY_SEN.outline.prepBadge);
    expect(strip?.title).toMatch(/Yapay Zekâyla Tanışma/u);
    expect(strip?.estimatedMinutes).toBe(8);
    expect(strip?.contentMarkdown).toMatch(/Bu şeridin sonunda/u);
    expect(strip?.contentMarkdown).toMatch(/ücretsiz ile ücretli/u);
    expect(strip?.contentMarkdown).toMatch(/istem kutusudur/u);
    expect(strip?.contentMarkdown).toMatch(/Türkçe mi İngilizce mi/u);
    expect(strip?.contentMarkdown).not.toMatch(/Sınav şimdi açıldı/u);
    expect(strip?.contentMarkdown).not.toMatch(/Baraj 70 puandır/u);
    expect(academyPrepStripForSlug("02_ecommerce_ai")).toBeNull();
  });
});
