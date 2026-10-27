import { JUNIOR_MAT_31, JUNIOR_MAT_31_SCENARIO } from "@/lib/junior/content/mat/15";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-15` iki kesenin dörtgeni.
 * Bir paralel çift yamuktur. İki çift paralelkenardır.
 * Örnek cümlede derece yoktur. İndirgeyici 360 yazmaz.
 */
const example = JUNIOR_MAT_31_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Alt ve üst kenar", "showAngle");

export const JR_06_MAT_31_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-15",
  title: JUNIOR_MAT_31_SCENARIO.title,
  listenText: JUNIOR_MAT_31.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-15.mp3",
  layout: "angle",
  stageTitle: "Dörtgen",
  stageSubtitle: "Yamuk ve paralelkenar",
  chapterTitle: "İki kesen",
  exampleKeyframes: [
    {
      hook: "showAngle",
      offsetMs: 0,
      op: "SHOW_ANGLE",
      params: {
        kind: "quad-pair",
        names: ["Yamuk", "Paralelkenar"],
        note: "yamuktur",
        marks: [],
      },
    },
  ],
});
