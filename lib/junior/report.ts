import { JUNIOR_QUIZ_MIN_ITEMS, JUNIOR_XP_SCORE_FLOOR } from "@/lib/junior/limits";

/** Son yedi takvim günü. Gün başı İstanbul saatine göredir. */

const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

export const JUNIOR_WEEKLY_REPORT_DAYS = 7;

export type JuniorReportSource = {
  profileId: string;
  lessonKey: string;
  mode: "speak" | "write" | "practice" | "quiz";
  advice: string;
  score: number;
  createdAt: Date;
};

export type JuniorWeeklyNarration = {
  attempts: number;
  averageScore: number | null;
  latestScore: number | null;
};

export type JuniorWeeklyQuizPoint = {
  lessonKey: string;
  lessonTitle: string;
  score: number;
  correct: number;
  wrong: number;
  total: number;
  takenAt: string;
};

export type JuniorWeeklyReport = {
  profileId: string;
  from: string;
  to: string;
  narration: JuniorWeeklyNarration;
  quizzes: JuniorWeeklyQuizPoint[];
  quizTotals: {
    attempts: number;
    correct: number;
    wrong: number;
    answered: number;
  };
  parentTip: string;
};

export function juniorWeeklyWindow(now = new Date()): { from: Date; to: Date } {
  const startToday = istanbulStartOfDay(now);
  const from = new Date(startToday.getTime() - (JUNIOR_WEEKLY_REPORT_DAYS - 1) * DAY_MS);
  return { from, to: now };
}

/** Konu testi puanını paket boyundaki doğru ve yanlış sayıya çevirir. */
export function juniorQuizCountsFromScore(
  score: number,
  total = JUNIOR_QUIZ_MIN_ITEMS,
): { score: number; correct: number; wrong: number; total: number } {
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
  const safeTotal = total > 0 ? total : JUNIOR_QUIZ_MIN_ITEMS;
  const correct = Math.max(0, Math.min(safeTotal, Math.round((safeScore / 100) * safeTotal)));
  return { score: safeScore, correct, wrong: safeTotal - correct, total: safeTotal };
}

export function buildJuniorWeeklyReport(
  rows: readonly JuniorReportSource[],
  input: {
    profileId: string;
    now?: Date;
    lessonTitle?: (lessonKey: string) => string;
  },
): JuniorWeeklyReport {
  const now = input.now ?? new Date();
  const window = juniorWeeklyWindow(now);
  const titleOf = input.lessonTitle ?? ((lessonKey: string) => lessonKey);
  const weekRows = rows
    .filter((row) => {
      const at = row.createdAt.getTime();
      return (
        row.profileId === input.profileId &&
        at >= window.from.getTime() &&
        at <= window.to.getTime()
      );
    })
    .sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());

  const tells = weekRows.filter((row) => row.mode === "speak" || row.mode === "write");
  const quizRows = weekRows.filter((row) => row.mode === "quiz");
  const narration = summarizeNarration(tells);
  const quizzes = quizRows.map((row) => {
    const counts = juniorQuizCountsFromScore(row.score);
    return {
      lessonKey: row.lessonKey,
      lessonTitle: titleOf(row.lessonKey),
      score: counts.score,
      correct: counts.correct,
      wrong: counts.wrong,
      total: counts.total,
      takenAt: row.createdAt.toISOString(),
    };
  });
  const quizTotals = quizzes.reduce(
    (sum, row) => ({
      attempts: sum.attempts + 1,
      correct: sum.correct + row.correct,
      wrong: sum.wrong + row.wrong,
      answered: sum.answered + row.total,
    }),
    { attempts: 0, correct: 0, wrong: 0, answered: 0 },
  );

  return {
    profileId: input.profileId,
    from: window.from.toISOString(),
    to: window.to.toISOString(),
    narration,
    quizzes,
    quizTotals,
    parentTip: pickParentTip({
      narration,
      quizCorrect: quizTotals.correct,
      quizWrong: quizTotals.wrong,
      tellAdvice: tells.at(-1)?.advice ?? "",
      quizAdvice: quizRows.at(-1)?.advice ?? "",
    }),
  };
}

function istanbulStartOfDay(now: Date): Date {
  const shifted = new Date(now.getTime() + ISTANBUL_OFFSET_MS);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) - ISTANBUL_OFFSET_MS,
  );
}

function summarizeNarration(rows: readonly JuniorReportSource[]): JuniorWeeklyNarration {
  if (rows.length === 0) {
    return { attempts: 0, averageScore: null, latestScore: null };
  }
  const total = rows.reduce((sum, row) => sum + clampScore(row.score), 0);
  const latest = rows.at(-1);
  return {
    attempts: rows.length,
    averageScore: Math.round(total / rows.length),
    latestScore: latest ? clampScore(latest.score) : null,
  };
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function pickParentTip(input: {
  narration: JuniorWeeklyNarration;
  quizCorrect: number;
  quizWrong: number;
  tellAdvice: string;
  quizAdvice: string;
}): string {
  const fromTell = frameAdvice(input.tellAdvice);
  if (fromTell) {
    return fromTell;
  }
  const fromQuiz = frameAdvice(input.quizAdvice);
  if (fromQuiz) {
    return fromQuiz;
  }
  if (input.narration.attempts === 0 && input.quizCorrect + input.quizWrong === 0) {
    return "Bu yedi günde anlatış ve konu testi yok; akşam bir ders açıp ilk konuyu birlikte dinleyin.";
  }
  if (input.narration.attempts > 0 && (input.narration.averageScore ?? 0) < JUNIOR_XP_SCORE_FLOOR) {
    return "Anlatış puanı düşük kaldı; akşam aynı konuyu bir kez kendi sözleriyle anlatsın.";
  }
  if (input.quizWrong > input.quizCorrect) {
    return "Testte yanlış daha çok çıktı; eksik cümleyi akşam birlikte bir kez okuyun.";
  }
  return "Bu hafta iş ilerledi; akşam bir konuyu kendi sözleriyle bir kez daha anlatsın.";
}

function frameAdvice(advice: string): string | null {
  const sentence = firstSentence(advice);
  if (!sentence) {
    return null;
  }
  const core = sentence.replace(/[.!?]$/u, "").trim();
  const lower = core.toLocaleLowerCase("tr");
  if (lower.startsWith("emin değilim")) {
    return "Anlatış bu kez net değildi; akşam aynı konuyu bir kez daha kendi sözleriyle anlatsın.";
  }
  if (lower.startsWith("bu ders bitti") || lower.startsWith("istersen sıradaki konuya geç")) {
    return null;
  }
  const rest = core.charAt(0).toLocaleLowerCase("tr") + core.slice(1);
  return `Evde şunu pekiştirin: ${rest}.`;
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/gu, " ").trim();
  if (!clean) {
    return "";
  }
  const mark = clean.search(/[.!?](?:\s|$)/u);
  const slice = mark === -1 ? clean : clean.slice(0, mark + 1);
  const body = slice.replace(/[.!?]+$/u, "").trim();
  return body ? `${body}.` : "";
}
