/** Kapalı pilot tavanları. Oyun puanı para birimi değildir. */

export const JUNIOR_PILOT_GRADE = 6;

export const JUNIOR_PILOT_SLUGS = ["jr_06_mat", "jr_06_fen", "jr_06_turkce"] as const;

export const JUNIOR_FREE_LESSON_KEYS = ["jr_06_mat-1", "jr_06_fen-1", "jr_06_turkce-1"] as const;

/** Pekiştirme testinin baktığı ders. Üç dersin ilk konusu da ücretsizdir. */
export const JUNIOR_FREE_LESSON_KEY = JUNIOR_FREE_LESSON_KEYS[0];

export const JUNIOR_GRADE_MIN = 5;
export const JUNIOR_GRADE_MAX = 12;
export const JUNIOR_PROFILE_CAP = 4;
export const JUNIOR_NICKNAME_MIN = 2;
export const JUNIOR_NICKNAME_MAX = 20;

export const JUNIOR_TELL_MIN_SEC = 15;
export const JUNIOR_TELL_MAX_SEC = 45;
export const JUNIOR_AUDIO_MIN_BYTES = 8_000;
export const JUNIOR_AUDIO_MAX_BYTES = 700_000;
export const JUNIOR_TEXT_MIN = 20;
export const JUNIOR_TEXT_MAX = 600;

export const JUNIOR_TELLS_PER_DAY = 8;
export const JUNIOR_TELL_XP = 12;
export const JUNIOR_PRACTICE_XP = 8;
export const JUNIOR_DAILY_XP_CAP = 40;
export const JUNIOR_XP_SCORE_FLOOR = 60;
export const JUNIOR_POINTS_CAP = 20_000;

export const JUNIOR_PROFILES_PATH = "/api/junior-pilot/profiles";
export const JUNIOR_TELL_PATH = "/api/junior-pilot/tell";
export const JUNIOR_PRACTICE_PATH = "/api/junior-pilot/practice";

export const JUNIOR_AUDIO_MIME_TYPES = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg", "audio/wav"] as const;

export const JUNIOR_BADGE_LABELS = {
  "ilk-anlatis": "İlk anlatış",
  "uc-ders": "Üç ders",
  pekistirme: "Pekiştirme",
} as const;

export type JuniorBadgeId = keyof typeof JUNIOR_BADGE_LABELS;

export function juniorBirthYearBounds(now = new Date()): { min: number; max: number } {
  const year = now.getFullYear();
  return { min: year - 18, max: year - 9 };
}

export function juniorBirthYearChoices(now = new Date()): number[] {
  const { min, max } = juniorBirthYearBounds(now);
  const years: number[] = [];
  for (let year = max; year >= min; year -= 1) {
    years.push(year);
  }
  return years;
}

export function juniorDefaultBirthYear(now = new Date()): number {
  return now.getFullYear() - 11;
}

export function normalizeJuniorMime(mimeType: string): string {
  const base = mimeType.trim().toLowerCase().split(";")[0]?.trim() ?? "";
  return base;
}

export function juniorAudioDecodedBytes(base64: string): number | null {
  const cleaned = base64.replace(/\s/g, "");
  if (!cleaned || cleaned.length % 4 !== 0) {
    return null;
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(cleaned)) {
    return null;
  }
  const padding = cleaned.endsWith("==") ? 2 : cleaned.endsWith("=") ? 1 : 0;
  return (cleaned.length / 4) * 3 - padding;
}
