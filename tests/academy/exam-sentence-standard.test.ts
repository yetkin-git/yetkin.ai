import { describe, expect, it } from "vitest";
import { officeAiSections } from "@/lib/academy/curricula/office_ai";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";

/**
 * Sınav cümle standardı (Tespit U6 tedavisi) — 9 dersin kapanışı aynı cümleyi basar.
 * Standart: "Sınav, 9. ders bitince açılır. Baraj score %70'tir."
 * Kilitli köprü cümleleri (bridge-lock) korunur; standart cümle ek olarak durur.
 * Mühürlü kaset (TTS) değişmez — yalnız makale standardıdır (re-bake yok).
 */
const EXAM_SENTENCE_STANDARD = "Sınav, 9. ders bitince açılır. Baraj score %70'tir.";

describe("sınav cümle standardı — 9 ders kapanışı", () => {
  it("dokuz compact makale standart cümleyi aynen taşır", () => {
    expect(officeAiSections).toHaveLength(9);
    for (const section of officeAiSections) {
      expect(section.contentMarkdown, section.lessonKey).toContain(EXAM_SENTENCE_STANDARD);
    }
  });

  it("mühürlü ders gövdeleri standardı oyuncuya basar", () => {
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(9);
    for (const lesson of lessons) {
      expect(lesson.body, lesson.key).toContain(EXAM_SENTENCE_STANDARD);
    }
  });
});
