/**
 * Junior anlatıcı ses kanalı.
 * Standart ders, metni bir kez böler ve ders anahtarıyla bellekte tutar.
 * Seçmeli ders, aynı metni yerelde böler. Dış ses servisine gitmez.
 * İki okuma aynı anda sürmez. Yeni okuma, eskisinin oturumunu düşürür.
 * Fon müziği (BGM) ayrı kanaldır; `endJuniorSpeech` BGM’yi kapatmaz.
 * BGM ev: `lib/junior/voice.ts` (`juniorBgmSrc`, duck/ambient hacim).
 */

import { JUNIOR_ELECTIVE_SLUGS, JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";

/** Chrome tek okumayı yaklaşık on beş saniyede keser. Parça bu tavanın altında kalır. */
export const JUNIOR_SPEECH_CHUNK_CHARS = 160;

export const JUNIOR_LOCAL_SPEECH_LANG = "tr-TR" as const;
export const JUNIOR_LOCAL_SPEECH_RATE = 0.95 as const;

/** Junior ders sesi dış API kotası kullanmaz. */
export const JUNIOR_SPEECH_USES_EXTERNAL_API = false as const;

/**
 * Anlatıcı oturumu bitince ortam sessizleşmez.
 * BGM, oynatıcıda ambient hacimde akmaya devam eder.
 */
export const JUNIOR_SPEECH_LEAVES_BGM_RUNNING = true as const;

export type JuniorSpeechChannel = "core-cache" | "elective-local" | "local-quota-free";

export type JuniorSpeechEngine = "local-cache" | "local-quota-free";

export type JuniorSpeechClip = {
  lessonKey: string;
  channel: JuniorSpeechChannel;
  engine: JuniorSpeechEngine;
  chunks: readonly string[];
  lang: typeof JUNIOR_LOCAL_SPEECH_LANG;
  rate: typeof JUNIOR_LOCAL_SPEECH_RATE;
  externalApi: typeof JUNIOR_SPEECH_USES_EXTERNAL_API;
  fromCache: boolean;
};

export type JuniorSpeechPlayback = JuniorSpeechClip & {
  sessionId: number;
};

type CoreSpeechEntry = {
  text: string;
  chunks: readonly string[];
};

const coreSpeechCache = new Map<string, CoreSpeechEntry>();
let speechSession = 0;

function juniorLessonSlug(lessonKey: string): string {
  return lessonKey.replace(/-\d+$/u, "");
}

function isListedSlug(slug: string, list: readonly string[]): boolean {
  return list.includes(slug);
}

export function juniorSpeechChannel(lessonKey: string): JuniorSpeechChannel {
  const slug = juniorLessonSlug(lessonKey);
  if (isListedSlug(slug, JUNIOR_PILOT_SLUGS)) {
    return "core-cache";
  }
  if (isListedSlug(slug, JUNIOR_ELECTIVE_SLUGS)) {
    return "elective-local";
  }
  return "local-quota-free";
}

function splitOversizedChunk(chunk: string, maxLen: number): string[] {
  if (chunk.length <= maxLen) {
    return [chunk];
  }
  const words = chunk.split(" ");
  const parts: string[] = [];
  let buf = "";
  for (const word of words) {
    const next = buf ? `${buf} ${word}` : word;
    if (next.length > maxLen && buf) {
      parts.push(buf);
      buf = word;
    } else {
      buf = next;
    }
  }
  if (buf) {
    parts.push(buf);
  }
  return parts;
}

export function chunkJuniorLocalSpeech(text: string, maxLen = JUNIOR_SPEECH_CHUNK_CHARS): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return [];
  }
  const sentences = cleaned.split(/(?<=\p{L}[.!?…])\s+/u);
  const chunks: string[] = [];
  let buf = "";
  for (const sentence of sentences) {
    const next = buf ? `${buf} ${sentence}` : sentence;
    if (buf && next.length > maxLen) {
      chunks.push(...splitOversizedChunk(buf, maxLen));
      buf = sentence;
    } else {
      buf = next;
    }
  }
  if (buf) {
    chunks.push(...splitOversizedChunk(buf, maxLen));
  }
  return chunks;
}

function localClip(
  lessonKey: string,
  channel: JuniorSpeechChannel,
  engine: JuniorSpeechEngine,
  chunks: readonly string[],
  fromCache: boolean,
): JuniorSpeechClip {
  return {
    lessonKey,
    channel,
    engine,
    chunks,
    lang: JUNIOR_LOCAL_SPEECH_LANG,
    rate: JUNIOR_LOCAL_SPEECH_RATE,
    externalApi: JUNIOR_SPEECH_USES_EXTERNAL_API,
    fromCache,
  };
}

function cachedCoreSpeech(lessonKey: string, text: string): JuniorSpeechClip {
  const hit = coreSpeechCache.get(lessonKey);
  if (hit && hit.text === text) {
    return localClip(lessonKey, "core-cache", "local-cache", hit.chunks, true);
  }
  const chunks = chunkJuniorLocalSpeech(text);
  coreSpeechCache.set(lessonKey, { text, chunks });
  return localClip(lessonKey, "core-cache", "local-cache", chunks, false);
}

/**
 * Standart ders önbelleğe yazılır.
 * Seçmeli ders ve tanınmayan anahtar yalnız yerel motora gider. Önbelleğe yazılmaz.
 */
export function planJuniorSpeech(lessonKey: string, text: string): JuniorSpeechClip {
  const channel = juniorSpeechChannel(lessonKey);
  if (channel === "core-cache") {
    return cachedCoreSpeech(lessonKey, text);
  }
  return localClip(lessonKey, channel, "local-quota-free", chunkJuniorLocalSpeech(text), false);
}

export function beginJuniorSpeech(lessonKey: string, text: string): JuniorSpeechPlayback {
  speechSession += 1;
  return {
    ...planJuniorSpeech(lessonKey, text),
    sessionId: speechSession,
  };
}

export function juniorSpeechSessionCurrent(sessionId: number): boolean {
  return sessionId === speechSession;
}

export function endJuniorSpeech(): void {
  speechSession += 1;
}

export function juniorCoreSpeechCacheSize(): number {
  return coreSpeechCache.size;
}

export function resetJuniorSpeechForTests(): void {
  coreSpeechCache.clear();
  speechSession += 1;
}
