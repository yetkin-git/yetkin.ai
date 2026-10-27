/**
 * Junior akustik senkron kapısı.
 * Oynatıcının çaldığı MP3 çözülür. Cümle sonu sapması ve her kelimenin ses enerjisi
 * doğrulanamazsa ders onaylanmaz. Prebuild bu komutu argümansız çalıştırır.
 *
 *   npm run verify:junior-sync
 *   npx tsx scripts/verify-junior-sync.ts --lesson=jr_06_mat-1
 *   npx tsx scripts/verify-junior-sync.ts --lesson=jr_06_mat-1 --apply
 *
 * Ses klasörü bu süreçte yoksa (git, CI, Vercel paketi) akustik sapma atlanır.
 * Manifest kapısı `verify:junior-audio-manifest` ile aynı hükümdür. Klasör durup
 * ders dosyası yoksa onay verilmez.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { MAT_5_AUTHORED_CUES, type AuthoredCueSpec } from "@/lib/junior/pilot-engine/mat-1.choreography";
import { MAT_6_AUTHORED_CUES } from "@/lib/junior/pilot-engine/mat-6.choreography";
import { realignPilotTimelineWords } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { juniorSyncFailure, measureSentenceEndDrift, measureWordAcousticFit, wordAcousticFailure } from "@/lib/junior/pilot-engine/sync-gate";
import { decodeAudioToMonoPcm, JUNIOR_ANALYSIS_SAMPLE_RATE, pcmDurationMs } from "./junior-audio-pcm";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");

const AUTHORED_CUES: Readonly<Record<string, readonly AuthoredCueSpec[]>> = {
  "jr_06_mat-1": MAT_5_AUTHORED_CUES,
  "jr_06_mat-2": MAT_6_AUTHORED_CUES,
};

function lessonArg(argv: readonly string[]): string | null {
  const value = argv.find((part) => part.startsWith("--lesson="))?.slice("--lesson=".length)?.trim();
  return value || null;
}

function directoryPresent(relative: string): boolean {
  const absolute = join(ROOT, relative);
  try {
    return existsSync(absolute) && statSync(absolute).isDirectory();
  } catch {
    return false;
  }
}

/** Oynatıcının veya fırın yatağının durduğu klasör. İkisi de yoksa bayt bu derlemede yoktur. */
function juniorAudioBytesPresent(): boolean {
  return directoryPresent("public/media/junior/audio") || directoryPresent("media-bake/junior/audio");
}

/** Oynatıcının çaldığı dosya. MP3, fırın WAV'ından önce gelir. */
function playerAudioPath(lessonKey: string): string | null {
  const candidates = [
    join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.mp3`),
    join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.wav`),
    join(ROOT, "media-bake", "junior", "audio", `${lessonKey}.wav`),
  ];
  return candidates.find((path) => existsSync(path)) ?? null;
}

function timelinePath(lessonKey: string): string {
  return join(TIMELINE_DIR, `${lessonKey}.timeline.json`);
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
    throw new Error(`${filter} için mühürlü timeline yok. Kapı onay vermez.`);
  }
  return [filter];
}

function loadTimeline(lessonKey: string): TimelineJSON {
  const path = timelinePath(lessonKey);
  if (!existsSync(path)) {
    throw new Error(`${lessonKey} için mühürlü timeline yok. Kapı onay vermez.`);
  }
  return timelineJsonSchema.parse(JSON.parse(readFileSync(path, "utf8")) as unknown);
}

function cuesFor(lessonKey: string, timeline: TimelineJSON): readonly AuthoredCueSpec[] {
  return (
    AUTHORED_CUES[lessonKey] ??
    timeline.cues.map((cue) => ({
      id: cue.id,
      chapterId: cue.chapterId as AuthoredCueSpec["chapterId"],
      pauseAfterMs: cue.pauseAfterMs,
      markedText: cue.markedText ?? cue.text,
      keyframes: cue.keyframes.map((frame) => ({
        hook: frame.hook,
        offsetMs: Math.max(0, Math.round(frame.atMs - cue.startMs)),
        op: frame.op,
        params: frame.params,
      })),
    }))
  );
}

function checkLesson(lessonKey: string, apply: boolean): void {
  const path = playerAudioPath(lessonKey);
  if (!path) {
    throw new Error(`${lessonKey} ses dosyası yok. Sapma doğrulanamadı. Onay yok.`);
  }
  let timeline = loadTimeline(lessonKey);
  const samples = decodeAudioToMonoPcm(path);
  const durationMs = pcmDurationMs(samples);
  if (apply) {
    timeline = realignPilotTimelineWords(timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE, cuesFor(lessonKey, timeline));
    if (timeline.lessonKey !== lessonKey) {
      throw new Error("Hizalanan timeline ders anahtarını değiştirdi.");
    }
    const target = timelinePath(lessonKey);
    writeFileSync(target, `${JSON.stringify(timeline, null, 2)}\n`, "utf8");
    process.stdout.write(`akustik kelime saati yazıldı → ${target}\n`);
  }
  const sentence = measureSentenceEndDrift(timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  const words = measureWordAcousticFit(timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE);
  process.stdout.write(
    `${lessonKey} ses=${path} süre=${durationMs}ms cümle n=${sentence.samples} medyan=${Math.round(sentence.medianMs)}ms p90=${Math.round(sentence.p90Ms)}ms en fazla=${Math.round(sentence.maxMs)}ms kelime=${words.words} kayma=${words.issues.length}\n`,
  );
  const sentenceFailure = juniorSyncFailure(sentence);
  if (sentenceFailure) {
    throw new Error(sentenceFailure);
  }
  const wordFailure = wordAcousticFailure(words);
  if (wordFailure) {
    throw new Error(wordFailure);
  }
}

function main(): void {
  const argv = process.argv.slice(2);
  const apply = argv.includes("--apply");
  const keys = lessonKeys(lessonArg(argv));
  if (keys.length === 0) {
    throw new Error("Mühürlü timeline yok. Kapı onay vermez.");
  }
  if (!juniorAudioBytesPresent()) {
    if (apply) {
      throw new Error("Ses klasörü yok. --apply akustik saati yazamaz.");
    }
    process.stdout.write(
      `verify:junior-sync OK — ${keys.length} timeline. Ses klasörü bu süreçte yok (paket veya git); akustik sapma atlandı.\n`,
    );
    return;
  }
  for (const lessonKey of keys) {
    checkLesson(lessonKey, apply);
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
