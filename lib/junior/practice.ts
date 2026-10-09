import "server-only";

import { juniorTopicEndQuestions } from "@/lib/junior/quiz";
import type { JuniorPracticeAnswer, JuniorPracticeItem } from "@/lib/junior/types";

type ChoiceKey = {
  id: string;
  kind: "choice";
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
  explanation: string;
};

type MatchKey = {
  id: string;
  kind: "match";
  prompt: string;
  left: readonly { id: string; label: string }[];
  right: readonly { id: string; label: string }[];
  pairs: Readonly<Record<string, string>>;
  explanation: string;
};

type PracticeKey = ChoiceKey | MatchKey;

function practiceFromTopicEndQuiz(lessonKey: string): readonly PracticeKey[] | null {
  const rows = juniorTopicEndQuestions(lessonKey);
  if (rows.length === 0) {
    return null;
  }
  return rows.map((row) => ({
    id: row.id,
    kind: "choice" as const,
    prompt: row.question,
    choices: [...row.options],
    correctIndex: row.correctAnswerIndex,
    explanation: row.explanation,
  }));
}

/** Arşiv dışı elle yazılmış pekiştirme kalmadı; mat/fen/türkçe/sosyal/ingilizce quiz paketinden kurulur. */
const PRACTICE_BY_LESSON: Readonly<Record<string, readonly PracticeKey[]>> = {};

function practiceKeysForLesson(lessonKey: string): readonly PracticeKey[] {
  const fromArchive = practiceFromTopicEndQuiz(lessonKey);
  if (fromArchive) {
    return fromArchive;
  }
  return PRACTICE_BY_LESSON[lessonKey] ?? [];
}

export function publicJuniorPractice(lessonKey: string): JuniorPracticeItem[] {
  const rows = practiceKeysForLesson(lessonKey);
  return rows.map((row) => {
    if (row.kind === "choice") {
      return {
        id: row.id,
        kind: "choice",
        prompt: row.prompt,
        choices: [...row.choices],
      };
    }
    return {
      id: row.id,
      kind: "match",
      prompt: row.prompt,
      left: row.left.map((item) => ({ ...item })),
      right: row.right.map((item) => ({ ...item })),
    };
  });
}

export type JuniorPracticeGrade = {
  score: number;
  correct: number;
  total: number;
  notes: { id: string; ok: boolean; explanation: string }[];
};

export function gradeJuniorPractice(
  lessonKey: string,
  answers: readonly JuniorPracticeAnswer[],
): JuniorPracticeGrade | null {
  const keys = practiceKeysForLesson(lessonKey);
  if (keys.length === 0) {
    return null;
  }
  const byId = new Map(answers.map((answer) => [answer.id, answer]));
  const notes = keys.map((key) => {
    const answer = byId.get(key.id);
    const ok = answer ? answerMatches(key, answer) : false;
    return { id: key.id, ok, explanation: key.explanation };
  });
  const correct = notes.filter((note) => note.ok).length;
  const score = Math.round((correct / keys.length) * 100);
  return { score, correct, total: keys.length, notes };
}

function answerMatches(key: PracticeKey, answer: JuniorPracticeAnswer): boolean {
  if (key.kind === "choice") {
    return answer.choiceIndex === key.correctIndex;
  }
  const matches = answer.matches ?? {};
  const leftIds = Object.keys(key.pairs);
  return leftIds.every((leftId) => matches[leftId] === key.pairs[leftId]);
}
