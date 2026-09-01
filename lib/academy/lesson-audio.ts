/**
 * Ders ses medyası — Zero-Cost Streaming bağlayıcısı.
 * İzleme anında canlı TTS tetiklenmez; mühürlü WAV kamu yolundan okunur.
 */

import { ACADEMY_MEDIA_PUBLIC_ROOT } from "@/lib/academy/lesson-media";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

/**
 * Mühürlü WAV süreleri (saniye, yuvarlanmış).
 * Diskteki dosya ile `tests/academy/media-release-seal.test.ts` senkronlar.
 * Bake sonrası süre değişirse bu tabloyu güncelle.
 */
export const ACADEMY_SEALED_AUDIO_DURATION_SEC = {
  "ai-agent-temel-1": 113,
  "ai-agent-temel-2": 115,
  "ai-agent-temel-3": 115,
  "ai-agent-temel-4": 128,
  "ai-agent-temel-5": 114,
  "ai-agent-temel-6": 121,
  "ai-agent-orta-1": 116,
  "ai-agent-orta-2": 108,
  "ai-agent-orta-3": 108,
  "ai-agent-orta-4": 105,
  "ai-agent-orta-5": 106,
  "ai-agent-orta-6": 115,
  "ai-agent-ileri-1": 116,
  "ai-agent-ileri-2": 101,
  "ai-agent-ileri-3": 101,
  "ai-agent-ileri-4": 104,
} as const;

export function academyLessonAudioPublicPath(courseSlug: string, lessonKey: string): string {
  const slug = courseSlug.trim();
  const key = lessonKey.trim();
  return `${ACADEMY_MEDIA_PUBLIC_ROOT}/audio/${slug}/${key}.wav`;
}

export function academySealedAudioDurationSec(courseSlug: string, lessonKey: string): number {
  if (!isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
    return 0;
  }
  const sec = ACADEMY_SEALED_AUDIO_DURATION_SEC[lessonKey as keyof typeof ACADEMY_SEALED_AUDIO_DURATION_SEC];
  return typeof sec === "number" && sec > 0 ? sec : 0;
}

export { isAcademyLessonAudioSealed };
