import "server-only";

import { juniorAudioManifestEntry, type JuniorAudioManifest } from "@/lib/junior/audio-manifest";
import { JUNIOR_AUDIO_MANIFEST } from "@/lib/junior/audio-manifest.generated";
import { JUNIOR_QUIZ_MIN_ITEMS } from "@/lib/junior/limits";
import { JUNIOR_NARRATION_MAX_MS, JUNIOR_NARRATION_MIN_MS } from "@/lib/junior/player-clock";
import { juniorQuizDistributionOk, juniorTopicEndQuestions } from "@/lib/junior/quiz";
import { juniorNarrationDurationMs } from "@/lib/junior/scenario";
import { JUNIOR_VECTOR_SCENES, type JuniorLessonScript } from "@/lib/junior/types";
import {
  defaultJuniorAudioDiskRead,
  type JuniorAudioDiskRead,
} from "@/lib/junior/production-seal-disk";
import { juniorLessonHasBakedAudio } from "@/lib/junior/voice";
import { juniorWarmupSrc } from "@/lib/junior/warmup";

export const JUNIOR_SEAL_GAPS = ["text", "audio", "warmup", "quiz", "scene"] as const;

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

/**
 * Konu yeşil sayılmazsa eksik kapılar.
 * Metin bandı, fırınlanmış ses (anahtar, manifest ve disk), ısınma kaseti, en az üç doğrulanmış soru, atanmış SVG sahnesi.
 */
export function juniorProductionSealGaps(
  lesson: Pick<JuniorLessonScript, "key" | "listenText" | "mebNote" | "lifeUse" | "scene">,
  read: JuniorAudioDiskRead = defaultJuniorAudioDiskRead,
): JuniorSealGap[] {
  const gaps: JuniorSealGap[] = [];
  const durationMs = juniorNarrationDurationMs(lesson.mebNote, lesson.lifeUse);
  if (
    lesson.listenText.trim().length === 0 ||
    durationMs < JUNIOR_NARRATION_MIN_MS ||
    durationMs > JUNIOR_NARRATION_MAX_MS
  ) {
    gaps.push("text");
  }
  if (!juniorBakedAudioSealed(lesson.key, read)) {
    gaps.push("audio");
  }
  if (!juniorWarmupSrc(lesson.key)) {
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

/** Fail-closed. Eksik kapı varsa konu mühürlenmez. */
export function assertJuniorProductionSeal(
  lesson: Pick<JuniorLessonScript, "key" | "listenText" | "mebNote" | "lifeUse" | "scene">,
): void {
  const gaps = juniorProductionSealGaps(lesson);
  if (gaps.length === 0) {
    return;
  }
  throw new Error(`${lesson.key} Junior mühürü eksik: ${gaps.join(", ")}.`);
}
