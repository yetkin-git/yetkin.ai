import "server-only";

import { AUTHORED_ACTIVITY_RAILS } from "@/lib/junior/activity-source";
import type { JuniorActivityPublic } from "@/lib/junior/activity-public";
import { juniorLessonByKey } from "@/lib/junior/catalog";
import type { JuniorLessonScript, JuniorPracticeAnswer } from "@/lib/junior/types";

type MatchKey = {
  id: string;
  kind: "match";
  prompt: string;
  left: readonly { id: string; label: string }[];
  right: readonly { id: string; label: string }[];
  pairs: Readonly<Record<string, string>>;
  explanation: string;
};

type ClozeGapKey = {
  id: string;
  before: string;
  after: string;
  accepts: readonly string[];
};

type ClozeKey = {
  id: string;
  kind: "cloze";
  prompt: string;
  before: string;
  after: string;
  accepts: readonly string[];
  gaps?: readonly ClozeGapKey[];
  wordBank?: readonly string[];
  explanation: string;
};

type PuzzleKey = {
  title: string;
  prompt: string;
  rockets: readonly { id: string; label: string; ruleHint: string }[];
  validRockets: Readonly<Record<string, readonly string[]>>;
};

type OrderKey = {
  id: string;
  kind: "order";
  prompt: string;
  tiles: readonly { id: string; label: string }[];
  sequence: readonly string[];
  puzzle?: PuzzleKey;
  explanation: string;
};

type ActivityKey = MatchKey | ClozeKey | OrderKey;

/** Doğru sıra istemciye gitmesin diye bir tur kaydırılır. */
function rotatedTiles(row: OrderKey): { id: string; label: string }[] {
  if (row.puzzle) {
    return row.tiles.map((tile) => ({ ...tile }));
  }
  const byId = new Map(row.tiles.map((tile) => [tile.id, tile]));
  const ordered = row.sequence.map((id) => byId.get(id)).filter((tile) => tile !== undefined);
  const [first, ...rest] = ordered;
  if (first === undefined || rest.length === 0) {
    return ordered.map((tile) => ({ ...tile }));
  }
  return [...rest, first].map((tile) => ({ ...tile }));
}

const CLOZE_SKIP = new Set([
  "bir",
  "ve",
  "ile",
  "için",
  "bu",
  "şu",
  "da",
  "de",
  "mi",
  "mı",
  "mu",
  "mü",
  "ki",
  "en",
  "çok",
  "daha",
  "olan",
  "olarak",
  "ise",
  "veya",
  "her",
  "gün",
]);

function foldWord(value: string): string {
  return value.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "").toLocaleLowerCase("tr-TR");
}

function sentenceWords(text: string): string[] {
  return text.replace(/\s+/g, " ").trim().split(" ").filter((word) => foldWord(word).length > 0);
}

function containsWord(haystack: string, word: string): boolean {
  const needle = foldWord(word);
  if (!needle) {
    return false;
  }
  return haystack.split(/\s+/).some((part) => foldWord(part) === needle);
}

function matchFrom(outcomes: readonly string[]): MatchKey | null {
  const rows = outcomes.slice(0, 3).flatMap((outcome, index) => {
    const words = sentenceWords(outcome);
    if (words.length < 2) {
      return [];
    }
    const cut = words.length >= 4 ? 3 : 1;
    const tail = words.slice(cut).join(" ");
    if (!tail) {
      return [];
    }
    return [{ id: `h${index}`, head: words.slice(0, cut).join(" "), tailId: `t${index}`, tail }];
  });
  if (rows.length < 2) {
    return null;
  }
  const pairs: Record<string, string> = {};
  for (const row of rows) {
    pairs[row.id] = row.tailId;
  }
  return {
    id: "match",
    kind: "match",
    prompt: "Sol sözü sağdaki devamına bağla.",
    left: rows.map((row) => ({ id: row.id, label: row.head })),
    right: [...rows].reverse().map((row) => ({ id: row.tailId, label: row.tail })),
    pairs,
    explanation: outcomes.slice(0, rows.length).join(" "),
  };
}

function orderFrom(outcomes: readonly string[]): OrderKey | null {
  const lines = outcomes.slice(0, 4).filter((line) => sentenceWords(line).length >= 2);
  if (lines.length < 2) {
    return null;
  }
  const tiles = lines.map((label, index) => ({ id: `s${index}`, label }));
  return {
    id: "order",
    kind: "order",
    prompt: "Bugünkü cümleleri anlatım sırasına diz.",
    tiles,
    sequence: tiles.map((tile) => tile.id),
    explanation: lines.join(" "),
  };
}

function clozeFromSentence(sentence: string, visible: string): ClozeKey | null {
  const parts = sentence.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (parts.length < 4) {
    return null;
  }
  for (let index = parts.length - 1; index > 0; index -= 1) {
    const token = foldWord(parts[index] ?? "");
    if (token.length < 4 || CLOZE_SKIP.has(token) || containsWord(visible, token)) {
      continue;
    }
    const before = parts.slice(0, index).join(" ");
    const after = parts
      .slice(index + 1)
      .join(" ")
      .replace(/^[.!?]+/, "")
      .trim();
    return {
      id: "cloze",
      kind: "cloze",
      prompt: "Boşluğu doldur.",
      before,
      after,
      accepts: [token],
      explanation: sentence.replace(/\s+/g, " ").trim(),
    };
  }
  return null;
}

function clozeFromText(text: string, visible: string): ClozeKey | null {
  const sentences = text.split(/(?<=[.!?])\s+/u);
  for (const sentence of sentences) {
    const built = clozeFromSentence(sentence, visible);
    if (built) {
      return built;
    }
  }
  return null;
}

function generatedKeys(lesson: JuniorLessonScript): ActivityKey[] {
  const outcomes = lesson.outcomes.map((line) => line.replace(/\s+/g, " ").trim()).filter((line) => sentenceWords(line).length >= 2);
  const match = matchFrom(outcomes);
  const order = orderFrom(outcomes);
  if (!match || !order) {
    return [];
  }
  const visible = [...match.left, ...match.right, ...order.tiles].map((item) => item.label).join(" ");
  const cloze = [lesson.lifeUse, lesson.teaser, lesson.mebNote, lesson.title]
    .map((line) => clozeFromText(line, visible))
    .find((row) => row !== null && row !== undefined);
  if (!cloze) {
    return [];
  }
  const prefix = `rail-${lesson.key}`;
  return [
    { ...match, id: `${prefix}-match` },
    { ...cloze, id: `${prefix}-cloze` },
    { ...order, id: `${prefix}-order` },
  ];
}

const generatedCache = new Map<string, readonly ActivityKey[]>();

function keysFor(lessonKey: string): readonly ActivityKey[] {
  const authored = AUTHORED_ACTIVITY_RAILS[lessonKey];
  if (authored) {
    return authored;
  }
  const cached = generatedCache.get(lessonKey);
  if (cached) {
    return cached;
  }
  const lesson = juniorLessonByKey(lessonKey);
  const keys = lesson ? generatedKeys(lesson) : [];
  generatedCache.set(lessonKey, keys);
  return keys;
}

export function publicJuniorActivityRail(lessonKey: string): JuniorActivityPublic[] {
  return keysFor(lessonKey).map((row) => {
    if (row.kind === "match") {
      return {
        id: row.id,
        kind: "match",
        prompt: row.prompt,
        left: row.left.map((item) => ({ ...item })),
        right: row.right.map((item) => ({ ...item })),
      };
    }
    if (row.kind === "cloze") {
      return {
        id: row.id,
        kind: "cloze",
        prompt: row.prompt,
        before: row.before,
        after: row.after,
        ...(row.gaps
          ? {
              gaps: row.gaps.map((g) => ({
                id: g.id,
                before: g.before,
                after: g.after,
              })),
            }
          : {}),
        ...(row.wordBank ? { wordBank: [...row.wordBank] } : {}),
      };
    }
    return {
      id: row.id,
      kind: "order",
      prompt: row.prompt,
      tiles: rotatedTiles(row),
      ...(row.puzzle
        ? {
            puzzle: {
              title: row.puzzle.title,
              prompt: row.puzzle.prompt,
              rockets: row.puzzle.rockets.map((r) => ({ ...r })),
            },
          }
        : {}),
    };
  });
}

export function isJuniorActivityRailAnswer(lessonKey: string, id: string): boolean {
  return keysFor(lessonKey).some((row) => row.id === id);
}

function foldCloze(value: string): string {
  return value.replace(/\s+/g, "").trim().toLocaleLowerCase("tr-TR");
}

/** Kontrol sonrası kart. `answer` yalnız yanlış boşluk ve eşleştirmede dolar. */
export type JuniorActivityCardMark = {
  id: string;
  ok: boolean;
  answer?: string;
};

export type JuniorActivityGrade = {
  score: number;
  correct: number;
  total: number;
  notes: { id: string; ok: boolean; explanation: string; cards: JuniorActivityCardMark[] }[];
};

export function gradeJuniorActivityRail(
  lessonKey: string,
  answers: readonly JuniorPracticeAnswer[],
): JuniorActivityGrade | null {
  const keys = keysFor(lessonKey);
  if (keys.length === 0) {
    return null;
  }
  const byId = new Map(answers.map((answer) => [answer.id, answer]));
  const notes = keys.map((key) => {
    const answer = byId.get(key.id);
    const ok = answer ? activityMatches(key, answer) : false;
    return { id: key.id, ok, explanation: key.explanation, cards: cardMarks(key, answer) };
  });
  const correct = notes.filter((note) => note.ok).length;
  const score = Math.round((correct / keys.length) * 100);
  return { score, correct, total: keys.length, notes };
}

function cardMarks(key: ActivityKey, answer: JuniorPracticeAnswer | undefined): JuniorActivityCardMark[] {
  if (key.kind === "match") {
    const matches = answer?.matches ?? {};
    return key.left.map((item) => {
      const rightId = key.pairs[item.id];
      const ok = matches[item.id] === rightId;
      if (ok) {
        return { id: item.id, ok: true };
      }
      const label = key.right.find((row) => row.id === rightId)?.label ?? "";
      return { id: item.id, ok: false, answer: label };
    });
  }
  if (key.kind === "cloze") {
    if (key.gaps && key.gaps.length > 0 && answer?.clozes) {
      return key.gaps.map((gap) => {
        const written = foldCloze(answer.clozes?.[gap.id] ?? "");
        const ok = written.length > 0 && gap.accepts.some((acc) => foldCloze(acc) === written);
        if (ok) {
          return { id: gap.id, ok: true };
        }
        return { id: gap.id, ok: false, answer: gap.accepts[0] ?? "" };
      });
    }
    const ok = answer ? activityMatches(key, answer) : false;
    if (ok) {
      return [{ id: key.id, ok: true }];
    }
    return [{ id: key.id, ok: false, answer: key.accepts[0] ?? "" }];
  }
  if (key.puzzle && answer?.placements) {
    return key.tiles.map((tile) => {
      const rocketId = answer.placements?.[tile.id] ?? "";
      const allowed = key.puzzle?.validRockets[tile.id] ?? [];
      return { id: tile.id, ok: Boolean(rocketId && allowed.includes(rocketId)) };
    });
  }
  const given = answer?.order ?? [];
  return key.tiles.map((tile) => {
    const slot = key.sequence.indexOf(tile.id);
    return { id: tile.id, ok: slot >= 0 && given[slot] === tile.id };
  });
}

function activityMatches(key: ActivityKey, answer: JuniorPracticeAnswer): boolean {
  if (key.kind === "match") {
    const matches = answer.matches ?? {};
    return Object.keys(key.pairs).every((leftId) => matches[leftId] === key.pairs[leftId]);
  }
  if (key.kind === "cloze") {
    if (key.gaps && key.gaps.length > 0) {
      if (answer.clozes) {
        return key.gaps.every((gap) => {
          const written = foldCloze(answer.clozes?.[gap.id] ?? "");
          return written.length > 0 && gap.accepts.some((acc) => foldCloze(acc) === written);
        });
      }
      return false;
    }
    const written = foldCloze(answer.cloze ?? "");
    if (!written) {
      return false;
    }
    return key.accepts.some((accept) => foldCloze(accept) === written);
  }
  if (key.puzzle && answer.placements) {
    return key.tiles.every((tile) => {
      const rocketId = answer.placements?.[tile.id] ?? "";
      const allowed = key.puzzle?.validRockets[tile.id] ?? [];
      return Boolean(rocketId && allowed.includes(rocketId));
    });
  }
  const given = answer.order ?? [];
  return key.sequence.length === given.length && key.sequence.every((id, index) => given[index] === id);
}
