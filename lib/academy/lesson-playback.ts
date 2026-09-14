/**
 * Ders oynatıcı medya adresleri — CSP `media-src 'self'` ile aynı köken.
 * Dış CDN / YouTube bu aşamada bağlanmaz.
 */

import { academyLessonAudioPlaybackSrc } from "@/lib/academy/lesson-audio";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

export const ACADEMY_DEMO_VIDEO_PUBLIC_PATH = "/academy/demo/office-ai-intro.mp4" as const;
export const ACADEMY_DEMO_AUDIO_PUBLIC_PATH = "/academy/demo/office-ai-podcast.wav" as const;

/**
 * Eski demo podcast bağının SKU kilidi — taze ingest öncesi fallback yok.
 * Sesi olmayan derste oynatıcı dürüst "kayıt henüz yerleştirilmedi" kartı basar.
 */
export const ACADEMY_DEMO_AUDIO_COURSE_SLUG = null;

export type AcademyLessonVideoKind = "file" | "hls" | "embed" | "none";

export function trimAcademyMediaUrl(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Podcast çözümü — yalnız açık `audioUrl`. Demo WAV fallback'i kapalıdır;
 * sesi olmayan derste oynatıcı dürüst boş kart basar (A5).
 */
export function resolveAcademyLessonAudioUrl(
  audioUrl?: string | null,
  _courseSlug?: string | null,
): string | undefined {
  return trimAcademyMediaUrl(audioUrl);
}

/**
 * Oynatıcı kaynağı — mühürlü ders Callirrhoe WAV; aksi halde açık URL / demo podcast.
 */
export function resolveAcademyLessonPlayerAudioSrc(
  courseSlug: string,
  lessonKey: string,
  audioUrl?: string | null,
): string | undefined {
  if (isAcademyLessonAudioSealed(courseSlug, lessonKey)) {
    return academyLessonAudioPlaybackSrc(courseSlug, lessonKey);
  }
  return resolveAcademyLessonAudioUrl(audioUrl, courseSlug);
}

export function resolveAcademyLessonVideoUrl(videoUrl?: string | null): string | undefined {
  return trimAcademyMediaUrl(videoUrl);
}

export function classifyAcademyLessonVideoSrc(videoUrl?: string | null): {
  kind: AcademyLessonVideoKind;
  src?: string;
} {
  const src = resolveAcademyLessonVideoUrl(videoUrl);
  if (!src) {
    return { kind: "none" };
  }
  if (/youtube\.com|youtu\.be|vimeo\.com|player\.vimeo\.com/i.test(src)) {
    return { kind: "embed", src };
  }
  if (/\.m3u8(\?|#|$)/i.test(src)) {
    return { kind: "hls", src };
  }
  return { kind: "file", src };
}

/** Renk çubuğu / test-pattern / henüz çekilmemiş demo intro — vatandaşa basılmaz. */
const PLACEHOLDER_LESSON_VIDEO =
  /(?:^|\/)(?:test-pattern|office-ai-intro)\.mp4(?:\?|#|$)/i;

export function isAcademyPlaceholderLessonVideo(videoUrl?: string | null): boolean {
  const src = trimAcademyMediaUrl(videoUrl);
  if (!src) {
    return true;
  }
  return PLACEHOLDER_LESSON_VIDEO.test(src);
}

/** Oynatıcı yalnız gerçek (placeholder olmayan) dosya/HLS bağlar. */
export function academyLessonVideoShouldRender(videoUrl?: string | null): boolean {
  if (isAcademyPlaceholderLessonVideo(videoUrl)) {
    return false;
  }
  const classified = classifyAcademyLessonVideoSrc(videoUrl);
  return classified.kind === "file" || classified.kind === "hls";
}

export function academyLessonVideoMime(src: string): string {
  if (/\.webm(\?|#|$)/i.test(src)) {
    return "video/webm";
  }
  if (/\.m3u8(\?|#|$)/i.test(src)) {
    return "application/vnd.apple.mpegurl";
  }
  if (/\.ogg(\?|#|$)/i.test(src) || /\.ogv(\?|#|$)/i.test(src)) {
    return "video/ogg";
  }
  return "video/mp4";
}
