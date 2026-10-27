/**
 * JuniorCinemaEngine v2 — Akustik Enerji Zarfı ve Kesin PCM Zaman Damgası Motoru.
 *
 * Tek veya çoklu PCM WAV sentezinden:
 * 1) Yazar sekanslarının konuşma sınırlarını 20ms RMS pencereleri ve sessizlik vadileriyle bulur.
 * 2) Her sekansın arasına pedagojik es (`createSilentPcmWav(pauseAfterMs)`) enjekte eder.
 * 3) Kesin PCM bayt ve örnek (sample) sayımından `durationMs = (pcmByteLength / (2 * sampleRate)) * 1000`
 *    formülüyle sıfır kaymalı (0ms drift) `TimelineJSON` üretir.
 */

import {
  createSilentPcmWav,
  readPcmWavLayout,
  wrapPcmAsWav,
} from "@/lib/kernel/ai/pcm-wav";
import { alignWordsByAcoustics } from "@/lib/junior/pilot-engine/word-aligner";
import {
  buildCueTimingFromBounds,
  buildMat5TimelineFromDurations,
  MAT_5_AUTHORED_CUES,
  parseMarkedCueText,
  type AuthoredCueSpec,
} from "@/lib/junior/pilot-engine/mat-1.choreography";
import {
  timelineJsonSchema,
  type ChapterItem,
  type CueSegment,
  type TimelineJSON,
} from "@/lib/junior/pilot-engine/schema";
import { JUNIOR_SYNC_MAX_LIMIT_MS, measureSentenceEndDrift } from "@/lib/junior/pilot-engine/sync-gate";

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
 * Ham PCM tamponunu `authoredCues` içindeki sekanslara akustik vadi (minimum RMS enerji) aramasıyla böler,
 * ardından her sekansın sonuna `createSilentPcmWav(cue.pauseAfterMs)` ekleyerek kesin PCM zaman damgalarını hesaplar.
 * Zaman çizelgesi gövdesini `buildTimeline` kurar. Ders anahtarı bu fonksiyona gömülü değildir.
 */
export function alignSingleWavToAuthoredCues(
  rawWav: Buffer,
  authoredCues: readonly AuthoredCueSpec[],
  buildTimeline: (speechDurationsMs: readonly number[]) => TimelineJSON,
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
  const builtTimeline = buildTimeline(speechDurationsMs);
  const timeline = realignPilotTimelineWords(
    timelineJsonSchema.parse(builtTimeline),
    bufferToSamples(readPcmWavLayout(combinedWav)?.pcm ?? Buffer.alloc(0)),
    sampleRate,
    authoredCues,
  );

  return {
    combinedWav,
    timeline,
    cueDiagnostics,
  };
}

/** `jr_06_mat-1` hizalayıcısı. Sekans listesi ve saat kurucusu bu derse kilitlidir. */
export function alignSingleWavToMat5Cues(
  rawWav: Buffer,
  authoredCues: readonly AuthoredCueSpec[] = MAT_5_AUTHORED_CUES,
): PcmAlignedPilotResult {
  return alignSingleWavToAuthoredCues(rawWav, authoredCues, buildMat5TimelineFromDurations);
}

function bufferToSamples(pcm: Buffer): Int16Array {
  const samples = new Int16Array(Math.floor(pcm.length / 2));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = pcm.readInt16LE(index * 2);
  }
  return samples;
}

/**
 * Kelime saatini tüm kaydın dalgasına kilitler (tüm pilot dersler için genel fonksiyon).
 * Sekans penceresi kelimeyi o aralığa gerer; geç konuşma erken damganın üstüne biner.
 * Pencere burada sınır değildir. Kancalı kare, yeni kelime başlangıcına kayar.
 * Hece payı kullanılmaz. Hizalama kapanmazsa fırın düşer.
 */
export function realignPilotTimelineWords(
  timeline: TimelineJSON,
  samples: Int16Array,
  sampleRate: number,
  authoredCues: readonly AuthoredCueSpec[] = MAT_5_AUTHORED_CUES,
): TimelineJSON {
  if (samples.length === 0 || sampleRate <= 0) {
    return timeline;
  }
  if (authoredCues.length !== timeline.cues.length) {
    throw new Error("Akustik hizalama sekans sayısı yazar listesiyle uyuşmuyor.");
  }
  const pieces = timeline.cues.map((cue, index) => {
    const spec = authoredCues[index];
    if (!spec || spec.id !== cue.id) {
      throw new Error(`${cue.id} akustik hizalama yazar sekansıyla uyuşmuyor.`);
    }
    return { cue, spec, words: parseMarkedCueText(spec.markedText).words };
  });
  const tokens = pieces.flatMap((piece) => piece.words);
  const durationMs = Math.max(1, Math.round((samples.length / sampleRate) * 1000));
  const aligned = alignWordsByAcoustics(tokens, samples, sampleRate, 0, durationMs);
  if (aligned.length !== tokens.length) {
    throw new Error("Akustik hizalama kelime sayısını değiştirdi.");
  }
  let cursor = 0;
  const cues = pieces.map((piece, index) => {
    const slice = aligned.slice(cursor, cursor + piece.words.length);
    cursor += piece.words.length;
    const next = aligned[cursor];
    const startMs = index === 0 ? 0 : slice[0]!.startMs;
    const endMs = Math.max(slice[slice.length - 1]!.endMs, next ? next.startMs : durationMs);
    const rebuilt = buildCueTimingFromBounds(piece.spec, startMs, Math.max(1, endMs - startMs), slice);
    return {
      ...rebuilt,
      startMs,
      endMs,
      pauseAfterMs: piece.cue.pauseAfterMs,
    };
  });
  const titles = new Map(timeline.chapters.map((chapter) => [chapter.id, chapter.title]));
  return timelineJsonSchema.parse({
    ...timeline,
    audio: {
      ...timeline.audio,
      durationMs,
    },
    chapters: chaptersFromCueBounds(cues, titles, durationMs),
    cues,
  });
}

/** Bölüm şeridi sekans sınırlarını izler. Son bölüm kaydın gerçek süresinde biter. */
function chaptersFromCueBounds(
  cues: readonly CueSegment[],
  titles: ReadonlyMap<string, string>,
  durationMs: number,
): ChapterItem[] {
  const chapters: ChapterItem[] = [];
  for (const cue of cues) {
    const last = chapters[chapters.length - 1];
    if (!last || last.id !== cue.chapterId) {
      chapters.push({
        id: cue.chapterId,
        title: titles.get(cue.chapterId) ?? cue.chapterId,
        startMs: chapters.length === 0 ? 0 : cue.startMs,
        endMs: cue.endMs,
      });
    } else {
      last.endMs = cue.endMs;
    }
  }
  if (chapters.length === 0) {
    throw new Error("Bölüm saati kurulamadı.");
  }
  for (let index = 0; index < chapters.length - 1; index += 1) {
    chapters[index]!.endMs = chapters[index + 1]!.startMs;
  }
  chapters[chapters.length - 1]!.endMs = durationMs;
  return chapters;
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

const SENTENCE_BREATH_MS = 220;

function shiftClockPast(value: number, cutMs: number, deltaMs: number): number {
  return value >= cutMs ? value + deltaMs : value;
}

function shiftParamsPast(params: Record<string, unknown>, cutMs: number, deltaMs: number): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (key === "atMs" && typeof value === "number") {
      next[key] = shiftClockPast(value, cutMs, deltaMs);
    } else if (Array.isArray(value)) {
      next[key] = value.map((item) =>
        item && typeof item === "object" ? shiftParamsPast(item as Record<string, unknown>, cutMs, deltaMs) : item,
      );
    } else if (value && typeof value === "object") {
      next[key] = shiftParamsPast(value as Record<string, unknown>, cutMs, deltaMs);
    } else {
      next[key] = value;
    }
  }
  return next;
}

/**
 * Model cümle sonunda duyulur es bırakmadıysa yerel PCM'e 220 ms nefes koyar.
 * İkinci TTS isteği açılmaz. Kesim, ölçülen kelime bitişidir.
 */
export function sealPilotSentenceBreaths(
  wav: Buffer,
  timeline: TimelineJSON,
  authoredCues: readonly AuthoredCueSpec[] = MAT_5_AUTHORED_CUES,
): { wav: Buffer; timeline: TimelineJSON } {
  const layout = readPcmWavLayout(wav);
  if (!layout || layout.pcm.length < 400) {
    throw new Error("Nefes mührü için PCM yok.");
  }
  let pcm = layout.pcm;
  let current = realignPilotTimelineWords(timeline, bufferToSamples(pcm), layout.sampleRate, authoredCues);
  for (let guard = 0; guard < 4; guard += 1) {
    const report = measureSentenceEndDrift(current, bufferToSamples(pcm), layout.sampleRate);
    const offender = [...report.drifts].sort((left, right) => Math.abs(right.driftMs) - Math.abs(left.driftMs))[0];
    if (!offender || Math.abs(offender.driftMs) < JUNIOR_SYNC_MAX_LIMIT_MS) {
      break;
    }
    const inserted = insertSentenceBreath(pcm, layout.sampleRate, layout.channels, current, offender.wordEndMs, offender.word);
    pcm = inserted.pcm;
    current = inserted.timeline;
  }
  return {
    wav: wrapPcmAsWav(pcm, layout.sampleRate, layout.channels, 16),
    timeline: current,
  };
}

/** Geriye dönük uyumluluk takma adları */
export const realignMat5TimelineWords = realignPilotTimelineWords;
export const sealMat5SentenceBreaths = sealPilotSentenceBreaths;

function insertSentenceBreath(
  pcm: Buffer,
  sampleRate: number,
  channels: number,
  timeline: TimelineJSON,
  cutMs: number,
  anchorWord: string,
): { pcm: Buffer; timeline: TimelineJSON } {
  const bytesPerFrame = 2 * channels;
  const insertFrames = Math.max(1, Math.round((sampleRate * SENTENCE_BREATH_MS) / 1000));
  const deltaMs = Math.round((insertFrames / sampleRate) * 1000);
  const cutFrame = Math.min(Math.floor(pcm.length / bytesPerFrame), Math.max(0, Math.round((cutMs / 1000) * sampleRate)));
  const cutByte = cutFrame * bytesPerFrame;
  const faded = Buffer.from(pcm);
  const fadeFrames = Math.min(insertFrames, Math.round((sampleRate * 8) / 1000));
  for (let frame = 0; frame < fadeFrames; frame += 1) {
    const gain = frame / Math.max(1, fadeFrames);
    for (let channel = 0; channel < channels; channel += 1) {
      const tail = cutByte - (frame + 1) * bytesPerFrame + channel * 2;
      const head = cutByte + frame * bytesPerFrame + channel * 2;
      if (tail >= 0) {
        faded.writeInt16LE(Math.round(faded.readInt16LE(tail) * gain), tail);
      }
      if (head + 1 < faded.length) {
        faded.writeInt16LE(Math.round(faded.readInt16LE(head) * gain), head);
      }
    }
  }
  const joined = Buffer.concat([
    faded.subarray(0, cutByte),
    Buffer.alloc(insertFrames * bytesPerFrame),
    faded.subarray(cutByte),
  ]);
  const cues = timeline.cues.map((cue) => ({
    ...cue,
    startMs: shiftClockPast(cue.startMs, cutMs, deltaMs),
    endMs: shiftClockPast(cue.endMs, cutMs, deltaMs),
    words: (cue.words ?? []).map((word) => {
      const anchor = word.word === anchorWord && word.endMs === cutMs;
      return {
        ...word,
        startMs: anchor ? word.startMs : shiftClockPast(word.startMs, cutMs, deltaMs),
        endMs: anchor ? word.endMs : shiftClockPast(word.endMs, cutMs, deltaMs),
      };
    }),
    keyframes: cue.keyframes.map((keyframe) => ({
      ...keyframe,
      atMs: shiftClockPast(keyframe.atMs, cutMs, deltaMs),
      params: shiftParamsPast(keyframe.params, cutMs, deltaMs),
    })),
  }));
  return {
    pcm: joined,
    timeline: timelineJsonSchema.parse({
      ...timeline,
      audio: { ...timeline.audio, durationMs: timeline.audio.durationMs + deltaMs },
      chapters: timeline.chapters.map((chapter) => ({
        ...chapter,
        startMs: shiftClockPast(chapter.startMs, cutMs, deltaMs),
        endMs: shiftClockPast(chapter.endMs, cutMs, deltaMs),
      })),
      cues,
    }),
  };
}
