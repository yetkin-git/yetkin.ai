/**
 * TTS paragraf bloğu — Gemini'ye 3–5 sn mikro dilim gitmez.
 * Ders metni 12–15 doğal nefes bloğuna paketlenir; ders başı istek 10–12 bandındadır.
 * Cümle geçişlerindeki [pause] bake hattında enjekte edilir (teleprompter metni temiz kalır).
 * Dilimler arasına 0.3–0.5 sn sessizlik + 6.5 sn RPM kalkanı konur.
 */

import { academyDialogueReadingDurationSec } from "@/lib/academy/dialogue-timeline";

/** Hedef konuşma penceresi — anlamlı paragraf bloğu; 3–5 sn mikro dilim YASAK. */
export const ACADEMY_TTS_BREATH_CHUNK_MIN_SEC = 18;
export const ACADEMY_TTS_BREATH_CHUNK_MAX_SEC = 70;
/**
 * Tek noktalama birimi bu süreyi aşarsa virgül/noktalı virgül sınırından bölünür.
 * Normal stüdyo paragrafı (~40–65 sn) tek istek kalır.
 */
export const ACADEMY_TTS_BREATH_ATOMIC_MAX_SEC = 80;
/** RPM 10/dk tavanının altında kalmak için istekler arası zorunlu boşluk. */
export const ACADEMY_TTS_RPM_GAP_MS = 6_500;
/** Nefes bloğu tavanı — bir ders API’ye en fazla bu kadar doğal blok gider. */
export const ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX = 15;
/** Ders başı istek hedef bandı (kota / request shaping). */
export const ACADEMY_TTS_LESSON_REQUEST_MIN = 10;
export const ACADEMY_TTS_LESSON_REQUEST_MAX = 12;

export type AcademyTtsLessonRequestBudget = {
  count: number;
  inTargetBand: boolean;
  withinHardMax: boolean;
};

export function academyTtsLessonRequestBudget(count: number): AcademyTtsLessonRequestBudget {
  return {
    count,
    inTargetBand: count >= ACADEMY_TTS_LESSON_REQUEST_MIN && count <= ACADEMY_TTS_LESSON_REQUEST_MAX,
    withinHardMax: count > 0 && count <= ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX,
  };
}

/** Yeni fırınlama: tavan 15; 10–12 hedef. Mühürlü kaset kotayı ezer (sıfır re-bake). */
export function assertAcademyTtsLessonRequestBudget(count: number, sealed: boolean): void {
  if (sealed) {
    return;
  }
  const budget = academyTtsLessonRequestBudget(count);
  if (!budget.withinHardMax) {
    throw new Error(
      `TTS istek tavanı aşıldı: ${count} (hedef ${ACADEMY_TTS_LESSON_REQUEST_MIN}–${ACADEMY_TTS_LESSON_REQUEST_MAX}, tavan ${ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX}). Paragrafları 10–12 doğal nefes bloğuna birleştir.`,
    );
  }
}

/** Gemini native TTS nefes etiketi — cümle geçişinde model duraksar, okumaz. */
export const ACADEMY_TTS_BREATH_PAUSE_TAG = "[pause]";

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
const PAUSE_TAG_RE = /\s*\[pause\]\s*/giu;

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

export function stripAcademyTtsBreathPauses(text: string): string {
  return text.replace(PAUSE_TAG_RE, " ").replace(/\s+/gu, " ").trim();
}

/**
 * Cümle geçişlerine Gemini nefes etiketi koyar.
 * Nokta/ünlem sonrası `[pause]`; virgül zaten modelin doğal esidir.
 */
export function injectAcademyTtsBreathPauses(text: string): string {
  const trimmed = stripAcademyTtsBreathPauses(text);
  if (!trimmed) {
    return "";
  }
  const sentences = splitBy(trimmed, SENTENCE_BOUNDARY);
  if (sentences.length <= 1) {
    return trimmed;
  }
  return sentences.join(` ${ACADEMY_TTS_BREATH_PAUSE_TAG} `);
}

/** Anlamlı paragraf bloğu. Stüdyo paragrafı tek istek; yalnızca tavanı aşan birim bölünür. */
export function splitAcademyTtsBreathChunks(text: string): string[] {
  const trimmed = stripAcademyTtsBreathPauses(text);
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
