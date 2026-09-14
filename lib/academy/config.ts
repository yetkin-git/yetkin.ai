/**
 * Academy ses / süre / metin standartları — tek merkez.
 * TTS üretim, teleprompter tempo ve müfredat bütçeleri buradan okunur.
 * Ders/kurs dakika bantları PEDAGOJI.md §F ile `production-standard.ts` SSOT’udur.
 */

import {
  ACADEMY_AI_COURSE_DURATION_MAX_MINUTES,
  ACADEMY_AI_COURSE_DURATION_MIN_MINUTES,
  ACADEMY_AI_LESSON_DURATION_MAX_MINUTES,
  ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
} from "@/lib/academy/production-standard";

/** Mühürlü ofis sesi — Gözde / Callirrhoe (`ACADEMY_INSTRUCTOR_VOICE_BY_SLUG["01_office_ai"]`). */
export const VOICE_MODEL = "Callirrhoe" as const;

/** Stüdyo es süreleri (ms) — virgül < cümle < paragraf. */
export const PAUSES = {
  comma: 350,
  sentence: 700,
  paragraph: 1000,
} as const;

/**
 * Bölüm başına hedef süre ve kelime bütçesi — yalnız ses mühürlü (WAV) dersler.
 * Compact makale müfredatı (Anayasa B4) bu bütçeye bağlı değildir.
 * Dakika: §F 7–12 (ders), 45–90 (kurs). Kelime: ~150 wpm × ders bandı.
 * Yayın 30 kaset E.5 sıfır re-bake ile bu banda çekilmez; yeni bake bu LIMITS’i okur.
 */
export const LIMITS = {
  minMinutes: ACADEMY_AI_LESSON_DURATION_MIN_MINUTES,
  maxMinutes: ACADEMY_AI_LESSON_DURATION_MAX_MINUTES,
  courseMinMinutes: ACADEMY_AI_COURSE_DURATION_MIN_MINUTES,
  courseMaxMinutes: ACADEMY_AI_COURSE_DURATION_MAX_MINUTES,
  minWords: 1050,
  maxWords: 1800,
} as const;

export type AcademyVoiceModel = typeof VOICE_MODEL;
export type AcademyPauses = typeof PAUSES;
export type AcademyLimits = typeof LIMITS;
