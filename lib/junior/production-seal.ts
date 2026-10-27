import "server-only";

import { juniorAudioManifestEntry, type JuniorAudioManifest } from "@/lib/junior/audio-manifest";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import { JUNIOR_NARRATION_MAX_MS, JUNIOR_NARRATION_MIN_MS } from "@/lib/junior/player-clock";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { JR_06_MAT_1_TIMELINE, JR_06_MAT_2_TIMELINE } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { timelineJsonSchema } from "@/lib/junior/pilot-engine/schema";
import { JUNIOR_PILOT_PLAYBACK_LESSON_KEY } from "@/lib/junior/pilot-engine/playback-key";
import { mat5NarrationSealIssue, mat6NarrationSealIssue } from "@/lib/junior/pilot-engine/timeline-seal";
import { juniorQuizDistributionOk, juniorTopicEndQuestions } from "@/lib/junior/quiz";

export { JUNIOR_NARRATION_MAX_MS, JUNIOR_NARRATION_MIN_MS };
import { JUNIOR_VECTOR_SCENES, type JuniorLessonScript } from "@/lib/junior/types";
import {
  defaultJuniorAudioDiskRead,
  type JuniorAudioDiskRead,
} from "@/lib/junior/production-seal-disk";
import { juniorLessonHasBakedAudio } from "@/lib/junior/voice";
import { juniorWarmupSrc } from "@/lib/junior/warmup";

export const JUNIOR_SEAL_GAPS = ["text", "audio", "warmup", "quiz", "scene", "duration"] as const;

export type JuniorSealGap = (typeof JUNIOR_SEAL_GAPS)[number];

function quizVerified(lessonKey: string): boolean {
  // Yayın dağılım kapısı (T-05): her şık en fazla %40 doğru cevap; her konuda en az iki farklı konum.
  if (!juniorQuizDistributionOk()) {
    return false;
  }
  const rows = juniorTopicEndQuestions(lessonKey);
  if (rows.length < JUNIOR_QUIZ_MIN_ITEMS) {
    return false;
  }
  return rows.every((row) => {
    const options = row.options.filter((option) => option.trim().length > 0);
    return (
      row.question.trim().length > 0 &&
      row.explanation.trim().length > 0 &&
      options.length === row.options.length &&
      options.length >= 2 &&
      row.correctAnswerIndex >= 0 &&
      row.correctAnswerIndex < row.options.length
    );
  });
}

/**
 * Ses kapısı (T-04, fail-closed). Üç koşul birlikte aranır:
 * 1) Anahtar fırın manifestindeki `JUNIOR_BAKED_AUDIO_KEYS` içinde olmalı.
 * 2) Manifestte geçerli SHA-256 ve bayt kaydı olmalı. Manifest build'de `--check` ile doğrulanır.
 * 3) Ses klasörü bu süreçte duruyorsa MP3 orada ve boş değilse olmalı.
 * Klasör yoksa (Vercel paketi, CDN) kanıt manifesttir; kayıt yoksa kapı kapalı kalır.
 */
export function juniorBakedAudioSealed(
  lessonKey: string,
  read: JuniorAudioDiskRead = defaultJuniorAudioDiskRead,
  manifest: JuniorAudioManifest = JUNIOR_AUDIO_MANIFEST,
): boolean {
  if (!juniorLessonHasBakedAudio(lessonKey)) {
    return false;
  }
  if (!juniorAudioManifestEntry(lessonKey, manifest)) {
    return false;
  }
  if (!read.treePresent()) {
    return true;
  }
  return read.filePresent(lessonKey);
}

const LOCKED_TIMELINE_KEY = /^jr_06_[a-z0-9_]+-\d+$/u;

/**
 * Kilitli zaman çizelgesinin PCM süresi. Oynatıcı okuyucusunu kaydetmez.
 */
function lockedTimelineDurationMs(lessonKey: string): number | null {
  const key = lessonKey.trim();
  if (!LOCKED_TIMELINE_KEY.test(key)) {
    return null;
  }
  const path = join(process.cwd(), "packages", "junior-content", "timelines", `${key}.timeline.json`);
  if (!existsSync(path)) {
    return null;
  }
  try {
    const timeline = timelineJsonSchema.parse(JSON.parse(readFileSync(path, "utf8")) as unknown);
    if (timeline.lessonKey !== key) {
      return null;
    }
    if (timeline.production?.status !== "locked" || timeline.production.readiness !== "ready") {
      return null;
    }
    const pcm = timeline.audio.durationMs;
    return Number.isFinite(pcm) && pcm > 0 ? pcm : null;
  } catch {
    return null;
  }
}

/**
 * Ölçülmüş anlatım. Önce MP3 başlığı, yoksa kilitli zaman çizelgesinin PCM süresi.
 * Karakter saati bu kapıya girmez. Ölçüm yoksa `null`.
 */
export function measuredJuniorNarrationMs(
  lessonKey: string,
  read: JuniorAudioDiskRead = defaultJuniorAudioDiskRead,
): number | null {
  const disk = read.mp3DurationMs?.(lessonKey) ?? null;
  if (disk !== null && Number.isFinite(disk) && disk > 0) {
    return disk;
  }
  return lockedTimelineDurationMs(lessonKey);
}

/**
 * Mühürlü pilotun süresi. Dosya duruyorsa MP3 başlığından okunur.
 * Dosya yoksa (dağıtım paketi) mühürlü zaman çizelgesindeki ölçülmüş süre kullanılır.
 * Karakter saati bu ders için kapı değildir.
 */
export function juniorPilotNarrationMs(
  read: JuniorAudioDiskRead = defaultJuniorAudioDiskRead,
): number {
  return measuredJuniorNarrationMs(JUNIOR_PILOT_PLAYBACK_LESSON_KEY, read) ?? JR_06_MAT_1_TIMELINE.audio.durationMs;
}

/**
 * `jr_06_mat-2` mühür süresi. Dosya duruyorsa MP3 başlığından okunur.
 * Dosya yoksa mühürlü zaman çizelgesindeki ölçülmüş süre kullanılır.
 */
export function juniorMat2NarrationMs(
  read: JuniorAudioDiskRead = defaultJuniorAudioDiskRead,
): number {
  return measuredJuniorNarrationMs("jr_06_mat-2", read) ?? JR_06_MAT_2_TIMELINE.audio.durationMs;
}

/** @deprecated Yanlış numara. `juniorMat2NarrationMs` kullan. */
export const juniorMat6NarrationMs = juniorMat2NarrationMs;

/**
 * Konu yeşil sayılmazsa eksik kapılar.
 * Süre kapısı ölçülmüş MP3 veya kilitli PCM'dir. Karakter saati yeşil bırakmaz.
 * 180 sn altındaki ölçülmüş kaset `duration` açığıdır; paket kapısı bu açığı ders kartına yazar, kursu kilitlemez.
 * Fırınlanmış ses (anahtar, manifest ve disk), çekirdek ısınma kaseti, en az üç doğrulanmış soru, atanmış SVG sahnesi.
 * Seçmeli sahnede ısınma kaseti aranmaz.
 */
export function juniorProductionSealGaps(
  lesson: Pick<JuniorLessonScript, "key" | "listenText" | "mebNote" | "lifeUse" | "scene">,
  read: JuniorAudioDiskRead = defaultJuniorAudioDiskRead,
): JuniorSealGap[] {
  const gaps: JuniorSealGap[] = [];
  const pilot = lesson.key === JUNIOR_PILOT_PLAYBACK_LESSON_KEY;
  const mat2 = lesson.key === "jr_06_mat-2";
  const measured = measuredJuniorNarrationMs(lesson.key, read);
  const narrationIssue = pilot
    ? mat5NarrationSealIssue(JR_06_MAT_1_TIMELINE)
    : mat2
      ? mat6NarrationSealIssue(JR_06_MAT_2_TIMELINE)
      : null;
  if (lesson.listenText.trim().length === 0 || narrationIssue !== null) {
    gaps.push("text");
  }
  if (
    measured === null ||
    measured < JUNIOR_NARRATION_MIN_MS ||
    measured > JUNIOR_NARRATION_MAX_MS
  ) {
    gaps.push("duration");
  }
  if (!juniorBakedAudioSealed(lesson.key, read)) {
    gaps.push("audio");
  }
  // Seçmeli sahnede ısınma kaseti yoktur. `juniorWarmupSrc` null döner; oynatıcı sahneye düşer.
  if (lesson.scene !== "elective" && !juniorWarmupSrc(lesson.key)) {
    gaps.push("warmup");
  }
  if (!quizVerified(lesson.key)) {
    gaps.push("quiz");
  }
  if (!(JUNIOR_VECTOR_SCENES as readonly string[]).includes(lesson.scene)) {
    gaps.push("scene");
  }
  return gaps;
}

/**
 * Paket ve ücretsiz açılış kapısı. Süre dürüstlüğü ders kartındadır;
 * kısa kaset bütün kursu kilitli yapmaz.
 */
export function juniorContentSealGaps(
  lesson: Pick<JuniorLessonScript, "key" | "listenText" | "mebNote" | "lifeUse" | "scene">,
  read: JuniorAudioDiskRead = defaultJuniorAudioDiskRead,
): JuniorSealGap[] {
  return juniorProductionSealGaps(lesson, read).filter((gap) => gap !== "duration");
}

/** Fail-closed. Eksik kapı varsa konu mühürlenmez. Süre açığı da mühürü düşürür. */
export function assertJuniorProductionSeal(
  lesson: Pick<JuniorLessonScript, "key" | "listenText" | "mebNote" | "lifeUse" | "scene">,
): void {
  const gaps = juniorProductionSealGaps(lesson);
  if (gaps.length === 0) {
    return;
  }
  throw new Error(`${lesson.key} Junior mühürü eksik: ${gaps.join(", ")}.`);
}
