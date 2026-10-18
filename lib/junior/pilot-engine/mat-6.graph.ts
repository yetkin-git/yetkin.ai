import { JUNIOR_MAT_6, JUNIOR_MAT_6_SCENARIO } from "@/lib/junior/content/mat/6";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-6` asal çarpan grafiği.
 * İşlem: 12 = 2 × 2 × 3 ve 7'nin çarpanları yalnız 1 ile 7.
 * Çizici bu parametreleri okur. Sabit asal tablosu bu dosyada yoktur.
 */
const example = JUNIOR_MAT_6_SCENARIO.example.replace(/\s+/g, " ").trim();

const exampleMarked = insertSpeechHook(
  insertSpeechHook(example, "1 ve 7'dir", "stampSeven"),
  "2 çarpı 2 çarpı 3",
  "showTree",
);

export const JR_06_MAT_6_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-6",
  title: JUNIOR_MAT_6_SCENARIO.title,
  listenText: JUNIOR_MAT_6.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-6.mp3",
  layout: "prime-factor-tree",
  stageTitle: "Asal Sayılar",
  stageSubtitle: "Çarpan ağacı",
  chapterTitle: "Asal çarpan ağacı",
  exampleKeyframes: [
    {
      hook: "showTree",
      offsetMs: 0,
      op: "SHOW_PRIME_FACTOR_TREE",
      params: {
        composite: {
          number: 12,
          factors: [2, 2, 3],
          product: "2 × 2 × 3",
          branches: [
            { value: 2, atMs: 0 },
            { value: 2, atMs: 0 },
            { value: 3, atMs: 0 },
          ],
        },
      },
    },
    {
      hook: "stampSeven",
      offsetMs: 0,
      op: "SHOW_PRIME_FACTOR_TREE",
      params: {
        prime: {
          number: 7,
          factors: [1, 7],
          stamp: "asal",
          nodes: [
            { value: 1, atMs: 0 },
            { value: 7, atMs: 0 },
          ],
        },
      },
    },
  ],
});
