import { JUNIOR_MAT_7, JUNIOR_MAT_7_SCENARIO } from "@/lib/junior/content/mat/3";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-3` ortak bölen grafiği.
 * Parametre: 8 ve 12. Ortak bölenler 1, 2 ve 4. Ortak katlar 24'te buluşur.
 * Sayılar bu grafikten okunur.
 */
const example = JUNIOR_MAT_7_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "8 ve 12", "showCompare");

export const JR_06_MAT_7_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-3",
  title: JUNIOR_MAT_7_SCENARIO.title,
  listenText: JUNIOR_MAT_7.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-3.mp3",
  layout: "common-divisor",
  stageTitle: "Ortak bölen ve ortak kat",
  stageSubtitle: "8 ve 12",
  chapterTitle: "Ortak bölen",
  exampleKeyframes: [
    {
      hook: "showCompare",
      offsetMs: 0,
      op: "SHOW_COMMON_DIVISOR",
      params: {
        left: 8,
        right: 12,
        leftDivisors: [1, 2, 4, 8],
        rightDivisors: [1, 2, 3, 4, 6, 12],
        commonDivisors: [1, 2, 4],
        gcd: 4,
        leftMultiples: [8, 16, 24, 32],
        rightMultiples: [12, 24, 36],
        lcm: 24,
        marks: [
          { slot: "pair", value: 8, atMs: 0 },
          { slot: "pair", value: 12, atMs: 0 },
          { slot: "left-div", value: 1, atMs: 0 },
          { slot: "left-div", value: 2, atMs: 0 },
          { slot: "left-div", value: 4, atMs: 0 },
          { slot: "left-div", value: 8, token: "8'dir", atMs: 0 },
          { slot: "right-div", value: 1, atMs: 0 },
          { slot: "right-div", value: 2, atMs: 0 },
          { slot: "right-div", value: 3, atMs: 0 },
          { slot: "right-div", value: 4, atMs: 0 },
          { slot: "right-div", value: 6, atMs: 0 },
          { slot: "right-div", value: 12, token: "12'dir", atMs: 0 },
          { slot: "common", value: 1, atMs: 0 },
          { slot: "common", value: 2, atMs: 0 },
          { slot: "common", value: 4, token: "4'tür", atMs: 0 },
          { slot: "gcd", value: 4, token: "4'tür", atMs: 0 },
          { slot: "left-mult", value: 8, atMs: 0 },
          { slot: "left-mult", value: 16, atMs: 0 },
          { slot: "left-mult", value: 24, atMs: 0 },
          { slot: "left-mult", value: 32, token: "32'dir", atMs: 0 },
          { slot: "right-mult", value: 12, atMs: 0 },
          { slot: "right-mult", value: 24, atMs: 0 },
          { slot: "right-mult", value: 36, token: "36'dır", atMs: 0 },
          { slot: "lcm", value: 24, token: "24'tür", atMs: 0 },
        ],
      },
    },
  ],
});
