import { describe, expect, it } from "vitest";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { OFFICE_AI_EXAM_QUESTIONS, academyExamPoolForSlug } from "@/lib/academy/exam-pools";
import { academyExamQuestionsForSlug } from "@/lib/academy/seed";
import { loadAcademySpokenScriptProse } from "@/lib/academy/spoken-scripts";

const SLUG = "01_office_ai";
const LESSON_KEYS = [
  "01_office_ai-1",
  "01_office_ai-2",
  "01_office_ai-3",
  "01_office_ai-4",
  "01_office_ai-5",
  "01_office_ai-6",
  "01_office_ai-g1",
  "01_office_ai-w1",
  "01_office_ai-k1",
] as const;

describe("01_office_ai ölçme sızıntısı — compact makale ve mühür havuzu", () => {
  it("Tam Ders Metni Mini sınav ve kalın doğru şık basmaz", () => {
    const lessons = curriculumForCourseSlug(SLUG);
    expect(lessons).toHaveLength(9);
    for (const lesson of lessons) {
      expect(lesson.body, lesson.key).not.toMatch(/## Mini sınav/u);
      expect(lesson.body, lesson.key).not.toMatch(/^- \*\*.+\*\*$/mu);
    }
  });

  it("kurs mühür havuzu ders mini sınavını ve platform-meta soruyu taşımaz", () => {
    expect(OFFICE_AI_EXAM_QUESTIONS).toHaveLength(42);
    expect(academyExamPoolForSlug(SLUG)).toHaveLength(42);
    const seeded = academyExamQuestionsForSlug(SLUG);
    expect(seeded.every((row) => !row.id.startsWith("q_off_l"))).toBe(true);
    const blob = JSON.stringify(OFFICE_AI_EXAM_QUESTIONS);
    expect(blob).not.toMatch(/sınav barajı kaçtır/iu);
    expect(blob).not.toMatch(/sınav köprüsü ne zaman açılır/iu);
    expect(blob).not.toMatch(/sertifika ne zaman hak edilir/iu);
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_4")?.prompt).toMatch(/Üç Kapı/u);
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_6")?.choices[0]).toMatch(/VBA/u);
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_6")?.correctIndex).toBe(1);
  });

  it("konuşma metni transkriptinde Mini sınav yoktur", () => {
    for (const key of LESSON_KEYS) {
      const prose = loadAcademySpokenScriptProse(key);
      expect(prose, key).not.toMatch(/## Mini sınav/u);
    }
  });
});
