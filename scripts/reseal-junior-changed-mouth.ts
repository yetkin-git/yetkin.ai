/**
 * Yeni MP3 üzerine kelime saati yazar.
 * `jr_06_mat-10` bugünkü anlatım tohumudur.
 * `jr_06_mat-6` grafik kancalarını akustik saate kilitler.
 * Kapı geçmeden dosya yazılmaz.
 *
 *   npx tsx scripts/reseal-junior-changed-mouth.ts --lesson=jr_06_mat-10
 *   npx tsx scripts/reseal-junior-changed-mouth.ts --lesson=jr_06_mat-6
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { juniorScenarioIfPresent } from "@/lib/junior/content-source";
import { JR_06_MAT_27_TIMELINE } from "@/lib/junior/pilot-engine/mat-27.graph";
import { buildListenTimelineSeed } from "@/lib/junior/pilot-engine/listen-timeline-seed";
import { applyAcousticPauses, fitListenCuesToAcoustics } from "@/lib/junior/pilot-engine/listen-cue-fit";
import type { AuthoredCueSpec } from "@/lib/junior/pilot-engine/mat-1.choreography";
import { realignPilotTimelineWords } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import {
  juniorSyncFailure,
  measureSentenceEndDrift,
  measureWordAcousticFit,
  wordAcousticFailure,
} from "@/lib/junior/pilot-engine/sync-gate";
import { decodeAudioToMonoPcm, JUNIOR_ANALYSIS_SAMPLE_RATE } from "./junior-audio-pcm";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");

function lessonArg(argv: readonly string[]): string {
  const value = argv.find((part) => part.startsWith("--lesson="))?.slice("--lesson=".length).trim();
  if (!value) {
    throw new Error("Ders seçilmedi. --lesson=jr_06_mat-6 veya --lesson=jr_06_mat-10.");
  }
  return value;
}

function audioPath(lessonKey: string): string {
  const path = join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.mp3`);
  if (!existsSync(path)) {
    throw new Error(`${lessonKey} MP3 yok.`);
  }
  return path;
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

function assertGate(timeline: TimelineJSON, samples: Int16Array): TimelineJSON {
  const sentence = measureSentenceEndDrift(timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const words = measureWordAcousticFit(timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const sentenceFailure = juniorSyncFailure(sentence);
  const wordFailure = wordAcousticFailure(words);
  if (sentenceFailure || wordFailure) {
    throw new Error(sentenceFailure ?? wordFailure ?? "kapı geçmedi");
  }
  process.stdout.write(
    `${timeline.lessonKey} kapı geçti. süre=${timeline.audio.durationMs}ms cümle p90=${Math.round(sentence.p90Ms)}ms kelime=${words.words}\n`,
  );
  return timeline;
}

function seal(timeline: TimelineJSON): void {
  const sealed = timelineJsonSchema.parse({
    ...timeline,
    production: { status: "locked", readiness: "ready" },
  });
  mkdirSync(TIMELINE_DIR, { recursive: true });
  const path = join(TIMELINE_DIR, `${sealed.lessonKey}.timeline.json`);
  writeFileSync(path, `${JSON.stringify(sealed, null, 2)}\n`, "utf8");
  process.stdout.write(`akustik mühür yazıldı → ${path}\n`);
}

function resealListen(lessonKey: string): void {
  const scenario = juniorScenarioIfPresent(lessonKey);
  if (!scenario) {
    throw new Error(`${lessonKey} senaryosu yok.`);
  }
  const seed = buildListenTimelineSeed(scenario);
  const samples = decodeAudioToMonoPcm(audioPath(lessonKey), JUNIOR_ANALYSIS_SAMPLE_RATE);
  const fitted = fitListenCuesToAcoustics(seed.timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE, seed.cues);
  seal(assertGate(applyAcousticPauses(fitted.timeline), samples));
  if (fitted.demoted.length > 0) {
    process.stdout.write(
      `${lessonKey} cümle işareti düştü: ${fitted.demoted.map((row) => `${row.cueId} ${row.word}`).join(", ")}\n`,
    );
  }
}

function resealGraph(lessonKey: string): void {
  if (lessonKey !== "jr_06_mat-6" || JR_06_MAT_27_TIMELINE.lessonKey !== lessonKey) {
    throw new Error("Grafik mühür yalnız jr_06_mat-6 içindir.");
  }
  const samples = decodeAudioToMonoPcm(audioPath(lessonKey), JUNIOR_ANALYSIS_SAMPLE_RATE);
  const aligned = applyAcousticPauses(
    realignPilotTimelineWords(
      JR_06_MAT_27_TIMELINE,
      samples,
      JUNIOR_ANALYSIS_SAMPLE_RATE,
      specsFrom(JR_06_MAT_27_TIMELINE),
    ),
  );
  seal(assertGate(aligned, samples));
}

function main(): void {
  const lessonKey = lessonArg(process.argv.slice(2));
  if (lessonKey === "jr_06_mat-6") {
    resealGraph(lessonKey);
    return;
  }
  if (lessonKey === "jr_06_mat-10") {
    resealListen(lessonKey);
    return;
  }
  throw new Error(`${lessonKey} bu yazıcının dersi değil.`);
}

main();
