/**
 * Ders türü, süre tahmini ve ilerleme yüzdesi — istemci güvenli.
 * Müfredat gövdesini import etmez.
 */

import { buildAcademyDialogueTimeline } from "@/lib/academy/dialogue-timeline";
import { academySealedAudioDurationSec, isAcademyLessonAudioSealed } from "@/lib/academy/lesson-audio";

export type AcademyLessonContentKind = "audio" | "video" | "document";

const READING_WORDS_PER_MIN = 160;
const MIN_LESSON_MINUTES = 4;
const MAX_LESSON_MINUTES = 25;

export type AcademyLessonMediaMetaInput = {
  key?: string;
  courseSlug?: string;
  body?: string | null;
  audioDurationSec?: number | null;
  microVideos?: readonly { durationSec: number }[] | null;
};

export type AcademyLessonMediaMeta = {
  kind: AcademyLessonContentKind;
  durationMin: number;
};

export function academyProgressPercent(done: number, total: number): number {
  if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

/** Medya süresi (sn) → oynatma listesi dakikası. 0 medya 0 basar. */
export function academyMediaDurationMin(durationSec: number): number {
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return 0;
  }
  return Math.min(MAX_LESSON_MINUTES, Math.max(1, Math.round(durationSec / 60)));
}

function resolveAudioDurationSec(input: AcademyLessonMediaMetaInput, spokenDuration: number): number {
  if (typeof input.audioDurationSec === "number" && input.audioDurationSec > 0) {
    return input.audioDurationSec;
  }
  if (input.courseSlug && input.key) {
    const sealedSec = academySealedAudioDurationSec(input.courseSlug, input.key);
    if (sealedSec > 0) {
      return sealedSec;
    }
  }
  return spokenDuration > 0 ? spokenDuration : 0;
}

function readingPlusVideoMin(input: AcademyLessonMediaMetaInput): number {
  const words = (input.body ?? "").trim().split(/\s+/u).filter(Boolean).length;
  const reading = Math.max(MIN_LESSON_MINUTES, Math.round(words / READING_WORDS_PER_MIN) || MIN_LESSON_MINUTES);
  const videoSec = (input.microVideos ?? []).reduce((sum, slot) => sum + slot.durationSec, 0);
  const videoMin = videoSec > 0 ? Math.max(1, Math.ceil(videoSec / 60)) : 0;
  return Math.min(MAX_LESSON_MINUTES, reading + videoMin);
}

export function academyLessonMediaMeta(input: AcademyLessonMediaMetaInput): AcademyLessonMediaMeta {
  const sealed = Boolean(
    input.courseSlug && input.key && isAcademyLessonAudioSealed(input.courseSlug, input.key),
  );
  const timeline = input.body
    ? buildAcademyDialogueTimeline(input.body, input.courseSlug)
    : { turns: [] as const, spokenDuration: 0 };
  const audioSec = resolveAudioDurationSec(input, timeline.spokenDuration);
  const hasAudio =
    sealed ||
    timeline.turns.length > 0 ||
    (typeof input.audioDurationSec === "number" && input.audioDurationSec > 0);
  if (hasAudio) {
    const durationMin = academyMediaDurationMin(audioSec) || readingPlusVideoMin(input);
    return { kind: "audio", durationMin };
  }
  const kind: AcademyLessonContentKind = (input.microVideos?.length ?? 0) > 0 ? "video" : "document";
  return { kind, durationMin: readingPlusVideoMin(input) };
}

export function academyLessonContentKind(input: AcademyLessonMediaMetaInput): AcademyLessonContentKind {
  return academyLessonMediaMeta(input).kind;
}

export function academyLessonDurationMin(input: AcademyLessonMediaMetaInput): number {
  return academyLessonMediaMeta(input).durationMin;
}

export function academyLessonKindLabel(
  kind: AcademyLessonContentKind,
  copy: { kindAudio: string; kindVideo: string; kindDocument: string },
): string {
  if (kind === "audio") {
    return copy.kindAudio;
  }
  if (kind === "video") {
    return copy.kindVideo;
  }
  return copy.kindDocument;
}
