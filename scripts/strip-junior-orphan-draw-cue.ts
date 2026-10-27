/**
 * Özet tahtası dersinde anlatımdan çıkan çizim cümlesini kilitli MP3 ve cue'dan keser.
 * Kalan kelimeler bugünkü `listenText` ile aynı değilse ders atlanır. Ses, başarıdan önce yayın yoluna yazılmaz.
 *
 *   npx tsx scripts/strip-junior-orphan-draw-cue.ts --lesson=jr_06_fen-1
 *   npx tsx scripts/strip-junior-orphan-draw-cue.ts
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { juniorScenarioIfPresent } from "@/lib/junior/content-source";
import { juniorDrawCue } from "@/lib/junior/drawing-cue";
import { juniorLessonFromScenario } from "@/lib/junior/scenario";
import type { AuthoredCueSpec } from "@/lib/junior/pilot-engine/mat-1.choreography";
import { applyAcousticPauses, fitListenCuesToAcoustics } from "@/lib/junior/pilot-engine/listen-cue-fit";
import { buildListenTimelineSeed } from "@/lib/junior/pilot-engine/listen-timeline-seed";
import { realignPilotTimelineWords } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import {
  juniorSyncFailure,
  measureSentenceEndDrift,
  measureWordAcousticFit,
  wordAcousticFailure,
} from "@/lib/junior/pilot-engine/sync-gate";
import { wrapPcmAsWav } from "@/lib/kernel/ai/pcm-wav";
import { decodeAudioToMonoPcm, JUNIOR_ANALYSIS_SAMPLE_RATE } from "./junior-audio-pcm";
import { transcodeAcademyWavToMp3 } from "./transcode-academy-lesson-audio";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");
const AUDIO_DIR = join(ROOT, "public", "media", "junior", "audio");
const WORK_DIR = join(ROOT, "media-bake", "junior", "draw-cue-work");
const BAKE_RATE = 48_000;
const DRAW_BARE = "hadi şimdi ekrandaki çizime birlikte bakalım";

function lessonArg(argv: readonly string[]): string | null {
  const value = argv.find((part) => part.startsWith("--lesson="))?.slice("--lesson=".length).trim();
  return value || null;
}

function spokenWords(text: string): string[] {
  return text
    .replace(/\{@[a-zA-Z0-9_]+\}/gu, " ")
    .toLocaleLowerCase("tr-TR")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 0);
}

function isDrawCue(text: string): boolean {
  const bare = text
    .trim()
    .replace(/[!?.…]+$/u, "")
    .toLocaleLowerCase("tr-TR");
  return bare === DRAW_BARE;
}

function pcmToBuffer(samples: Int16Array): Buffer {
  const buffer = Buffer.allocUnsafe(samples.length * 2);
  for (let index = 0; index < samples.length; index += 1) {
    buffer.writeInt16LE(samples[index] ?? 0, index * 2);
  }
  return buffer;
}

function fadeEdge(samples: Int16Array, from: number, to: number, fadeIn: boolean): void {
  const span = Math.max(1, to - from);
  for (let index = from; index < to; index += 1) {
    const gain = fadeIn ? (index - from) / span : (to - index) / span;
    samples[index] = Math.round((samples[index] ?? 0) * gain);
  }
}

function cutSamples(samples: Int16Array, startMs: number, endMs: number, sampleRate: number): Int16Array {
  const start = Math.max(0, Math.min(samples.length, Math.round((startMs / 1000) * sampleRate)));
  const end = Math.max(start, Math.min(samples.length, Math.round((endMs / 1000) * sampleRate)));
  const left = Int16Array.from(samples.subarray(0, start));
  const right = Int16Array.from(samples.subarray(end));
  const fade = Math.min(Math.round(sampleRate * 0.012), left.length, right.length);
  if (fade > 0) {
    fadeEdge(left, left.length - fade, left.length, false);
    fadeEdge(right, 0, fade, true);
  }
  const joined = new Int16Array(left.length + right.length);
  joined.set(left, 0);
  joined.set(right, left.length);
  return joined;
}

function specsFrom(timeline: TimelineJSON): AuthoredCueSpec[] {
  return timeline.cues.map((cue) => ({
    id: cue.id,
    chapterId: cue.chapterId as AuthoredCueSpec["chapterId"],
    pauseAfterMs: cue.pauseAfterMs,
    markedText: cue.markedText ?? cue.text,
    keyframes: cue.keyframes.map((frame) => ({
      hook: frame.hook,
      offsetMs: Math.max(0, Math.round(frame.atMs - cue.startMs)),
      op: frame.op,
      params: frame.params as Record<string, unknown>,
    })),
  }));
}

function lessonKeys(filter: string | null): string[] {
  const keys = readdirSync(TIMELINE_DIR)
    .filter((name) => name.endsWith(".timeline.json"))
    .map((name) => name.slice(0, -".timeline.json".length))
    .sort();
  if (!filter) {
    return keys;
  }
  if (!keys.includes(filter)) {
    throw new Error(`${filter} timeline yok.`);
  }
  return [filter];
}

function stripLesson(lessonKey: string): "wrote" | "skipped" {
  if (juniorDrawCue(lessonKey)) {
    process.stdout.write(`${lessonKey} çizim cümlesi anlatımda duruyor. Kesilmedi.\n`);
    return "skipped";
  }
  const timelinePath = join(TIMELINE_DIR, `${lessonKey}.timeline.json`);
  const audioPath = join(AUDIO_DIR, `${lessonKey}.mp3`);
  const timeline = timelineJsonSchema.parse(JSON.parse(readFileSync(timelinePath, "utf8")) as unknown);
  const drawIndexes = timeline.cues.flatMap((cue, index) => (isDrawCue(cue.text) ? [index] : []));
  const phraseHits = timeline.cues.filter((cue) =>
    cue.text.toLocaleLowerCase("tr-TR").includes("ekrandaki çizime birlikte bakalım"),
  );
  if (phraseHits.length > 0 && drawIndexes.length === 0) {
    throw new Error(`${lessonKey} çizim cümlesi ayrı cue değil.`);
  }
  if (drawIndexes.length === 0) {
    process.stdout.write(`${lessonKey} çizim cue'su yok. Kesilmedi.\n`);
    return "skipped";
  }
  if (drawIndexes.length !== 1) {
    throw new Error(`${lessonKey} çizim cue sayısı ${drawIndexes.length}. Tek cue beklenir.`);
  }
  const scenario = juniorScenarioIfPresent(lessonKey);
  if (!scenario) {
    throw new Error(`${lessonKey} senaryosu yok.`);
  }
  const listen = spokenWords(juniorLessonFromScenario(scenario).listenText);
  const kept = timeline.cues.filter((_, index) => index !== drawIndexes[0]);
  const keptWords = spokenWords(kept.map((cue) => cue.text).join(" "));
  if (keptWords.join("\u0000") !== listen.join("\u0000")) {
    process.stdout.write(
      `${lessonKey} kalan kelime anlatımla uyuşmuyor (${keptWords.length} / ${listen.length}). Kesilmedi.\n`,
    );
    return "skipped";
  }
  if (!existsSync(audioPath)) {
    throw new Error(`${lessonKey} MP3 yok.`);
  }
  const draw = timeline.cues[drawIndexes[0]!]!;
  const next = timeline.cues[drawIndexes[0]! + 1];
  const cutStart = draw.startMs;
  const cutEnd = next ? next.startMs : draw.endMs;
  if (cutEnd <= cutStart) {
    throw new Error(`${lessonKey} kesim aralığı boş.`);
  }
  mkdirSync(WORK_DIR, { recursive: true });
  const wavPath = join(WORK_DIR, `${lessonKey}.wav`);
  const mp3Path = join(WORK_DIR, `${lessonKey}.mp3`);
  const full = decodeAudioToMonoPcm(audioPath, BAKE_RATE);
  const cut = cutSamples(full, cutStart, cutEnd, BAKE_RATE);
  writeFileSync(wavPath, wrapPcmAsWav(pcmToBuffer(cut), BAKE_RATE, 1, 16));
  transcodeAcademyWavToMp3(wavPath, mp3Path);
  const analysis = decodeAudioToMonoPcm(mp3Path, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const withoutDraw: TimelineJSON = {
    ...timeline,
    cues: kept,
  };
  let aligned = applyAcousticPauses(
    realignPilotTimelineWords(withoutDraw, analysis, JUNIOR_ANALYSIS_SAMPLE_RATE, specsFrom(withoutDraw)),
  );
  let sentence = measureSentenceEndDrift(aligned, analysis, JUNIOR_ANALYSIS_SAMPLE_RATE);
  let words = measureWordAcousticFit(aligned, analysis, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const wordFailure = wordAcousticFailure(words);
  if (wordFailure) {
    unlinkSync(mp3Path);
    unlinkSync(wavPath);
    throw new Error(wordFailure);
  }
  if (juniorSyncFailure(sentence)) {
    const seed = buildListenTimelineSeed(scenario);
    const fitted = fitListenCuesToAcoustics(seed.timeline, analysis, JUNIOR_ANALYSIS_SAMPLE_RATE, seed.cues);
    aligned = fitted.timeline;
    sentence = measureSentenceEndDrift(aligned, analysis, JUNIOR_ANALYSIS_SAMPLE_RATE);
    words = measureWordAcousticFit(aligned, analysis, JUNIOR_ANALYSIS_SAMPLE_RATE);
    const sentenceFailure = juniorSyncFailure(sentence);
    const fittedWordFailure = wordAcousticFailure(words);
    if (sentenceFailure || fittedWordFailure) {
      unlinkSync(mp3Path);
      unlinkSync(wavPath);
      throw new Error(sentenceFailure ?? fittedWordFailure ?? `${lessonKey} kapı geçmedi.`);
    }
  }
  const sealed = timelineJsonSchema.parse({
    ...aligned,
    production: { status: "locked", readiness: "ready" },
  });
  writeFileSync(timelinePath, `${JSON.stringify(sealed, null, 2)}\n`, "utf8");
  copyFileSync(mp3Path, audioPath);
  unlinkSync(mp3Path);
  unlinkSync(wavPath);
  process.stdout.write(
    `${lessonKey} çizim cümlesi kesildi. süre=${sealed.audio.durationMs}ms cümle p90=${Math.round(sentence.p90Ms)}ms kelime=${words.words}\n`,
  );
  return "wrote";
}

function main(): void {
  const keys = lessonKeys(lessonArg(process.argv.slice(2)));
  let wrote = 0;
  let skipped = 0;
  const failures: string[] = [];
  for (const lessonKey of keys) {
    try {
      const result = stripLesson(lessonKey);
      if (result === "wrote") {
        wrote += 1;
      } else {
        skipped += 1;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${lessonKey}: ${message}`);
      process.stderr.write(`${lessonKey} BAŞARISIZ — ${message}\n`);
    }
  }
  process.stdout.write(`çizim kesimi bitti. yazılan=${wrote} atlanan=${skipped} başarısız=${failures.length}\n`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main();
