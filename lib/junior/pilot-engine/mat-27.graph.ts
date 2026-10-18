import { JUNIOR_MAT_27, JUNIOR_MAT_27_SCENARIO } from "@/lib/junior/content/mat/27";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-27` uzunluk sayı doğrusu.
 * 250 cm = 2,5 m. 3 km = 3000 m. 40 mm = 4 cm.
 * İndirgeyici birimi kendisi çevirmez.
 */
const example = JUNIOR_MAT_27_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "250 santimetre", "showLine");

export const JR_06_MAT_27_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-27",
  title: JUNIOR_MAT_27_SCENARIO.title,
  listenText: JUNIOR_MAT_27.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-27.mp3",
  layout: "number-line",
  stageTitle: "Uzunluk doğrusu",
  stageSubtitle: "Birim konumu",
  chapterTitle: "Sayı doğrusu",
  exampleKeyframes: [
    {
      hook: "showLine",
      offsetMs: 0,
      op: "SHOW_NUMBER_LINE",
      params: {
        unit: "cm",
        focus: 250,
        focusLabel: "250 cm = 2,5 m",
        relations: ["100 cm = 1 m", "1 km = 1000 m", "10 mm = 1 cm", "40 mm = 4 cm", "3 km = 3000 m"],
        marks: [
          { slot: "cm", value: 250, atMs: 0 },
          { slot: "per-m", value: 100, atMs: 0 },
          { slot: "one-m", value: 1, atMs: 0 },
          { slot: "cm-again", value: 250, atMs: 0 },
          { slot: "metres", value: 2, atMs: 0 },
          { slot: "cm-rest", value: 50, atMs: 0 },
          { slot: "decimal", value: 2.5, token: "2,5", atMs: 0 },
          { slot: "km", value: 3, atMs: 0 },
          { slot: "metres-from-km", value: 3000, atMs: 0 },
          { slot: "mm", value: 40, atMs: 0 },
          { slot: "cm-from-mm", value: 4, atMs: 0 },
          { slot: "mm-per-cm", value: 10, atMs: 0 },
          { slot: "one-cm", value: 1, atMs: 0 },
        ],
      },
    },
  ],
});
