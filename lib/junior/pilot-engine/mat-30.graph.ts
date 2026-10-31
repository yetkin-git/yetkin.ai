import { juniorGraphLessonCopy } from "@/lib/junior/content-source";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_mat-14` paralel doğrular ve kesen.
 * İç açı 70°. Yöndeş 70°. İç ters 70°. Bütünler komşu 110°. Doğru açı 180°.
 * İndirgeyici 180 eksi 70 diye doldurmaz.
 */
const lessonCopy = juniorGraphLessonCopy("jr_06_mat-14");
const example = lessonCopy.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "Soldaki iç açı", "showAngle");

export const JR_06_MAT_30_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_mat-14",
  title: lessonCopy.title,
  listenText: lessonCopy.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_mat-14.mp3",
  layout: "angle",
  stageTitle: "Paralel ve kesen",
  stageSubtitle: "Yöndeş ve bütünler",
  chapterTitle: "Açı çiftleri",
  exampleKeyframes: [
    {
      hook: "showAngle",
      offsetMs: 0,
      op: "SHOW_ANGLE",
      params: {
        kind: "parallel",
        acute: 70,
        corresponding: 70,
        alternate: 70,
        supplementary: 110,
        straight: 180,
        complement: 0,
        adjacentLabel: "bütünler komşu",
        note: "yöndeş",
        marks: [
          { slot: "acute", value: 70, atMs: 0 },
          { slot: "corresponding", value: 70, atMs: 0 },
          { slot: "alternate", value: 70, atMs: 0 },
          { slot: "straight", value: 180, atMs: 0 },
          { slot: "straight-part", value: 70, atMs: 0 },
          { slot: "supplementary", value: 110, atMs: 0 },
        ],
      },
    },
  ],
});
