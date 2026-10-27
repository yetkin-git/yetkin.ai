/**
 * Kelime saatini sesin kendisinden çıkarır.
 *
 * Metin sabittir. Her kelimenin okunuşu ünlü, ünsüz ve sessizlik durumlarına ayrılır.
 * 10 ms pencerelerde RMS, sıfır geçişi ve spektral akı ölçülür. Viterbi yolu bu durumları
 * dalgaya oturtur. Sınır, hece payı değil; enerji vadisi ve spektral tepeye çekilir.
 */

export type AlignedWord = {
  word: string;
  startMs: number;
  endMs: number;
};

export type SpeechSilence = {
  startMs: number;
  endMs: number;
};

export type SilenceOptions = {
  /** Eşik, zarfın 99. yüzdelik değerine oranla. `peak` açıksa tepe değere oranlanır. */
  thresholdRatio: number;
  minSilenceMs: number;
  peak?: boolean;
};

export const ALIGNER_FRAME_MS = 10;

export const ALIGNER_SILENCE: SilenceOptions = {
  thresholdRatio: 0.03,
  minSilenceMs: 140,
};

/** Kapının ölçtüğü sessizlik: tepe RMS'in %2'si, en kısa 180 ms. */
export const JUNIOR_SYNC_SILENCE: SilenceOptions = {
  thresholdRatio: 0.02,
  minSilenceMs: 180,
  peak: true,
};

const ONES = ["", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"] as const;
const TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"] as const;

function underThousand(value: number): string[] {
  const hundreds = Math.floor(value / 100);
  const tens = Math.floor((value % 100) / 10);
  const ones = value % 10;
  const parts: string[] = [];
  if (hundreds > 0) {
    parts.push(hundreds > 1 ? `${ONES[hundreds]} yüz` : "yüz");
  }
  if (tens > 0) {
    parts.push(TENS[tens]!);
  }
  if (ones > 0) {
    parts.push(ONES[ones]!);
  }
  return parts;
}

/** «24» → «yirmi dört». Akustik okunuş içindir; yazım kuralı değildir. */
export function turkishNumberWords(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value >= 1_000_000_000) {
    return String(value);
  }
  if (value === 0) {
    return "sıfır";
  }
  const millions = Math.floor(value / 1_000_000);
  const thousands = Math.floor((value % 1_000_000) / 1000);
  const rest = value % 1000;
  const parts: string[] = [];
  if (millions > 0) {
    parts.push(...underThousand(millions), "milyon");
  }
  if (thousands === 1) {
    parts.push("bin");
  } else if (thousands > 1) {
    parts.push(...underThousand(thousands), "bin");
  }
  parts.push(...underThousand(rest));
  return parts.join(" ");
}

/** Yazılı kelimenin okunuşu. Rakam, kesir ve işlem imleri sözcüğe döner. */
export function spokenFormOfWord(word: string): string {
  return word
    .replace(/(\d+)[.,](\d+)/gu, (_, left: string, right: string) =>
      ` ${turkishNumberWords(Number(left))} virgül ${turkishNumberWords(Number(right))} `,
    )
    .replace(/\d+/gu, (digits) => ` ${turkishNumberWords(Number(digits))} `)
    .replace(/×/gu, " çarpı ")
    .replace(/÷/gu, " bölü ")
    .replace(/=/gu, " eşittir ")
    .replace(/\+/gu, " artı ")
    .replace(/%/gu, " yüzde ")
    .replace(/\s+/gu, " ")
    .trim();
}

/** 10 ms pencerelerde RMS zarfı. */
export function pcmEnvelope(samples: Int16Array, sampleRate: number, frameMs = ALIGNER_FRAME_MS): Float64Array {
  const frame = Math.max(1, Math.round((sampleRate * frameMs) / 1000));
  const count = Math.floor(samples.length / frame);
  const rms = new Float64Array(count);
  for (let index = 0; index < count; index += 1) {
    let sum = 0;
    const base = index * frame;
    for (let offset = 0; offset < frame; offset += 1) {
      const sample = samples[base + offset] ?? 0;
      sum += sample * sample;
    }
    rms[index] = Math.sqrt(sum / frame);
  }
  return rms;
}

export function envelopeThreshold(rms: Float64Array, ratio: number, peak = false): number {
  if (rms.length === 0) {
    return 1;
  }
  if (peak) {
    let top = 0;
    for (let index = 0; index < rms.length; index += 1) {
      const value = rms[index] ?? 0;
      if (value > top) {
        top = value;
      }
    }
    return Math.max(1, top * ratio);
  }
  const sorted = Array.from(rms).sort((left, right) => left - right);
  const p99 = sorted[Math.floor(0.99 * (sorted.length - 1))] ?? 0;
  return Math.max(1, p99 * ratio);
}

/** Bu kadar kısa bir tıkırtı iki sessizliği bölmez. */
const SILENCE_BRIDGE_MS = 60;

export function detectSilences(
  rms: Float64Array,
  options: SilenceOptions = ALIGNER_SILENCE,
  frameMs = ALIGNER_FRAME_MS,
): SpeechSilence[] {
  const threshold = envelopeThreshold(rms, options.thresholdRatio, options.peak === true);
  const runs: SpeechSilence[] = [];
  let runStart = -1;
  for (let index = 0; index <= rms.length; index += 1) {
    const quiet = index < rms.length && (rms[index] ?? 0) < threshold;
    if (quiet && runStart < 0) {
      runStart = index;
    } else if (!quiet && runStart >= 0) {
      runs.push({ startMs: runStart * frameMs, endMs: index * frameMs });
      runStart = -1;
    }
  }
  const merged: SpeechSilence[] = [];
  for (const run of runs) {
    const last = merged[merged.length - 1];
    if (last && run.startMs - last.endMs <= SILENCE_BRIDGE_MS) {
      last.endMs = run.endMs;
    } else {
      merged.push({ ...run });
    }
  }
  return merged.filter((run) => run.endMs - run.startMs >= options.minSilenceMs);
}

type PhoneKind = "vowel" | "sonorant" | "fricative" | "stop" | "gap";

type AcousticUnit = {
  wordIndex: number;
  kind: PhoneKind;
};

const FFT_SIZE = 256;
const GAP_FRAME_PENALTY = 0.03;

function phoneKindOf(letter: string): PhoneKind {
  if ("aeıioöuüâîû".includes(letter)) {
    return "vowel";
  }
  if ("mnrlryğw".includes(letter)) {
    return "sonorant";
  }
  if ("sfşhvzjcç".includes(letter)) {
    return "fricative";
  }
  return "stop";
}

/** Yazılı kelimenin okunuşundaki ses sınıfları. Rakam önce söze döner. */
export function spokenPhoneKinds(word: string): PhoneKind[] {
  const spoken = spokenFormOfWord(word).toLocaleLowerCase("tr-TR");
  const letters = spoken.match(/[a-zçğıöşüâîû]/gu) ?? [];
  const kinds = letters.map((letter) => phoneKindOf(letter));
  return kinds.length > 0 ? kinds : ["vowel"];
}

function phoneBounds(kind: PhoneKind): { min: number; max: number } {
  if (kind === "vowel") {
    return { min: 2, max: 48 };
  }
  if (kind === "sonorant") {
    return { min: 1, max: 24 };
  }
  if (kind === "fricative") {
    return { min: 1, max: 28 };
  }
  return { min: 1, max: 18 };
}

function durationPenalty(kind: PhoneKind, frames: number): number {
  const target = kind === "vowel" ? 8 : kind === "sonorant" ? 5 : kind === "fricative" ? 6 : 4;
  const delta = frames - target;
  return 0.05 * delta * delta;
}

function frameCost(kind: PhoneKind, energy: number, zcr: number, flux: number): number {
  if (kind === "gap") {
    return 6 * energy * energy;
  }
  if (kind === "vowel") {
    return 2.4 * (1 - energy) * (1 - energy) + 0.3 * zcr * zcr + 0.25 * flux * flux;
  }
  if (kind === "sonorant") {
    return 1.3 * (energy - 0.6) * (energy - 0.6) + 0.2 * zcr * zcr + 0.12;
  }
  if (kind === "fricative") {
    return 0.8 * (energy - 0.35) * (energy - 0.35) + 0.9 * (1 - zcr) * (1 - zcr) + 0.15;
  }
  return 0.5 * (energy - 0.25) * (energy - 0.25) + 0.4 * (1 - flux) * (1 - flux) + 0.2;
}

function percentile(values: Float64Array, ratio: number): number {
  if (values.length === 0) {
    return 0;
  }
  const sorted = Array.from(values).sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.round(ratio * (sorted.length - 1))));
  return sorted[index] ?? 0;
}

function normalizeInPlace(values: Float64Array): void {
  const scale = Math.max(percentile(values, 0.95), 1e-8);
  for (let index = 0; index < values.length; index += 1) {
    const normalized = (values[index] ?? 0) / scale;
    values[index] = normalized < 0 ? 0 : normalized > 1 ? 1 : normalized;
  }
}

function smooth3(values: Float64Array): Float64Array {
  const out = new Float64Array(values.length);
  for (let index = 0; index < values.length; index += 1) {
    const left = values[Math.max(0, index - 1)] ?? 0;
    const mid = values[index] ?? 0;
    const right = values[Math.min(values.length - 1, index + 1)] ?? 0;
    out[index] = (left + mid + right) / 3;
  }
  return out;
}

function bitReversePermute(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let index = 1, reversed = 0; index < n; index += 1) {
    let bit = n >> 1;
    for (; reversed & bit; bit >>= 1) {
      reversed ^= bit;
    }
    reversed ^= bit;
    if (index < reversed) {
      const reSwap = re[index] ?? 0;
      const imSwap = im[index] ?? 0;
      re[index] = re[reversed] ?? 0;
      im[index] = im[reversed] ?? 0;
      re[reversed] = reSwap;
      im[reversed] = imSwap;
    }
  }
}

function forwardFft(re: Float64Array, im: Float64Array): void {
  bitReversePermute(re, im);
  const n = re.length;
  for (let length = 2; length <= n; length <<= 1) {
    const angle = (-2 * Math.PI) / length;
    const wRe = Math.cos(angle);
    const wIm = Math.sin(angle);
    for (let start = 0; start < n; start += length) {
      let curRe = 1;
      let curIm = 0;
      const half = length >> 1;
      for (let offset = 0; offset < half; offset += 1) {
        const evenRe = re[start + offset] ?? 0;
        const evenIm = im[start + offset] ?? 0;
        const oddRe = re[start + offset + half] ?? 0;
        const oddIm = im[start + offset + half] ?? 0;
        const twRe = oddRe * curRe - oddIm * curIm;
        const twIm = oddRe * curIm + oddIm * curRe;
        re[start + offset] = evenRe + twRe;
        im[start + offset] = evenIm + twIm;
        re[start + offset + half] = evenRe - twRe;
        im[start + offset + half] = evenIm - twIm;
        const nextRe = curRe * wRe - curIm * wIm;
        curIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
      }
    }
  }
}

type FrameFeatures = {
  energy: Float64Array;
  zcr: Float64Array;
  flux: Float64Array;
};

function frameFeatures(samples: Int16Array, sampleRate: number): FrameFeatures {
  const hop = Math.max(1, Math.round((sampleRate * ALIGNER_FRAME_MS) / 1000));
  const frames = Math.floor(samples.length / hop);
  const energy = new Float64Array(frames);
  const zcr = new Float64Array(frames);
  const flux = new Float64Array(frames);
  const hann = new Float64Array(FFT_SIZE);
  for (let index = 0; index < FFT_SIZE; index += 1) {
    hann[index] = 0.5 * (1 - Math.cos((2 * Math.PI * index) / (FFT_SIZE - 1)));
  }
  const re = new Float64Array(FFT_SIZE);
  const im = new Float64Array(FFT_SIZE);
  const previous = new Float64Array(FFT_SIZE / 2);
  for (let frame = 0; frame < frames; frame += 1) {
    const base = frame * hop;
    let sum = 0;
    let crossings = 0;
    let last = samples[base] ?? 0;
    for (let offset = 0; offset < hop; offset += 1) {
      const sample = samples[base + offset] ?? 0;
      sum += sample * sample;
      if ((last >= 0 && sample < 0) || (last < 0 && sample >= 0)) {
        crossings += 1;
      }
      last = sample;
    }
    energy[frame] = Math.sqrt(sum / hop);
    zcr[frame] = crossings / hop;
    re.fill(0);
    im.fill(0);
    const available = Math.min(FFT_SIZE, samples.length - base);
    for (let offset = 0; offset < available; offset += 1) {
      re[offset] = (samples[base + offset] ?? 0) * (hann[offset] ?? 0);
    }
    forwardFft(re, im);
    let fluxSum = 0;
    for (let bin = 1; bin < FFT_SIZE / 2; bin += 1) {
      const magnitude = Math.log1p(Math.hypot(re[bin] ?? 0, im[bin] ?? 0));
      const rise = magnitude - (previous[bin] ?? 0);
      if (rise > 0) {
        fluxSum += rise;
      }
      previous[bin] = magnitude;
    }
    flux[frame] = fluxSum;
  }
  normalizeInPlace(energy);
  normalizeInPlace(zcr);
  normalizeInPlace(flux);
  return { energy: smooth3(energy), zcr, flux: smooth3(flux) };
}

function prefixCosts(kind: PhoneKind, features: FrameFeatures): Float64Array {
  const prefix = new Float64Array(features.energy.length + 1);
  for (let frame = 0; frame < features.energy.length; frame += 1) {
    prefix[frame + 1] =
      (prefix[frame] ?? 0) +
      frameCost(kind, features.energy[frame] ?? 0, features.zcr[frame] ?? 0, features.flux[frame] ?? 0);
  }
  return prefix;
}

function alignGapUnit(
  previous: Float64Array,
  prefix: Float64Array,
): { cost: Float64Array<ArrayBuffer>; startAt: Int32Array<ArrayBuffer> } {
  const frames = previous.length - 1;
  const cost = new Float64Array(frames + 1).fill(Number.POSITIVE_INFINITY);
  const startAt = new Int32Array(frames + 1).fill(-1);
  const deque: number[] = [];
  let head = 0;
  let nextStart = -1;
  const score = (start: number) => (previous[start] ?? 0) - (prefix[start] ?? 0) - GAP_FRAME_PENALTY * start;
  for (let end = 0; end <= frames; end += 1) {
    while (nextStart < end) {
      nextStart += 1;
      if (!Number.isFinite(previous[nextStart] ?? Number.POSITIVE_INFINITY)) {
        continue;
      }
      const value = score(nextStart);
      while (deque.length > head && score(deque[deque.length - 1]!) >= value) {
        deque.pop();
      }
      deque.push(nextStart);
    }
    while (deque.length > head && (deque[head] ?? 0) < 0) {
      head += 1;
    }
    if (deque.length <= head) {
      continue;
    }
    const start = deque[head]!;
    cost[end] = (prefix[end] ?? 0) + GAP_FRAME_PENALTY * end + score(start);
    startAt[end] = start;
  }
  return { cost, startAt };
}

function alignPhoneUnit(
  previous: Float64Array,
  prefix: Float64Array,
  kind: PhoneKind,
  minFrames: number,
  maxFrames: number,
): { cost: Float64Array<ArrayBuffer>; startAt: Int32Array<ArrayBuffer> } {
  const frames = previous.length - 1;
  const cost = new Float64Array(frames + 1).fill(Number.POSITIVE_INFINITY);
  const startAt = new Int32Array(frames + 1).fill(-1);
  for (let end = 0; end <= frames; end += 1) {
    const newest = end - minFrames;
    const oldest = Math.max(0, end - maxFrames);
    if (newest < oldest) {
      continue;
    }
    let best = Number.POSITIVE_INFINITY;
    let bestStart = -1;
    for (let start = oldest; start <= newest; start += 1) {
      const base = previous[start] ?? Number.POSITIVE_INFINITY;
      if (!Number.isFinite(base)) {
        continue;
      }
      const duration = end - start;
      const value = base + (prefix[end] ?? 0) - (prefix[start] ?? 0) + durationPenalty(kind, duration);
      if (value < best) {
        best = value;
        bestStart = start;
      }
    }
    if (bestStart >= 0) {
      cost[end] = best;
      startAt[end] = bestStart;
    }
  }
  return { cost, startAt };
}

function boundaryScore(energy: Float64Array, flux: Float64Array, frame: number): number {
  return (flux[frame] ?? 0) + (1 - (energy[frame] ?? 0));
}

function snapCut(cut: number, energy: Float64Array, flux: Float64Array): number {
  const radius = 6;
  const lo = Math.max(1, cut - radius);
  const hi = Math.min(energy.length - 2, cut + radius);
  let best = cut;
  let bestScore = boundaryScore(energy, flux, Math.max(0, Math.min(energy.length - 1, cut)));
  for (let frame = lo; frame <= hi; frame += 1) {
    const score = boundaryScore(energy, flux, frame);
    const before = boundaryScore(energy, flux, frame - 1);
    const after = boundaryScore(energy, flux, frame + 1);
    if (score >= before && score >= after && score > bestScore + 0.12) {
      best = frame;
      bestScore = score;
    }
  }
  return best;
}

function unitsForWords(words: readonly string[]): AcousticUnit[] {
  const units: AcousticUnit[] = [{ wordIndex: -1, kind: "gap" }];
  for (let index = 0; index < words.length; index += 1) {
    for (const kind of spokenPhoneKinds(words[index] ?? "")) {
      units.push({ wordIndex: index, kind });
    }
    units.push({ wordIndex: -1, kind: "gap" });
  }
  return units;
}

/**
 * Bilinen kelime dizisini pencerenin dalgasına zorla hizalar.
 * Çıktıdaki her kelimenin `startMs`/`endMs` değeri konuşmanın enerji aralığıdır.
 * Aralık dışındaki sessizlik hiçbir kelimeye yazılmaz.
 */
function alignPhonesInWindow(
  words: readonly string[],
  samples: Int16Array,
  sampleRate: number,
  windowStartMs: number,
  windowEndMs: number,
): AlignedWord[] {
  if (words.length === 0) {
    return [];
  }
  if (sampleRate <= 0 || windowEndMs <= windowStartMs) {
    throw new Error("Akustik hizalama için ses penceresi yok.");
  }
  const startSample = Math.max(0, Math.min(samples.length, Math.round((windowStartMs / 1000) * sampleRate)));
  const endSample = Math.max(startSample, Math.min(samples.length, Math.round((windowEndMs / 1000) * sampleRate)));
  const slice = samples.subarray(startSample, endSample);
  const features = frameFeatures(slice, sampleRate);
  const frames = features.energy.length;
  const units = unitsForWords(words);
  const phoneCount = units.filter((unit) => unit.kind !== "gap").length;
  if (frames < words.length || frames < 2) {
    throw new Error("Akustik hizalama sığmadı: ses penceresi kelimelerden kısa.");
  }
  let minSum = 0;
  for (const unit of units) {
    if (unit.kind !== "gap") {
      minSum += phoneBounds(unit.kind).min;
    }
  }
  const squeeze = minSum > frames || phoneCount > frames;
  if (phoneCount > frames) {
    throw new Error("Akustik hizalama sığmadı: ses birimi kare sayısını aşıyor.");
  }
  const prefixes = new Map<PhoneKind, Float64Array>();
  for (const kind of ["vowel", "sonorant", "fricative", "stop", "gap"] as const) {
    prefixes.set(kind, prefixCosts(kind, features));
  }
  let previous = new Float64Array(frames + 1).fill(Number.POSITIVE_INFINITY);
  previous[0] = 0;
  const starts: Int32Array<ArrayBuffer>[] = [];
  for (const unit of units) {
    const prefix = prefixes.get(unit.kind)!;
    const aligned =
      unit.kind === "gap"
        ? alignGapUnit(previous, prefix)
        : alignPhoneUnit(
            previous,
            prefix,
            unit.kind,
            squeeze ? 1 : phoneBounds(unit.kind).min,
            Math.max(squeeze ? 1 : phoneBounds(unit.kind).min, phoneBounds(unit.kind).max),
          );
    if (!Number.isFinite(aligned.cost[frames] ?? Number.POSITIVE_INFINITY) || (aligned.startAt[frames] ?? -1) < 0) {
      throw new Error(
        `Akustik hizalama yolu kapanmadı. tür=${unit.kind} kare=${frames} bedel=${aligned.cost[frames]} başlangıç=${aligned.startAt[frames]}`,
      );
    }
    starts.push(aligned.startAt);
    previous = aligned.cost;
  }
  let cursor = frames;
  const placed: Array<{ wordIndex: number; start: number; end: number }> = [];
  for (let index = units.length - 1; index >= 0; index -= 1) {
    const start = starts[index]?.[cursor] ?? -1;
    if (start < 0 || start > cursor) {
      const unit = units[index];
      throw new Error(
        `Akustik hizalama geri izi koptu. birim=${index}/${units.length} tür=${unit?.kind} kelime=${unit?.wordIndex} imleç=${cursor} kare=${frames} başlangıç=${start}`,
      );
    }
    placed.push({ wordIndex: units[index]!.wordIndex, start, end: cursor });
    cursor = start;
  }
  if (cursor !== 0) {
    throw new Error("Akustik hizalama pencerenin başında kapanmadı.");
  }
  const spans = words.map(() => ({ start: frames, end: -1 }));
  for (const piece of placed) {
    if (piece.wordIndex < 0) {
      continue;
    }
    const span = spans[piece.wordIndex];
    if (!span) {
      continue;
    }
    span.start = Math.min(span.start, piece.start);
    span.end = Math.max(span.end, piece.end);
  }
  const low = 0.12;
  for (const span of spans) {
    if (span.end <= span.start) {
      throw new Error("Akustik hizalama boş kelime üretti.");
    }
    while (span.start + 4 < span.end && (features.energy[span.start] ?? 0) < low) {
      span.start += 1;
    }
    while (span.end - 4 > span.start && (features.energy[span.end - 1] ?? 0) < low) {
      span.end -= 1;
    }
  }
  for (let index = 0; index < spans.length - 1; index += 1) {
    const current = spans[index]!;
    const next = spans[index + 1]!;
    if (next.start - current.end > 3) {
      continue;
    }
    const cut = snapCut(current.end, features.energy, features.flux);
    if (cut > current.start && cut < next.end) {
      current.end = cut;
      next.start = cut;
    }
  }
  for (let index = 0; index < spans.length; index += 1) {
    const span = spans[index]!;
    const previous = index > 0 ? spans[index - 1] : undefined;
    if (previous && span.start < previous.end) {
      span.start = previous.end;
    }
    if (span.end <= span.start) {
      span.end = Math.min(frames, span.start + 1);
    }
  }
  return words.map((word, index) => {
    const span = spans[index]!;
    const startMs = windowStartMs + span.start * ALIGNER_FRAME_MS;
    const endMs = windowStartMs + Math.max(span.start + 1, span.end) * ALIGNER_FRAME_MS;
    return {
      word,
      startMs: Math.round(Math.max(windowStartMs, Math.min(windowEndMs - ALIGNER_FRAME_MS, startMs))),
      endMs: Math.round(Math.max(windowStartMs + ALIGNER_FRAME_MS, Math.min(windowEndMs, endMs))),
    };
  });
}

type BoundaryKind = "sentence" | "clause" | "word";

function boundaryKind(previousWord: string | undefined): BoundaryKind {
  if (!previousWord) {
    return "word";
  }
  if (/(?:(?<!\d)\.|[!?…])["»)]*$/u.test(previousWord)) {
    return "sentence";
  }
  if (/[,;:—–.]["»)]*$/u.test(previousWord)) {
    return "clause";
  }
  return "word";
}

function boundaryPenalty(kind: BoundaryKind, silenceMs: number): number {
  if (kind === "sentence") {
    return 0;
  }
  if (kind === "clause") {
    return 0.3 + silenceMs / 1200;
  }
  return 2 + silenceMs / 200;
}

const MISSED_SENTENCE_PAUSE = 6;
const MISSED_CLAUSE_PAUSE = 0.15;

/** Ses birimlerinin hedef süresi. Ada bölmek içindir; kelime kenarını boyamaz. */
function phoneTargetMs(word: string): number {
  let frames = 0;
  for (const kind of spokenPhoneKinds(word)) {
    frames += kind === "vowel" ? 8 : kind === "sonorant" ? 5 : kind === "fricative" ? 6 : 4;
  }
  return Math.max(ALIGNER_FRAME_MS * 4, frames * ALIGNER_FRAME_MS);
}

function islandDurationCost(actualMs: number, expectedMs: number): number {
  const ratio = Math.log((actualMs + 60) / (expectedMs + 60));
  return (ratio * ratio) / (0.3 * 0.3);
}

function speechIslands(
  words: readonly string[],
  windowStartMs: number,
  windowEndMs: number,
  silences: readonly SpeechSilence[],
): Array<{ startMs: number; endMs: number; from: number; to: number }> {
  let onset = windowStartMs;
  let offset = windowEndMs;
  const interior: SpeechSilence[] = [];
  for (const silence of silences) {
    if (silence.endMs <= windowStartMs || silence.startMs >= windowEndMs) {
      continue;
    }
    if (silence.startMs <= windowStartMs + 30) {
      onset = Math.max(onset, Math.min(windowEndMs, silence.endMs));
      continue;
    }
    if (silence.endMs >= windowEndMs - 30) {
      offset = Math.min(offset, Math.max(windowStartMs, silence.startMs));
      continue;
    }
    interior.push(silence);
  }
  const n = words.length;
  if (offset - onset < 40 * n) {
    onset = windowStartMs;
    offset = windowEndMs;
  }
  const inner = interior.filter((silence) => silence.startMs > onset && silence.endMs < offset);
  const islands: Array<{ startMs: number; endMs: number }> = [];
  let cursor = onset;
  for (const silence of inner) {
    islands.push({ startMs: cursor, endMs: silence.startMs });
    cursor = silence.endMs;
  }
  islands.push({ startMs: cursor, endMs: offset });

  const expected = words.map((word) => phoneTargetMs(word));
  const prefix = [0];
  for (const duration of expected) {
    prefix.push((prefix[prefix.length - 1] ?? 0) + duration);
  }
  const speechMs = islands.reduce((sum, island) => sum + (island.endMs - island.startMs), 0);
  const scale = speechMs / Math.max(1, prefix[n] ?? 1);
  const kinds = Array.from({ length: n + 1 }, (_, boundary) => boundaryKind(boundary > 0 ? words[boundary - 1] : undefined));
  const missedPrefix = [0];
  for (let boundary = 1; boundary <= n; boundary += 1) {
    const kind = kinds[boundary];
    const missed =
      boundary < n ? (kind === "sentence" ? MISSED_SENTENCE_PAUSE : kind === "clause" ? MISSED_CLAUSE_PAUSE : 0) : 0;
    missedPrefix.push((missedPrefix[boundary - 1] ?? 0) + missed);
  }
  const cost = (islandIndex: number, from: number, to: number): number => {
    const island = islands[islandIndex]!;
    const skipped = to - 1 > from ? (missedPrefix[to - 1] ?? 0) - (missedPrefix[from] ?? 0) : 0;
    const expectedMs = ((prefix[to] ?? 0) - (prefix[from] ?? 0)) * scale;
    return islandDurationCost(island.endMs - island.startMs, expectedMs) + skipped;
  };

  const breaks: number[] = [];
  const silenceCount = inner.length;
  if (silenceCount > 0) {
    const dp: Float64Array[] = [];
    const back: Int32Array[] = [];
    for (let islandIndex = 0; islandIndex < silenceCount; islandIndex += 1) {
      const row = new Float64Array(n + 1).fill(Number.POSITIVE_INFINITY);
      const from = new Int32Array(n + 1).fill(-1);
      const silenceMs = inner[islandIndex]!.endMs - inner[islandIndex]!.startMs;
      for (let boundary = 0; boundary <= n; boundary += 1) {
        const penalty = boundary === 0 || boundary === n ? 6 : boundaryPenalty(kinds[boundary]!, silenceMs);
        if (islandIndex === 0) {
          row[boundary] = cost(0, 0, boundary) + penalty;
          from[boundary] = 0;
          continue;
        }
        const previous = dp[islandIndex - 1]!;
        for (let earlier = 0; earlier <= boundary; earlier += 1) {
          const base = previous[earlier] ?? Number.POSITIVE_INFINITY;
          if (!Number.isFinite(base)) {
            continue;
          }
          const value = base + cost(islandIndex, earlier, boundary) + penalty;
          if (value < (row[boundary] ?? Number.POSITIVE_INFINITY)) {
            row[boundary] = value;
            from[boundary] = earlier;
          }
        }
      }
      dp.push(row);
      back.push(from);
    }
    let best = Number.POSITIVE_INFINITY;
    let bestBoundary = 0;
    const last = dp[silenceCount - 1]!;
    for (let boundary = 0; boundary <= n; boundary += 1) {
      const value = (last[boundary] ?? Number.POSITIVE_INFINITY) + cost(silenceCount, boundary, n);
      if (value < best) {
        best = value;
        bestBoundary = boundary;
      }
    }
    let boundary = bestBoundary;
    for (let islandIndex = silenceCount - 1; islandIndex >= 0; islandIndex -= 1) {
      breaks.push(boundary);
      boundary = back[islandIndex]![boundary] ?? 0;
    }
    breaks.reverse();
  }

  const bounds = [0, ...breaks, n];
  return islands.map((island, index) => ({
    startMs: island.startMs,
    endMs: island.endMs,
    from: bounds[index] ?? 0,
    to: bounds[index + 1] ?? n,
  }));
}

function frameAt(ms: number, windowStartMs: number, frameCount: number): number {
  return Math.max(0, Math.min(frameCount - 1, Math.round((ms - windowStartMs) / ALIGNER_FRAME_MS)));
}

function intervalLoud(rms: Float64Array, threshold: number, startFrame: number, endFrame: number): boolean {
  const end = Math.max(startFrame + 1, endFrame);
  for (let frame = startFrame; frame < end && frame < rms.length; frame += 1) {
    if ((rms[frame] ?? 0) >= threshold) {
      return true;
    }
  }
  return false;
}

/** Sessiz kalan kısa kelimeyi en yakın konuşma başlangıcına çeker. */
function snapSilentWords(
  words: AlignedWord[],
  rms: Float64Array,
  threshold: number,
  windowStartMs: number,
): void {
  for (let index = 0; index < words.length; index += 1) {
    const word = words[index]!;
    const startFrame = frameAt(word.startMs, windowStartMs, rms.length);
    const endFrame = frameAt(word.endMs, windowStartMs, rms.length);
    if (intervalLoud(rms, threshold, startFrame, endFrame)) {
      continue;
    }
    const next = words[index + 1];
    const previous = words[index - 1];
    const searchFrom = previous ? frameAt(previous.endMs, windowStartMs, rms.length) : startFrame;
    const searchTo = next
      ? frameAt(next.startMs + 160, windowStartMs, rms.length)
      : Math.min(rms.length - 1, endFrame + 25);
    let onset = -1;
    for (let frame = searchFrom; frame <= searchTo; frame += 1) {
      if ((rms[frame] ?? 0) >= threshold) {
        onset = frame;
        break;
      }
    }
    if (onset < 0) {
      continue;
    }
    const startMs = windowStartMs + onset * ALIGNER_FRAME_MS;
    let endMs = startMs + Math.max(40, word.endMs - word.startMs);
    if (next && endMs > next.startMs) {
      const steal = endMs - next.startMs;
      if (next.endMs - next.startMs - steal >= 40) {
        next.startMs += steal;
        endMs = next.startMs;
      } else {
        endMs = Math.max(startMs + 20, next.startMs);
      }
    }
    if (endMs <= startMs) {
      continue;
    }
    word.startMs = startMs;
    word.endMs = endMs;
  }
}

/**
 * Bilinen kelime dizisini pencerenin dalgasına zorla hizalar.
 * Uzun sessizlikler cümle sınırına oturur. Ada içindeki kenar, spektral akı ve enerjidir.
 */
export function alignWordsByAcoustics(
  words: readonly string[],
  samples: Int16Array,
  sampleRate: number,
  windowStartMs: number,
  windowEndMs: number,
): AlignedWord[] {
  if (words.length === 0) {
    return [];
  }
  if (words.length === 1) {
    return alignPhonesInWindow(words, samples, sampleRate, windowStartMs, windowEndMs);
  }
  const startSample = Math.max(0, Math.min(samples.length, Math.round((windowStartMs / 1000) * sampleRate)));
  const endSample = Math.max(startSample, Math.min(samples.length, Math.round((windowEndMs / 1000) * sampleRate)));
  const envelope = pcmEnvelope(samples.subarray(startSample, endSample), sampleRate);
  const silences = detectSilences(envelope, JUNIOR_SYNC_SILENCE).map(
    (silence) => ({
      startMs: windowStartMs + silence.startMs,
      endMs: windowStartMs + silence.endMs,
    }),
  );
  const islands = speechIslands(words, windowStartMs, windowEndMs, silences);
  const aligned: AlignedWord[] = [];
  for (const island of islands) {
    if (island.to <= island.from || island.endMs - island.startMs < ALIGNER_FRAME_MS) {
      continue;
    }
    const piece = alignPhonesInWindow(
      words.slice(island.from, island.to),
      samples,
      sampleRate,
      island.startMs,
      island.endMs,
    );
    const tail = piece[piece.length - 1];
    if (tail && island.endMs - tail.endMs > 40 && island.endMs - tail.endMs <= 900) {
      tail.endMs = island.endMs;
    }
    for (let index = 0; index < piece.length; index += 1) {
      const word = piece[index]!;
      const next = piece[index + 1];
      if (word.endMs - word.startMs >= 40 || !next) {
        continue;
      }
      const room = Math.min(40, next.endMs - word.startMs - 40);
      if (room > word.endMs - word.startMs) {
        word.endMs = word.startMs + room;
        next.startMs = word.endMs;
      }
    }
    aligned.push(...piece);
  }
  if (aligned.length !== words.length) {
    throw new Error("Akustik hizalama adalara bölünemedi.");
  }
  snapSilentWords(
    aligned,
    envelope,
    envelopeThreshold(envelope, JUNIOR_SYNC_SILENCE.thresholdRatio, JUNIOR_SYNC_SILENCE.peak === true),
    windowStartMs,
  );
  return aligned;
}


