/**
 * Zero-Cost Streaming — DialogueTurn[] mühürlü ders sesi.
 * Canlı izlemede TTS yok; WAV `public/media/academy/audio` altına dondurulur.
 */

import { createHash } from "node:crypto";
import { join } from "node:path";
import type { AcademyLessonDraft, DialogueSpeakerId, DialogueTurn } from "@/lib/academy/curricula/types";
import {
  academyCastForDialogueSpeaker,
  type AcademyTtsVoice,
} from "@/lib/academy/instructors";
import { ACADEMY_MEDIA_SEALED_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { academyLessonAudioPublicPath } from "@/lib/academy/lesson-audio";
import {
  cleanAcademySpokenTextForTts,
  collapseAcademyLessonProse,
} from "@/lib/academy/lesson-body";

export const ACADEMY_MEDIA_RELEASE_BUCKET = "public" as const;
export const ACADEMY_MEDIA_RELEASE_LANGUAGE = "tr-TR" as const;
export const ACADEMY_MEDIA_RELEASE_MAX_BYTES = 80 * 1024 * 1024;
/** Perde/cümle ölçeği — 300 karakterlik mikro dilim yok. */
export const ACADEMY_MEDIA_RELEASE_SPEECH_CHUNK_CHARS = 12_000;

export type AcademySealedSkuSlug = (typeof ACADEMY_MEDIA_SEALED_SKU_SLUGS)[number];

export type AcademyMediaReleaseTurn = {
  speaker: DialogueSpeakerId;
  text: string;
  spokenText: string;
  voice: AcademyTtsVoice;
  speechRate: number;
  canonicalCharacterName: string;
};

export type AcademyMediaReleaseJob = {
  courseSlug: AcademySealedSkuSlug;
  lessonKey: string;
  title: string;
  turns: readonly AcademyMediaReleaseTurn[];
  publicPath: string;
  objectPath: string;
  cacheKey: string;
  mediaReleaseSeal: string;
};

export function academyLessonAudioObjectPath(courseSlug: string, lessonKey: string): string {
  return `academy/audio/${courseSlug.trim()}/${lessonKey.trim()}.wav`;
}

export function academyLessonAudioDiskPath(
  courseSlug: string,
  lessonKey: string,
  root = process.cwd(),
): string {
  return join(root, "public", "media", "academy", "audio", courseSlug.trim(), `${lessonKey.trim()}.wav`);
}

export function academyMediaReleaseCacheKey(courseSlug: string, lessonKey: string): string {
  return `media-release:${courseSlug.trim()}:${lessonKey.trim()}`;
}

export function collectAcademyLessonDialogueTurns(
  lesson: AcademyLessonDraft,
): readonly DialogueTurn[] {
  if (lesson.dialogue) {
    return [
      ...lesson.dialogue.warmup,
      ...lesson.dialogue.problem,
      ...lesson.dialogue.development,
      ...lesson.dialogue.conclusion,
    ];
  }
  return [];
}

export function spokenAcademyDialogueTurnText(text: string): string {
  return cleanAcademySpokenTextForTts(collapseAcademyLessonProse(text));
}

export function academyMediaReleaseTurnsForLesson(
  courseSlug: string,
  lesson: AcademyLessonDraft,
): AcademyMediaReleaseTurn[] {
  const turns: AcademyMediaReleaseTurn[] = [];
  for (const turn of collectAcademyLessonDialogueTurns(lesson)) {
    const spokenText = spokenAcademyDialogueTurnText(turn.text);
    if (!spokenText) {
      continue;
    }
    const cast = academyCastForDialogueSpeaker(courseSlug, "egitmen");
    turns.push({
      speaker: "egitmen",
      text: turn.text,
      spokenText,
      voice: cast.voice,
      speechRate: cast.speechRate,
      canonicalCharacterName: cast.canonicalCharacterName,
    });
  }
  return turns;
}

export function computeAcademyMediaReleaseSeal(job: {
  courseSlug: string;
  lessonKey: string;
  model: string;
  turns: readonly AcademyMediaReleaseTurn[];
}): string {
  const canonical = JSON.stringify({
    v: 1,
    courseSlug: job.courseSlug,
    lessonKey: job.lessonKey,
    model: job.model,
    turns: job.turns.map((turn) => ({
      speaker: turn.speaker,
      voice: turn.voice,
      speechRate: turn.speechRate,
      text: turn.spokenText,
    })),
  });
  return createHash("sha256").update(canonical, "utf8").digest("hex");
}

export function academyMediaReleaseJobForLesson(
  courseSlug: AcademySealedSkuSlug,
  lesson: AcademyLessonDraft,
  model: string,
): AcademyMediaReleaseJob {
  const turns = academyMediaReleaseTurnsForLesson(courseSlug, lesson);
  const mediaReleaseSeal = computeAcademyMediaReleaseSeal({
    courseSlug,
    lessonKey: lesson.key,
    model,
    turns,
  });
  return {
    courseSlug,
    lessonKey: lesson.key,
    title: lesson.title,
    turns,
    publicPath: academyLessonAudioPublicPath(courseSlug, lesson.key),
    objectPath: academyLessonAudioObjectPath(courseSlug, lesson.key),
    cacheKey: academyMediaReleaseCacheKey(courseSlug, lesson.key),
    mediaReleaseSeal,
  };
}

export function splitAcademySpeechChunks(
  text: string,
  maxChars = ACADEMY_MEDIA_RELEASE_SPEECH_CHUNK_CHARS,
): string[] {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.length <= maxChars) {
    return [trimmed];
  }
  const sentences = trimmed.split(/(?<=[.!?…])\s+/u).filter((part) => part.trim().length > 0);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) {
      continue;
    }
    if (piece.length > maxChars) {
      if (current) {
        chunks.push(current);
        current = "";
      }
      for (let offset = 0; offset < piece.length; offset += maxChars) {
        chunks.push(piece.slice(offset, offset + maxChars).trim());
      }
      continue;
    }
    const next = current ? `${current} ${piece}` : piece;
    if (next.length > maxChars) {
      chunks.push(current);
      current = piece;
    } else {
      current = next;
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks.filter((chunk) => chunk.length > 0);
}
