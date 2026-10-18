import "server-only";

import { projectJuniorGraphicHop, reduceSceneState } from "@yetkin/junior-graphic/runtime";
import { railV1JuniorLessonPlayDataSchema } from "@/lib/kernel/http/v1-contract";
import type { JuniorMediaUrls } from "@/lib/junior/media-grant";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import { isJuniorPilotPlaybackLesson } from "@/lib/junior/pilot-engine/playback-key";

/**
 * Web sahne kancası (`{@spawnMarbles}` ve benzeri). Hop metninde durmaz.
 * Native istemci aynı deseni ikinci kez süzer; bu satır sunucu kaynağıdır.
 */
const VISUAL_HOOK = /\{@[a-zA-Z0-9_]+\}/gu;

export function juniorHopSpeech(text: string): string {
  return text
    .replace(VISUAL_HOOK, " ")
    .replace(/[^\S\n]+/gu, " ")
    .replace(/ *\n */gu, "\n")
    .trim();
}

type PlayLessonFields = {
  title: string;
  courseTitle: string;
  script: string;
  scene: string;
  steps?: readonly string[];
  preparing: boolean;
  practice: unknown;
};

/**
 * Mevcut `junior-lesson-play` gövdesi.
 * Pilot dersin konuşması mühürlü zaman çizelgesinin düz metnidir; bilye, dedektif
 * tahtası ve kare listesi bu nesneye yazılmaz. Yeni hop açılmaz.
 */
export function buildJuniorLessonPlayData(input: {
  lessonKey: string;
  catalogAccess: "free" | "locked";
  lesson: PlayLessonFields;
  media: JuniorMediaUrls;
  progress: { status: "fresh" | "going" | "done" } | null;
}) {
  const pilot = isJuniorPilotPlaybackLesson(input.lessonKey)
    ? getPilotTimelineForLesson(input.lessonKey)
    : null;
  const script = pilot
    ? juniorHopSpeech(pilot.cues.map((cue) => cue.text).join("\n\n"))
    : juniorHopSpeech(input.lesson.script);
  const steps = pilot
    ? pilot.chapters.map((chapter) => chapter.title.trim()).filter((title) => title.length > 0)
    : (input.lesson.steps ?? []).map((step) => step.trim()).filter((step) => step.length > 0);
  const graphic = pilot ? projectJuniorGraphicHop(reduceSceneState(pilot, pilot.audio.durationMs)) : null;
  const parsed = railV1JuniorLessonPlayDataSchema.safeParse({
    lesson: {
      lessonKey: input.lessonKey,
      title: input.lesson.title,
      courseTitle: input.lesson.courseTitle,
      access: input.catalogAccess,
      script,
      scene: input.lesson.scene,
      steps,
      preparing: input.lesson.preparing,
    },
    media: input.media,
    practice: input.lesson.practice,
    progress: input.progress,
    graphic,
  });
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}
