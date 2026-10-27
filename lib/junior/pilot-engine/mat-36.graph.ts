import { JUNIOR_MAT_36, JUNIOR_MAT_36_SCENARIO } from "@/lib/junior/content/mat/22";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-22` merkez açı ve yay.
 * 90° açı 90° yay görür. Tam tur 360°, yarım 180°, dilim 60°, pay 6.
 * Dereceler bu grafikten okunur.
 */
const example = JUNIOR_MAT_36_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Merkez açı 90", "showArc");

export const JR_06_MAT_36_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-22",
  title: JUNIOR_MAT_36_SCENARIO.title,
  listenText: JUNIOR_MAT_36.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-22.mp3",
  layout: "circle-measure",
  stageTitle: "Merkez açı",
  stageSubtitle: "Yay ölçüsü",
  chapterTitle: "Merkez açı",
  exampleKeyframes: [
    {
      hook: "showArc",
      offsetMs: 0,
      op: "SHOW_CIRCLE",
      params: {
        centralAngle: 90,
        arcMeasure: 90,
        fullTurn: 360,
        semicircle: 180,
        slice: 60,
        parts: 6,
        marks: [
          { slot: "angle", value: 90, atMs: 0 },
          { slot: "arc", value: 90, atMs: 0 },
          { slot: "full", value: 360, atMs: 0 },
          { slot: "half", value: 180, atMs: 0 },
          { slot: "slice", value: 60, atMs: 0 },
          { slot: "slice-repeat", value: 60, atMs: 0 },
          { slot: "full-repeat", value: 360, atMs: 0 },
          { slot: "divisor", value: 60, atMs: 0 },
          { slot: "parts", value: 6, atMs: 0 },
        ],
      },
    },
  ],
});
