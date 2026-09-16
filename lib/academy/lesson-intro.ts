/**
 * 01_office_ai-1 giriş jeneriği — 0–2 sn yalnız Lyria, konuşma 2.0 saniyede.
 * Bitiş: son kelime bittiği an Lyria 0.70 zirve; logo + özet 3 sn, sonra 1.5 sn fade-out.
 * İzlemede harici API yok; mühürlü bed + TTS kaseti.
 */

import { ACADEMY_BED_OUTRO_TAIL_SEC } from "@/lib/academy/lesson-bed-duck";

export const ACADEMY_INTRO_GENERIC_SEC = 2 as const;
export const ACADEMY_INTRO_GENERIC_MIN_SEC = 1.5 as const;
export const ACADEMY_INTRO_GENERIC_LESSON_KEY = "01_office_ai-1" as const;
export const ACADEMY_INTRO_GENERIC_LESSON_KEYS = ["01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6", "01_office_ai-g1", "01_office_ai-w1", "01_office_ai-k1"] as const;
export const ACADEMY_INTRO_GENERIC_TITLE = "01_OFFICE_AI" as const;
export const ACADEMY_OUTRO_SUMMARY_LABELS = ["A1 sütun adı", "Birleşikleri çöz", "Yalın dille söyle"] as const;
export const ACADEMY_OFFICE_AI_2_OUTRO_SUMMARY_LABELS = [
  "Toplam ve trend",
  "Anomali ve risk",
  "Eylem cümlesi",
] as const;
export const ACADEMY_OFFICE_AI_3_OUTRO_SUMMARY_LABELS = [
  "Tek fikir / slayt",
  "Görsel yönlendir",
  "Taslağı aktar",
] as const;
export const ACADEMY_OFFICE_AI_4_OUTRO_SUMMARY_LABELS = [
  "Önemle etiketle",
  "Taslak yazdır",
  "Arşive kaldır",
] as const;
export const ACADEMY_OFFICE_AI_5_OUTRO_SUMMARY_LABELS = [
  "Formülle doğrula",
  "Mantık hatası sor",
  "İnsan gözü kilitle",
] as const;
export const ACADEMY_OFFICE_AI_6_OUTRO_SUMMARY_LABELS = [
  "Takvime yaz",
  "10+10+10 blok",
  "Maskeli kısa özet",
] as const;
export const ACADEMY_OFFICE_AI_G1_OUTRO_SUMMARY_LABELS = [
  "Gemini’yi aç",
  "Kutuyu tara",
  "Taşıma suyu bırak",
] as const;
export const ACADEMY_OFFICE_AI_K1_OUTRO_SUMMARY_LABELS = [
  "Ham veri yükleme",
  "Maskeleyip sor",
  "3. Kapı kısa özet",
] as const;

export function academyLessonHasIntroGeneric(lessonKey: string): boolean {
  return (ACADEMY_INTRO_GENERIC_LESSON_KEYS as readonly string[]).includes(lessonKey.trim());
}

export function academyLessonIntroOffsetSec(lessonKey: string): number {
  return academyLessonHasIntroGeneric(lessonKey) ? ACADEMY_INTRO_GENERIC_SEC : 0;
}

export function academyOutroSummaryLabels(lessonKey: string): readonly string[] {
  const key = lessonKey.trim();
  if (key === "01_office_ai-2") {
    return ACADEMY_OFFICE_AI_2_OUTRO_SUMMARY_LABELS;
  }
  if (key === "01_office_ai-3") {
    return ACADEMY_OFFICE_AI_3_OUTRO_SUMMARY_LABELS;
  }
  if (key === "01_office_ai-4") {
    return ACADEMY_OFFICE_AI_4_OUTRO_SUMMARY_LABELS;
  }
  if (key === "01_office_ai-5") {
    return ACADEMY_OFFICE_AI_5_OUTRO_SUMMARY_LABELS;
  }
  if (key === "01_office_ai-6") {
    return ACADEMY_OFFICE_AI_6_OUTRO_SUMMARY_LABELS;
  }
  if (key === "01_office_ai-g1") {
    return ACADEMY_OFFICE_AI_G1_OUTRO_SUMMARY_LABELS;
  }
  if (key === "01_office_ai-w1") {
    return ACADEMY_OFFICE_AI_W1_OUTRO_SUMMARY_LABELS;
  }
  if (key === "01_office_ai-k1") {
    return ACADEMY_OFFICE_AI_K1_OUTRO_SUMMARY_LABELS;
  }
  return ACADEMY_OUTRO_SUMMARY_LABELS;
}

export function academyLessonIntroIsActive(lessonKey: string, currentTime: number): boolean {
  const offset = academyLessonIntroOffsetSec(lessonKey);
  if (!(offset > 0)) {
    return false;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return t >= 0 && t < offset;
}

export function academyLessonSpeechHasStarted(lessonKey: string, currentTime: number): boolean {
  const offset = academyLessonIntroOffsetSec(lessonKey);
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return t >= offset;
}

export function academyLessonOutroIsActive(
  lessonKey: string,
  currentTime: number,
  speechEndSec: number,
): boolean {
  if (!academyLessonHasIntroGeneric(lessonKey)) {
    return false;
  }
  if (!(Number.isFinite(speechEndSec) && speechEndSec > 0)) {
    return false;
  }
  const t = Number.isFinite(currentTime) ? currentTime : 0;
  return t >= speechEndSec && t < speechEndSec + ACADEMY_BED_OUTRO_TAIL_SEC;
}
