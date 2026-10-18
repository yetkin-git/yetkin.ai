import { JUNIOR_FEN_37, JUNIOR_FEN_37_SCENARIO } from "@/lib/junior/content/fen/37";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_fen-37` biyoçeşitlilik grafiği.
 * 12 kuş türü, 30 bitki türü, kesimden sonra 4 tür ayrılır.
 * Organ çizimi bu derste yoktur.
 */
const example = JUNIOR_FEN_37_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "12 kuş", "showHabitat");

export const JR_06_FEN_37_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_fen-37",
  title: JUNIOR_FEN_37_SCENARIO.title,
  listenText: JUNIOR_FEN_37.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_fen-37.mp3",
  layout: "habitat",
  stageTitle: "Biyoçeşitlilik",
  stageSubtitle: "Tür ve tehdit",
  chapterTitle: "Tür sayımı",
  subject: "Fen Bilimleri",
  teacherName: "Deniz",
  teacherVoice: "Fenrir",
  exampleKeyframes: [
    {
      hook: "showHabitat",
      offsetMs: 0,
      op: "SHOW_HABITAT",
      params: {
        birds: 12,
        plants: 30,
        birdsLost: 4,
        threats: ["Ağaçların yarısı kesilirse", "Dereye bırakılan atık"],
        protection: "dereyi temiz tutan",
        marks: [
          { slot: "birds", value: 12, atMs: 0 },
          { slot: "plants", value: 30, atMs: 0 },
          { slot: "lost", value: 4, token: "4'ü", atMs: 0 },
        ],
      },
    },
  ],
});
