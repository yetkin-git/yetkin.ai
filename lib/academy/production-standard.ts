/**
 * Yapay zekâ eğitimi üretim ve doygunluk standardı — PEDAGOJI.md §F.
 * Compact makale gövdesini kesmez (Anayasa B4). Mühürlü sinema / konuşma metni bu banda kilitlenir.
 */

export const ACADEMY_AI_COURSE_DURATION_MIN_MINUTES = 45;
export const ACADEMY_AI_COURSE_DURATION_MAX_MINUTES = 90;
export const ACADEMY_AI_LESSON_COUNT_MIN = 6;
export const ACADEMY_AI_LESSON_COUNT_MAX = 8;
export const ACADEMY_AI_LESSON_DURATION_MIN_MINUTES = 7;
export const ACADEMY_AI_LESSON_DURATION_MAX_MINUTES = 12;

export const ACADEMY_TTS_VOICE_GENDERS = ["female", "male"] as const;

export type AcademyTtsVoiceGender = (typeof ACADEMY_TTS_VOICE_GENDERS)[number];

export const ACADEMY_LESSON_SATURATION_BEATS = [
  {
    id: "warmup_problem",
    order: 1,
    label: "Isınma / İş Problemi",
    targetMinutes: 1.5,
    purpose: "Gerçek iş hayatı karşılığı, risk ve problem",
  },
  {
    id: "scenario_core",
    order: 2,
    label: "Birinci Senaryo / Temel Yöntem",
    targetMinutes: 3.5,
    purpose: "İlk istem/kod ve çözüm",
  },
  {
    id: "scenario_edge",
    order: 3,
    label: "İkinci Senaryo / İstisna veya Kritik Durum",
    targetMinutes: 3.5,
    purpose: "Veri bozukluğu, edge-case, kritik müdahale",
  },
  {
    id: "summary_field",
    order: 4,
    label: "Özet & Saha Görevi",
    targetMinutes: 1.5,
    purpose: "Cebine koyacakların ve sınav öncesi mikro görev",
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
  return Number.isFinite(minutes) && minutes >= ACADEMY_AI_COURSE_DURATION_MIN_MINUTES && minutes <= ACADEMY_AI_COURSE_DURATION_MAX_MINUTES;
}

export function isAcademyAiLessonCount(count: number): boolean {
  return Number.isInteger(count) && count >= ACADEMY_AI_LESSON_COUNT_MIN && count <= ACADEMY_AI_LESSON_COUNT_MAX;
}

export function isAcademyAiLessonDurationMinutes(minutes: number): boolean {
  return Number.isFinite(minutes) && minutes >= ACADEMY_AI_LESSON_DURATION_MIN_MINUTES && minutes <= ACADEMY_AI_LESSON_DURATION_MAX_MINUTES;
}

export function academyLessonSaturationTotalMinutes(): number {
  return ACADEMY_LESSON_SATURATION_BEATS.reduce((sum, beat) => sum + beat.targetMinutes, 0);
}
