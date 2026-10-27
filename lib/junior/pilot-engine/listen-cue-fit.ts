/**
 * Dinleme sekansını duran kasete oturtur.
 * Cümle sonu, ölçülen sessizlikten 400 ms uzaktaysa o kelimenin cümle işareti düşer.
 * `pauseAfterMs` taslak 280 ms değildir; son kelime ile sonraki kelime arasındaki boşluktur.
 * Ses dosyası yazılmaz. `production` yazılmaz.
 */

import type { AuthoredCueSpec } from "@/lib/junior/pilot-engine/mat-1.choreography";
import { realignPilotTimelineWords } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import {
  JUNIOR_SYNC_MAX_LIMIT_MS,
  JUNIOR_SYNC_P90_LIMIT_MS,
  juniorSyncFailure,
  measureSentenceEndDrift,
  measureWordAcousticFit,
  wordAcousticFailure,
} from "@/lib/junior/pilot-engine/sync-gate";

const SENTENCE_MARK = /(?:(?<!\d)[.!?…])["»)]*$/u;
const FIT_PASSES = 8;

export type DemotedSentenceBoundary = {
  cueId: string;
  word: string;
};

function cloneSpecs(cues: readonly AuthoredCueSpec[]): AuthoredCueSpec[] {
  return cues.map((cue) => ({
    ...cue,
    keyframes: cue.keyframes.map((frame) => ({ ...frame, params: { ...frame.params } })),
  }));
}

/** Cümle işaretini düşürür. `12.` ve `3,14` durur. İşaret yoksa metin aynı kalır. */
export function demoteSentencePunctuation(markedText: string, word: string): string {
  if (!SENTENCE_MARK.test(word)) {
    return markedText;
  }
  const stem = word.replace(SENTENCE_MARK, "");
  if (stem.length === 0 || stem === word) {
    return markedText;
  }
  const tokens = markedText.split(/(\s+)/u);
  let changed = false;
  const next = tokens.map((token) => {
    if (changed || token !== word) {
      return token;
    }
    changed = true;
    return stem;
  });
  return changed ? next.join("") : markedText;
}

/** Son kelimenin bitişi ile sonraki kelimenin başı arasındaki boşluk. Son sekans kaydın sonuna kadar. */
export function applyAcousticPauses(timeline: TimelineJSON): TimelineJSON {
  const cues = timeline.cues.map((cue, index) => {
    const words = cue.words ?? [];
    const last = words[words.length - 1];
    const next = timeline.cues[index + 1];
    const nextStart = next?.words?.[0]?.startMs ?? next?.startMs ?? timeline.audio.durationMs;
    const anchor = last?.endMs ?? cue.endMs;
    return {
      ...cue,
      pauseAfterMs: Math.max(0, Math.round(nextStart - anchor)),
    };
  });
  return timelineJsonSchema.parse({
    ...timeline,
    cues,
  });
}

/**
 * Viterbi saatini cümle kapısına göre düzeltir.
 * Kelime enerjisi bozulursa dosya yazılmaz.
 */
export function fitListenCuesToAcoustics(
  timeline: TimelineJSON,
  samples: Int16Array,
  sampleRate: number,
  cues: readonly AuthoredCueSpec[],
): { timeline: TimelineJSON; cues: AuthoredCueSpec[]; demoted: DemotedSentenceBoundary[] } {
  let specs = cloneSpecs(cues);
  let aligned = realignPilotTimelineWords(timeline, samples, sampleRate, specs);
  const demoted: DemotedSentenceBoundary[] = [];
  for (let pass = 0; pass < FIT_PASSES; pass += 1) {
    const words = measureWordAcousticFit(aligned, samples, sampleRate);
    const wordFailure = wordAcousticFailure(words);
    if (wordFailure) {
      throw new Error(wordFailure);
    }
    const sentence = measureSentenceEndDrift(aligned, samples, sampleRate);
    if (sentence.pass) {
      return { timeline: applyAcousticPauses(aligned), cues: specs, demoted };
    }
    const far = sentence.drifts.filter((row) => Math.abs(row.driftMs) >= JUNIOR_SYNC_MAX_LIMIT_MS);
    const ranked = [...sentence.drifts].sort((left, right) => Math.abs(right.driftMs) - Math.abs(left.driftMs));
    const targets =
      far.length > 0 ? far : ranked.filter((row) => Math.abs(row.driftMs) >= JUNIOR_SYNC_P90_LIMIT_MS).slice(0, 1);
    if (targets.length === 0) {
      throw new Error(juniorSyncFailure(sentence) ?? `${timeline.lessonKey} cümle sınırı kapanmadı.`);
    }
    let edited = 0;
    specs = specs.map((spec) => {
      let markedText = spec.markedText;
      for (const target of targets) {
        if (target.cueId !== spec.id) {
          continue;
        }
        const next = demoteSentencePunctuation(markedText, target.word);
        if (next === markedText) {
          continue;
        }
        markedText = next;
        edited += 1;
        demoted.push({ cueId: spec.id, word: target.word });
      }
      return markedText === spec.markedText ? spec : { ...spec, markedText };
    });
    if (edited === 0) {
      throw new Error(juniorSyncFailure(sentence) ?? `${timeline.lessonKey} cümle işareti düşmedi.`);
    }
    aligned = realignPilotTimelineWords(timeline, samples, sampleRate, specs);
  }
  throw new Error(`${timeline.lessonKey} cümle sınırı ${FIT_PASSES} turda kapanmadı.`);
}
