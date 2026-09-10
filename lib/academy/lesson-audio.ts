/**
 * Ders ses medyası — Zero-Cost Streaming bağlayıcısı.
 * İzleme anında canlı TTS tetiklenmez; mühürlü WAV kamu yolundan okunur.
 */

import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

/**
 * Mühürlü WAV süreleri (saniye, yuvarlanmış).
 * Diskteki dosya ile `tests/academy/sealed-audio-pilot.test.ts` senkronlar.
 * Bake sonrası süre değişirse bu tabloyu güncelle.
 */
export const ACADEMY_SEALED_AUDIO_DURATION_SEC = {
  "01_office_ai-1": 549,
  "01_office_ai-2": 441,
  "01_office_ai-3": 454,
  "01_office_ai-4": 408,
  "01_office_ai-5": 382,
  "01_office_ai-6": 342,
  "02_ecommerce_ai-1": 572,
  "02_ecommerce_ai-2": 621,
  "02_ecommerce_ai-3": 586,
  "02_ecommerce_ai-4": 612,
  "02_ecommerce_ai-5": 521,
  "02_ecommerce_ai-6": 492,
  "03_social_media_ai-1": 451,
  "03_social_media_ai-2": 414,
  "03_social_media_ai-3": 394,
  "03_social_media_ai-4": 383,
  "03_social_media_ai-5": 387,
  "03_social_media_ai-6": 379,
  "04_chatbot_nocode-1": 425,
  "04_chatbot_nocode-2": 426,
  "04_chatbot_nocode-3": 440,
  "04_chatbot_nocode-4": 415,
  "04_chatbot_nocode-5": 478,
  "04_chatbot_nocode-6": 430,
  "05_prompt_practice-1": 439,
  "05_prompt_practice-2": 425,
  "05_prompt_practice-3": 427,
  "05_prompt_practice-4": 436,
  "05_prompt_practice-5": 455,
  "05_prompt_practice-6": 466,
} as const;

type AcademySealedLessonKey = keyof typeof ACADEMY_SEALED_AUDIO_DURATION_SEC;

/**
 * Tarayıcı `Cache-Control: immutable` kırıcı. WAV/MP3 yenilenince damgayı yükselt.
 */
export const ACADEMY_SEALED_AUDIO_CACHE_V: Partial<Record<AcademySealedLessonKey, number>> = {};

export function academyLessonAudioPublicPath(courseSlug: string, lessonKey: string): string {
  const slug = courseSlug.trim();
  const key = lessonKey.trim();
  return `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/${slug}/${key}.wav`;
}

export function academySealedAudioCacheVersion(lessonKey: string): number {
  const timings = loadAcademySealedAudioTimings(lessonKey);
  if (timings && timings.cacheV > 0) {
    return timings.cacheV;
  }
  const key = lessonKey.trim() as AcademySealedLessonKey;
  const revision = ACADEMY_SEALED_AUDIO_CACHE_V[key];
  if (typeof revision === "number" && revision > 0) {
    return revision;
  }
  const duration = ACADEMY_SEALED_AUDIO_DURATION_SEC[key];
  return typeof duration === "number" && duration > 0 ? duration : 0;
}

/** Oynatıcı adresi — kanonik yola `?v=` damgası; disk/DB yolu değişmez. */
export function academyLessonAudioPlaybackSrc(courseSlug: string, lessonKey: string): string {
  const path = academyLessonAudioPublicPath(courseSlug, lessonKey);
  const version = academySealedAudioCacheVersion(lessonKey);
  return version > 0 ? `${path}?v=${version}` : path;
}

export function academySealedAudioDurationSec(courseSlug: string, lessonKey: string): number {
  if (!isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
    return 0;
  }
  const timings = loadAcademySealedAudioTimings(lessonKey);
  if (timings && timings.durationSec > 0) {
    return Math.round(timings.durationSec);
  }
  const sec = ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonKey as keyof typeof ACADEMY_SEALED_AUDIO_DURATION_SEC];
  return typeof sec === "number" && sec > 0 ? sec : 0;
}

function finitePositiveSec(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Oynatıcı süresi — Chrome 24 kHz WAV ~1:47 (107 sn) uydurma duration basar.
 * Mühürlü / kelime saati daha uzunsa o damga kullanılır.
 */
export function academyPlayerClockDurationSec(input: {
  audioDuration: number;
  sealedDuration: number;
  spokenDuration: number;
}): number {
  const audio = finitePositiveSec(input.audioDuration);
  const sealed = finitePositiveSec(input.sealedDuration);
  const spoken = finitePositiveSec(input.spokenDuration);
  const trusted = sealed || spoken;
  if (audio > 0 && trusted > 0 && audio <= 120 && trusted > 150) {
    return trusted;
  }
  return audio || trusted;
}

export { isAcademyLessonAudioSealed };
