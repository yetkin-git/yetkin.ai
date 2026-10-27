import { JUNIOR_MAT_11, JUNIOR_MAT_11_SCENARIO } from "@/lib/junior/content/mat/7";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-7` aynı paydada toplama.
 * 1/4 + 2/4 = 3/4. Payda 4 kalır. Pizza 8 dilimde 3.
 * İndirgeyici payları toplamaz.
 */
const example = JUNIOR_MAT_11_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Paylar 1", "showFraction");

export const JR_06_MAT_11_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-7",
  title: JUNIOR_MAT_11_SCENARIO.title,
  listenText: JUNIOR_MAT_11.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-7.mp3",
  layout: "fraction",
  stageTitle: "Aynı payda",
  stageSubtitle: "Paylar toplanır",
  chapterTitle: "Payda sabit",
  exampleKeyframes: [
    {
      hook: "showFraction",
      offsetMs: 0,
      op: "SHOW_FRACTION",
      params: {
        operation: "toplama",
        leftNumerator: 1,
        leftDenominator: 4,
        rightNumerator: 2,
        rightDenominator: 4,
        resultNumerator: 3,
        resultDenominator: 4,
        differenceNumerator: 2,
        differenceDenominator: 4,
        parts: 8,
        filled: 3,
        note: "sabit kalır",
        marks: [
          { slot: "left", value: 1, atMs: 0 },
          { slot: "right", value: 2, token: "2'dir", atMs: 0 },
          { slot: "sum-left", value: 1, atMs: 0 },
          { slot: "sum-right", value: 2, atMs: 0 },
          { slot: "result", value: 3, atMs: 0 },
          { slot: "den", value: 4, atMs: 0 },
          { slot: "diff-left", value: 3, atMs: 0 },
          { slot: "diff-right", value: 1, atMs: 0 },
          { slot: "diff", value: 2, atMs: 0 },
          { slot: "parts", value: 8, atMs: 0 },
        ],
      },
    },
  ],
});
