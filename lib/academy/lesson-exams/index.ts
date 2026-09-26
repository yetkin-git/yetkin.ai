import type { AcademyExamQuestion } from "@/lib/academy/types";
import officeAiLesson1ExamJson from "./01_office_ai-1.json" with { type: "json" };
import officeAiLesson2ExamJson from "./01_office_ai-2.json" with { type: "json" };
import officeAiLesson3ExamJson from "./01_office_ai-3.json" with { type: "json" };
import officeAiLesson4ExamJson from "./01_office_ai-4.json" with { type: "json" };
import officeAiLesson5ExamJson from "./01_office_ai-5.json" with { type: "json" };
import officeAiLesson6ExamJson from "./01_office_ai-6.json" with { type: "json" };
import officeAiLessonG1ExamJson from "./01_office_ai-g1.json" with { type: "json" };
import officeAiLessonW1ExamJson from "./01_office_ai-w1.json" with { type: "json" };
import officeAiLessonK1ExamJson from "./01_office_ai-k1.json" with { type: "json" };
import officeAiIleriLesson1ExamJson from "./01_office_ai_ileri-1.json" with { type: "json" };
import officeAiIleriLesson2ExamJson from "./01_office_ai_ileri-2.json" with { type: "json" };
import officeAiIleriLesson3ExamJson from "./01_office_ai_ileri-3.json" with { type: "json" };
import officeAiIleriLesson4ExamJson from "./01_office_ai_ileri-4.json" with { type: "json" };
import officeAiIleriLesson5ExamJson from "./01_office_ai_ileri-5.json" with { type: "json" };
import officeAiIleriLesson6ExamJson from "./01_office_ai_ileri-6.json" with { type: "json" };

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
  "01_office_ai-3": parseLessonExam(officeAiLesson3ExamJson) ?? {
    lessonKey: "01_office_ai-3",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai-4": parseLessonExam(officeAiLesson4ExamJson) ?? {
    lessonKey: "01_office_ai-4",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai-5": parseLessonExam(officeAiLesson5ExamJson) ?? {
    lessonKey: "01_office_ai-5",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai-6": parseLessonExam(officeAiLesson6ExamJson) ?? {
    lessonKey: "01_office_ai-6",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai-g1": parseLessonExam(officeAiLessonG1ExamJson) ?? {
    lessonKey: "01_office_ai-g1",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai-w1": parseLessonExam(officeAiLessonW1ExamJson) ?? {
    lessonKey: "01_office_ai-w1",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai-k1": parseLessonExam(officeAiLessonK1ExamJson) ?? {
    lessonKey: "01_office_ai-k1",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai_ileri-1": parseLessonExam(officeAiIleriLesson1ExamJson) ?? {
    lessonKey: "01_office_ai_ileri-1",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai_ileri-2": parseLessonExam(officeAiIleriLesson2ExamJson) ?? {
    lessonKey: "01_office_ai_ileri-2",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai_ileri-3": parseLessonExam(officeAiIleriLesson3ExamJson) ?? {
    lessonKey: "01_office_ai_ileri-3",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai_ileri-4": parseLessonExam(officeAiIleriLesson4ExamJson) ?? {
    lessonKey: "01_office_ai_ileri-4",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai_ileri-5": parseLessonExam(officeAiIleriLesson5ExamJson) ?? {
    lessonKey: "01_office_ai_ileri-5",
    passScore: ACADEMY_LESSON_EXAM_PASS_SCORE,
    questions: [],
  },
  "01_office_ai_ileri-6": parseLessonExam(officeAiIleriLesson6ExamJson) ?? {
    lessonKey: "01_office_ai_ileri-6",
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

/** `q_off_l1_`, `q_off_lg1_` gibi ders mini sınav öneki. */
export function academyLessonExamGroupPrefix(questionId: string): string | null {
  const match = /^(q_off_l(?:g1|w1|k1|\d+)_)/u.exec(questionId.trim());
  return match?.[1] ?? null;
}

/** Her dersten bir soru — kurs sonu çekimde adil pin. */
export function pinAcademyLessonExamQuestionIds(
  questions: readonly AcademyExamQuestion[],
): string[] {
  const groups = new Map<string, string>();
  for (const question of questions) {
    const prefix = academyLessonExamGroupPrefix(question.id);
    if (!prefix || groups.has(prefix)) {
      continue;
    }
    groups.set(prefix, question.id);
  }
  return [...groups.values()];
}
