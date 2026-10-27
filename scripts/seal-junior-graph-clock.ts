/**
 * Grafik saat derslerini kilitli karaoke JSON'a taşır.
 * Kaynak, oynatıcının grafik tahtasıdır. Kelime saati duran MP3 üzerinde ölçülür.
 * Senkron kapısı geçmeyen ders yazılmaz. Ses dosyasına dokunulmaz.
 *
 *   npx tsx scripts/seal-junior-graph-clock.ts
 *   npx tsx scripts/seal-junior-graph-clock.ts --lesson=jr_06_fen-9
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import type { AuthoredCueSpec } from "@/lib/junior/pilot-engine/mat-1.choreography";
import { fitListenCuesToAcoustics } from "@/lib/junior/pilot-engine/listen-cue-fit";
import { getGraphTimelineFallback } from "@/lib/junior/pilot-engine/graph-timeline-fallback";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { juniorSyncFailure, measureSentenceEndDrift, measureWordAcousticFit, wordAcousticFailure } from "@/lib/junior/pilot-engine/sync-gate";
import { decodeAudioToMonoPcm, JUNIOR_ANALYSIS_SAMPLE_RATE } from "./junior-audio-pcm";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");

/** JSON dosyası olmayan grafik saat. `jr_06_mat-6` zaten kilitli JSON kullanır. */
const GRAPH_KEYS = [
  "jr_06_mat-3",
  "jr_06_mat-7",
  "jr_06_mat-8",
  "jr_06_mat-9",
  "jr_06_mat-14",
  "jr_06_mat-15",
  "jr_06_mat-16",
  "jr_06_mat-17",
  "jr_06_mat-18",
  "jr_06_mat-19",
  "jr_06_mat-20",
  "jr_06_mat-21",
  "jr_06_mat-22",
  "jr_06_fen-9",
  "jr_06_fen-10",
  "jr_06_fen-21",
  "jr_06_fen-37",
  "jr_06_fen-38",
] as const;

function lessonList(argv: readonly string[]): string[] {
  const explicit = argv
    .filter((part) => part.startsWith("--lesson="))
    .map((part) => part.slice("--lesson=".length).trim())
    .filter((key) => key.length > 0);
  if (explicit.length === 0) {
    return [...GRAPH_KEYS];
  }
  for (const key of explicit) {
    if (!(GRAPH_KEYS as readonly string[]).includes(key)) {
      throw new Error(`${key} grafik saat listesinde yok.`);
    }
  }
  return explicit;
}

function playerAudioPath(lessonKey: string): string {
  const path = join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.mp3`);
  if (!existsSync(path)) {
    throw new Error(`${lessonKey} ses dosyası yok.`);
  }
  return path;
}

function authoredCues(timeline: TimelineJSON): AuthoredCueSpec[] {
  return timeline.cues.map((cue) => {
    const chapterId = cue.chapterId;
    if (chapterId !== "ch-1" && chapterId !== "ch-2" && chapterId !== "ch-3" && chapterId !== "ch-4" && chapterId !== "ch-5") {
      throw new Error(`${timeline.lessonKey} ${cue.id} bölüm kimliği geçersiz.`);
    }
    return {
      id: cue.id,
      chapterId,
      pauseAfterMs: cue.pauseAfterMs,
      markedText: cue.markedText ?? cue.text,
      keyframes: cue.keyframes.map((frame) => ({
        hook: frame.hook,
        offsetMs: Math.max(0, Math.round(frame.atMs - cue.startMs)),
        op: frame.op,
        params: frame.params as Record<string, unknown>,
      })),
    };
  });
}

function writeSealed(timeline: TimelineJSON): string {
  const sealed = timelineJsonSchema.parse({
    ...timeline,
    production: { status: "locked", readiness: "ready" },
  });
  const ordered = {
    schemaVersion: sealed.schemaVersion,
    lessonKey: sealed.lessonKey,
    production: sealed.production,
    title: sealed.title,
    grade: sealed.grade,
    subject: sealed.subject,
    teacher: sealed.teacher,
    audio: sealed.audio,
    chapters: sealed.chapters,
    cues: sealed.cues,
  };
  const path = join(TIMELINE_DIR, `${sealed.lessonKey}.timeline.json`);
  writeFileSync(path, `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
  return path;
}

function sealLesson(lessonKey: string): void {
  const timeline = getGraphTimelineFallback(lessonKey);
  if (!timeline || timeline.lessonKey !== lessonKey) {
    throw new Error(`${lessonKey} grafik saati yok.`);
  }
  if ((timeline.cues[0]?.words?.length ?? 0) === 0) {
    throw new Error(`${lessonKey} grafik saatinde kelime yok.`);
  }
  const audioPath = playerAudioPath(lessonKey);
  process.stdout.write(`${lessonKey} PCM okunuyor → ${audioPath}\n`);
  const samples = decodeAudioToMonoPcm(audioPath);
  const fitted = fitListenCuesToAcoustics(
    timeline,
    samples,
    JUNIOR_ANALYSIS_SAMPLE_RATE,
    authoredCues(timeline),
  );
  const aligned = fitted.timeline;
  if (fitted.demoted.length > 0) {
    process.stdout.write(
      `${lessonKey} cümle sınırı düştü: ${fitted.demoted.map((row) => `${row.cueId} «${row.word}»`).join(", ")}\n`,
    );
  }
  const sentence = measureSentenceEndDrift(aligned, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const words = measureWordAcousticFit(aligned, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  process.stdout.write(
    `${lessonKey} süre=${aligned.audio.durationMs}ms cümle p90=${Math.round(sentence.p90Ms)}ms en fazla=${Math.round(sentence.maxMs)}ms kelime kayma=${words.issues.length}\n`,
  );
  const sentenceFailure = juniorSyncFailure(sentence);
  if (sentenceFailure) {
    throw new Error(sentenceFailure);
  }
  const wordFailure = wordAcousticFailure(words);
  if (wordFailure) {
    throw new Error(wordFailure);
  }
  const path = writeSealed(aligned);
  process.stdout.write(`${lessonKey} kilitli JSON → ${path}\n`);
}

function main(): void {
  const keys = lessonList(process.argv.slice(2));
  const failures: string[] = [];
  for (const lessonKey of keys) {
    try {
      sealLesson(lessonKey);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${lessonKey}: ${message}`);
      process.stderr.write(`${lessonKey} BAŞARISIZ — ${message}\n`);
    }
  }
  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
  process.stdout.write("seal:junior-graph-clock OK\n");
}

try {
  main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`seal:junior-graph-clock BAŞARISIZ — ${message}\n`);
  process.exit(1);
}
