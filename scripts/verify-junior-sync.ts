/**
 * Junior akustik senkron kapısı.
 * WAV veya MP3 çözülür; cümle sonu sapmasının p90 eşiği doğrulanamazsa ders onaylanmaz.
 *
 *   npm run verify:junior-sync
 *   npx tsx scripts/verify-junior-sync.ts --lesson=jr_06_mat-5
 *   npx tsx scripts/verify-junior-sync.ts --lesson=jr_06_mat-5 --apply
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { JR_06_MAT_5_TIMELINE } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { realignMat5TimelineWords } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { juniorSyncFailure, measureSentenceEndDrift } from "@/lib/junior/pilot-engine/sync-gate";
import { decodeAudioToMonoPcm, JUNIOR_ANALYSIS_SAMPLE_RATE, pcmDurationMs } from "./junior-audio-pcm";

const ROOT = process.cwd();
const LESSON_KEY = "jr_06_mat-5";
const TIMELINE_PATH = join(ROOT, "packages", "junior-content", "timelines", "jr_06_mat-5.timeline.json");

function lessonArg(argv: readonly string[]): string {
  return argv.find((part) => part.startsWith("--lesson="))?.slice("--lesson=".length)?.trim() || LESSON_KEY;
}

function audioPath(lessonKey: string): string | null {
  const candidates = [
    join(ROOT, "media-bake", "junior", "audio", `${lessonKey}.wav`),
    join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.wav`),
    join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.mp3`),
  ];
  return candidates.find((path) => existsSync(path)) ?? null;
}

function loadTimeline(lessonKey: string): TimelineJSON {
  if (lessonKey !== LESSON_KEY) {
    throw new Error(`${lessonKey} için mühürlü timeline yok. Kapı onay vermez.`);
  }
  return timelineJsonSchema.parse(JSON.parse(readFileSync(TIMELINE_PATH, "utf8")) as unknown);
}

function main(): void {
  const argv = process.argv.slice(2);
  const lessonKey = lessonArg(argv);
  const apply = argv.includes("--apply");
  const path = audioPath(lessonKey);
  if (!path) {
    throw new Error(`${lessonKey} ses dosyası yok. Sapma doğrulanamadı. Onay yok.`);
  }
  let timeline = loadTimeline(lessonKey);
  const samples = decodeAudioToMonoPcm(path);
  const durationMs = pcmDurationMs(samples);
  if (apply) {
    timeline = realignMat5TimelineWords(timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
    if (timeline.lessonKey !== JR_06_MAT_5_TIMELINE.lessonKey) {
      throw new Error("Hizalanan timeline ders anahtarını değiştirdi.");
    }
    writeFileSync(TIMELINE_PATH, `${JSON.stringify(timeline, null, 2)}\n`, "utf8");
    process.stdout.write(`kelime saati PCM sessizliklerine yazıldı → ${TIMELINE_PATH}\n`);
  }
  const report = measureSentenceEndDrift(timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const failure = juniorSyncFailure(report);
  process.stdout.write(
    `${lessonKey} ses=${path} süre=${durationMs}ms n=${report.samples} medyan=${Math.round(report.medianMs)}ms p90=${Math.round(report.p90Ms)}ms en fazla=${Math.round(report.maxMs)}ms\n`,
  );
  if (failure) {
    throw new Error(failure);
  }
  process.stdout.write("verify:junior-sync OK\n");
}

try {
  main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`verify:junior-sync BAŞARISIZ — ${message}\n`);
  process.exit(1);
}
