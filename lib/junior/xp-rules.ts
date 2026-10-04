import {
  JUNIOR_DAILY_XP_CAP,
  JUNIOR_POINTS_CAP,
  JUNIOR_XP_SCORE_FLOOR,
} from "@/lib/junior/limits";

export type JuniorBadgeSource = {
  lessonKey: string;
  mode: string;
  score: number;
};

export function awardJuniorXp(input: { usedToday: number; score: number; base: number }): number {
  if (input.score < JUNIOR_XP_SCORE_FLOOR) {
    return 0;
  }
  const room = JUNIOR_DAILY_XP_CAP - input.usedToday;
  if (room <= 0) {
    return 0;
  }
  const grant = Math.min(input.base, room);
  return grant > 0 ? grant : 0;
}

export function nextJuniorPoints(current: number, award: number): number {
  return Math.min(JUNIOR_POINTS_CAP, Math.max(0, current) + Math.max(0, award));
}

export function juniorBadges(rows: readonly JuniorBadgeSource[]): string[] {
  const badges: string[] = [];
  const told = rows.filter((row) => row.mode !== "practice" && row.score >= JUNIOR_XP_SCORE_FLOOR);
  if (told.length > 0) {
    badges.push("ilk-anlatis");
  }
  const lessons = new Set(told.map((row) => row.lessonKey));
  if (lessons.size >= 3) {
    badges.push("uc-ders");
  }
  if (rows.some((row) => row.mode === "practice" && row.score === 100)) {
    badges.push("pekistirme");
  }
  return badges;
}

export function xpUsedSince(rows: readonly { createdAt: Date; xpAwarded: number }[], since: Date): number {
  return rows.reduce((sum, row) => (row.createdAt >= since ? sum + row.xpAwarded : sum), 0);
}
