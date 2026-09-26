/**
 * TTS paragraf bloğu — Gemini'ye 3–5 sn mikro dilim gitmez.
 * Ders metni doğal paragraf bloklarına paketlenir. Fırın ders başına tam 10–12 istek atar.
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
/** Bir blok bu süreyi aşınca diksiyon düşer; birleştirme burada durur, bant yine 10–12 kalır. */
export const ACADEMY_TTS_LESSON_BLOCK_DICTION_MAX_SEC = 120;
/** Ders başı istek bandı — tam 10–12 doğal paragraf bloğu. */
export const ACADEMY_TTS_LESSON_BREATH_BLOCK_MAX = 12;
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
    withinHardMax: count >= ACADEMY_TTS_LESSON_REQUEST_MIN && count <= ACADEMY_TTS_LESSON_REQUEST_MAX,
  };
}

/**
 * Yeni fırın: ders başına 10–12 istek. Metin 10 bloğa yetmeyecek kadar kısaysa
 * mikro cümle üretilmez; uzun metin 12 üstüne taşmaz.
 */
export function assertAcademyTtsLessonRequestBudget(
  count: number,
  _sealed: boolean,
  speechSec = Number.POSITIVE_INFINITY,
): void {
  if (count <= 0) {
    throw new Error("TTS istek yok: konuşma metni boş.");
  }
  const canFillBand = speechSec >= ACADEMY_TTS_BREATH_CHUNK_MIN_SEC * ACADEMY_TTS_LESSON_REQUEST_MIN;
  if (!canFillBand) {
    return;
  }
  if (count < ACADEMY_TTS_LESSON_REQUEST_MIN || count > ACADEMY_TTS_LESSON_REQUEST_MAX) {
    throw new Error(
      `TTS istek bandı ${ACADEMY_TTS_LESSON_REQUEST_MIN}–${ACADEMY_TTS_LESSON_REQUEST_MAX}; gelen ${count}.`,
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

/** Cümle: . ! ? … — `1. A1` / `2. bölümde` gibi sıra no. kesilmez. */
const SENTENCE_BOUNDARY = /(?<=(?<!\d)\.|[!?…])\s+/u;
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

export type AcademyTtsLessonRequest = {
  /** Kaynak atom indeksleri. Bölünmüş atom iki istekte de aynı indeksi taşır. */
  atomIndexes: readonly number[];
  text: string;
};

function canSplitBlock(text: string): { left: string; right: string } | null {
  const sentences = splitBy(text, SENTENCE_BOUNDARY);
  if (sentences.length < 2) {
    return null;
  }
  let best: { left: string; right: string; gap: number } | null = null;
  const total = speechSec(text);
  const half = total / 2;
  for (let cut = 1; cut < sentences.length; cut += 1) {
    const left = sentences.slice(0, cut).join(" ");
    const right = sentences.slice(cut).join(" ");
    const leftSec = speechSec(left);
    const rightSec = speechSec(right);
    if (leftSec < ACADEMY_TTS_BREATH_CHUNK_MIN_SEC || rightSec < ACADEMY_TTS_BREATH_CHUNK_MIN_SEC) {
      continue;
    }
    const gap = Math.abs(leftSec - half);
    if (!best || gap < best.gap) {
      best = { left, right, gap };
    }
  }
  return best ? { left: best.left, right: best.right } : null;
}

/**
 * Paragrafları ders başına 10–12 Gemini isteğine paketler.
 * Komşu kısa bloklar birleşir; dev blok cümle grubundan bölünür. Tek cümlelik istek üretilmez.
 */
export function packAcademyTtsLessonRequests(paragraphs: readonly string[]): AcademyTtsLessonRequest[] {
  const atoms = paragraphs.flatMap((paragraph) => splitAcademyTtsBreathChunks(paragraph));
  if (atoms.length === 0) {
    return [];
  }
  type Group = { atomIndexes: number[]; text: string; sec: number };
  let groups: Group[] = atoms.map((text, index) => ({
    atomIndexes: [index],
    text,
    sec: speechSec(text),
  }));
  const totalSec = groups.reduce((sum, group) => sum + group.sec, 0);
  const canFillBand = totalSec >= ACADEMY_TTS_BREATH_CHUNK_MIN_SEC * ACADEMY_TTS_LESSON_REQUEST_MIN;

  while (groups.length > ACADEMY_TTS_LESSON_REQUEST_MAX) {
    let best = -1;
    let bestSum = Number.POSITIVE_INFINITY;
    for (let index = 0; index < groups.length - 1; index += 1) {
      const sum = groups[index]!.sec + groups[index + 1]!.sec;
      if (sum <= ACADEMY_TTS_LESSON_BLOCK_DICTION_MAX_SEC && sum < bestSum) {
        bestSum = sum;
        best = index;
      }
    }
    if (best < 0) {
      break;
    }
    const left = groups[best]!;
    const right = groups[best + 1]!;
    const merged: Group = {
      atomIndexes: [...left.atomIndexes, ...right.atomIndexes],
      text: `${left.text} ${right.text}`.replace(/\s+/gu, " ").trim(),
      sec: left.sec + right.sec,
    };
    groups = [...groups.slice(0, best), merged, ...groups.slice(best + 2)];
  }

  while (canFillBand && groups.length < ACADEMY_TTS_LESSON_REQUEST_MIN) {
    let best = -1;
    let bestSec = 0;
    for (let index = 0; index < groups.length; index += 1) {
      const group = groups[index]!;
      if (group.sec > bestSec && canSplitBlock(group.text)) {
        best = index;
        bestSec = group.sec;
      }
    }
    if (best < 0) {
      break;
    }
    const group = groups[best]!;
    const split = canSplitBlock(group.text);
    if (!split) {
      break;
    }
    const left: Group = {
      atomIndexes: group.atomIndexes,
      text: split.left,
      sec: speechSec(split.left),
    };
    const right: Group = {
      atomIndexes: group.atomIndexes,
      text: split.right,
      sec: speechSec(split.right),
    };
    groups = [...groups.slice(0, best), left, right, ...groups.slice(best + 1)];
  }

  return groups.map((group) => ({
    atomIndexes: group.atomIndexes,
    text: group.text,
  }));
}
