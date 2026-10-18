import { JUNIOR_MAT_33, JUNIOR_MAT_33_SCENARIO } from "@/lib/junior/content/mat/33";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-33` iç açılar.
 * Üçgen 50, 60, eksik 70, toplam 180. Dörtgen 80, 90, 100, eksik 90, toplam 360.
 * İndirgeyici toplamdan çıkarma yapmaz.
 */
const example = JUNIOR_MAT_33_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Bir üçgende", "showAngle");

export const JR_06_MAT_33_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-33",
  title: JUNIOR_MAT_33_SCENARIO.title,
  listenText: JUNIOR_MAT_33.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-33.mp3",
  layout: "angle",
  stageTitle: "İç açılar",
  stageSubtitle: "Üçgen ve dörtgen",
  chapterTitle: "Açı toplamı",
  exampleKeyframes: [
    {
      hook: "showAngle",
      offsetMs: 0,
      op: "SHOW_ANGLE",
      params: {
        kind: "interior",
        triangle: [50, 60, 70],
        triangleSum: 180,
        triangleMissing: 70,
        quadrilateral: [80, 90, 100, 90],
        quadrilateralSum: 360,
        quadrilateralKnown: 270,
        quadrilateralMissing: 90,
        note: "üçgende",
        marks: [
          { slot: "t1", value: 50, atMs: 0 },
          { slot: "t2", value: 60, atMs: 0 },
          { slot: "sum", value: 180, atMs: 0 },
          { slot: "t1b", value: 50, atMs: 0 },
          { slot: "t2b", value: 60, atMs: 0 },
          { slot: "known", value: 110, atMs: 0 },
          { slot: "sum-b", value: 180, atMs: 0 },
          { slot: "known-b", value: 110, atMs: 0 },
          { slot: "missing", value: 70, atMs: 0 },
          { slot: "q1", value: 80, atMs: 0 },
          { slot: "q2", value: 90, atMs: 0 },
          { slot: "q3", value: 100, atMs: 0 },
          { slot: "q-known", value: 270, atMs: 0 },
          { slot: "q-sum", value: 360, atMs: 0 },
          { slot: "q-known-b", value: 270, atMs: 0 },
          { slot: "q-missing", value: 90, atMs: 0 },
        ],
      },
    },
  ],
});
