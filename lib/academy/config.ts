/**
 * Academy ses / süre / metin standartları — tek merkez.
 * TTS üretim, teleprompter tempo ve müfredat bütçeleri buradan okunur.
 */

/** Mühürlü ofis sesi — Gözde / Callirrhoe (`ACADEMY_INSTRUCTOR_VOICE_BY_SLUG["01_office_ai"]`). */
export const VOICE_MODEL = "Callirrhoe" as const;

/** Stüdyo es süreleri (ms) — virgül < cümle < paragraf. */
export const PAUSES = {
  comma: 350,
  sentence: 700,
  paragraph: 1000,
} as const;

/** Bölüm başına hedef süre ve kelime bütçesi — yalnız ses mühürlü (WAV) dersler.
 * Compact makale müfredatı (ör. `01_office_ai`) bu bütçeye bağlı değildir.
 */
export const LIMITS = {
  minMinutes: 5.0,
  maxMinutes: 7.0,
  minWords: 750,
  maxWords: 1000,
} as const;

export type AcademyVoiceModel = typeof VOICE_MODEL;
export type AcademyPauses = typeof PAUSES;
export type AcademyLimits = typeof LIMITS;
