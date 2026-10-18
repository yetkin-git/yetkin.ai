/**
 * Kelime saatini sesin kendisinden çıkarır.
 *
 * Yöntem sessizlik çapalı hizalamadır: PCM enerji zarfındaki sessizlikler cümle ve virgül
 * sınırlarına dinamik programlamayla eşlenir. Kelimeler yalnız iki sessizlik arasındaki
 * konuşma adası içinde, sayıları Türkçe okunuşuyla sayan hece ağırlığına göre dağılır.
 * Fonem düzeyinde ASR değildir; hata, tek bir konuşma adasının içiyle sınırlıdır.
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

/** «24» → «yirmi dört». Hece sayımı içindir; yazım kuralı değildir. */
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

/** Kelimenin ardından gelen kısa duraklama payı, hece biriminde. */
function trailingPauseWeight(word: string): number {
  if (/[.!?…]["»)]*$/u.test(word)) {
    return 1.2;
  }
  if (/[,;:]["»)]*$/u.test(word)) {
    return 0.6;
  }
  return 0;
}

/** Okunuştaki ünlü sayısı. «10'a» 2, «24» 4, «18» 3 hecedir. */
export function spokenSyllableCount(word: string): number {
  const vowels = spokenFormOfWord(word)
    .toLocaleLowerCase("tr-TR")
    .match(/[aeıioöuüâîû]/gu);
  return Math.max(1, vowels?.length ?? 0);
}

export function spokenWordWeight(word: string): number {
  return spokenSyllableCount(word) + trailingPauseWeight(word);
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

type BoundaryKind = "sentence" | "clause" | "word";

/**
 * Fırın, ses modeline giden metne her cümle sonundan sonra `<break>` koyar
 * (`injectAcademyTtsBreathPauses`). Rakamdan sonraki nokta («ve 6.») kesme almaz; virgül sayılır.
 */
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

/** Sessizliğin bir kelime sınırına düşme bedeli. Uzun sessizlik noktalamasız sınıra zor oturur. */
function boundaryPenalty(kind: BoundaryKind, silenceMs: number): number {
  if (kind === "sentence") {
    return 0;
  }
  if (kind === "clause") {
    return 0.3 + silenceMs / 1200;
  }
  return 2 + silenceMs / 200;
}

/** `<break>` alan cümle sonu neredeyse her zaman sessizliktir. Durmadan geçilen cümle sonu bedeli. */
const MISSED_SENTENCE_PAUSE = 6;
const MISSED_CLAUSE_PAUSE = 0.15;

/** Ada süresi ile hece beklentisinin oranı. İfade hızı ±%30 oynar; ölçek bağımsızdır. */
function islandCost(actualMs: number, expectedMs: number): number {
  const ratio = Math.log((actualMs + 60) / (expectedMs + 60));
  return (ratio * ratio) / (0.3 * 0.3);
}

/**
 * Bir sekansın kelimelerini `[windowStartMs, windowEndMs]` konuşma penceresine yerleştirir.
 * Pencere kenarına değen sessizlik, konuşmanın başlangıç ve bitişini kırpar.
 */
export function alignWordsToSpeechWindow(
  words: readonly string[],
  windowStartMs: number,
  windowEndMs: number,
  silences: readonly SpeechSilence[],
): AlignedWord[] {
  const n = words.length;
  if (n === 0) {
    return [];
  }
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

  const weights = words.map((word) => spokenWordWeight(word));
  const prefix = [0];
  for (const weight of weights) {
    prefix.push(prefix[prefix.length - 1]! + weight);
  }
  const totalWeight = prefix[n]!;
  const speechMs = islands.reduce((sum, island) => sum + (island.endMs - island.startMs), 0);
  const msPerWeight = speechMs / Math.max(1e-6, totalWeight);
  const kinds = Array.from({ length: n + 1 }, (_, b) => boundaryKind(b > 0 ? words[b - 1] : undefined));
  const missedPrefix = [0];
  for (let b = 1; b <= n; b += 1) {
    const kind = kinds[b];
    const missed = b < n ? (kind === "sentence" ? MISSED_SENTENCE_PAUSE : kind === "clause" ? MISSED_CLAUSE_PAUSE : 0) : 0;
    missedPrefix.push(missedPrefix[b - 1]! + missed);
  }
  /** Ada `[from, to)` kelimelerini taşır; içinde kalan noktalama sınırları durmadan geçilmiştir. */
  const cost = (islandIndex: number, from: number, to: number): number => {
    const island = islands[islandIndex]!;
    const skipped = to - 1 > from ? missedPrefix[to - 1]! - missedPrefix[from]! : 0;
    return islandCost(island.endMs - island.startMs, (prefix[to]! - prefix[from]!) * msPerWeight) + skipped;
  };

  const k = inner.length;
  const breaks: number[] = [];
  if (k > 0) {
    const dp: Float64Array[] = [];
    const back: Int32Array[] = [];
    for (let j = 0; j < k; j += 1) {
      const row = new Float64Array(n + 1).fill(Number.POSITIVE_INFINITY);
      const from = new Int32Array(n + 1).fill(-1);
      const silenceMs = inner[j]!.endMs - inner[j]!.startMs;
      for (let b = 0; b <= n; b += 1) {
        const penalty = b === 0 || b === n ? 6 : boundaryPenalty(kinds[b]!, silenceMs);
        if (j === 0) {
          row[b] = cost(0, 0, b) + penalty;
          from[b] = 0;
          continue;
        }
        const previous = dp[j - 1]!;
        for (let a = 0; a <= b; a += 1) {
          const base = previous[a]!;
          if (!Number.isFinite(base)) {
            continue;
          }
          const value = base + cost(j, a, b) + penalty;
          if (value < row[b]!) {
            row[b] = value;
            from[b] = a;
          }
        }
      }
      dp.push(row);
      back.push(from);
    }
    let best = Number.POSITIVE_INFINITY;
    let bestB = 0;
    const last = dp[k - 1]!;
    for (let b = 0; b <= n; b += 1) {
      const value = (last[b] ?? Number.POSITIVE_INFINITY) + cost(k, b, n);
      if (value < best) {
        best = value;
        bestB = b;
      }
    }
    const chosen = new Array<number>(k);
    let b = bestB;
    for (let j = k - 1; j >= 0; j -= 1) {
      chosen[j] = b;
      b = back[j]![b]!;
    }
    breaks.push(...chosen);
  }

  const bounds = [0, ...breaks, n];
  const aligned: AlignedWord[] = new Array(n);
  for (let islandIndex = 0; islandIndex < islands.length; islandIndex += 1) {
    const from = bounds[islandIndex]!;
    const to = bounds[islandIndex + 1]!;
    if (to <= from) {
      continue;
    }
    const island = islands[islandIndex]!;
    const span = island.endMs - island.startMs;
    const islandWeight = prefix[to]! - prefix[from]!;
    for (let index = from; index < to; index += 1) {
      const startRatio = (prefix[index]! - prefix[from]!) / islandWeight;
      const endRatio = (prefix[index + 1]! - prefix[from]!) / islandWeight;
      aligned[index] = {
        word: words[index]!,
        startMs: Math.round(island.startMs + startRatio * span),
        endMs: Math.round(island.startMs + endRatio * span),
      };
    }
  }
  return aligned.map((word) => (word.endMs > word.startMs ? word : { ...word, endMs: word.startMs + 40 }));
}
