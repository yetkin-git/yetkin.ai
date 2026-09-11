/**
 * Zero-Cost Streaming — DialogueTurn[] mühürlü ders sesi.
 * Canlı izlemede TTS yok; bake WAV `media-bake/academy/audio` altına dondurulur,
 * yayın MP3 `public/media/academy/audio` altına yazılır.
 */

import { createHash } from "node:crypto";
import { join } from "node:path";
import type { AcademyLessonDraft, DialogueSpeakerId, DialogueTurn } from "@/lib/academy/curricula/types";
import {
  academyCastForDialogueSpeaker,
  academyInstructorTtsCast,
  type AcademyTtsVoice,
} from "@/lib/academy/instructors";
import { ACADEMY_MEDIA_SEALED_SKU_SLUGS } from "@/lib/academy/pilot-sku";
import { academyLessonAudioPublicPath } from "@/lib/academy/lesson-audio";
import {
  cleanAcademySpokenTextForTts,
  collapseAcademyLessonProse,
} from "@/lib/academy/lesson-body";
import {
  applyAcademyCueDisplayPhonetics,
  expandAcademyTtsSkipPreventer,
  loadAcademySpokenScriptParagraphs,
  loadAcademySpokenScriptProse,
} from "@/lib/academy/spoken-scripts";

export const ACADEMY_MEDIA_RELEASE_BUCKET = "public" as const;
export const ACADEMY_MEDIA_RELEASE_LANGUAGE = "tr-TR" as const;
export const ACADEMY_MEDIA_RELEASE_MAX_BYTES = 80 * 1024 * 1024;
/** Perde/cümle ölçeği — karakter mikro dilimi değil; süre bütçesi `tts-breath-chunks`. */
export const ACADEMY_MEDIA_RELEASE_SPEECH_CHUNK_CHARS = 12_000;
/** Dilimler arası taze nefes — 300–500 ms sessizlik. */
export const ACADEMY_TTS_PARAGRAPH_PAUSE_SEC = 0.4;

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
  return join(root, "media-bake", "academy", "audio", courseSlug.trim(), `${lessonKey.trim()}.wav`);
}

export function academyLessonAudioReleaseDiskPath(
  courseSlug: string,
  lessonKey: string,
  root = process.cwd(),
): string {
  return join(root, "public", "media", "academy", "audio", courseSlug.trim(), `${lessonKey.trim()}.mp3`);
}

export function academyLessonAudioLegacyPublicWavPath(
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
  return cleanAcademySpokenTextForTts(
    collapseAcademyLessonProse(applyAcademyCueDisplayPhonetics(expandAcademyTtsSkipPreventer(text))),
  );
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
  if (turns.length > 0) {
    return turns;
  }
  const paragraphs = loadAcademySpokenScriptParagraphs(lesson.key);
  if (paragraphs.length > 0) {
    const cast = academyInstructorTtsCast(courseSlug);
    return paragraphs.map((spokenText) => ({
      speaker: "egitmen" as const,
      text: spokenText,
      spokenText,
      voice: cast.voice,
      speechRate: cast.speechRate,
      canonicalCharacterName: cast.canonicalCharacterName,
    }));
  }
  const spokenText = loadAcademySpokenScriptProse(lesson.key);
  if (!spokenText) {
    return [];
  }
  const cast = academyInstructorTtsCast(courseSlug);
  return [
    {
      speaker: "egitmen",
      text: spokenText,
      spokenText,
      voice: cast.voice,
      speechRate: cast.speechRate,
      canonicalCharacterName: cast.canonicalCharacterName,
    },
  ];
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
