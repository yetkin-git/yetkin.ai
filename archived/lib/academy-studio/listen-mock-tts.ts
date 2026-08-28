/**
 * Akademi TTS — kota / üst katman düşüşünde sunucu mock WAV önbelleği.
 * Disk yok; süreç belleğinde kısa tampon. Vatandaş hoparlörüne
 * düşmez; stüdyo sesi yoksa istemci hazırlanıyor bildirimi basar.
 */

import "server-only";

import { createHash } from "node:crypto";
import { ACADEMY_LISTEN_FALLBACK_SILENCE_MS } from "@/archived/lib/academy-studio/lesson-listen";
import { createSilentPcmWav } from "@/lib/kernel/ai/pcm-wav";

const MOCK_CACHE_MAX_KEYS = 64;
const mockKeys = new Map<string, true>();
let staticMockWav: Uint8Array | null = null;

export function isAcademyListenDevMockEnabled(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv !== "production";
}

export function academyListenMockTtsCacheKey(text: string, voiceName: string): string {
  return createHash("sha256").update(`${voiceName}\n${text}`).digest("hex").slice(0, 24);
}

function staticMockBytes(): Uint8Array {
  if (!staticMockWav) {
    staticMockWav = new Uint8Array(createSilentPcmWav(ACADEMY_LISTEN_FALLBACK_SILENCE_MS));
  }
  return staticMockWav;
}

function rememberKey(key: string): void {
  if (mockKeys.has(key)) {
    mockKeys.delete(key);
    mockKeys.set(key, true);
    return;
  }
  mockKeys.set(key, true);
  while (mockKeys.size > MOCK_CACHE_MAX_KEYS) {
    const oldest = mockKeys.keys().next().value;
    if (typeof oldest !== "string") {
      return;
    }
    mockKeys.delete(oldest);
  }
}

/** Kota / 50x düşüşü — aynı statik mock WAV; anahtar önbelleği tekrar vuruşunu işaretler. */
export function getAcademyListenMockTtsWav(text: string, voiceName: string): Buffer {
  rememberKey(academyListenMockTtsCacheKey(text, voiceName));
  return Buffer.from(staticMockBytes());
}

export function academyListenMockTtsCacheSize(): number {
  return mockKeys.size;
}

export function resetAcademyListenMockTtsCacheForTests(): void {
  mockKeys.clear();
  staticMockWav = null;
}
