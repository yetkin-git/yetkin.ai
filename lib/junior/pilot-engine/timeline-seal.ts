import {
  MAT_5_AUTHORED_CUES,
  parseMarkedCueText,
} from "@/lib/junior/pilot-engine/mat-5.choreography";
import { JUNIOR_PILOT_PLAYBACK_LESSON_KEY } from "@/lib/junior/pilot-engine/playback-key";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * Mühürlü zaman çizelgesinin konuşması yazar koreografiden kopmuşsa fırlatır.
 * Saat (milisaniye) PCM fırınınındır; bu kapı saati yeniden yazmaz.
 */
export function assertSealedPilotTimeline(timeline: TimelineJSON): void {
  if (timeline.lessonKey !== JUNIOR_PILOT_PLAYBACK_LESSON_KEY) {
    throw new Error("Pilot zaman çizelgesi ders anahtarı yazarlıkla uyuşmuyor.");
  }
  if (timeline.cues.length !== MAT_5_AUTHORED_CUES.length) {
    throw new Error("Pilot zaman çizelgesi sekans sayısı yazarlıkla uyuşmuyor.");
  }
  for (let index = 0; index < MAT_5_AUTHORED_CUES.length; index += 1) {
    const spec = MAT_5_AUTHORED_CUES[index];
    const cue = timeline.cues[index];
    if (!spec || !cue) {
      throw new Error("Pilot zaman çizelgesi sekansı eksik.");
    }
    const clean = parseMarkedCueText(spec.markedText).cleanText;
    if (cue.id !== spec.id || cue.chapterId !== spec.chapterId || cue.text !== clean) {
      throw new Error(`Pilot zaman çizelgesi ${spec.id} konuşması yazarlıktan koptu.`);
    }
  }
}

/** Taslak hece saati mühürlü PCM saatinin yerine geçmişse doğrudur. */
export function pilotTimelineUsesDraftClock(sealed: TimelineJSON, draft: TimelineJSON): boolean {
  if (sealed.cues.length === 0 || sealed.cues.length !== draft.cues.length) {
    return false;
  }
  return sealed.cues.every((cue, index) => {
    const other = draft.cues[index];
    return Boolean(other && cue.startMs === other.startMs && cue.endMs === other.endMs);
  });
}
