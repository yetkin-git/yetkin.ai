/**
 * Ders türü, süre tahmini ve ilerleme yüzdesi — istemci güvenli.
 * Müfredat gövdesini import etmez.
 */

export type AcademyLessonContentKind = "video" | "document";

const READING_WORDS_PER_MIN = 160;
const MIN_LESSON_MINUTES = 4;
const MAX_LESSON_MINUTES = 25;

export function academyProgressPercent(done: number, total: number): number {
  if (!Number.isFinite(done) || !Number.isFinite(total) || total <= 0) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

export function academyLessonContentKind(input: {
  microVideos?: readonly unknown[] | null;
}): AcademyLessonContentKind {
  return (input.microVideos?.length ?? 0) > 0 ? "video" : "document";
}

export function academyLessonDurationMin(input: {
  body?: string | null;
  microVideos?: readonly { durationSec: number }[] | null;
}): number {
  const words = (input.body ?? "").trim().split(/\s+/u).filter(Boolean).length;
  const reading = Math.max(MIN_LESSON_MINUTES, Math.round(words / READING_WORDS_PER_MIN) || MIN_LESSON_MINUTES);
  const videoSec = (input.microVideos ?? []).reduce((sum, slot) => sum + slot.durationSec, 0);
  const videoMin = videoSec > 0 ? Math.max(1, Math.ceil(videoSec / 60)) : 0;
  return Math.min(MAX_LESSON_MINUTES, reading + videoMin);
}
