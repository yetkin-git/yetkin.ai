/** MEB 2026-2027 ders yılı 14 Eylül 2026 Pazartesi açılır. Gün hesabı İstanbul saatine göredir. */

const ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1000;

export const JUNIOR_SCHOOL_YEAR_OPEN = { year: 2026, month: 9, day: 14 } as const;

function istanbulDate(now: Date): { year: number; month: number; day: number } {
  const shifted = new Date(now.getTime() + ISTANBUL_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

function calendarUtc(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day);
}

/** Okul açılmadan önce null. Açılış günü 1. haftadır. Hafta pazartesi başlar. */
export function juniorSchoolWeek(now = new Date()): number | null {
  const today = istanbulDate(now);
  const open = JUNIOR_SCHOOL_YEAR_OPEN;
  const days = Math.floor(
    (calendarUtc(today.year, today.month, today.day) - calendarUtc(open.year, open.month, open.day)) /
      86_400_000,
  );
  if (days < 0) {
    return null;
  }
  return Math.floor(days / 7) + 1;
}

/** Raf sırası 1. haftadır. Kart başlığı, hafta numarasını konu adıyla birleştirir. */
export function juniorShelfWeekHeading(week: number, title: string): string {
  return `${week}. Hafta: ${title}`;
}

/** Bu haftanın konusu, raf sırasındaki derstir. Raf bitince rozet son konuda kalır. */
export function juniorThisWeekLessonIndex(lessonCount: number, now = new Date()): number | null {
  const week = juniorSchoolWeek(now);
  if (week === null || lessonCount <= 0) {
    return null;
  }
  return Math.min(week - 1, lessonCount - 1);
}
