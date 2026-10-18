import { JUNIOR_FEN_38, JUNIOR_FEN_38_SCENARIO } from "@/lib/junior/content/fen/38";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_fen-38` yakıt grafiği.
 * 10 km yol, 2 litre yakıt, 1 km yürüyüş.
 * Baca ve Güneş paneli cümleleri parametredir. Organ çizimi yoktur.
 */
const example = JUNIOR_FEN_38_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "10 kilometrelik", "showFuel");

export const JR_06_FEN_38_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_fen-38",
  title: JUNIOR_FEN_38_SCENARIO.title,
  listenText: JUNIOR_FEN_38.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_fen-38.mp3",
  layout: "fuel",
  stageTitle: "Yakıt ve çevre",
  stageSubtitle: "Enerji ve baca",
  chapterTitle: "Yakıt ölçüsü",
  subject: "Fen Bilimleri",
  teacherName: "Deniz",
  teacherVoice: "Fenrir",
  exampleKeyframes: [
    {
      hook: "showFuel",
      offsetMs: 0,
      op: "SHOW_FUEL",
      params: {
        distanceKm: 10,
        fuelLitres: 2,
        walkKm: 1,
        cleanStack: "filtreli baca",
        dirtyStack: "filtresiz baca",
        alternate: "Güneş paneli",
        marks: [
          { slot: "distance", value: 10, atMs: 0 },
          { slot: "fuel", value: 2, atMs: 0 },
          { slot: "walk", value: 1, atMs: 0 },
        ],
      },
    },
  ],
});
