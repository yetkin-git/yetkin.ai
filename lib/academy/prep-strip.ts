/**
 * Hazırlık şeridi — lesson-index ve sınav yoluna girmez.
 * Vatandaş rozeti «Başlamadan Önce». Tamamlama tarayıcıda durur; mühür istemez.
 * Ses katmanı (Ders 0 kaseti) 101 mühründen ayrı bir bayrakla açılır; varsayılan makaledir.
 */

import { OFFICE_AI_PREP_STRIP, OFFICE_AI_PREP_STRIP_KEY } from "@/lib/academy/curricula/office_ai/prep";
import { academyLessonAudioPublicPath } from "@/lib/academy/lesson-audio";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import {
  loadAcademyTeleprompterFlow,
  type AcademyTeleprompterLine,
} from "@/lib/academy/lesson-teleprompter-flow";

export type AcademyPrepStrip = {
  key: string;
  slug: string;
  title: string;
  badge: string;
  estimatedMinutes: number;
  contentMarkdown: string;
};

export const ACADEMY_PREP_STRIP_STORAGE_PREFIX = "academy_prep_strip_done" as const;

export function academyPrepStripForSlug(slug: string): AcademyPrepStrip | null {
  if (slug.trim() === OFFICE_AI_PREP_STRIP.slug) {
    return OFFICE_AI_PREP_STRIP;
  }
  return null;
}

export function isAcademyPrepStripKey(lessonKey: string): boolean {
  return lessonKey.trim() === OFFICE_AI_PREP_STRIP_KEY;
}

/**
 * Ders 0 ses mührü — 101 `ACADEMY_MEDIA_SEALED_AUDIO` listesinden ayrı bayrak.
 * WAV fırınlanıp MP3 yayın yoluna düşmeden `true` yapılmaz; varsayılan makale-only.
 * Bayrak `true` olmadan oynatıcı ses aramaz (dürüst yüzey: 404 sessizliği yok).
 */
export const ACADEMY_PREP_STRIP_AUDIO_SEALED: Readonly<Record<string, boolean>> = {
  "01_office_ai": false,
};

export function isAcademyPrepStripAudioSealed(slug: string): boolean {
  return ACADEMY_PREP_STRIP_AUDIO_SEALED[slug.trim()] === true;
}

/** Hazırlık şeridi ses adresi — mühürlü dersle aynı yayın kökü, ayrı anahtar. */
export function academyPrepStripAudioPlaybackSrc(slug: string): string | null {
  const strip = academyPrepStripForSlug(slug);
  if (!strip) {
    return null;
  }
  const timings = loadAcademySealedAudioTimings(strip.key);
  if (!timings || !(timings.durationSec > 0)) {
    return null;
  }
  const path = academyLessonAudioPublicPath(slug.trim(), strip.key);
  return timings.cacheV > 0 ? `${path}?v=${timings.cacheV}` : path;
}

/** Hazırlık şeridi ses süresi — timings TAHMİNİ olabilir; fırın ezer. */
export function academyPrepStripAudioDurationSec(slug: string): number {
  const strip = academyPrepStripForSlug(slug);
  if (!strip) {
    return 0;
  }
  const timings = loadAcademySealedAudioTimings(strip.key);
  if (!timings || !(timings.durationSec > 0)) {
    return 0;
  }
  return Math.round(timings.durationSec);
}

export type AcademyPrepStripArticleLayer = {
  kind: "article";
};

export type AcademyPrepStripKaraokeLayer = {
  kind: "article+karaoke";
  lessonKey: string;
  audioSrc: string;
  cues: readonly AcademyTeleprompterLine[];
  durationSec: number;
};

export type AcademyPrepStripPlayerLayer =
  | AcademyPrepStripArticleLayer
  | AcademyPrepStripKaraokeLayer;

/** Şerit oynatıcı katmanı — ses mührü kapalıysa makale; açıksa karaoke. 101 sınav yoluna dokunmaz. */
export function academyPrepStripPlayerLayer(slug: string): AcademyPrepStripPlayerLayer {
  const strip = academyPrepStripForSlug(slug);
  if (!strip || !isAcademyPrepStripAudioSealed(slug)) {
    return { kind: "article" };
  }
  const audioSrc = academyPrepStripAudioPlaybackSrc(slug);
  const cues = loadAcademyTeleprompterFlow(strip.key);
  const durationSec = academyPrepStripAudioDurationSec(slug);
  if (!audioSrc || cues.length === 0 || !(durationSec > 0)) {
    return { kind: "article" };
  }
  return { kind: "article+karaoke", lessonKey: strip.key, audioSrc, cues, durationSec };
}

export function isAcademyPrepStripKaraokeLayer(
  layer: AcademyPrepStripPlayerLayer,
): layer is AcademyPrepStripKaraokeLayer {
  return layer.kind === "article+karaoke";
}

export function academyPrepStripStorageKey(slug: string): string {
  return `${ACADEMY_PREP_STRIP_STORAGE_PREFIX}:${slug.trim()}`;
}

export function readAcademyPrepStripDone(slug: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(academyPrepStripStorageKey(slug)) === "1";
  } catch {
    return false;
  }
}

export function writeAcademyPrepStripDone(slug: string, done = true): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const key = academyPrepStripStorageKey(slug);
    if (done) {
      window.localStorage.setItem(key, "1");
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Gizli mod / kota — şerit isteğe bağlıdır; mühür kırılmaz.
  }
}
