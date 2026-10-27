/**
 * Cümle sonu sapması kapısı.
 * Tahmini kelime bitişi, aynı sekansın içindeki en yakın sessizliğin başlangıcıyla kıyaslanır.
 * Artı değer: saat erken. Eşik p90 < 250 ms ve en fazla < 400 ms.
 */

import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import {
  alignWordsByAcoustics,
  ALIGNER_FRAME_MS,
  detectSilences,
  envelopeThreshold,
  JUNIOR_SYNC_SILENCE,
  pcmEnvelope,
  type SpeechSilence,
} from "@/lib/junior/pilot-engine/word-aligner";

export const JUNIOR_SYNC_P90_LIMIT_MS = 250;
export const JUNIOR_SYNC_MAX_LIMIT_MS = 400;
/** Kelime ortası, akustik hizadan en fazla bu kadar kayabilir. */
export const JUNIOR_WORD_MIDPOINT_LIMIT_MS = 80;
/** Kesişim / birleşim. Bunun altı zaman kaymasıdır. */
export const JUNIOR_WORD_OVERLAP_MIN = 0.55;
/** Uzun kelimenin aralığı bu oranın altında seste oturmuyorsa mühür bozuktur. */
export const JUNIOR_WORD_SPEECH_RATIO_MIN = 0.4;
const SHORT_WORD_MS = 160;

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

export type WordAcousticDrift = {
  cueId: string;
  word: string;
  startMs: number;
  endMs: number;
  alignedStartMs: number;
  alignedEndMs: number;
  midpointDriftMs: number;
  overlap: number;
  speechRatio: number;
};

export type WordAcousticReport = {
  lessonKey: string;
  words: number;
  issues: readonly WordAcousticDrift[];
  pass: boolean;
};

function overlapRatio(startMs: number, endMs: number, alignedStartMs: number, alignedEndMs: number): number {
  const intersection = Math.max(0, Math.min(endMs, alignedEndMs) - Math.max(startMs, alignedStartMs));
  const union = Math.max(endMs, alignedEndMs) - Math.min(startMs, alignedStartMs);
  if (union <= 0) {
    return 0;
  }
  return intersection / union;
}

function speechRatioOf(rms: Float64Array, threshold: number, startMs: number, endMs: number): number {
  const startFrame = Math.max(0, Math.floor(startMs / ALIGNER_FRAME_MS));
  const endFrame = Math.min(rms.length, Math.max(startFrame + 1, Math.ceil(endMs / ALIGNER_FRAME_MS)));
  let loud = 0;
  let count = 0;
  for (let frame = startFrame; frame < endFrame; frame += 1) {
    count += 1;
    if ((rms[frame] ?? 0) >= threshold) {
      loud += 1;
    }
  }
  return count === 0 ? 0 : loud / count;
}

/**
 * Mühürlü kelime aralığını aynı dalgadan yeniden üretilen akustik aralıkla ve
 * aralığın kendi ses enerjisiyle karşılaştırır. Kayma veya sessiz aralık kapıyı düşürür.
 */
export function measureWordAcousticFit(
  timeline: TimelineJSON,
  samples: Int16Array,
  sampleRate: number,
): WordAcousticReport {
  const rms = pcmEnvelope(samples, sampleRate);
  const threshold = envelopeThreshold(rms, JUNIOR_SYNC_SILENCE.thresholdRatio, JUNIOR_SYNC_SILENCE.peak === true);
  const issues: WordAcousticDrift[] = [];
  const stored = timeline.cues.flatMap((cue) =>
    (cue.words ?? []).map((word) => ({ cueId: cue.id, word })),
  );
  const durationMs = Math.max(1, Math.round((samples.length / sampleRate) * 1000));
  const aligned =
    stored.length === 0
      ? []
      : alignWordsByAcoustics(
          stored.map((row) => row.word.word),
          samples,
          sampleRate,
          0,
          durationMs,
        );
  let words = 0;
  for (let index = 0; index < stored.length; index += 1) {
    const row = stored[index]!;
    const fresh = aligned[index];
    if (!fresh) {
      continue;
    }
    words += 1;
    const word = row.word;
    const midpointDriftMs = Math.abs((word.startMs + word.endMs) / 2 - (fresh.startMs + fresh.endMs) / 2);
    const overlap = overlapRatio(word.startMs, word.endMs, fresh.startMs, fresh.endMs);
    const speechRatio = speechRatioOf(rms, threshold, word.startMs, word.endMs);
    const spanMs = word.endMs - word.startMs;
    const drifted = midpointDriftMs > JUNIOR_WORD_MIDPOINT_LIMIT_MS || overlap < JUNIOR_WORD_OVERLAP_MIN;
    const silent = spanMs >= SHORT_WORD_MS ? speechRatio < JUNIOR_WORD_SPEECH_RATIO_MIN : speechRatio <= 0;
    if (drifted || silent) {
      issues.push({
        cueId: row.cueId,
        word: word.word,
        startMs: word.startMs,
        endMs: word.endMs,
        alignedStartMs: fresh.startMs,
        alignedEndMs: fresh.endMs,
        midpointDriftMs,
        overlap,
        speechRatio,
      });
    }
  }
  return {
    lessonKey: timeline.lessonKey,
    words,
    issues,
    pass: words > 0 && issues.length === 0,
  };
}

export function wordAcousticFailure(report: WordAcousticReport): string | null {
  if (report.words === 0) {
    return `${report.lessonKey} kelime saati yok. Onay yok.`;
  }
  if (report.pass) {
    return null;
  }
  const sample = report.issues
    .slice(0, 6)
    .map(
      (row) =>
        `${row.cueId} «${row.word}» mühür ${Math.round(row.startMs)}-${Math.round(row.endMs)} akustik ${Math.round(row.alignedStartMs)}-${Math.round(row.alignedEndMs)} kayma ${Math.round(row.midpointDriftMs)}ms örtüşme ${row.overlap.toFixed(2)} enerji ${row.speechRatio.toFixed(2)}`,
    )
    .join("; ");
  return `${report.lessonKey} kelime enerjisi kapıyı geçemedi. ${report.issues.length}/${report.words} kelime. Eşik kayma≤${JUNIOR_WORD_MIDPOINT_LIMIT_MS}ms örtüşme≥${JUNIOR_WORD_OVERLAP_MIN} enerji≥${JUNIOR_WORD_SPEECH_RATIO_MIN}. ${sample}`;
}
