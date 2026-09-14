import type { AcademyExamQuestion } from "@/lib/academy/types";
import officeAiLesson1ExamJson from "./01_office_ai-1.json" with { type: "json" };
import officeAiLesson2ExamJson from "./01_office_ai-2.json" with { type: "json" };

export const ACADEMY_LESSON_EXAM_PASS_SCORE = 70 as const;

export type AcademyLessonExam = {
  lessonKey: string;
  passScore: typeof ACADEMY_LESSON_EXAM_PASS_SCORE;
  questions: readonly AcademyExamQuestion[];
};

function parseLessonExam(raw: unknown): AcademyLessonExam | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const rec = raw as Record<string, unknown>;
  const lessonKey = typeof rec.lessonKey === "string" ? rec.lessonKey.trim() : "";
  if (!lessonKey || rec.passScore !== ACADEMY_LESSON_EXAM_PASS_SCORE) {
    return null;
  }
  if (!Array.isArray(rec.questions) || rec.questions.length < 3) {
    return null;
  }
  const questions: AcademyExamQuestion[] = [];
  for (const item of rec.questions) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.prompt !== "string") {
      return null;
    }
    if (!Array.isArray(row.choices) || row.choices.length < 2) {
      return null;
    }
    if (typeof row.correctIndex !== "number" || !Number.isInteger(row.correctIndex)) {
      return null;
    }
    questions.push({
      id: row.id,
      prompt: row.prompt,
      choices: row.choices.map((choice) => String(choice)),
      correctIndex: row.correctIndex,
    });
  }
  return { lessonKey, passScore: ACADEMY_LESSON_EXAM_PASS_SCORE, questions };
}

const LESSON_EXAMS: Readonly<Record<string, AcademyLessonExam>> = {
  "01_office_ai-1": parseLessonExam(officeAiLesson1ExamJson) ?? {
    lessonKey: "01_office_ai-1",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai-2": parseLessonExam(officeAiLesson2ExamJson) ?? {
    lessonKey: "01_office_ai-2",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
};

export function loadAcademyLessonExam(lessonKey: string): AcademyLessonExam | null {
  const exam = LESSON_EXAMS[lessonKey.trim()];
  if (!exam || exam.questions.length < 3) {
    return null;
  }
  return exam;
}

export function hasAcademyLessonExam(lessonKey: string): boolean {
  return loadAcademyLessonExam(lessonKey) != null;
}
