/**
 * Ders ses medyası — Zero-Cost Streaming bağlayıcısı.
 * İzleme anında canlı TTS tetiklenmez; mühürlü yayın MP3 kamu yolundan okunur.
 * Bake WAV `media-bake/` altında kalır; Vercel paketine girmez.
 */

import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import {
  academyMediaSealedLessonKeys,
  isAcademyLessonAudioSealed,
} from "@/lib/academy/pilot-sku";

/**
 * Mühürlü WAV süreleri (saniye, yuvarlanmış).
 * Diskteki dosya ile `tests/academy/sealed-audio-pilot.test.ts` senkronlar.
 * Bake sonrası süre değişirse bu tabloyu güncelle. Taze ingest bekler.
 */
export const ACADEMY_SEALED_AUDIO_DURATION_SEC: Readonly<Record<string, number>> = {
  "01_office_ai-1": 607,
  "01_office_ai-2": 554,
  "01_office_ai-3": 576,
  "01_office_ai-4": 444,
  "01_office_ai-5": 518,
  "01_office_ai-6": 540,
  "01_office_ai-g1": 567,
  "01_office_ai-w1": 567,
  "01_office_ai-k1": 678,
};

type AcademySealedLessonKey = keyof typeof ACADEMY_SEALED_AUDIO_DURATION_SEC;

/**
 * Tarayıcı `Cache-Control: immutable` kırıcı. WAV/MP3 yenilenince damgayı yükselt.
 */
export const ACADEMY_SEALED_AUDIO_CACHE_V: Partial<Record<AcademySealedLessonKey, number>> = {};

/** Yayın uzantısı — bake WAV git/Vercel dışıdır. */
export const ACADEMY_SEALED_AUDIO_EXTENSION = "mp3" as const;
export const ACADEMY_SEALED_AUDIO_MIME = "audio/mpeg" as const;
/** Lyria 3.5 dip müzik — mühürlü bed; izlemede canlı üretim yok. */
export const ACADEMY_SEALED_BED_EXTENSION = "bed.mp3" as const;
export const ACADEMY_SEALED_BED_LESSON_KEYS = ["01_office_ai-1", "01_office_ai-2", "01_office_ai-3", "01_office_ai-4", "01_office_ai-5", "01_office_ai-6", "01_office_ai-g1", "01_office_ai-w1", "01_office_ai-k1"] as const;

/** 01_office_ai-2/3/4/5/6/g1/w1/k1 Lyria kaseti 1. ders bed’ini reuse eder — yeni Lyria çağrısı yok. */
function academyLessonBedAssetKey(lessonKey: string): string {
  const key = lessonKey.trim();
  return key === "01_office_ai-2" ||
    key === "01_office_ai-3" ||
    key === "01_office_ai-4" ||
    key === "01_office_ai-5" ||
    key === "01_office_ai-6" ||
    key === "01_office_ai-g1" ||
    key === "01_office_ai-w1" ||
    key === "01_office_ai-k1"
    ? "01_office_ai-1"
    : key;
}
/** Vercel Pro statik yükleme tavanı 1 GB; mühürlü MP3 bu bütçenin altında kalır. */
export const ACADEMY_SEALED_AUDIO_DEPLOY_MAX_BYTES = 400 * 1024 * 1024;

export function academyLessonAudioPublicPath(courseSlug: string, lessonKey: string): string {
  const slug = courseSlug.trim();
  const key = lessonKey.trim();
  return `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/${slug}/${key}.${ACADEMY_SEALED_AUDIO_EXTENSION}`;
}

export function academyLessonBedPublicPath(courseSlug: string, lessonKey: string): string {
  const slug = courseSlug.trim();
  const key = academyLessonBedAssetKey(lessonKey);
  return `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/${slug}/${key}.${ACADEMY_SEALED_BED_EXTENSION}`;
}

export function isAcademyLessonBedSealed(courseSlug: string, lessonKey: string): boolean {
  return (
    isAcademyLessonAudioSealed(courseSlug, lessonKey) &&
    (ACADEMY_SEALED_BED_LESSON_KEYS as readonly string[]).includes(lessonKey.trim())
  );
}

export function academyLessonBedPlaybackSrc(courseSlug: string, lessonKey: string): string {
  const path = academyLessonBedPublicPath(courseSlug, lessonKey);
  const version = academySealedAudioCacheVersion(lessonKey);
  return version > 0 ? `${path}?v=${version}` : path;
}

export function isAcademyMpegAudioBuffer(bytes: Uint8Array): boolean {
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return true;
  }
  return bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0;
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

/**
 * Mühürlü kaset kesin timings toplamı (saniye). Yuvarlak `ACADEMY_SEALED_AUDIO_DURATION_SEC` değil.
 * Vitrin / `estimatedTotalMinutes` bu fonksiyonu okur.
 */
export function academyCourseSealedDurationSec(courseSlug: string): number {
  let total = 0;
  for (const lessonKey of academyMediaSealedLessonKeys(courseSlug)) {
    const timings = loadAcademySealedAudioTimings(lessonKey);
    if (timings && timings.durationSec > 0) {
      total += timings.durationSec;
      continue;
    }
    const fallback = ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonKey as AcademySealedLessonKey];
    if (typeof fallback === "number" && fallback > 0) {
      total += fallback;
    }
  }
  return total;
}

/** Kurs süresi dakika — timings toplamı, iki ondalık. */
export function academyCourseSealedDurationMinutes(courseSlug: string): number {
  return Math.round((academyCourseSealedDurationSec(courseSlug) / 60) * 100) / 100;
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
  outroTailSec?: number;
}): number {
  const audio = finitePositiveSec(input.audioDuration);
  const sealed = finitePositiveSec(input.sealedDuration);
  const spoken = finitePositiveSec(input.spokenDuration);
  const trusted = sealed || spoken;
  const tail = finitePositiveSec(input.outroTailSec ?? 0);
  if (audio > 0 && trusted > 0 && audio <= 120 && trusted > 150) {
    return trusted + tail;
  }
  return (audio || trusted) + tail;
}

export { isAcademyLessonAudioSealed };
