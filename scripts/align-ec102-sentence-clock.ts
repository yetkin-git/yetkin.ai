/**
 * EC-102 Ders 4, 5 veya 6 — nefes dilimini cümle saatine kilitler.
 * Varsayılan `02_ecommerce_ai-4`. `--key=` yalnız verilen dersi yazar.
 * WAV üzerindeki −32 dB sessizlik, fırın parçasının kendi penceresinde cümle
 * sınırına yapışır. Başka dersin dosyasına yazmaz.
 *
 *   npx tsx scripts/align-ec102-sentence-clock.ts --probe
 *   npx tsx scripts/align-ec102-sentence-clock.ts
 *   npx tsx scripts/align-ec102-sentence-clock.ts --key=02_ecommerce_ai-5 --probe
 *   npx tsx scripts/align-ec102-sentence-clock.ts --key=02_ecommerce_ai-5
 *   npx tsx scripts/align-ec102-sentence-clock.ts --key=02_ecommerce_ai-6 --probe
 *   npx tsx scripts/align-ec102-sentence-clock.ts --key=02_ecommerce_ai-6
 */
import "@/lib/academy/lesson-json-disk";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { academyBakeChunkGap } from "@/lib/academy/human-rhythm";
import { academyLessonCueParagraphPlan, loadAcademyLessonCues } from "@/lib/academy/lesson-cues";
import {
  sealEcommerceCueClock,
  type AcademySealedAudioPiece,
  type AcademySealedAudioTimings,
} from "@/lib/academy/lesson-audio-timings";
import { academyLessonAudioDiskPath } from "@/lib/academy/media-release-seal";
import { academyMediaSealedLessonKeys } from "@/lib/academy/pilot-sku";
import { loadAcademySpokenScriptMarkdownParagraphs } from "@/lib/academy/spoken-scripts";
import { applyAcademySpokenPhoneticsToDisplay } from "@/lib/academy/spoken-scripts/phonetics";
import { expandAcademyTtsSkipPreventer } from "@/lib/academy/spoken-scripts/skip-preventer";
import {
  academyLessonRequestTargetForCourse,
  packAcademyTtsLessonRequests,
  splitAcademyTtsBreathChunks,
} from "@/lib/academy/tts-breath-chunks";
import { pcmWavDurationSec } from "@/lib/kernel/ai/pcm-wav";

const require = createRequire(import.meta.url);
const ffmpegPath = require("ffmpeg-static") as string | null;

function lessonKeyFromArgv(): "02_ecommerce_ai-4" | "02_ecommerce_ai-5" | "02_ecommerce_ai-6" {
  const flag = process.argv.find((arg) => arg.startsWith("--key="));
  const key = flag ? flag.slice("--key=".length) : "02_ecommerce_ai-4";
  if (key !== "02_ecommerce_ai-4" && key !== "02_ecommerce_ai-5" && key !== "02_ecommerce_ai-6") {
    throw new Error(`Bu saat kilidi yalnız EC-102 ders 4, 5 veya 6 içindir: ${key}`);
  }
  return key;
}

function welcomePrefixForLesson(key: ReturnType<typeof lessonKeyFromArgv>): string {
  if (key === "02_ecommerce_ai-5") {
    return "Çayın yanındaysan";
  }
  if (key === "02_ecommerce_ai-6") {
    return "Bugün bu modülün son dersindeyiz";
  }
  return "Şimdi bugün kasaya";
}

const LESSON_KEY = lessonKeyFromArgv();
const COURSE_SLUG = "02_ecommerce_ai";
const ROOT = process.cwd();
const SENTENCE_BOUNDARY = /(?<=(?<!\d)\.|[!?…])\s+/u;

type Silence = { start: number; end: number };

type SentenceRow = {
  cueId: string;
  cueParagraphIndex: number;
  text: string;
};

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function normalize(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

function splitSentences(text: string): string[] {
  return normalize(text).split(SENTENCE_BOUNDARY).map((part) => part.trim()).filter((part) => part.length > 0);
}

function sentenceRows(): SentenceRow[] {
  const cues = loadAcademyLessonCues(LESSON_KEY);
  const spoken = loadAcademySpokenScriptMarkdownParagraphs(LESSON_KEY);
  const rows: SentenceRow[] = [];
  let cursor = 0;
  for (const cue of cues) {
    const paragraphs = cue.paragraphs ?? [];
    for (let cueParagraphIndex = 0; cueParagraphIndex < paragraphs.length; cueParagraphIndex += 1) {
      const paragraph = spoken[cursor];
      cursor += 1;
      if (!paragraph) {
        throw new Error(`Konuşma paragrafı eksik: ${cue.id} #${cueParagraphIndex}`);
      }
      for (const text of splitSentences(paragraph)) {
        rows.push({ cueId: cue.id, cueParagraphIndex, text });
      }
    }
  }
  if (cursor !== spoken.length) {
    throw new Error(`Paragraf sayısı uyuşmadı: cue=${cursor} spoken=${spoken.length}`);
  }
  return rows;
}

function probePhonetics(): void {
  const spoken = loadAcademySpokenScriptMarkdownParagraphs(LESSON_KEY);
  const blob = spoken.join("\n");
  const opening = splitSentences(spoken[0] ?? "")[0] ?? "";
  const display = applyAcademySpokenPhoneticsToDisplay(blob);
  const rows: Array<[string, number]> = [
    ["Pe te te A Ve Me", blob.match(/Pe te te A Ve Me/gu)?.length ?? 0],
    ["En on bir", blob.match(/En on bir/gu)?.length ?? 0],
    ["Çiçek sepeti", blob.match(/Çiçek sepeti/gu)?.length ?? 0],
    ["Trend yol", blob.match(/Trend yol/gu)?.length ?? 0],
    ["Hepsi burada", blob.match(/Hepsi burada/gu)?.length ?? 0],
    ["Ama zon", blob.match(/Ama zon/gu)?.length ?? 0],
    ["Listin", blob.match(/Listin/gu)?.length ?? 0],
    ["Promt", blob.match(/Promt/gu)?.length ?? 0],
    ["Arama Motoru Optimizasyonu (SEO)", blob.match(/Arama Motoru Optimizasyonu \(SEO\)/gu)?.length ?? 0],
    ["PttAVM (seste olmamalı)", blob.match(/PttAVM/gu)?.length ?? 0],
    ["N11 (seste olmamalı)", blob.match(/\bN11\b/gu)?.length ?? 0],
    ["Es i o (seste olmamalı)", blob.match(/Es i o/gu)?.length ?? 0],
    ["Piti avm (seste olmamalı)", blob.match(/Piti avm/gu)?.length ?? 0],
    ["Listingg", display.match(/Listingg/gu)?.length ?? 0],
    ["Promptt", display.match(/Promptt/gu)?.length ?? 0],
  ];
  process.stdout.write(`açılış: ${opening}\n`);
  process.stdout.write(`cümle: ${sentenceRows().length}\n`);
  for (const [label, count] of rows) {
    process.stdout.write(`  ${label}: ${count}\n`);
  }
  process.stdout.write(`ekran PttAVM: ${display.match(/PttAVM/gu)?.length ?? 0}\n`);
  process.stdout.write(`ekran N11: ${display.match(/\bN11\b/gu)?.length ?? 0}\n`);
  if (opening !== "Merhaba, ben Kaan.") {
    throw new Error(`Açılış kilitli değil: ${opening}`);
  }
  if ((blob.match(/Pe te te A Ve Me/gu)?.length ?? 0) < 1) {
    throw new Error("PttAVM fonetiği TTS metnine inmemiş.");
  }
  if ((blob.match(/En on bir/gu)?.length ?? 0) < 1) {
    throw new Error("N11 fonetiği TTS metnine inmemiş.");
  }
  if (/PttAVM|Es i o|Piti avm|\bN11\b/u.test(blob)) {
    throw new Error("TTS metninde ekran markası veya eski harf kodu duruyor.");
  }
}

function detectSilences(wavPath: string, noiseDb: number, minSec: number): Silence[] {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static ikili yok.");
  }
  const result = spawnSync(
    ffmpegPath,
    [
      "-hide_banner",
      "-i",
      wavPath,
      "-af",
      `silencedetect=noise=${noiseDb}dB:d=${minSec}`,
      "-f",
      "null",
      "-",
    ],
    { encoding: "utf8" },
  );
  const log = `${result.stderr ?? ""}\n${result.stdout ?? ""}`;
  const silences: Silence[] = [];
  let pendingStart: number | null = null;
  for (const line of log.split(/\r?\n/u)) {
    const start = line.match(/silence_start:\s*(-?\d+(?:\.\d+)?)/u);
    if (start) {
      pendingStart = Number(start[1]);
      continue;
    }
    const end = line.match(/silence_end:\s*(-?\d+(?:\.\d+)?)/u);
    if (end && pendingStart != null) {
      const endSec = Number(end[1]);
      if (endSec > pendingStart) {
        silences.push({ start: pendingStart, end: endSec });
      }
      pendingStart = null;
    }
  }
  return silences;
}

type SpeechAtom = { start: number; end: number };

function speechAtomsInWindow(winStart: number, winEnd: number, silences: Silence[]): SpeechAtom[] {
  const cuts = [winStart, winEnd];
  for (const silence of silences) {
    if (silence.end <= winStart || silence.start >= winEnd) {
      continue;
    }
    cuts.push(Math.max(silence.start, winStart), Math.min(silence.end, winEnd));
  }
  cuts.sort((left, right) => left - right);
  const atoms: SpeechAtom[] = [];
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const start = cuts[index]!;
    const end = cuts[index + 1]!;
    if (end - start < 0.04) {
      continue;
    }
    const silent = silences.some(
      (silence) => start >= silence.start - 0.02 && end <= silence.end + 0.02,
    );
    if (!silent) {
      atoms.push({ start, end });
    }
  }
  return atoms;
}

function alignWindow(
  winStart: number,
  winEnd: number,
  sentences: string[],
  silences: Silence[],
): { start: number; end: number }[] {
  if (sentences.length === 1) {
    return [{ start: round3(winStart), end: round3(winEnd) }];
  }
  const atoms = speechAtomsInWindow(winStart, winEnd, silences);
  if (atoms.length < sentences.length) {
    throw new Error(
      `Konuşma atomu cümleden az: atom=${atoms.length} cümle=${sentences.length} pencere=${winStart.toFixed(3)}–${winEnd.toFixed(3)}`,
    );
  }
  const weights = sentences.map((sentence) => Math.max(1, sentence.length));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const prefix = [0];
  for (const atom of atoms) {
    prefix.push(prefix[prefix.length - 1]! + (atom.end - atom.start));
  }
  const totalSpeech = prefix[prefix.length - 1]!;
  const expected = weights.map((weight) => (totalSpeech * weight) / totalWeight);
  const sentenceCount = sentences.length;
  const atomCount = atoms.length;
  const INF = 1e15;
  const dp: number[][] = Array.from({ length: sentenceCount + 1 }, () => Array(atomCount + 1).fill(INF));
  const prev: number[][] = Array.from({ length: sentenceCount + 1 }, () => Array(atomCount + 1).fill(-1));
  dp[0]![0] = 0;
  for (let sentenceIndex = 1; sentenceIndex <= sentenceCount; sentenceIndex += 1) {
    for (let atomEnd = sentenceIndex; atomEnd <= atomCount; atomEnd += 1) {
      const remainingSentences = sentenceCount - sentenceIndex;
      const remainingAtoms = atomCount - atomEnd;
      if (remainingAtoms < remainingSentences) {
        continue;
      }
      let best = INF;
      let bestStart = -1;
      for (let atomStart = sentenceIndex - 1; atomStart < atomEnd; atomStart += 1) {
        const base = dp[sentenceIndex - 1]![atomStart]!;
        if (base >= INF / 2) {
          continue;
        }
        const duration = prefix[atomEnd]! - prefix[atomStart]!;
        const target = expected[sentenceIndex - 1]!;
        let cost = base + (duration - target) ** 2;
        if (duration < 0.25 && weights[sentenceIndex - 1]! > 12) {
          cost += 1_000_000;
        }
        if (cost < best) {
          best = cost;
          bestStart = atomStart;
        }
      }
      dp[sentenceIndex]![atomEnd] = best;
      prev[sentenceIndex]![atomEnd] = bestStart;
    }
  }
  if (dp[sentenceCount]![atomCount]! >= INF / 2) {
    throw new Error(`Cümle atomlara oturmadı: pencere=${winStart.toFixed(3)}–${winEnd.toFixed(3)}`);
  }
  const spans: Array<{ start: number; end: number }> = [];
  let atomEnd = atomCount;
  for (let sentenceIndex = sentenceCount; sentenceIndex >= 1; sentenceIndex -= 1) {
    const atomStart = prev[sentenceIndex]![atomEnd]!;
    spans.push({ start: atoms[atomStart]!.start, end: atoms[atomEnd - 1]!.end });
    atomEnd = atomStart;
  }
  spans.reverse();
  spans[0]!.start = winStart;
  spans[spans.length - 1]!.end = winEnd;
  return spans.map((span) => ({ start: round3(span.start), end: round3(span.end) }));
}

type BreathWindow = { text: string; start: number; end: number };

function breathWindows(durationSec: number): BreathWindow[] {
  const plan = academyLessonCueParagraphPlan(LESSON_KEY);
  const spoken = loadAcademySpokenScriptMarkdownParagraphs(LESSON_KEY);
  if (plan.length !== spoken.length) {
    throw new Error(`Paragraf planı uyuşmadı: plan=${plan.length} spoken=${spoken.length}`);
  }
  const atoms: Array<{ text: string; cueId: string; cueParagraphIndex: number }> = [];
  for (let index = 0; index < plan.length; index += 1) {
    const planned = plan[index]!;
    for (const text of splitAcademyTtsBreathChunks(spoken[index]!)) {
      atoms.push({
        text,
        cueId: planned.cueId,
        cueParagraphIndex: planned.cueParagraphIndex,
      });
    }
  }
  const target = academyLessonRequestTargetForCourse(academyMediaSealedLessonKeys(COURSE_SLUG).length);
  const requests = packAcademyTtsLessonRequests(
    atoms.map((atom) => atom.text),
    target,
  );
  const cacheDir = join(
    ROOT,
    "media-bake",
    "academy",
    "piece-cache",
    COURSE_SLUG,
    LESSON_KEY,
  );
  const newestByIndex = new Map<string, string>();
  for (const name of readdirSync(cacheDir)) {
    const match = /^(\d{2})-.+\.wav$/u.exec(name);
    if (!match) {
      continue;
    }
    const index = match[1]!;
    const previous = newestByIndex.get(index);
    if (!previous) {
      newestByIndex.set(index, name);
      continue;
    }
    const previousStamp = statSync(join(cacheDir, previous)).mtimeMs;
    const nextStamp = statSync(join(cacheDir, name)).mtimeMs;
    if (nextStamp >= previousStamp) {
      newestByIndex.set(index, name);
    }
  }
  const files = [...newestByIndex.keys()].sort().map((index) => newestByIndex.get(index)!);
  if (files.length !== requests.length) {
    throw new Error(`Parça önbelleği ${files.length}, istek ${requests.length}`);
  }
  let cursor = 0;
  const windows: BreathWindow[] = [];
  for (let index = 0; index < requests.length; index += 1) {
    const request = requests[index]!;
    const first = atoms[request.atomIndexes[0]!]!;
    if (index > 0) {
      const previous = windows[index - 1]!;
      const previousFirst = atoms[requests[index - 1]!.atomIndexes[0]!]!;
      const gap = academyBakeChunkGap({
        prevCueId: previousFirst.cueId,
        nextCueId: first.cueId,
        prevParagraphIndex: previousFirst.cueParagraphIndex,
        nextParagraphIndex: first.cueParagraphIndex,
        breathPauseSec: 0.4,
      });
      cursor += gap.pauseSec;
      void previous;
    }
    const wav = readFileSync(join(cacheDir, files[index]!));
    const pieceSec = pcmWavDurationSec(wav);
    windows.push({
      text: expandAcademyTtsSkipPreventer(request.text),
      start: cursor,
      end: cursor + pieceSec,
    });
    cursor += pieceSec;
  }
  const scale = cursor > 0 ? durationSec / cursor : 1;
  return windows.map((window, index) => ({
    text: window.text,
    start: window.start * scale,
    end: index === windows.length - 1 ? durationSec : window.end * scale,
  }));
}

function speechAtomCount(durationSec: number, silences: Silence[]): number {
  const cuts = [0, ...silences.flatMap((silence) => [silence.start, silence.end]), durationSec]
    .filter((value) => value >= 0 && value <= durationSec + 0.001)
    .sort((left, right) => left - right);
  let atoms = 0;
  for (let index = 0; index < cuts.length - 1; index += 1) {
    const start = cuts[index]!;
    const end = cuts[index + 1]!;
    const silent = silences.some((silence) => start >= silence.start - 0.001 && end <= silence.end + 0.001);
    if (!silent && end - start >= 0.05) {
      atoms += 1;
    }
  }
  return atoms;
}

function main(): void {
  if (process.argv.includes("--probe")) {
    probePhonetics();
    return;
  }
  probePhonetics();
  const wavPath = academyLessonAudioDiskPath(COURSE_SLUG, LESSON_KEY, ROOT);
  const timingsPath = join(ROOT, "lib", "academy", "lesson-audio-timings", `${LESSON_KEY}.json`);
  const cuePath = join(ROOT, "lib", "academy", "lesson-cues", `${LESSON_KEY}.json`);
  if (!existsSync(wavPath)) {
    throw new Error(`WAV yok: ${wavPath}`);
  }
  const timings = JSON.parse(readFileSync(timingsPath, "utf8")) as AcademySealedAudioTimings;
  if (timings.lessonKey !== LESSON_KEY) {
    throw new Error(`Saat dosyası başka ders: ${timings.lessonKey}`);
  }
  const rows = sentenceRows();
  const durationSec = round3(pcmWavDurationSec(readFileSync(wavPath)));
  const breaths = breathWindows(durationSec);
  const silences28 = detectSilences(wavPath, -32, 0.28);
  const silences = detectSilences(wavPath, -32, 0.08);

  const pieces: AcademySealedAudioPiece[] = [];
  const chunkIndexByParagraph = new Map<string, number>();
  let cursor = 0;
  for (const breath of breaths) {
    const local = splitSentences(breath.text);
    const slice = rows.slice(cursor, cursor + local.length);
    const expected = normalize(slice.map((row) => row.text).join(" "));
    const actual = normalize(breath.text);
    if (slice.length !== local.length || expected !== actual) {
      throw new Error(
        `Nefes dilimi cümlelerle örtüşmedi yerel=${local.length} beklenen=${slice.length}`,
      );
    }
    const times = alignWindow(breath.start, breath.end, local, silences);
    for (let index = 0; index < slice.length; index += 1) {
      const row = slice[index]!;
      const key = `${row.cueId}:${row.cueParagraphIndex}`;
      const chunkIndex = chunkIndexByParagraph.get(key) ?? 0;
      chunkIndexByParagraph.set(key, chunkIndex + 1);
      const slot = times[index]!;
      if (slot.end - slot.start < 0.2 && row.text.length > 12) {
        throw new Error(`Cümle süresi çöktü: ${slot.start}–${slot.end} ${row.text}`);
      }
      pieces.push({
        index: pieces.length,
        cueId: row.cueId,
        cueParagraphIndex: row.cueParagraphIndex,
        chunkIndex,
        start: slot.start,
        end: slot.end,
        text: row.text,
      });
    }
    cursor += local.length;
  }
  if (cursor !== rows.length) {
    throw new Error(`Cümle artığı: kullanılan ${cursor} / ${rows.length}`);
  }

  const locked = pieces;
  for (let index = 1; index < locked.length; index += 1) {
    const previous = locked[index - 1]!;
    const current = locked[index]!;
    if (current.start < previous.end) {
      throw new Error(`Üst üste binme: #${index - 1} ${previous.end} > #${index} ${current.start}`);
    }
    if (current.end < current.start) {
      throw new Error(`Ters saat: #${index}`);
    }
  }
  if (locked[0]?.text !== "Merhaba, ben Kaan.") {
    throw new Error(`İlk parça açılış değil: ${locked[0]?.text ?? ""}`);
  }
  const welcome = locked[1];
  const welcomeSec = welcome ? welcome.end - welcome.start : 0;
  const welcomePrefix = welcomePrefixForLesson(LESSON_KEY);
  if (!welcome || !welcome.text.startsWith(welcomePrefix) || welcomeSec < 1 || welcomeSec > 8) {
    throw new Error(`Açılış cümlesi kaydı: ${welcome?.start}–${welcome?.end} ${welcome?.text ?? ""}`);
  }

  const nextTimings: AcademySealedAudioTimings = {
    lessonKey: LESSON_KEY,
    pauseSec: timings.pauseSec,
    durationSec,
    cacheV: Math.max(1, Math.round(durationSec * 1000)),
    pieces: locked,
  };
  const cues = JSON.parse(readFileSync(cuePath, "utf8")) as Array<{
    id: string;
    start: number;
    end: number;
    paragraphs?: string[];
  }>;
  const sealedCues = sealEcommerceCueClock(cues, nextTimings);
  const lastCue = sealedCues.at(-1);
  if (!lastCue || Math.abs(lastCue.end - durationSec) > 0.001) {
    throw new Error(`Son cue ses süresine kilitli değil: ${lastCue?.end} / ${durationSec}`);
  }
  for (let index = 1; index < sealedCues.length; index += 1) {
    if (sealedCues[index]!.start < sealedCues[index - 1]!.end - 0.001) {
      throw new Error(`Cue iç içe: ${sealedCues[index - 1]!.id} > ${sealedCues[index]!.id}`);
    }
  }

  let tightGaps = 0;
  for (let index = 1; index < locked.length; index += 1) {
    if (locked[index]!.start - locked[index - 1]!.end < 0.12) {
      tightGaps += 1;
    }
  }

  writeFileSync(timingsPath, `${JSON.stringify(nextTimings, null, 2)}\n`, "utf8");
  writeFileSync(cuePath, `${JSON.stringify(sealedCues, null, 2)}\n`, "utf8");

  const atoms = speechAtomCount(durationSec, silences28);
  process.stdout.write(
    `saat kilitlendi cümle=${locked.length} sessizlik28=${silences28.length} atom=${atoms} darBoşluk=${tightGaps} süre=${durationSec}\n`,
  );
  for (const cue of sealedCues) {
    const count = locked.filter((piece) => piece.cueId === cue.id).length;
    process.stdout.write(`  ${cue.id} ${cue.start}–${cue.end} cümle=${count}\n`);
  }
  const outliers = locked.filter((piece) => {
    const seconds = piece.end - piece.start;
    const chars = piece.text.length;
    const rate = chars / Math.max(seconds, 0.001);
    return seconds < 0.45 || rate < 6 || rate > 28;
  });
  for (const piece of outliers) {
    const seconds = piece.end - piece.start;
    process.stdout.write(
      `  sapma ${piece.start.toFixed(3)}–${piece.end.toFixed(3)} ${seconds.toFixed(2)}s ${(piece.text.length / seconds).toFixed(1)}c/s ${piece.text}\n`,
    );
  }
  process.stdout.write(`açılış ${locked[0]!.start}–${locked[0]!.end} ${locked[0]!.text}\n`);
  const farewell = locked.at(-1)!;
  process.stdout.write(`veda ${farewell.start}–${farewell.end} ${farewell.text}\n`);
}

main();
