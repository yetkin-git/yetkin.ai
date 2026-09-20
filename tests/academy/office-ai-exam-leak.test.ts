import { readFileSync } from "node:fs";
import { join } from "node:path";
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
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_4")?.choices[1]).toMatch(
      /yerleşik panel/iu,
    );
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_4")?.choices[1]).toMatch(/ataş/iu);
    const q42 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_42");
    expect(q42?.correctIndex).toBe(1);
    expect(q42?.choices[1]).toMatch(/Müşteri A/u);
    expect(q42?.choices[1]).toMatch(/MASKELİ_IBAN/u);
    expect(q42?.choices.join(" ")).toMatch(/son dört/iu);
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_6")?.choices[0]).toMatch(/puntoyu küçültmek/u);
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_6")?.choices.join(" ")).not.toMatch(/VBA|Gamma|Marp/u);
    expect(OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_6")?.correctIndex).toBe(1);
    const q12 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_12");
    const q24 = OFFICE_AI_EXAM_QUESTIONS.find((row) => row.id === "q_off_24");
    expect(q12?.prompt).toMatch(/Cuma 30 dakikalık rutini nasıl bölersin/u);
    expect(q24?.prompt).toMatch(/ekran görüntüsü/u);
    expect(q24?.prompt).not.toMatch(/Cuma rutininin üç bloğu/u);
    expect(q24?.choices[1]).toMatch(/maskeli kısa özet/iu);
  });

  it("konuşma metni transkriptinde Mini sınav yoktur", () => {
    for (const key of LESSON_KEYS) {
      const prose = loadAcademySpokenScriptProse(key);
      expect(prose, key).not.toMatch(/## Mini sınav/u);
    }
  });

  it("konuşma metni üretim notu taşımaz", () => {
    const root = process.cwd();
    for (const key of LESSON_KEYS) {
      const raw = readFileSync(join(root, "lib/academy/spoken-scripts", `${key}.md`), "utf8");
      expect(raw, key).not.toMatch(/mühür paketi/iu);
      expect(raw, key).not.toMatch(/Metin uydurulmadı/u);
    }
  });
});
