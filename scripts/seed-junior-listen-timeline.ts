/**
 * Junior akustik zaman çizelgesi tohumu.
 * Duran MP3 `decodeAudioToMonoPcm` ile okunur. Kelime saati `alignWordsByAcoustics`tir.
 * Uzak cümle sonu `fitListenCuesToAcoustics` ile düşer. `pauseAfterMs` ölçülen boşluktur.
 * Çağıran `realignPilotTimelineWords`. Ses dosyası yazılmaz. `--force` ve `--overwrite` kapalıdır.
 * `PILOT_BAKE_SPECS` bu yazıcıya girmez.
 *
 *   npx tsx scripts/seed-junior-listen-timeline.ts --lesson=jr_06_turkce-1
 *   npx tsx scripts/seed-junior-listen-timeline.ts --openers
 *   npx tsx scripts/seed-junior-listen-timeline.ts --seal --lesson=jr_06_turkce-1
 *
 * Kapı, dosya yazıldıktan sonra ayrıdır:
 *   npx tsx scripts/verify-junior-sync.ts --lesson=jr_06_turkce-1 --apply
 * `production` ancak kapı geçtikten sonra `--seal` ile yazılır.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { juniorScenarioIfPresent, juniorSealedCourseLessons } from "@/lib/junior/content-source";
import { JUNIOR_PILOT_SLUGS } from "@/lib/junior/limits";
import { fitListenCuesToAcoustics } from "@/lib/junior/pilot-engine/listen-cue-fit";
import { buildListenTimelineSeed } from "@/lib/junior/pilot-engine/listen-timeline-seed";
import { isJuniorGraphClockLesson } from "@/lib/junior/pilot-engine/playback-key";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { decodeAudioToMonoPcm, JUNIOR_ANALYSIS_SAMPLE_RATE } from "./junior-audio-pcm";

const ROOT = process.cwd();
const TIMELINE_DIR = join(ROOT, "packages", "junior-content", "timelines");

const OPENERS = ["jr_06_turkce-1", "jr_06_sosyal-1", "jr_06_fen-1", "jr_06_ing_main-20"] as const;

function assertNoAudioRewrite(argv: readonly string[]): void {
  if (argv.some((part) => part === "--force" || part === "--overwrite" || part.startsWith("--force=") || part.startsWith("--overwrite="))) {
    throw new Error("Bu yazıcı ses dosyasına dokunmaz. --force ve --overwrite kapalıdır.");
  }
}

function timelinePath(lessonKey: string): string {
  return join(TIMELINE_DIR, `${lessonKey}.timeline.json`);
}

function playerAudioPath(lessonKey: string): string | null {
  const candidates = [
    join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.mp3`),
    join(ROOT, "public", "media", "junior", "audio", `${lessonKey}.wav`),
    join(ROOT, "media-bake", "junior", "audio", `${lessonKey}.wav`),
  ];
  return candidates.find((path) => existsSync(path)) ?? null;
}

function readTimeline(lessonKey: string): TimelineJSON | null {
  const path = timelinePath(lessonKey);
  if (!existsSync(path)) {
    return null;
  }
  return timelineJsonSchema.parse(JSON.parse(readFileSync(path, "utf8")) as unknown);
}

function writeTimeline(timeline: TimelineJSON): string {
  const path = timelinePath(timeline.lessonKey);
  writeFileSync(path, `${JSON.stringify(timeline, null, 2)}\n`, "utf8");
  return path;
}

function lessonList(argv: readonly string[]): string[] {
  const explicit = argv
    .filter((part) => part.startsWith("--lesson="))
    .map((part) => part.slice("--lesson=".length).trim())
    .filter((key) => key.length > 0);
  if (explicit.length > 0) {
    return explicit;
  }
  if (argv.includes("--openers")) {
    return [...OPENERS];
  }
  if (argv.includes("--core")) {
    const keys = JUNIOR_PILOT_SLUGS.flatMap((slug) => juniorSealedCourseLessons(slug).map((lesson) => lesson.key));
    const openerSet = new Set<string>(OPENERS);
    const head = OPENERS.filter((key) => keys.includes(key));
    const rest = keys.filter((key) => !openerSet.has(key));
    return [...head, ...rest];
  }
  throw new Error("Ders seçilmedi. --lesson=<anahtar>, --openers veya --core ver.");
}

function seedLesson(lessonKey: string, includeGraph: boolean): "wrote" | "skipped" {
  if (isJuniorGraphClockLesson(lessonKey) && !includeGraph) {
    process.stdout.write(`${lessonKey} grafik saati. Ray kapısı geçmeden bu dosya yazılmaz.\n`);
    return "skipped";
  }
  const existing = readTimeline(lessonKey);
  if (existing?.production?.status === "locked" && existing.production.readiness === "ready") {
    process.stdout.write(`${lessonKey} kilitli timeline duruyor. Üzerine yazılmadı.\n`);
    return "skipped";
  }
  const scenario = juniorScenarioIfPresent(lessonKey);
  if (!scenario) {
    throw new Error(`${lessonKey} senaryosu yok. Tohum yazılmadı.`);
  }
  const audioPath = playerAudioPath(lessonKey);
  if (!audioPath) {
    throw new Error(`${lessonKey} ses dosyası yok. Tohum yazılmadı.`);
  }
  const seed = buildListenTimelineSeed(scenario);
  if (seed.timeline.lessonKey !== lessonKey) {
    throw new Error(`${lessonKey} tohumu başka ders anahtarı üretti.`);
  }
  process.stdout.write(`${lessonKey} PCM okunuyor → ${audioPath}\n`);
  const samples = decodeAudioToMonoPcm(audioPath);
  const fitted = fitListenCuesToAcoustics(seed.timeline, samples, JUNIOR_ANALYSIS_SAMPLE_RATE, seed.cues);
  if (fitted.timeline.lessonKey !== lessonKey) {
    throw new Error(`${lessonKey} hizalaması ders anahtarını değiştirdi.`);
  }
  if (fitted.timeline.production) {
    throw new Error(`${lessonKey} tohumuna production yazılamaz. Kapı geçmeden mühür yok.`);
  }
  const words = fitted.timeline.cues.reduce((sum, cue) => sum + (cue.words?.length ?? 0), 0);
  const path = writeTimeline(fitted.timeline);
  const dropped =
    fitted.demoted.length === 0
      ? "cümle sınırı yerinde"
      : `cümle sınırı düştü: ${fitted.demoted.map((row) => `${row.cueId} «${row.word}»`).join(", ")}`;
  process.stdout.write(
    `${lessonKey} akustik tohum yazıldı → ${path} süre=${fitted.timeline.audio.durationMs}ms sekans=${fitted.timeline.cues.length} kelime=${words} ${dropped}\n`,
  );
  return "wrote";
}

function sealLesson(lessonKey: string): void {
  const existing = readTimeline(lessonKey);
  if (!existing) {
    throw new Error(`${lessonKey} timeline yok. Mühür yazılmadı.`);
  }
  if (existing.lessonKey !== lessonKey) {
    throw new Error(`${lessonKey} dosyası başka dersi taşıyor.`);
  }
  const words = existing.cues.reduce((sum, cue) => sum + (cue.words?.length ?? 0), 0);
  if (words === 0) {
    throw new Error(`${lessonKey} kelime saati yok. Mühür yazılmadı.`);
  }
  const sealed = timelineJsonSchema.parse({
    ...existing,
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
  const path = timelinePath(lessonKey);
  writeFileSync(path, `${JSON.stringify(ordered, null, 2)}\n`, "utf8");
  process.stdout.write(`${lessonKey} production locked/ready → ${path}\n`);
}

function main(): void {
  const argv = process.argv.slice(2);
  assertNoAudioRewrite(argv);
  const seal = argv.includes("--seal");
  const includeGraph = argv.includes("--include-graph");
  const keys = lessonList(argv);
  const failures: string[] = [];
  for (const lessonKey of keys) {
    try {
      if (seal) {
        sealLesson(lessonKey);
      } else {
        seedLesson(lessonKey, includeGraph);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${lessonKey}: ${message}`);
      process.stderr.write(`${lessonKey} BAŞARISIZ — ${message}\n`);
    }
  }
  if (failures.length > 0) {
    throw new Error(failures.join("\n"));
  }
  process.stdout.write(seal ? "seed:junior-listen-timeline seal OK\n" : "seed:junior-listen-timeline OK\n");
}

try {
  main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`seed:junior-listen-timeline BAŞARISIZ — ${message}\n`);
  process.exit(1);
}
