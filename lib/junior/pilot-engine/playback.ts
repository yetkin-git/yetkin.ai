import { isLockedTimeline } from "@/lib/junior/pilot-engine/acoustic-timeline-store";
import { getPilotTimelineForLesson } from "@/lib/junior/pilot-engine/mat-5-timeline-loader";
import {
  JUNIOR_PILOT_PLAYBACK_LESSON_KEY,
  isJuniorPilotPlaybackLesson,
} from "@/lib/junior/pilot-engine/playback-key";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

export { JUNIOR_PILOT_PLAYBACK_LESSON_KEY, isJuniorPilotPlaybackLesson };

export type JuniorPlaybackResolution =
  | {
      engine: "pilot";
      lessonKey: string;
      timeline: TimelineJSON;
    }
  | { engine: "sealed"; lessonKey: string };

/**
 * Tek oynatma kapısı.
 * Sunucudan `preloadedTimeline` prop olarak iletildiğinde doğrudan onu kullanır;
 * verilmemişse (birim testleri / sunucu çağrıları) `getPilotTimelineForLesson` ile çözümler.
 */
export function resolveJuniorPlayback(
  lessonKey: string,
  preloadedTimeline?: TimelineJSON | null,
): JuniorPlaybackResolution {
  const timeline =
    preloadedTimeline !== undefined ? preloadedTimeline : getPilotTimelineForLesson(lessonKey);
  if (!timeline || timeline.lessonKey !== lessonKey) {
    return { engine: "sealed", lessonKey };
  }
  if (isJuniorPilotPlaybackLesson(lessonKey) || isLockedTimeline(timeline)) {
    return {
      engine: "pilot",
      lessonKey,
      timeline,
    };
  }
  return { engine: "sealed", lessonKey };
}
