import { JUNIOR_MAT_13, JUNIOR_MAT_13_SCENARIO } from "@/lib/junior/content/mat/9";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-9` kesirde çarpma ve bölme.
 * 1/2 × 1/2 = 1/4. 3/4 × 2 = 6/4, sade 3/2. 1/2 ÷ 1/4 = 2.
 * İndirgeyici ters çevirmeyi kendisi yapmaz.
 */
const example = JUNIOR_MAT_13_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Paylar 1", "showFraction");

export const JR_06_MAT_13_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-9",
  title: JUNIOR_MAT_13_SCENARIO.title,
  listenText: JUNIOR_MAT_13.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-9.mp3",
  layout: "fraction",
  stageTitle: "Çarpma ve bölme",
  stageSubtitle: "Pay payda ile çarpılır",
  chapterTitle: "Kesir işlemi",
  exampleKeyframes: [
    {
      hook: "showFraction",
      offsetMs: 0,
      op: "SHOW_FRACTION",
      params: {
        operation: "çarpma",
        leftNumerator: 1,
        leftDenominator: 2,
        rightNumerator: 1,
        rightDenominator: 2,
        resultNumerator: 1,
        resultDenominator: 4,
        productNumerator: 6,
        productDenominator: 4,
        simplifiedNumerator: 3,
        simplifiedDenominator: 2,
        quotient: 2,
        note: "ters çevirirsek",
        marks: [
          { slot: "pay", value: 1, atMs: 0 },
          { slot: "pay-b", value: 1, atMs: 0 },
          { slot: "pay-product", value: 1, atMs: 0 },
          { slot: "left-den", value: 2, atMs: 0 },
          { slot: "right-den", value: 2, atMs: 0 },
          { slot: "product-den", value: 4, atMs: 0 },
          { slot: "whole", value: 2, atMs: 0 },
          { slot: "unsimplified", value: 6, atMs: 0 },
          { slot: "simplified", value: 2, atMs: 0 },
          { slot: "divide", value: 2, atMs: 0 },
          { slot: "divide-again", value: 2, atMs: 0 },
          { slot: "quotient", value: 2, atMs: 0 },
        ],
      },
    },
  ],
});
