/**
 * Ders oynatıcı medya adresleri — CSP `media-src 'self'` ile aynı köken.
 * Dış CDN / YouTube bu aşamada bağlanmaz.
 */

import { academyLessonAudioPlaybackSrc } from "@/lib/academy/lesson-audio";
import { isAcademyLessonAudioSealed } from "@/lib/academy/pilot-sku";

export const ACADEMY_DEMO_VIDEO_PUBLIC_PATH = "/academy/demo/office-ai-intro.mp4" as const;
export const ACADEMY_DEMO_AUDIO_PUBLIC_PATH = "/academy/demo/office-ai-podcast.wav" as const;

/**
 * Demo podcast'in ait olduğu tek ders. Ofis AI kaydı başka SKU'ya enjekte edilmez;
 * sesi olmayan derste oynatıcı dürüst "kayıt henüz yerleştirilmedi" kartı basar.
 */
export const ACADEMY_DEMO_AUDIO_COURSE_SLUG = "01_office_ai" as const;

export type AcademyLessonVideoKind = "file" | "hls" | "embed" | "none";

export function trimAcademyMediaUrl(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Podcast çözümü — açık `audioUrl` önceliklidir. Demo WAV fallback'i yalnız
 * `01_office_ai` derslerine kilitlidir; diğer SKU'larda `undefined` döner ve
 * yanlış içerik (ofis podcast'i) sessizce çalınmaz.
 */
export function resolveAcademyLessonAudioUrl(
  audioUrl?: string | null,
  courseSlug?: string | null,
): string | undefined {
  const explicit = trimAcademyMediaUrl(audioUrl);
  if (explicit) {
    return explicit;
  }
  return courseSlug?.trim() === ACADEMY_DEMO_AUDIO_COURSE_SLUG
    ? ACADEMY_DEMO_AUDIO_PUBLIC_PATH
    : undefined;
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
