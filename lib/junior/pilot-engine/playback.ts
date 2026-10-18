import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import {
  JUNIOR_PILOT_PLAYBACK_LESSON_KEY,
  isJuniorPilotPlaybackLesson,
  type JuniorPilotPlaybackLessonKey,
} from "@/lib/junior/pilot-engine/playback-key";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

export { JUNIOR_PILOT_PLAYBACK_LESSON_KEY, isJuniorPilotPlaybackLesson };

export type JuniorPlaybackResolution =
  | {
      engine: "pilot";
      lessonKey: JuniorPilotPlaybackLessonKey;
      timeline: TimelineJSON;
    }
  | { engine: "sealed"; lessonKey: string };

/**
 * Tek oynatma kapısı.
 * Grafiği olan ders pilot sahneye gider. Grafiği olmayan ders vektör oynatıcıdadır.
 * `scene` alanı film seçmez.
 */
export function resolveJuniorPlayback(lessonKey: string): JuniorPlaybackResolution {
  if (isJuniorPilotPlaybackLesson(lessonKey)) {
    const timeline = getPilotTimelineForLesson(lessonKey);
    if (timeline) {
      return {
        engine: "pilot",
        lessonKey,
        timeline,
      };
    }
  }
  return { engine: "sealed", lessonKey };
}
