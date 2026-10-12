import type { SchoolWeek } from "../schema/topic";

/** Takvim dosyası değişince raf önbelleği bu sürümü de taşır. */
export const JUNIOR_CALENDAR_VERSION = "2026-2027.1";

/**
 * 14 Eylül 2026 pazartesi = 1. hafta. 25 Haziran 2027 cuma = 41. hafta.
 * Ara tatil ve yarıyıl MEB 13 Haziran 2026 çalışma takvimi genelgesindedir.
 * 11 Kasım 2026 matematik ortak yazılısı tek gündür; o hafta teach kalır.
 * 19. hafta 1. dönem sonudur. 39. hafta 8 Haziran 2027 Türkçe ortak yazılısını taşır.
 * 41. hafta okul temelli planlamadır. Bu haftalara konu bindirilmez.
 */
const MARKS: Record<number, SchoolWeek> = {
  10: { week: 10, kind: "break", label: "1. dönem ara tatili, 16-20 Kasım 2026" },
  19: { week: 19, kind: "exam", label: "1. dönem sonu yazılı haftası, 18-22 Ocak 2027" },
  20: { week: 20, kind: "break", label: "Yarıyıl tatili, 25-31 Ocak 2027" },
  21: { week: 21, kind: "break", label: "Yarıyıl tatili, 1-5 Şubat 2027" },
  26: { week: 26, kind: "break", label: "2. dönem ara tatili, 8-12 Mart 2027" },
  39: { week: 39, kind: "exam", label: "6. sınıf Türkçe ortak yazılı haftası, 8 Haziran 2027" },
  41: { week: 41, kind: "okul-temelli", label: "Okul temelli planlama, 21-25 Haziran 2027" },
};

export const JUNIOR_SCHOOL_WEEK_COUNT = 41;

export function buildSchoolWeeks(): SchoolWeek[] {
  return Array.from({ length: JUNIOR_SCHOOL_WEEK_COUNT }, (_, index) => {
    const week = index + 1;
    return MARKS[week] ?? { week, kind: "teach" };
  });
}
