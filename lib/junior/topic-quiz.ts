import "server-only";

import { JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import { assembleJuniorQuestionSet } from "@/lib/junior/question-bank";
import type { JuniorPracticeAnswer, JuniorPracticeChoice } from "@/lib/junior/types";

export function isJuniorTopicQuizReady(lessonKey: string): boolean {
  return assembleJuniorQuestionSet(lessonKey).length >= JUNIOR_QUIZ_MIN_ITEMS;
}

export function publicJuniorTopicQuiz(lessonKey: string): JuniorPracticeChoice[] {
  return assembleJuniorQuestionSet(lessonKey).map((row) => ({
    id: row.itemId,
    kind: "choice",
    prompt: row.prompt,
    choices: [...row.choices],
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
  const keys = assembleJuniorQuestionSet(lessonKey);
  if (keys.length < JUNIOR_QUIZ_MIN_ITEMS) {
    return null;
  }
  const byId = new Map(answers.map((answer) => [answer.id, answer]));
  const notes = keys.map((key) => {
    const answer = byId.get(key.itemId);
    const ok = answer?.choiceIndex === key.correctIndex;
    return { id: key.itemId, ok, explanation: key.explanation };
  });
  const correct = notes.filter((note) => note.ok).length;
  const score = Math.round((correct / keys.length) * 100);
  return { score, correct, total: keys.length, notes };
}

/** Testlerin doğru ve yanlış şıkları kurması içindir. İstemciye gönderilmez. */
export function juniorTopicQuizAnswers(
  lessonKey: string,
  correctCount: number,
): JuniorPracticeAnswer[] | null {
  const keys = assembleJuniorQuestionSet(lessonKey);
  if (keys.length < JUNIOR_QUIZ_MIN_ITEMS) {
    return null;
  }
  const target = Math.max(0, Math.min(keys.length, correctCount));
  return keys.map((key, index) => ({
    id: key.itemId,
    choiceIndex: index < target ? key.correctIndex : key.correctIndex === 0 ? 1 : 0,
  }));
}
