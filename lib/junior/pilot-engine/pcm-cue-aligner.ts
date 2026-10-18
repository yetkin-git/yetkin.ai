/**
 * JuniorCinemaEngine v2 — Akustik Enerji Zarfı ve Kesin PCM Zaman Damgası Motoru.
 *
 * Tek veya çoklu PCM WAV sentezinden:
 * 1) 12 sekansın (cue-01 .. cue-12) konuşma sınırlarını 20ms RMS pencereleri ve sessizlik vadileriyle bulur.
 * 2) Her sekansın arasına pedagojik es (`createSilentPcmWav(pauseAfterMs)`) enjekte eder.
 * 3) Kesin PCM bayt ve örnek (sample) sayımından `durationMs = (pcmByteLength / (2 * sampleRate)) * 1000`
 *    formülüyle sıfır kaymalı (0ms drift) `TimelineJSON` üretir.
 */

import {
  createSilentPcmWav,
  readPcmWavLayout,
  wrapPcmAsWav,
} from "@/lib/kernel/ai/pcm-wav";
import {
  alignWordsToSpeechWindow,
  detectSilences,
  JUNIOR_SYNC_SILENCE,
  pcmEnvelope,
} from "@/lib/junior/pilot-engine/word-aligner";
import {
  buildCueTimingFromBounds,
  buildMat5TimelineFromDurations,
  MAT_5_AUTHORED_CUES,
  parseMarkedCueText,
  type AuthoredCueSpec,
} from "@/lib/junior/pilot-engine/mat-5.choreography";
import { timelineJsonSchema, type CueSegment, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";

export type PcmAlignedPilotResult = {
  /** Pedagojik esler (`pauseAfterMs`) eklenmiş birleşik 16-bit mono WAV tamponu. */
  combinedWav: Buffer;
  /** Kesin PCM örnek sayımından üretilmiş TimelineJSON. */
  timeline: TimelineJSON;
  /** Her sekansın konuşma ve sessizlik milisaniye dökümü. */
  cueDiagnostics: Array<{
    id: string;
    spokenMs: number;
    pauseAfterMs: number;
    startMs: number;
    endMs: number;
  }>;
};

/**
 * Ham PCM tamponunu `authoredCues` içindeki 12 sekansa akustik vadi (minimum RMS enerji) aramasıyla böler,
 * ardından her sekansın sonuna `createSilentPcmWav(cue.pauseAfterMs)` ekleyerek kesin PCM zaman damgalarını hesaplar.
 */
export function alignSingleWavToMat5Cues(
  rawWav: Buffer,
  authoredCues: readonly AuthoredCueSpec[] = MAT_5_AUTHORED_CUES,
): PcmAlignedPilotResult {
  const layout = readPcmWavLayout(rawWav);
  if (!layout || layout.pcm.length < 400) {
    throw new Error("Geçersiz veya boş PCM WAV tamponu.");
  }
  const { sampleRate, channels, pcm } = layout;
  const bytesPerFrame = 2 * channels;
  const totalFrames = Math.floor(pcm.length / bytesPerFrame);

  // 20ms pencerelerde RMS enerji dizisi çıkar
  const windowFrames = Math.max(1, Math.floor((sampleRate * 20) / 1000));
  const totalWindows = Math.max(1, Math.floor(totalFrames / windowFrames));
  const rmsWindows = new Float64Array(totalWindows);

  for (let w = 0; w < totalWindows; w += 1) {
    let sumSq = 0;
    const baseFrame = w * windowFrames;
    for (let f = 0; f < windowFrames; f += 1) {
      const byteOffset = (baseFrame + f) * bytesPerFrame;
      const sample = pcm.readInt16LE(byteOffset);
      sumSq += sample * sample;
    }
    rmsWindows[w] = Math.sqrt(sumSq / windowFrames);
  }

  // Her sekansın karakter ağırlığını hesapla
  const parsedCues = authoredCues.map((spec) => ({
    spec,
    parsed: parseMarkedCueText(spec.markedText),
  }));
  const weights = parsedCues.map((item) => Math.max(10, item.parsed.cleanText.length));
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);

  // N-1 sınır noktasını beklenen oranın ±%4.5 komşuluğundaki en düşük enerjili (sessizlik vadisi) pencerede bul
  const boundaryFrames: number[] = [0];
  let cumulativeWeight = 0;
  const searchRadiusWindows = Math.max(8, Math.floor(totalWindows * 0.045));

  for (let i = 0; i < parsedCues.length - 1; i += 1) {
    cumulativeWeight += weights[i]!;
    const expectedRatio = cumulativeWeight / totalWeight;
    const expectedWin = Math.round(expectedRatio * totalWindows);
    const minWin = Math.max(
      Math.floor(boundaryFrames[i]! / windowFrames) + 10,
      expectedWin - searchRadiusWindows,
    );
    const maxWin = Math.min(totalWindows - 10, expectedWin + searchRadiusWindows);

    let bestWin = Math.max(minWin, Math.min(maxWin, expectedWin));
    let bestScore = Number.POSITIVE_INFINITY;

    // 3 pencereli (60ms) yerel ortalama enerji + merkeze uzaklık cezası
    for (let w = minWin; w <= maxWin; w += 1) {
      const e0 = rmsWindows[Math.max(0, w - 1)] ?? 0;
      const e1 = rmsWindows[w] ?? 0;
      const e2 = rmsWindows[Math.min(totalWindows - 1, w + 1)] ?? 0;
      const localRms = (e0 + e1 + e2) / 3;
      const distPenalty = (Math.abs(w - expectedWin) / Math.max(1, searchRadiusWindows)) * 180;
      const score = localRms + distPenalty;
      if (score < bestScore) {
        bestScore = score;
        bestWin = w;
      }
    }

    boundaryFrames.push(bestWin * windowFrames);
  }
  boundaryFrames.push(totalFrames);

  // Her sekansın PCM dilimini al, sonuna pedagojik sessizlik (createSilentPcmWav) ekle ve kesin sample sayımı yap
  const outPcmParts: Buffer[] = [];
  const speechDurationsMs: number[] = [];
  const cueDiagnostics: PcmAlignedPilotResult["cueDiagnostics"] = [];
  let cursorFrames = 0;

  for (let i = 0; i < parsedCues.length; i += 1) {
    const { spec } = parsedCues[i]!;
    const startFrame = boundaryFrames[i]!;
    const endFrame = Math.max(startFrame + 1, boundaryFrames[i + 1]!);
    const sliceFrames = endFrame - startFrame;
    const sliceBytes = pcm.subarray(startFrame * bytesPerFrame, endFrame * bytesPerFrame);

    // 15ms yumuşak fade-in / fade-out (klik önleyici)
    const smoothedSlice = Buffer.from(sliceBytes);
    const fadeFrames = Math.min(Math.floor(sliceFrames / 4), Math.floor((sampleRate * 15) / 1000));
    for (let f = 0; f < fadeFrames; f += 1) {
      const gain = f / Math.max(1, fadeFrames);
      for (let ch = 0; ch < channels; ch += 1) {
        const inIdx = (f * channels + ch) * 2;
        const outIdx = ((sliceFrames - 1 - f) * channels + ch) * 2;
        smoothedSlice.writeInt16LE(Math.round(smoothedSlice.readInt16LE(inIdx) * gain), inIdx);
        smoothedSlice.writeInt16LE(Math.round(smoothedSlice.readInt16LE(outIdx) * gain), outIdx);
      }
    }

    const pauseFrames =
      spec.pauseAfterMs > 0
        ? Math.floor(
            (readPcmWavLayout(createSilentPcmWav(spec.pauseAfterMs, sampleRate))?.pcm.length ??
              Math.floor((sampleRate * spec.pauseAfterMs) / 1000) * 2) / 2,
          )
        : 0;
    const pausePcm = Buffer.alloc(pauseFrames * bytesPerFrame);

    const cueStartMs = Math.round((cursorFrames / sampleRate) * 1000);
    const spokenMs = Math.max(200, Math.round((sliceFrames / sampleRate) * 1000));
    const actualPauseMs = Math.round((pauseFrames / sampleRate) * 1000);
    const cueEndMs = cueStartMs + spokenMs;

    outPcmParts.push(smoothedSlice, pausePcm);
    cursorFrames += sliceFrames + pauseFrames;

    speechDurationsMs.push(spokenMs);
    cueDiagnostics.push({
      id: spec.id,
      spokenMs,
      pauseAfterMs: actualPauseMs,
      startMs: cueStartMs,
      endMs: cueEndMs,
    });
  }

  const combinedWav = wrapPcmAsWav(Buffer.concat(outPcmParts), sampleRate, channels, 16);
  const builtTimeline = buildMat5TimelineFromDurations(speechDurationsMs);
  const timeline = realignMat5TimelineWords(
    timelineJsonSchema.parse(builtTimeline),
    bufferToSamples(readPcmWavLayout(combinedWav)?.pcm ?? Buffer.alloc(0)),
    sampleRate,
  );

  return {
    combinedWav,
    timeline,
    cueDiagnostics,
  };
}

function bufferToSamples(pcm: Buffer): Int16Array {
  const samples = new Int16Array(Math.floor(pcm.length / 2));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = pcm.readInt16LE(index * 2);
  }
  return samples;
}

/**
 * Kelime saatini cue sınırlarının içindeki PCM sessizliklerine kilitler.
 * Cue başlangıç ve bitişi yerinde kalır; kancalı kareler yeni kelime başlangıcına kayar.
 */
export function realignMat5TimelineWords(
  timeline: TimelineJSON,
  samples: Int16Array,
  sampleRate: number,
): TimelineJSON {
  if (samples.length === 0 || sampleRate <= 0) {
    return timeline;
  }
  const silences = detectSilences(pcmEnvelope(samples, sampleRate), JUNIOR_SYNC_SILENCE);
  const cues = timeline.cues.map((cue, index) => {
    const spec = MAT_5_AUTHORED_CUES[index];
    if (!spec || spec.id !== cue.id) {
      return cue;
    }
    const speechMs = Math.max(1, cue.endMs - cue.startMs);
    const parsed = parseMarkedCueText(spec.markedText);
    const aligned = alignWordsToSpeechWindow(parsed.words, cue.startMs, cue.endMs, silences);
    if (aligned.length !== parsed.words.length) {
      return cue;
    }
    const rebuilt = buildCueTimingFromBounds(spec, cue.startMs, speechMs, aligned);
    return {
      ...rebuilt,
      startMs: cue.startMs,
      endMs: cue.endMs,
      pauseAfterMs: cue.pauseAfterMs,
    };
  });
  return timelineJsonSchema.parse({
    ...timeline,
    cues,
  });
}

/** İç `atMs` değerleri üst kareyle aynı ölçeği alır. Başka sayılar durur. */
function scaleKeyframeParams(
  params: Record<string, unknown>,
  scale: number,
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === "atMs" && typeof value === "number") {
      next[key] = Math.round(value * scale);
    } else if (Array.isArray(value)) {
      next[key] = value.map((item) =>
        item && typeof item === "object"
          ? scaleKeyframeParams(item as Record<string, unknown>, scale)
          : item,
      );
    } else if (value && typeof value === "object") {
      next[key] = scaleKeyframeParams(value as Record<string, unknown>, scale);
    } else {
      next[key] = value;
    }
  }
  return next;
}

/**
 * MP3 transcode sonrasında gerçek MP3 süresi ile PCM süresi arasında çok küçük (ör. birkaç ms) fark varsa
 * tüm sekans ve keyframe zamanlarını gerçek MP3 milisaniyesine kilitler.
 */
export function lockTimelineToExactAudioMs(timeline: TimelineJSON, exactAudioMs: number): TimelineJSON {
  const currentTotalMs = timeline.audio.durationMs;
  if (exactAudioMs <= 0 || Math.abs(exactAudioMs - currentTotalMs) <= 5) {
    return timeline;
  }
  const scale = exactAudioMs / Math.max(1, currentTotalMs);
  const scaledCues: CueSegment[] = timeline.cues.map((cue, idx, arr) => {
    const startMs = idx === 0 ? 0 : Math.round(cue.startMs * scale);
    const endMs = idx === arr.length - 1 ? exactAudioMs : Math.round(cue.endMs * scale);
    return {
      ...cue,
      startMs,
      endMs,
      words: (cue.words ?? []).map((w) => ({
        ...w,
        startMs: Math.round(w.startMs * scale),
        endMs: Math.round(w.endMs * scale),
      })),
      keyframes: cue.keyframes.map((kf) => ({
        ...kf,
        atMs: Math.round(kf.atMs * scale),
        params: scaleKeyframeParams(kf.params, scale),
      })),
    };
  });

  const scaledChapters = timeline.chapters.map((ch, idx, arr) => ({
    ...ch,
    startMs: idx === 0 ? 0 : Math.round(ch.startMs * scale),
    endMs: idx === arr.length - 1 ? exactAudioMs : Math.round(ch.endMs * scale),
  }));

  return timelineJsonSchema.parse({
    ...timeline,
    audio: {
      ...timeline.audio,
      durationMs: exactAudioMs,
    },
    chapters: scaledChapters,
    cues: scaledCues,
  });
}
