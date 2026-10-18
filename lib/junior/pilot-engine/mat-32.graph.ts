import { JUNIOR_MAT_32, JUNIOR_MAT_32_SCENARIO } from "@/lib/junior/content/mat/32";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-32` köşegenler.
 * 10 cm köşegen 5 ve 5. 6 cm köşegen 3 ve 3.
 * İndirgeyici yarımını hesaplamaz.
 */
const example = JUNIOR_MAT_32_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "köşegenleri 10", "showAngle");

export const JR_06_MAT_32_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-32",
  title: JUNIOR_MAT_32_SCENARIO.title,
  listenText: JUNIOR_MAT_32.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-32.mp3",
  layout: "angle",
  stageTitle: "Köşegen",
  stageSubtitle: "Orta nokta",
  chapterTitle: "Eşit parçalar",
  exampleKeyframes: [
    {
      hook: "showAngle",
      offsetMs: 0,
      op: "SHOW_ANGLE",
      params: {
        kind: "diagonal",
        diagonalLong: 10,
        diagonalShort: 6,
        halfLong: 5,
        halfShort: 3,
        note: "birbirini ortalıyordur",
        marks: [
          { slot: "long", value: 10, atMs: 0 },
          { slot: "short", value: 6, atMs: 0 },
          { slot: "long-again", value: 10, atMs: 0 },
          { slot: "half-long-a", value: 5, atMs: 0 },
          { slot: "half-long-b", value: 5, atMs: 0 },
          { slot: "short-again", value: 6, atMs: 0 },
          { slot: "half-short-a", value: 3, atMs: 0 },
          { slot: "half-short-b", value: 3, atMs: 0 },
        ],
      },
    },
  ],
});
