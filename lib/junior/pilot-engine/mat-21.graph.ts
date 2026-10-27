import { JUNIOR_MAT_21, JUNIOR_MAT_21_SCENARIO } from "@/lib/junior/content/mat/19";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-19` paralelkenar ve üçgen alanı.
 * Taban 8, yükseklik 5, alan 40. Üçgen 20. Eğik kenar 6 yükseklik değildir.
 * İndirgeyici taban ile yüksekliği çarpmaz.
 */
const example = JUNIOR_MAT_21_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Tabanı 8", "showArea");

export const JR_06_MAT_21_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-19",
  title: JUNIOR_MAT_21_SCENARIO.title,
  listenText: JUNIOR_MAT_21.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-19.mp3",
  layout: "area",
  stageTitle: "Alan",
  stageSubtitle: "Taban ve yükseklik",
  chapterTitle: "Alan hesabı",
  exampleKeyframes: [
    {
      hook: "showArea",
      offsetMs: 0,
      op: "SHOW_AREA",
      params: {
        base: 8,
        height: 5,
        slant: 6,
        parallelogram: 40,
        triangle: 20,
        divisor: 2,
        unit: "cm²",
        formula: "taban × yükseklik",
        note: "dik yükseklik değildir",
        marks: [
          { slot: "base", value: 8, atMs: 0 },
          { slot: "height", value: 5, atMs: 0 },
          { slot: "base-again", value: 8, atMs: 0 },
          { slot: "height-product", value: 5, token: "5'ten", atMs: 0 },
          { slot: "parallelogram", value: 40, atMs: 0 },
          { slot: "half-source", value: 40, token: "40'ın", atMs: 0 },
          { slot: "triangle", value: 20, atMs: 0 },
          { slot: "slant", value: 6, atMs: 0 },
          { slot: "height-true", value: 5, atMs: 0 },
        ],
      },
    },
  ],
});
