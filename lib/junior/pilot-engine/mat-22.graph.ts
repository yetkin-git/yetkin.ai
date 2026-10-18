import { JUNIOR_MAT_22, JUNIOR_MAT_22_SCENARIO } from "@/lib/junior/content/mat/22";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-22` alan birimleri.
 * 2 m kenar, 4 m², 40.000 cm². 3 dönüm = 3.000 m². 2 hektar = 20 dönüm.
 * İndirgeyici 10.000 ile çarpmaz.
 */
const example = JUNIOR_MAT_22_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Kenar uzunluğu 2", "showArea");

export const JR_06_MAT_22_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-22",
  title: JUNIOR_MAT_22_SCENARIO.title,
  listenText: JUNIOR_MAT_22.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-22.mp3",
  layout: "area",
  stageTitle: "Alan birimi",
  stageSubtitle: "Dönüm ve hektar",
  chapterTitle: "Arazi ölçüsü",
  exampleKeyframes: [
    {
      hook: "showArea",
      offsetMs: 0,
      op: "SHOW_AREA",
      params: {
        squareSide: 2,
        squareArea: 4,
        squareCm2: 40000,
        cm2PerM2: 10000,
        donumCount: 3,
        donumM2: 3000,
        hectareCount: 2,
        hectareDonum: 20,
        donumPerHectare: 10,
        unit: "m²",
        formula: "kenar × kenar",
        note: "metrekaredir",
        marks: [
          { slot: "side", value: 2, atMs: 0 },
          { slot: "side-b", value: 2, atMs: 0 },
          { slot: "side-c", value: 2, token: "2'den", atMs: 0 },
          { slot: "area", value: 4, atMs: 0 },
          { slot: "area-again", value: 4, atMs: 0 },
          { slot: "per-m2", value: 10000, token: "10.000'i", atMs: 0 },
          { slot: "cm2", value: 40000, token: "40.000", atMs: 0 },
          { slot: "donum", value: 3, atMs: 0 },
          { slot: "donum-factor", value: 3, atMs: 0 },
          { slot: "per-donum", value: 1000, token: "1.000'i", atMs: 0 },
          { slot: "donum-m2", value: 3000, token: "3.000", atMs: 0 },
          { slot: "hectare", value: 2, atMs: 0 },
          { slot: "hectare-donum", value: 20, atMs: 0 },
          { slot: "per-hectare", value: 10, atMs: 0 },
        ],
      },
    },
  ],
});
