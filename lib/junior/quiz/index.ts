import { JUNIOR_FEN_QUIZ_PACKS } from "@/lib/junior/quiz/fen";
import { JUNIOR_ING_QUIZ_PACKS } from "@/lib/junior/quiz/ing";
import { JUNIOR_MAT_QUIZ_PACKS } from "@/lib/junior/quiz/mat";
import { JUNIOR_SOSYAL_QUIZ_PACKS } from "@/lib/junior/quiz/sosyal";
import { JUNIOR_TURKCE_QUIZ_PACKS } from "@/lib/junior/quiz/turkce";
import type {
  JuniorLessonQuizPack,
  JuniorTopicEndPublicQuestion,
  JuniorTopicEndQuestion,
} from "@/lib/junior/quiz/types";

const ALL_PACKS: readonly JuniorLessonQuizPack[] = [
  ...JUNIOR_MAT_QUIZ_PACKS,
  ...JUNIOR_FEN_QUIZ_PACKS,
  ...JUNIOR_TURKCE_QUIZ_PACKS,
  ...JUNIOR_SOSYAL_QUIZ_PACKS,
  ...JUNIOR_ING_QUIZ_PACKS,
];

const BY_KEY: ReadonlyMap<string, JuniorLessonQuizPack> = new Map(
  ALL_PACKS.map((pack) => [pack.lessonKey, pack]),
);

export function juniorQuizPack(lessonKey: string): JuniorLessonQuizPack | null {
  return BY_KEY.get(lessonKey) ?? null;
}

export function juniorTellGuides(lessonKey: string): readonly string[] {
  return juniorQuizPack(lessonKey)?.tellGuides ?? [];
}

export function juniorTopicEndQuestions(lessonKey: string): readonly JuniorTopicEndQuestion[] {
  return juniorQuizPack(lessonKey)?.questions ?? [];
}

/** İstemciye cevap anahtarı gitmez. */
export function publicJuniorTopicEndQuiz(lessonKey: string): JuniorTopicEndPublicQuestion[] {
  return juniorTopicEndQuestions(lessonKey).map((row) => ({
    id: row.id,
    level: row.level,
    question: row.question,
    options: row.options,
    hint: row.hint,
  }));
}

export type JuniorTopicEndGrade = {
  score: number;
  correct: number;
  total: number;
  notes: { id: string; ok: boolean; explanation: string; hint: string }[];
};

export function gradeJuniorTopicEndQuiz(
  lessonKey: string,
  answers: readonly { id: string; choiceIndex?: number }[],
): JuniorTopicEndGrade | null {
  const keys = juniorTopicEndQuestions(lessonKey);
  if (keys.length === 0) {
    return null;
  }
  const byId = new Map(answers.map((answer) => [answer.id, answer]));
  const notes = keys.map((key) => {
    const answer = byId.get(key.id);
    const ok = answer?.choiceIndex === key.correctAnswerIndex;
    return { id: key.id, ok, explanation: key.explanation, hint: key.hint };
  });
  const correct = notes.filter((note) => note.ok).length;
  const score = Math.round((correct / keys.length) * 100);
  return { score, correct, total: keys.length, notes };
}

export function juniorMatQuizLessonKeys(): readonly string[] {
  return JUNIOR_MAT_QUIZ_PACKS.map((pack) => pack.lessonKey);
}

export function juniorMatQuizQuestionCount(): number {
  return JUNIOR_MAT_QUIZ_PACKS.reduce((sum, pack) => sum + pack.questions.length, 0);
}

export function juniorFenQuizLessonKeys(): readonly string[] {
  return JUNIOR_FEN_QUIZ_PACKS.map((pack) => pack.lessonKey);
}

export function juniorFenQuizQuestionCount(): number {
  return JUNIOR_FEN_QUIZ_PACKS.reduce((sum, pack) => sum + pack.questions.length, 0);
}

export function juniorTurkceQuizLessonKeys(): readonly string[] {
  return JUNIOR_TURKCE_QUIZ_PACKS.map((pack) => pack.lessonKey);
}

export function juniorTurkceQuizQuestionCount(): number {
  return JUNIOR_TURKCE_QUIZ_PACKS.reduce((sum, pack) => sum + pack.questions.length, 0);
}

export function juniorSosyalQuizLessonKeys(): readonly string[] {
  return JUNIOR_SOSYAL_QUIZ_PACKS.map((pack) => pack.lessonKey);
}

export function juniorSosyalQuizQuestionCount(): number {
  return JUNIOR_SOSYAL_QUIZ_PACKS.reduce((sum, pack) => sum + pack.questions.length, 0);
}

export function juniorIngQuizLessonKeys(): readonly string[] {
  return JUNIOR_ING_QUIZ_PACKS.map((pack) => pack.lessonKey);
}

export function juniorIngQuizQuestionCount(): number {
  return JUNIOR_ING_QUIZ_PACKS.reduce((sum, pack) => sum + pack.questions.length, 0);
}
