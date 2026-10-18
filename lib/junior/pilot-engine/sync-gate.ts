/**
 * Cümle sonu sapması kapısı.
 * Tahmini kelime bitişi, aynı sekansın içindeki en yakın sessizliğin başlangıcıyla kıyaslanır.
 * Artı değer: saat erken. Eşik p90 < 250 ms ve en fazla < 400 ms.
 */

import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import {
  detectSilences,
  JUNIOR_SYNC_SILENCE,
  pcmEnvelope,
  type SpeechSilence,
} from "@/lib/junior/pilot-engine/word-aligner";

export const JUNIOR_SYNC_P90_LIMIT_MS = 250;
export const JUNIOR_SYNC_MAX_LIMIT_MS = 400;

export type SentenceEndDrift = {
  cueId: string;
  word: string;
  wordEndMs: number;
  silenceStartMs: number;
  driftMs: number;
};

export type JuniorSyncReport = {
  lessonKey: string;
  samples: number;
  medianMs: number;
  p90Ms: number;
  maxMs: number;
  drifts: readonly SentenceEndDrift[];
  pass: boolean;
};

function percentile(sortedAbs: readonly number[], ratio: number): number {
  if (sortedAbs.length === 0) {
    return Number.POSITIVE_INFINITY;
  }
  const index = Math.min(sortedAbs.length - 1, Math.max(0, Math.ceil(ratio * sortedAbs.length) - 1));
  return sortedAbs[index] ?? Number.POSITIVE_INFINITY;
}

function isSentenceEnd(word: string): boolean {
  return /(?:(?<!\d)[.!?…])["»)]*$/u.test(word);
}

function nearestSilenceStart(
  wordEndMs: number,
  cueStartMs: number,
  cueEndMs: number,
  silences: readonly SpeechSilence[],
): number | null {
  let best: number | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const silence of silences) {
    if (silence.endMs < cueStartMs || silence.startMs > cueEndMs) {
      continue;
    }
    const distance = Math.abs(silence.startMs - wordEndMs);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = silence.startMs;
    }
  }
  return best;
}

export function measureSentenceEndDrift(
  timeline: TimelineJSON,
  samples: Int16Array,
  sampleRate: number,
): JuniorSyncReport {
  const silences = detectSilences(pcmEnvelope(samples, sampleRate), JUNIOR_SYNC_SILENCE);
  const drifts: SentenceEndDrift[] = [];
  for (const cue of timeline.cues) {
    for (const word of cue.words ?? []) {
      if (!isSentenceEnd(word.word)) {
        continue;
      }
      const silenceStartMs = nearestSilenceStart(word.endMs, cue.startMs, cue.endMs, silences);
      if (silenceStartMs === null) {
        continue;
      }
      drifts.push({
        cueId: cue.id,
        word: word.word,
        wordEndMs: word.endMs,
        silenceStartMs,
        driftMs: silenceStartMs - word.endMs,
      });
    }
  }
  const absolute = drifts.map((row) => Math.abs(row.driftMs)).sort((left, right) => left - right);
  const mid = absolute.length === 0 ? Number.POSITIVE_INFINITY : absolute[Math.floor((absolute.length - 1) / 2)]!;
  const p90Ms = percentile(absolute, 0.9);
  const maxMs = absolute.length === 0 ? Number.POSITIVE_INFINITY : absolute[absolute.length - 1]!;
  return {
    lessonKey: timeline.lessonKey,
    samples: drifts.length,
    medianMs: mid,
    p90Ms,
    maxMs,
    drifts,
    pass:
      drifts.length > 0 &&
      p90Ms < JUNIOR_SYNC_P90_LIMIT_MS &&
      maxMs < JUNIOR_SYNC_MAX_LIMIT_MS,
  };
}

export function juniorSyncFailure(report: JuniorSyncReport): string | null {
  if (report.samples === 0) {
    return `${report.lessonKey} cümle sonu ölçülemedi. Onay yok.`;
  }
  if (report.pass) {
    return null;
  }
  return `${report.lessonKey} akustik sapma kapıyı geçemedi. n=${report.samples} medyan=${Math.round(report.medianMs)}ms p90=${Math.round(report.p90Ms)}ms en fazla=${Math.round(report.maxMs)}ms. Eşik p90<${JUNIOR_SYNC_P90_LIMIT_MS} en fazla<${JUNIOR_SYNC_MAX_LIMIT_MS}.`;
}
