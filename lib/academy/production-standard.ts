/**
 * Yapay zekâ eğitimi üretim ve doygunluk standardı — PEDAGOJI.md §D.1 ve §E.
 * Belgede §F yoktur. Mühür tabanı buradadır: ders en az 5 dakika, kurs en az 6 ders.
 * Üst dakika dayatması yoktur. TTS bütçe tavanı vardır: kurs 100 istek, ders 10–12 istek.
 * Vitrin kartındaki dakika yuvarlaması `lesson-meta.ts` içindedir; bu dosya mühür tabanıdır.
 */

export const ACADEMY_AI_COURSE_DURATION_MIN_MINUTES = 45;
/** Mühür tabanı. Spot kaset kurs sayılmaz. Ders adedi TTS bütçesine (100 istek) sığar. */
export const ACADEMY_AI_LESSON_COUNT_MIN = 6;
/** Taban süre. 12, 15, 18 dk serbesttir. Ders başına istek bandı 10–12’dir. */
export const ACADEMY_AI_LESSON_DURATION_MIN_MINUTES = 5;
/** 5 dk × 60 — mühürlü kaset alt tabanı (saniye). */
export const ACADEMY_AI_LESSON_DURATION_MIN_SEC = ACADEMY_AI_LESSON_DURATION_MIN_MINUTES * 60;

/**
 * 1 Maç = MAX 100 Düdük.
 * Bir kursun Gemini TTS isteği, uzatma ve duraklama dahil bu tavanı aşmaz.
 */
export const ACADEMY_MATCH_WHISTLE_MAX = 100;
/** Normal süre. Temel anlatım bu bantta planlanır. */
export const ACADEMY_MATCH_WHISTLE_REGULATION_MIN = 70;
export const ACADEMY_MATCH_WHISTLE_REGULATION_MAX = 80;
/** Yedek. Yalnız zorunlu uzatma ve duraklama bu payı kullanır. */
export const ACADEMY_MATCH_WHISTLE_RESERVE_MIN = 15;
export const ACADEMY_MATCH_WHISTLE_RESERVE_MAX = 20;

export type AcademyMatchWhistlePlan = {
  requests: number;
  withinCap: boolean;
  inRegulationBand: boolean;
  reserveRemaining: number;
};

export function academyMatchWhistlePlan(requests: number): AcademyMatchWhistlePlan {
  return {
    requests,
    withinCap: requests <= ACADEMY_MATCH_WHISTLE_MAX,
    inRegulationBand:
      requests >= ACADEMY_MATCH_WHISTLE_REGULATION_MIN &&
      requests <= ACADEMY_MATCH_WHISTLE_REGULATION_MAX,
    reserveRemaining: ACADEMY_MATCH_WHISTLE_MAX - requests,
  };
}

/** Plan 100 düdüğü aşarsa fırın açılmaz. */
export function assertAcademyMatchWhistleBudget(requests: number): void {
  if (!Number.isInteger(requests) || requests < 0) {
    throw new Error("Maç düdük sayısı geçersiz.");
  }
  if (requests > ACADEMY_MATCH_WHISTLE_MAX) {
    throw new Error(
      `1 Maç = MAX 100 Düdük. Plan ${requests} istek, tavan ${ACADEMY_MATCH_WHISTLE_MAX}. API çağrısı yok.`,
    );
  }
}

export const ACADEMY_TTS_VOICE_GENDERS = ["female", "male"] as const;

export type AcademyTtsVoiceGender = (typeof ACADEMY_TTS_VOICE_GENDERS)[number];

export const ACADEMY_LESSON_SATURATION_BEATS = [
  {
    id: "warmup_problem",
    order: 1,
    label: "Isınma / İş Problemi",
    targetMinutes: 1.5,
    purpose: "Gerçek iş hayatı karşılığı ve problemin nedeni",
  },
  {
    id: "scenario_core",
    order: 2,
    label: "Birinci Senaryo / Temel Yöntem",
    targetMinutes: 3.5,
    purpose: "İlk istem ve çözüm — ekranda çalışan işlem",
  },
  {
    id: "scenario_edge",
    order: 3,
    label: "İkinci Senaryo / İstisna veya Kritik Durum",
    targetMinutes: 3.5,
    purpose: "Edge-case, yanlış vs doğru, kritik durum (ÖNCE / SONRA split)",
  },
  {
    id: "summary_field",
    order: 4,
    label: "Özet & Saha Görevi",
    targetMinutes: 1.5,
    purpose: "Cebine koyacakların ve aksiyon görevi",
  },
] as const;

export type AcademyLessonSaturationBeatId = (typeof ACADEMY_LESSON_SATURATION_BEATS)[number]["id"];

export const ACADEMY_SEALED_MEDIA_LAYERS = [
  "full_text",
  "timed_cues",
  "diagrams",
  "cinematic_media",
] as const;

export type AcademySealedMediaLayer = (typeof ACADEMY_SEALED_MEDIA_LAYERS)[number];

export const ACADEMY_OPTIONAL_LEVEL_PACKAGES = ["Temel", "Orta", "İleri"] as const;

export type AcademyOptionalLevelPackage = (typeof ACADEMY_OPTIONAL_LEVEL_PACKAGES)[number];

export function isAcademyTtsVoiceGender(value: string): value is AcademyTtsVoiceGender {
  return (ACADEMY_TTS_VOICE_GENDERS as readonly string[]).includes(value.trim());
}

export function academyTtsVoiceGenderFromLabel(raw: string | null | undefined): AcademyTtsVoiceGender | null {
  const folded = raw?.trim().toLowerCase() ?? "";
  if (folded === "female" || folded === "kadin" || folded === "kadın") {
    return "female";
  }
  if (folded === "male" || folded === "erkek") {
    return "male";
  }
  return null;
}

export function isAcademyAiCourseDurationMinutes(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= ACADEMY_AI_COURSE_DURATION_MIN_MINUTES;
}

export function isAcademyAiLessonCount(count: number): boolean {
  return Number.isInteger(count) && count >= ACADEMY_AI_LESSON_COUNT_MIN;
}

export function isAcademyAiLessonDurationMinutes(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= ACADEMY_AI_LESSON_DURATION_MIN_MINUTES;
}

export function isAcademyAiLessonDurationSec(seconds: number): boolean {
  return Number.isFinite(seconds) && seconds >= ACADEMY_AI_LESSON_DURATION_MIN_SEC;
}

export function academyLessonSaturationTotalMinutes(): number {
  return ACADEMY_LESSON_SATURATION_BEATS.reduce((sum, beat) => sum + beat.targetMinutes, 0);
}
