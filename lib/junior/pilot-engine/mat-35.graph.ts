import { JUNIOR_MAT_35, JUNIOR_MAT_35_SCENARIO } from "@/lib/junior/content/mat/21";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-21` çember yol problemi.
 * Çap 2 m, yarıçap 1 m, bir tur 6,28 m, iki tur 12,56 m.
 * Sayılar bu grafikten okunur.
 */
const example = JUNIOR_MAT_35_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "çapı 2", "showWheel");

export const JR_06_MAT_35_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-21",
  title: JUNIOR_MAT_35_SCENARIO.title,
  listenText: JUNIOR_MAT_35.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-21.mp3",
  layout: "circle-measure",
  stageTitle: "Çember yolu",
  stageSubtitle: "Tur ve çevre",
  chapterTitle: "Tekerlek turu",
  exampleKeyframes: [
    {
      hook: "showWheel",
      offsetMs: 0,
      op: "SHOW_CIRCLE",
      params: {
        radius: 1,
        diameter: 2,
        pi: 3.14,
        circumference: 6.28,
        unit: "m",
        formula: "2πr",
        relation: "R = 2r",
        turns: 2,
        distance: 12.56,
        marks: [
          { slot: "diameter", value: 2, atMs: 0 },
          { slot: "factor", value: 2, atMs: 0 },
          { slot: "pi-approx", value: 3, atMs: 0 },
          { slot: "circ-approx", value: 6, atMs: 0 },
          { slot: "pi", value: 3.14, token: "3,14", atMs: 0 },
          { slot: "circumference", value: 6.28, token: "6,28", atMs: 0 },
          { slot: "turns", value: 2, token: "İki", atMs: 0 },
          { slot: "distance", value: 12.56, token: "12,56", atMs: 0 },
          { slot: "radius", value: 1, atMs: 0 },
          { slot: "diameter-repeat", value: 2, atMs: 0 },
        ],
      },
    },
  ],
});
