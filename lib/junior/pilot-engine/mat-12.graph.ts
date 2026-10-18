import { JUNIOR_MAT_12, JUNIOR_MAT_12_SCENARIO } from "@/lib/junior/content/mat/12";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-12` denk kesir.
 * 1/2 + 1/4. Ortak payda 4. Denk kesir 2/4. Toplam 3/4. Fark 1/4.
 * İndirgeyici paydayı genişletmez.
 */
const example = JUNIOR_MAT_12_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Paydalar 2", "showFraction");

export const JR_06_MAT_12_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-12",
  title: JUNIOR_MAT_12_SCENARIO.title,
  listenText: JUNIOR_MAT_12.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-12.mp3",
  layout: "fraction",
  stageTitle: "Denk kesir",
  stageSubtitle: "Paydayı eşitle",
  chapterTitle: "Ortak payda",
  exampleKeyframes: [
    {
      hook: "showFraction",
      offsetMs: 0,
      op: "SHOW_FRACTION",
      params: {
        operation: "denk",
        leftNumerator: 1,
        leftDenominator: 2,
        rightNumerator: 1,
        rightDenominator: 4,
        equivalentNumerator: 2,
        equivalentDenominator: 4,
        resultNumerator: 3,
        resultDenominator: 4,
        differenceNumerator: 1,
        differenceDenominator: 4,
        note: "ortak payda",
        marks: [
          { slot: "paydalar", value: 2, atMs: 0 },
          { slot: "paydalar-den", value: 4, token: "4'tür", atMs: 0 },
          { slot: "common-count", value: 4, atMs: 0 },
          { slot: "factor-source", value: 2, token: "2'nin", atMs: 0 },
          { slot: "common", value: 4, atMs: 0 },
          { slot: "expand-source", value: 2, atMs: 0 },
          { slot: "expand-by", value: 2, atMs: 0 },
          { slot: "equiv-den", value: 4, atMs: 0 },
          { slot: "sum-pay", value: 2, atMs: 0 },
          { slot: "sum-other", value: 1, atMs: 0 },
          { slot: "result", value: 3, atMs: 0 },
          { slot: "result-den", value: 4, atMs: 0 },
          { slot: "diff-start", value: 3, atMs: 0 },
        ],
      },
    },
  ],
});
