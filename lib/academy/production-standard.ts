/**
 * Yapay zekâ eğitimi üretim ve doygunluk standardı — PEDAGOJI.md §D.1 ve §E.
 * Belgede §F yoktur. Mühür tabanı buradadır: ders en az 5 dakika, kurs en az 6 ders.
 * Üst dakika ve üst ders tavanı yoktur (Anayasa B4). Vitrin kartındaki dakika yuvarlaması
 * `lesson-meta.ts` içindedir; bu dosya mühür tabanıdır.
 */

export const ACADEMY_AI_COURSE_DURATION_MIN_MINUTES = 45;
/** Mühür tabanı. Spot kaset kurs sayılmaz. Üst ders adedi yoktur. */
export const ACADEMY_AI_LESSON_COUNT_MIN = 6;
/** Taban süre. Üst dakika tavanı yoktur: 12, 15, 18 dk serbesttir. */
export const ACADEMY_AI_LESSON_DURATION_MIN_MINUTES = 5;
/** 5 dk × 60 — mühürlü kaset alt tabanı (saniye). Üst saniye tavanı yoktur. */
export const ACADEMY_AI_LESSON_DURATION_MIN_SEC = ACADEMY_AI_LESSON_DURATION_MIN_MINUTES * 60;

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
