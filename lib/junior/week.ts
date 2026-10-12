/** MEB 2026-2027 ders yılı 14 Eylül 2026 Pazartesi açılır. Gün hesabı İstanbul saatine göredir. */

import { juniorCalendarBundle } from "@yetkin/junior-content/calendar";
import type { JuniorCourseSlug } from "@yetkin/junior-content";

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

/** Kart başlığı, hafta numarasını çıktı adıyla birleştirir. */
export function juniorShelfWeekHeading(week: number, title: string): string {
  return `${week}. Hafta: ${title}`;
}

/**
 * Bu haftanın konu anahtarları. Aralık `startWeek <= hafta <= endWeek` olan tymm konularıdır.
 * Ara tatil, sınav ve okul temelli hafta boş döner. Dosya indeksi kullanılmaz.
 */
export function juniorActiveLessonKeys(slug: JuniorCourseSlug, now = new Date()): readonly string[] {
  const week = juniorSchoolWeek(now);
  if (week === null) {
    return [];
  }
  const bundle = juniorCalendarBundle(slug);
  const row = bundle.weeks.find((item) => item.week === week);
  if (!row || row.kind !== "teach") {
    return [];
  }
  return bundle.topics
    .filter(
      (topic) =>
        topic.band === "tymm" && topic.startWeek >= 1 && topic.startWeek <= week && week <= topic.endWeek,
    )
    .map((topic) => topic.lessonKey);
}

/** Konunun kendi hafta aralığı. Takvim şeridinde olmayan konu boş döner. */
export function juniorLessonWeekSpan(
  slug: JuniorCourseSlug,
  lessonKey: string,
): { startWeek: number; endWeek: number } | null {
  const bundle = juniorCalendarBundle(slug);
  const topic = bundle.topics.find((item) => item.lessonKey === lessonKey);
  if (!topic || topic.band !== "tymm" || topic.startWeek < 1) {
    return null;
  }
  return { startWeek: topic.startWeek, endWeek: topic.endWeek };
}

/** Konunun kendi çıktı adları. Aynı haftadaki kardeş konu bu başlığa yazılmaz. */
export function juniorLessonWeekHeading(slug: JuniorCourseSlug, lessonKey: string): string | null {
  const bundle = juniorCalendarBundle(slug);
  const topic = bundle.topics.find((item) => item.lessonKey === lessonKey);
  if (!topic || topic.band !== "tymm" || topic.startWeek < 1) {
    return null;
  }
  const titles: string[] = [];
  const seen = new Set<string>();
  for (const code of topic.outcomeCodes) {
    if (seen.has(code)) {
      continue;
    }
    const outcome = bundle.outcomes.find((item) => item.outcomeCode === code);
    if (!outcome || outcome.hours <= 0) {
      continue;
    }
    seen.add(code);
    titles.push(outcome.outcomeTitle);
  }
  if (titles.length === 0) {
    return null;
  }
  const span = topic.startWeek === topic.endWeek ? `${topic.startWeek}` : `${topic.startWeek}–${topic.endWeek}`;
  return `${span}. Hafta: ${titles.join(" · ")}`;
}

/** Ders, saatli her çıktının planlanan konusu saati doldurunca tamamdır. */
export function juniorCourseHoursComplete(slug: JuniorCourseSlug): boolean {
  const bundle = juniorCalendarBundle(slug);
  return bundle.outcomes
    .filter((outcome) => outcome.hours > 0)
    .every((outcome) => {
      const placed = bundle.topics
        .filter(
          (topic) =>
            topic.band === "tymm" && topic.hours > 0 && topic.outcomeCodes.includes(outcome.outcomeCode),
        )
        .reduce((total, topic) => total + topic.hours, 0);
      return placed >= outcome.hours;
    });
}
