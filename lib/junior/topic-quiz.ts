import "server-only";

import { JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import {
  gradeJuniorTopicEndQuiz,
  juniorTopicEndQuestions,
  publicJuniorTopicEndQuiz,
} from "@/lib/junior/quiz";
import type { JuniorPracticeAnswer, JuniorPracticeChoice } from "@/lib/junior/types";

export function isJuniorTopicQuizReady(lessonKey: string): boolean {
  return juniorTopicEndQuestions(lessonKey).length >= JUNIOR_QUIZ_MIN_ITEMS;
}

export function publicJuniorTopicQuiz(lessonKey: string): JuniorPracticeChoice[] {
  return publicJuniorTopicEndQuiz(lessonKey).map((row) => ({
    id: row.id,
    kind: "choice",
    prompt: row.question,
    choices: [...row.options],
  }));
}

export type JuniorTopicQuizGrade = {
  score: number;
  correct: number;
  total: number;
  notes: { id: string; ok: boolean; explanation: string }[];
};

export function gradeJuniorTopicQuiz(
  lessonKey: string,
  answers: readonly JuniorPracticeAnswer[],
): JuniorTopicQuizGrade | null {
  const graded = gradeJuniorTopicEndQuiz(lessonKey, answers);
  if (!graded || graded.total < JUNIOR_QUIZ_MIN_ITEMS) {
    return null;
  }
  return {
    score: graded.score,
    correct: graded.correct,
    total: graded.total,
    notes: graded.notes.map(({ id, ok, explanation }) => ({ id, ok, explanation })),
  };
}

/** Testlerin doğru ve yanlış şıkları kurması içindir. İstemciye gönderilmez. */
export function juniorTopicQuizAnswers(
  lessonKey: string,
  correctCount: number,
): JuniorPracticeAnswer[] | null {
  const keys = juniorTopicEndQuestions(lessonKey);
  if (keys.length < JUNIOR_QUIZ_MIN_ITEMS) {
    return null;
  }
  const target = Math.max(0, Math.min(keys.length, correctCount));
  return keys.map((key, index) => ({
    id: key.id,
    choiceIndex: index < target ? key.correctAnswerIndex : key.correctAnswerIndex === 0 ? 1 : 0,
  }));
}
