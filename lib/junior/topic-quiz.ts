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
    kind: "choice" as const,
    level: row.level,
    prompt: row.question,
    choices: [...row.options],
  }));
}

export type JuniorTopicQuizNote = {
  id: string;
  ok: boolean;
  explanation: string;
  /** Puanlandıktan sonra, yalnız yanlış soruda. Yayın yüküne girmez. */
  answer?: string;
};

export type JuniorTopicQuizGrade = {
  score: number;
  correct: number;
  total: number;
  notes: JuniorTopicQuizNote[];
};

export function gradeJuniorTopicQuiz(
  lessonKey: string,
  answers: readonly JuniorPracticeAnswer[],
): JuniorTopicQuizGrade | null {
  const graded = gradeJuniorTopicEndQuiz(lessonKey, answers);
  if (!graded || graded.total < JUNIOR_QUIZ_MIN_ITEMS) {
    return null;
  }
  const keys = new Map(juniorTopicEndQuestions(lessonKey).map((row) => [row.id, row]));
  return {
    score: graded.score,
    correct: graded.correct,
    total: graded.total,
    notes: graded.notes.map(({ id, ok, explanation }) => {
      if (ok) {
        return { id, ok, explanation };
      }
      const key = keys.get(id);
      const spoken = key ? key.options[key.correctAnswerIndex] : "";
      return spoken ? { id, ok, explanation, answer: spoken } : { id, ok, explanation };
    }),
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
