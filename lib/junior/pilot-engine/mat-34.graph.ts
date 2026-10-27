import { JUNIOR_MAT_34, JUNIOR_MAT_34_SCENARIO } from "@/lib/junior/content/mat/20";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-20` çember ölçüsü.
 * Yarıçap 5 cm, çap 10 cm, π 3,14, çevre 2πr = 31,4 cm.
 * Sayılar bu grafikten okunur. `CircleGeoScene` bu dersi çizmez.
 */
const example = JUNIOR_MAT_34_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Çapı 10", "showCircle");

export const JR_06_MAT_34_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-20",
  title: JUNIOR_MAT_34_SCENARIO.title,
  listenText: JUNIOR_MAT_34.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-20.mp3",
  layout: "circle-measure",
  stageTitle: "Çember uzunluğu",
  stageSubtitle: "Çap ve yarıçap",
  chapterTitle: "Çember ölçüsü",
  exampleKeyframes: [
    {
      hook: "showCircle",
      offsetMs: 0,
      op: "SHOW_CIRCLE",
      params: {
        radius: 5,
        diameter: 10,
        pi: 3.14,
        circumference: 31.4,
        unit: "cm",
        formula: "2πr",
        relation: "R = 2r",
        marks: [
          { slot: "diameter", value: 10, atMs: 0 },
          { slot: "product", value: 10, atMs: 0 },
          { slot: "pi-approx", value: 3, atMs: 0 },
          { slot: "circ-approx", value: 30, atMs: 0 },
          { slot: "pi", value: 3.14, token: "3,14", atMs: 0 },
          { slot: "circumference", value: 31.4, token: "31,4", atMs: 0 },
          { slot: "radius", value: 5, atMs: 0 },
          { slot: "half-source", value: 10, token: "10'un", atMs: 0 },
          { slot: "half", value: 5, token: "5'tir", atMs: 0 },
        ],
      },
    },
  ],
});
