/**
 * Akademi Dersi Dinle — rota gümrüğü, bellek L1 ve Supabase L2.
 * HTTP yüzeyi `app/api/academy/courses/[id]/listen/route.ts`.
 * Parça tavanı `splitSpokenTextForTts` (`archived/lib/academy-studio/lesson-listen.ts`).
 * GEMINI_API_KEY ve ham sağlayıcı metni vatandaşa sızmaz.
 * Disk yazılmaz — kalıcı ses `lesson-audios` bucket + `academy_audio_cache`.
 */

import "server-only";

import { createHash } from "node:crypto";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  ACADEMY_LISTEN_AUDIO_URL_HEADER,
  ACADEMY_LISTEN_CACHE_HEADER,
  ACADEMY_LISTEN_CACHE_SOURCE_HEADER,
  ACADEMY_LISTEN_FALLBACK_HEADER,
  ACADEMY_LISTEN_FRAMING_HEADER,
  ACADEMY_LISTEN_FRAMING_WAV_U32BE,
  ACADEMY_LISTEN_SPEAKERS_HEADER,
  ACADEMY_LISTEN_FALLBACK_KIND_LOCAL,
  ACADEMY_LISTEN_TEXT_DURATION_HEADER,
  formatAcademyListenTextDurationHeader,
} from "@/archived/lib/academy-studio/lesson-listen";

/** Tarayıcı Accept jokerini JSON sanılmasın; ders dinle varsayılanı parça akışı. */
export function academyListenWantsByteStream(request: Request, beat?: string | null): boolean {
  if (beat) {
    return false;
  }
  const accept = (request.headers.get("accept") ?? "").toLowerCase();
  if (accept.includes("application/octet-stream")) {
    return true;
  }
  if (accept.includes("application/json")) {
    return false;
  }
  return true;
}

export {
  ACADEMY_LISTEN_AUDIO_URL_HEADER,
  ACADEMY_LISTEN_CACHE_HEADER,
  ACADEMY_LISTEN_CACHE_SOURCE_HEADER,
  ACADEMY_LISTEN_FALLBACK_HEADER,
  ACADEMY_LISTEN_FRAMING_HEADER,
  ACADEMY_LISTEN_FRAMING_WAV_U32BE,
  ACADEMY_LISTEN_SPEAKERS_HEADER,
  ACADEMY_LISTEN_TEXT_DURATION_HEADER,
} from "@/archived/lib/academy-studio/lesson-listen";

export function academyListenCitizenMessage(reason: string): string {
  switch (reason) {
    case "VOICE_BINDING_UNAVAILABLE":
      return ACADEMY_SEN.listen.failVoiceBinding;
    case "missing-or-invalid-api-key":
    case "gemini-auth-failed":
      return ACADEMY_SEN.listen.failKey;
    case "gemini-quota":
    case "gemini-bad-request":
    case "rate-limit":
    case "user-quota":
    case "platform-cap":
    case "gemini-timeout":
    case "gemini-upstream":
      return ACADEMY_SEN.listen.failQuota;
    case "empty-spoken-text":
    case "empty-text":
      return ACADEMY_SEN.listen.failEmpty;
    case "gemini-forbidden":
    case "gemini-model-not-found":
    case "empty-audio":
    case "guard-unavailable":
    case "provider-error":
      return ACADEMY_SEN.listen.failQuota;
    default:
      return ACADEMY_SEN.listen.failUpstream;
  }
}

export function logAcademyListenFailure(input: {
  reason: string;
  errorName?: string;
  status?: number;
}): void {
  logEvent({
    level: "error",
    event: "academy.listen.failed",
    reason: input.reason.slice(0, 480),
    errorName: input.errorName,
    status: input.status,
    route: "academy.lesson.listen",
  });
}

/** En fazla 48 ders WAV'i — LRU. Disk yok. */
export const ACADEMY_LISTEN_AUDIO_CACHE_MAX_ENTRIES = 48;

/** Yaklaşık 96 MiB süreç tavanı. */
export const ACADEMY_LISTEN_AUDIO_CACHE_MAX_BYTES = 96 * 1024 * 1024;

export type AcademyListenCacheSource = "memory" | "supabase" | "miss";

export type AcademyListenCachedAudio = {
  mimeType: "audio/wav";
  audioBytes: Uint8Array;
  parts: readonly Uint8Array[];
  model: string;
  usedFallback?: boolean;
  publicUrl?: string;
};

export function academyListenHttpHeaders(input: {
  cacheState: "hit" | "miss";
  speakers: string;
  textDurationSec: number;
  fallback?: boolean;
  stream?: boolean;
  audioUrl?: string;
  cacheSource?: AcademyListenCacheSource;
}): Record<string, string> {
  const headers: Record<string, string> = {
    "Cache-Control": "private, no-store",
    [ACADEMY_LISTEN_CACHE_HEADER]: input.cacheState,
    [ACADEMY_LISTEN_SPEAKERS_HEADER]: input.speakers,
    [ACADEMY_LISTEN_TEXT_DURATION_HEADER]: formatAcademyListenTextDurationHeader(input.textDurationSec),
  };
  if (input.stream) {
    headers[ACADEMY_LISTEN_FRAMING_HEADER] = ACADEMY_LISTEN_FRAMING_WAV_U32BE;
  }
  if (input.fallback) {
    headers[ACADEMY_LISTEN_FALLBACK_HEADER] = ACADEMY_LISTEN_FALLBACK_KIND_LOCAL;
  }
  if (input.audioUrl) {
    headers[ACADEMY_LISTEN_AUDIO_URL_HEADER] = input.audioUrl;
  }
  if (input.cacheSource) {
    headers[ACADEMY_LISTEN_CACHE_SOURCE_HEADER] = input.cacheSource;
  }
  return headers;
}

export function academyListenSoftFallbackResponse(input: {
  speakers: string;
  textDurationSec: number;
}): Response {
  return new Response(JSON.stringify({ fallback: true, mode: "text" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...academyListenHttpHeaders({
        cacheState: "miss",
        speakers: input.speakers,
        textDurationSec: input.textDurationSec,
        fallback: true,
        cacheSource: "miss",
      }),
    },
  });
}

export function closeAcademyListenByteStream(
  controller: ReadableStreamDefaultController<Uint8Array>,
  endFrame: Uint8Array,
): void {
  try {
    controller.enqueue(endFrame);
  } catch {
    // already closed or enqueue after close
  }
  try {
    controller.close();
  } catch {
    // already closed
  }
}

export function academyListenCdnResponse(input: {
  audioUrl: string;
  speakers: string;
  textDurationSec: number;
  fallback?: boolean;
  cacheSource: Exclude<AcademyListenCacheSource, "miss">;
}): Response {
  return new Response(JSON.stringify({ audioUrl: input.audioUrl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...academyListenHttpHeaders({
        cacheState: "hit",
        speakers: input.speakers,
        textDurationSec: input.textDurationSec,
        fallback: input.fallback,
        audioUrl: input.audioUrl,
        cacheSource: input.cacheSource,
      }),
    },
  });
}

export type AcademyListenAudioCache = {
  get(key: string): AcademyListenCachedAudio | null;
  set(key: string, value: AcademyListenCachedAudio): void;
  clear(): void;
  size(): number;
};

function cloneBytes(bytes: Uint8Array): Uint8Array {
  return bytes.slice();
}

function cloneCached(value: AcademyListenCachedAudio): AcademyListenCachedAudio {
  return {
    mimeType: "audio/wav",
    audioBytes: cloneBytes(value.audioBytes),
    parts: value.parts.map(cloneBytes),
    model: value.model,
    usedFallback: value.usedFallback,
    publicUrl: value.publicUrl,
  };
}

export function academyListenAudioCacheKey(
  slug: string,
  lessonKey: string,
  fingerprint: string,
): string {
  const digest = createHash("sha256").update(fingerprint).digest("hex").slice(0, 32);
  return `${slug}:${lessonKey}:${digest}`;
}

export function createAcademyListenAudioCache(
  maxEntries = ACADEMY_LISTEN_AUDIO_CACHE_MAX_ENTRIES,
  maxBytes = ACADEMY_LISTEN_AUDIO_CACHE_MAX_BYTES,
): AcademyListenAudioCache {
  const map = new Map<string, AcademyListenCachedAudio>();
  let totalBytes = 0;

  function entryBytes(value: AcademyListenCachedAudio): number {
    return (
      value.audioBytes.byteLength +
      value.parts.reduce((sum, part) => sum + part.byteLength, 0)
    );
  }

  function evict(): void {
    while (map.size > 0 && (map.size > maxEntries || totalBytes > maxBytes)) {
      const oldest = map.keys().next().value;
      if (typeof oldest !== "string") {
        return;
      }
      const removed = map.get(oldest);
      map.delete(oldest);
      if (removed) {
        totalBytes -= entryBytes(removed);
      }
    }
  }

  return {
    get(key) {
      const hit = map.get(key);
      if (!hit) {
        return null;
      }
      map.delete(key);
      map.set(key, hit);
      return cloneCached(hit);
    },
    set(key, value) {
      const stored = cloneCached(value);
      const previous = map.get(key);
      if (previous) {
        totalBytes -= entryBytes(previous);
        map.delete(key);
      }
      map.set(key, stored);
      totalBytes += entryBytes(stored);
      evict();
    },
    clear() {
      map.clear();
      totalBytes = 0;
    },
    size() {
      return map.size;
    },
  };
}

const sharedAcademyListenAudioCache = createAcademyListenAudioCache();
const inflightAcademyListenAudio = new Map<string, Promise<AcademyListenCachedAudio>>();

export function getSharedAcademyListenAudioCache(): AcademyListenAudioCache {
  return sharedAcademyListenAudioCache;
}

export function resetSharedAcademyListenAudioCacheForTests(): void {
  sharedAcademyListenAudioCache.clear();
  inflightAcademyListenAudio.clear();
}

export function getAcademyListenInflight(
  key: string,
): Promise<AcademyListenCachedAudio> | undefined {
  return inflightAcademyListenAudio.get(key);
}

export function setAcademyListenInflight(
  key: string,
  pending: Promise<AcademyListenCachedAudio>,
): void {
  inflightAcademyListenAudio.set(key, pending);
}

export function clearAcademyListenInflight(key: string): void {
  inflightAcademyListenAudio.delete(key);
}
