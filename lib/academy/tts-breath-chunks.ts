/**
 * TTS nefes dilimleyici — Gemini'ye tek dev blok gitmez.
 * Noktalama sınırında 3–5 sn doğal konuşma parçası; tek cümle biraz taşabilir.
 * Dilimler arasına 0.3–0.5 sn sessizlik bake hattında konur (dikiş/crossfade değil).
 */

import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";

/** Hedef konuşma penceresi — paketleme tavanı. */
export const ACADEMY_TTS_BREATH_CHUNK_MIN_SEC = 3;
export const ACADEMY_TTS_BREATH_CHUNK_MAX_SEC = 5;
/**
 * Tek noktalama birimi bu süreyi aşarsa virgül/noktalı virgül sınırından bölünür.
 * 42 sn'lik perde yasağı durur; 6–8 sn'lik doğal cümle kesilmez.
 */
export const ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC = 8;

function speechSec(text: string): number {
  return academyDialogueReadingDurationSec(text, "egitmen");
}

function splitBy(text: string, pattern: RegExp): string[] {
  return text
    .split(pattern)
    .map((part) => part.replace(/\s+/gu, " ").trim())
    .filter((part) => part.length > 0);
}

/** Cümle: . ! ? …  — birim solda kalır. */
const SENTENCE_BOUNDARY = /(?<=[.!?…])\s+/u;
/** Uzun cümle: virgül, noktalı virgül, iki nokta, tire. */
const CLAUSE_BOUNDARY = /(?<=[,;:—–])\s+/u;

function splitOversizedUnit(text: string): string[] {
  if (speechSec(text) <= ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC) {
    return [text];
  }
  const clauses = splitBy(text, CLAUSE_BOUNDARY);
  if (clauses.length > 1) {
    return packSpeechChunks(clauses);
  }
  const words = text.split(/\s+/u).filter((word) => word.length > 0);
  if (words.length < 4) {
    return [text];
  }
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (current && speechSec(next) > ACADEMY_TTS_BREATH_CHUNK_MAX_SEC) {
      chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks.filter((chunk) => chunk.length > 0);
}

function packSpeechChunks(units: readonly string[]): string[] {
  const chunks: string[] = [];
  let current = "";
  const emit = (): void => {
    if (current) {
      chunks.push(current);
      current = "";
    }
  };
  for (const raw of units) {
    const unit = raw.trim();
    if (!unit) {
      continue;
    }
    if (speechSec(unit) > ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC) {
      emit();
      chunks.push(...splitOversizedUnit(unit));
      continue;
    }
    const next = current ? `${current} ${unit}` : unit;
    if (!current) {
      current = unit;
      continue;
    }
    if (speechSec(next) <= ACADEMY_TTS_BREATH_CHUNK_MAX_SEC) {
      current = next;
      continue;
    }
    if (
      speechSec(current) < ACADEMY_TTS_BREATH_CHUNK_MIN_SEC &&
      speechSec(next) <= ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC
    ) {
      current = next;
      continue;
    }
    emit();
    current = unit;
  }
  emit();
  return chunks.filter((chunk) => chunk.length > 0);
}

/** Noktalamadan 3–5 sn TTS isteği. Tek cümle en fazla ~8 sn kalabilir. */
export function splitAcademyTtsBreathChunks(text: string): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  if (speechSec(trimmed) <= ACADEMY_TTS_BREATH_CHUNK_MAX_SEC) {
    return [trimmed];
  }
  const sentences = splitBy(trimmed, SENTENCE_BOUNDARY);
  if (sentences.length === 0) {
    return splitOversizedUnit(trimmed);
  }
  return packSpeechChunks(sentences);
}
