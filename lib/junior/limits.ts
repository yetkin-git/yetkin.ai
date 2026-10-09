/** Kapalı pilot tavanları. Oyun puanı para birimi değildir. */

export const JUNIOR_PILOT_GRADE = 6;

/** Sınıf seçici yalnız 6. sınıf pilotunu gösterir. Başka sınıfın metni yoktur. */
export const JUNIOR_PILOT_SHELF_LINE =
  "Bu sınıf yakında gelecektir. Şu an sadece 6. Sınıf Pilot aktiftir.";

export const JUNIOR_PILOT_SLUGS = [
  "jr_06_mat",
  "jr_06_fen",
  "jr_06_turkce",
  "jr_06_ing_main",
  "jr_06_sosyal",
] as const;

export const JUNIOR_ELECTIVE_SLUGS = [
  "jr_06_ing",
  "jr_06_alm",
  "jr_06_fra",
  "jr_06_siyer",
  "jr_06_kod",
  "jr_06_arp",
] as const;

/** Pakete dahil seçmeli ders hakkı. Her çocuk profili en fazla bu kadar ders seçer. */
export const JUNIOR_ELECTIVE_QUOTA = 3;

export const JUNIOR_PLAN_CODE = "junior-yearly";

export const JUNIOR_QUOTA_FULL_LABEL = "Paket Kotası Doldu / Düzenle";

/**
 * Pekiştirme örneğinin baktığı ders.
 * Ücretsiz konu listesinin evi katalogdur: her kartın ilk konusu (`juniorFreeLessonKeys`).
 */
export const JUNIOR_FREE_LESSON_KEY = "jr_06_mat-1";

/** Anlatış kaydı ve konu testi. İlk konunun metni bu cümleye girmez. */
export const JUNIOR_PAID_ACTION_ERROR =
  "Anlatış kaydı ve konu testi veli girişi ile yıllık paket ister.";

/** Soru arşivi on soruya ulaşmayan konuda test adımı. */
export const JUNIOR_QUIZ_PREPARING_LABEL = "Hazırlık Aşamasında";

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
export const JUNIOR_QUIZ_XP = 10;
export const JUNIOR_DAILY_XP_CAP = 40;
export const JUNIOR_XP_SCORE_FLOOR = 60;
/** Dinle ve Anlat geçer puanı. Bunun altı konu testini açmaz. */
export const JUNIOR_TELL_PASS_SCORE = JUNIOR_XP_SCORE_FLOOR;
/** Konu testi barajı. Yüzde yetmiş. */
export const JUNIOR_QUIZ_PASS_SCORE = 70;
/** Konu testi eşiği. Paket boyu `lib/junior/quiz` evindedir. */
export const JUNIOR_QUIZ_MIN_ITEMS = 3;
export const JUNIOR_POINTS_CAP = 20_000;

export const JUNIOR_PROFILES_PATH = "/api/junior-pilot/profiles";
export const JUNIOR_ELECTIVES_PATH = "/api/junior-pilot/electives";
export const JUNIOR_CHECKOUT_PATH = "/api/junior-pilot/checkout";
export const JUNIOR_TELL_PATH = "/api/junior-pilot/tell";
export const JUNIOR_PRACTICE_PATH = "/api/junior-pilot/practice";
export const JUNIOR_QUIZ_PATH = "/api/junior-pilot/quiz";
export const JUNIOR_GRADE_PATH = "/api/junior-pilot/grade";

/** Abonelik açıkken her çocuk profili ve paket bir kez sınıf değiştirir. */
export const JUNIOR_GRADE_SWITCH_RIGHTS = 1;

export const JUNIOR_GRADE_SWITCH_EXHAUSTED = "Sınıf değiştirme hakkınız tamamlanmıştır";

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
