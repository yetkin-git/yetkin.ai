import { describe, expect, it } from "vitest";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_GMAIL_GEMINI_PROMPT } from "@/lib/academy/gmail-workspace";
import {
  academyLessonHasPedagogy,
  academyLessonHasPractice,
  classifyAcademyLessonChunk,
  composePracticalLessonBody,
  spokenAcademyLessonBody,
  splitAcademyLessonChunks,
} from "@/lib/academy/lesson-body";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { academyInteractiveTaskByKey } from "@/lib/academy/proof-of-work";

const OFFICE_KEYS = curriculumLessonKeysForSlug("01_office_ai");

describe("01_office_ai — LESSON_PRACTICE iş tohumları (Faz T3)", () => {
  it("dokuz anahtarın tamamı 3 adımlı pratik taşır; hop compact-read kalır", () => {
    expect(OFFICE_KEYS).toHaveLength(9);
    expect(Object.keys(LESSON_PRACTICE).sort()).toEqual([...OFFICE_KEYS].sort());
    for (const key of OFFICE_KEYS) {
      const practice = LESSON_PRACTICE[key];
      expect(practice, key).toBeDefined();
      expect(practice!.params.length, key).toBeGreaterThanOrEqual(2);
      expect(practice!.params.some((row) => /senin|kendi|gerçek/i.test(`${row.label} ${row.value}`)), key).toBe(
        true,
      );
      expect(practice!.steps, key).toHaveLength(3);
      expect(practice!.code.language, key).toBe("text");
      expect(practice!.code.source.trim().length, key).toBeGreaterThan(40);
      expect(`${practice!.params.map((row) => row.value).join(" ")}`, key).not.toMatch(
        /\b(?:xlsx|docx|pptx)\b/iu,
      );
      expect(academyInteractiveTaskByKey(key), key).toBeNull();
    }
  });

  it("composePracticalLessonBody parametre, adım ve istem çitini Tam Ders Metni’ne basar", () => {
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(9);
    for (const lesson of lessons) {
      const practice = LESSON_PRACTICE[lesson.key]!;
      const composed = composePracticalLessonBody("Vatandaş kendi dosyasıyla iş çıkarır. İkinci cümle durur.", practice);
      expect(academyLessonHasPractice(composed), lesson.key).toBe(true);
      expect(composed).toContain("```params");
      expect(composed).toContain("```adim");
      expect(composed).toContain("```text");
      expect(classifyAcademyLessonChunk(`\`\`\`params\n${practice.params[0]!.label} | ${practice.params[0]!.value}\n\`\`\``).kind).toBe(
        "params",
      );
      expect(classifyAcademyLessonChunk(`\`\`\`adim\n${practice.steps[0]}\n\`\`\``).kind).toBe("steps");
      expect(lesson.body).toContain("```params");
      expect(lesson.body).toContain(practice.steps[0]!);
      expect(lesson.body).toContain(practice.code.source.trim());
      expect(academyLessonHasPractice(lesson.body), lesson.key).toBe(true);
      expect(academyLessonHasPedagogy(lesson.body), lesson.key).toBe(false);
      const kinds = new Set(splitAcademyLessonChunks(lesson.body).map((chunk) => classifyAcademyLessonChunk(chunk).kind));
      expect(kinds.has("params"), lesson.key).toBe(true);
      expect(kinds.has("steps"), lesson.key).toBe(true);
      expect(kinds.has("code"), lesson.key).toBe(true);
      const spoken = spokenAcademyLessonBody(lesson.body);
      expect(spoken, lesson.key).not.toContain("```");
      expect(spoken, lesson.key).toContain(practice.params[0]!.label);
    }
  });

  it("Gmail tohumu yerleşik Gemini istemini taşır; Excel tohumu A1 ister", () => {
    expect(LESSON_PRACTICE["01_office_ai-g1"]!.code.source).toContain(ACADEMY_GMAIL_GEMINI_PROMPT);
    expect(LESSON_PRACTICE["01_office_ai-1"]!.steps[0]).toMatch(/A1/u);
    expect(LESSON_PRACTICE["01_office_ai-k1"]!.code.source).toMatch(/KVKK/u);
    expect(LESSON_PRACTICE["01_office_ai-5"]!.code.source).toMatch(/TOPLA/u);
    expect(LESSON_PRACTICE["01_office_ai-6"]!.params[0]!.value).toMatch(/Cuma/u);
  });
});
