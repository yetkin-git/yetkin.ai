import timelineJson from "@/packages/junior-content/timelines/jr_06_mat-5.timeline.json";
import { JR_06_FEN_10_TIMELINE } from "@/lib/junior/pilot-engine/fen-10.graph";
import { JR_06_FEN_21_TIMELINE } from "@/lib/junior/pilot-engine/fen-21.graph";
import { JR_06_FEN_37_TIMELINE } from "@/lib/junior/pilot-engine/fen-37.graph";
import { JR_06_FEN_38_TIMELINE } from "@/lib/junior/pilot-engine/fen-38.graph";
import { JR_06_FEN_9_TIMELINE } from "@/lib/junior/pilot-engine/fen-9.graph";
import { JR_06_MAT_11_TIMELINE } from "@/lib/junior/pilot-engine/mat-11.graph";
import { JR_06_MAT_12_TIMELINE } from "@/lib/junior/pilot-engine/mat-12.graph";
import { JR_06_MAT_13_TIMELINE } from "@/lib/junior/pilot-engine/mat-13.graph";
import { JR_06_MAT_21_TIMELINE } from "@/lib/junior/pilot-engine/mat-21.graph";
import { JR_06_MAT_22_TIMELINE } from "@/lib/junior/pilot-engine/mat-22.graph";
import { JR_06_MAT_27_TIMELINE } from "@/lib/junior/pilot-engine/mat-27.graph";
import { JR_06_MAT_30_TIMELINE } from "@/lib/junior/pilot-engine/mat-30.graph";
import { JR_06_MAT_31_TIMELINE } from "@/lib/junior/pilot-engine/mat-31.graph";
import { JR_06_MAT_32_TIMELINE } from "@/lib/junior/pilot-engine/mat-32.graph";
import { JR_06_MAT_33_TIMELINE } from "@/lib/junior/pilot-engine/mat-33.graph";
import { JR_06_MAT_34_TIMELINE } from "@/lib/junior/pilot-engine/mat-34.graph";
import { JR_06_MAT_35_TIMELINE } from "@/lib/junior/pilot-engine/mat-35.graph";
import { JR_06_MAT_36_TIMELINE } from "@/lib/junior/pilot-engine/mat-36.graph";
import { JR_06_MAT_6_TIMELINE } from "@/lib/junior/pilot-engine/mat-6.graph";
import { JR_06_MAT_7_TIMELINE } from "@/lib/junior/pilot-engine/mat-7.graph";
import { JUNIOR_PILOT_PLAYBACK_LESSON_KEY } from "@/lib/junior/pilot-engine/playback-key";
import { timelineJsonSchema, type TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * Mühürlü PCM saati. Konuşma yazarı `mat-5.choreography.ts` dir.
 * Konuşma eşitliği `assertSealedPilotTimeline` ile `verify:junior-content` kapısındadır.
 * Taslak hece saati (`MAT_5_DRAFT_TIMELINE`) bu dosyayı okumaz.
 * Grafik saati dersleri bu JSON'u okumaz.
 */
export const JR_06_MAT_5_TIMELINE: TimelineJSON = timelineJsonSchema.parse(timelineJson);

const GRAPH_TIMELINES: Readonly<Record<string, TimelineJSON>> = {
  "jr_06_mat-6": JR_06_MAT_6_TIMELINE,
  "jr_06_mat-7": JR_06_MAT_7_TIMELINE,
  "jr_06_mat-11": JR_06_MAT_11_TIMELINE,
  "jr_06_mat-12": JR_06_MAT_12_TIMELINE,
  "jr_06_mat-13": JR_06_MAT_13_TIMELINE,
  "jr_06_mat-21": JR_06_MAT_21_TIMELINE,
  "jr_06_mat-22": JR_06_MAT_22_TIMELINE,
  "jr_06_mat-27": JR_06_MAT_27_TIMELINE,
  "jr_06_mat-30": JR_06_MAT_30_TIMELINE,
  "jr_06_mat-31": JR_06_MAT_31_TIMELINE,
  "jr_06_mat-32": JR_06_MAT_32_TIMELINE,
  "jr_06_mat-33": JR_06_MAT_33_TIMELINE,
  "jr_06_mat-34": JR_06_MAT_34_TIMELINE,
  "jr_06_mat-35": JR_06_MAT_35_TIMELINE,
  "jr_06_mat-36": JR_06_MAT_36_TIMELINE,
  "jr_06_fen-9": JR_06_FEN_9_TIMELINE,
  "jr_06_fen-10": JR_06_FEN_10_TIMELINE,
  "jr_06_fen-21": JR_06_FEN_21_TIMELINE,
  "jr_06_fen-37": JR_06_FEN_37_TIMELINE,
  "jr_06_fen-38": JR_06_FEN_38_TIMELINE,
};

export function getPilotTimelineForLesson(lessonKey: string): TimelineJSON | null {
  if (lessonKey === JUNIOR_PILOT_PLAYBACK_LESSON_KEY) {
    return JR_06_MAT_5_TIMELINE;
  }
  return GRAPH_TIMELINES[lessonKey] ?? null;
}
