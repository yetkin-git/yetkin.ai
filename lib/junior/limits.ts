import { JUNIOR_SCHOOL_SEGMENT } from "@/lib/kernel/catalog-ids/school-segments";

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

/**
 * Çekirdek İngilizce (`jr_06_ing_main`) dururken bu taslak paket fiyatına girmez.
 * Katalogda kalır. Rozet `JUNIOR_QUIZ_PREPARING_LABEL` dir.
 */
export const JUNIOR_ELECTIVE_PRICE_EXCLUDED = ["jr_06_ing"] as const;

export const JUNIOR_ELECTIVE_DRAFT_PRICE_ERROR =
  "Bu ders hazırlık aşamasındadır. Yıllık paket vaadine girmez.";

/**
 * Mühür kapısını geçmeyen seçmeli ders paket seçimine eklenmez ve paketinde açılmaz (T-06).
 * Seçili olanı çıkarmak her zaman mümkündür. Etiket vitrin ve seçim ekranında kullanılır.
 */
export const JUNIOR_ELECTIVE_SOON_LABEL = "Yakında";

export const JUNIOR_ELECTIVE_SOON_ERROR = "Bu seçmeli ders henüz hazır değil. Hazır olunca pakete eklenebilir.";

export const JUNIOR_ELECTIVE_SOON_LESSON_ERROR =
  "Bu seçmeli ders henüz hazır değil. Paketinde açılmaz; hazır olunca açılır.";

/**
 * Pakete dahil seçmeli ders hakkı. Her çocuk profili en fazla bu kadar ders seçer.
 * Kota sayısının çalışma zamanı tek evidir. Şema varsayılanı ve SQL CHECK bu sayıya mühürlenir.
 */
export const JUNIOR_ELECTIVE_QUOTA = 3;

/** Kota cümleleri bu sabitten türer. Metin içine ders sayısı gömülmez. */
export function juniorElectiveQuotaLimitError(): string {
  return `En fazla ${JUNIOR_ELECTIVE_QUOTA} seçmeli ders seçilir.`;
}

export function juniorElectiveQuotaTitle(): string {
  return `${JUNIOR_ELECTIVE_QUOTA} seçmeli ders`;
}

export function juniorElectiveQuotaFullHint(): string {
  return `${JUNIOR_ELECTIVE_QUOTA} ders dolunca diğerleri kota durumuna geçer.`;
}

export function juniorElectiveQuotaRightsHint(): string {
  return `Paket açılınca ${JUNIOR_ELECTIVE_QUOTA} ders hakkı durur.`;
}

export function juniorElectiveQuotaOpenHint(): string {
  return `${JUNIOR_ELECTIVE_QUOTA} seçmeli ders hakkın duruyor.`;
}

export function juniorElectiveNotInQuotaError(): string {
  return `Bu seçmeli ders paket kotanda yok. En fazla ${JUNIOR_ELECTIVE_QUOTA} ders seçilir.`;
}

/** Mühürsüz seçmeli kart. Vitrin bu etiketi hazır ders gibi sunmaz. */
export const JUNIOR_ELECTIVE_DEVELOPING_LABEL = "Geliştirme Aşamasında";

export const JUNIOR_PLAN_CODE = "junior-yearly";

export const JUNIOR_QUOTA_FULL_LABEL = "Paket Kotası Doldu / Düzenle";

/**
 * Ücretsiz ilk ders kapısı: güncel haftanın (2026-2027 Maarif takvimi) ilk matematik dersi.
 * Hafta değişince bu sabit elle taşınır; `juniorFreeLessonKeys` listesi bu anahtarı her zaman içerir.
 */
export const JUNIOR_FREE_LESSON_KEY = "jr_06_mat-14";

/**
 * İngilizce ücretsiz kapısı. 1–5. hafta: hak, sorumluluk ve sınıf kuralı.
 * Dosya sırasındaki `jr_06_ing_main-1` 35–36. haftadadır ve yıllık pakettedir.
 */
export const JUNIOR_ING_FREE_LESSON_KEY = "jr_06_ing_main-20";

/**
 * Dosya sırasındaki `{slug}-1` yerine kullanılan kart açılışı.
 * İngilizce rafı `JUNIOR_ING_FREE_LESSON_KEY` ile açılır.
 */
export const JUNIOR_FREE_OPENER_OVERRIDE: Readonly<Record<string, string>> = {
  jr_06_ing_main: JUNIOR_ING_FREE_LESSON_KEY,
};

/**
 * Kart başı ücretsiz açılıştan çıkarılan anahtarlar.
 * Müfredat dışı arşiv silindi; liste boştur. Matematik kartı `jr_06_mat-5` ile açılır.
 */
export const JUNIOR_ARCHIVED_OPENER_KEYS: readonly string[] = [];

/** Anlatış kaydı ve üç soruluk kontrol. İlk konunun metni bu cümleye girmez. */
export const JUNIOR_PAID_ACTION_ERROR =
  "Anlatış kaydı ve 3 soruluk hızlı konu kontrolü veli girişi ile yıllık paket ister.";

/** Mühür geçmeyen konu. On soruluk vaat değildir. */
export const JUNIOR_QUIZ_PREPARING_LABEL = "Hazırlık Aşamasında";

/** Çekirdek konu kontrolünün adı. Paket boyu üçtür (`JUNIOR_QUIZ_MIN_ITEMS`). */
export const JUNIOR_QUIZ_CONTROL_LABEL = "3 Soruluk Hızlı Konu Kontrolü";

/** Ortaokul bandı. 9–12 ve YKS `YOUNG_SCHOOL_SEGMENT` içindedir. */
export const JUNIOR_GRADE_MIN = JUNIOR_SCHOOL_SEGMENT.gradeMin;
export const JUNIOR_GRADE_MAX = JUNIOR_SCHOOL_SEGMENT.gradeMax;
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
/** Dinle ve Anlat geçer puanı. Bunun altı hızlı konu kontrolünü açmaz. */
export const JUNIOR_TELL_PASS_SCORE = JUNIOR_XP_SCORE_FLOOR;
/** Hızlı konu kontrolü barajı. Yüzde yetmiş. */
export const JUNIOR_QUIZ_PASS_SCORE = 70;
/** Hızlı konu kontrolü eşiği. Çekirdek paket üç sorudur. Ev `lib/junior/quiz`. */
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
