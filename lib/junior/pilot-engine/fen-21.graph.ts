import { JUNIOR_FEN_21, JUNIOR_FEN_21_SCENARIO } from "@/lib/junior/content/fen/21";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_fen-21` alınan yol ve yer değiştirme.
 * Tur 400 m, yer değiştirme 0. 80 m doğu ve 30 m batı: yol 110 m, net 50 m doğu.
 * Koridor 120 m. İndirgeyici farkı almaz.
 */
const example = JUNIOR_FEN_21_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "400 metre", "showSpeed");

export const JR_06_FEN_21_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_fen-21",
  title: JUNIOR_FEN_21_SCENARIO.title,
  listenText: JUNIOR_FEN_21.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_fen-21.mp3",
  layout: "speed",
  stageTitle: "Yol ve yer değiştirme",
  stageSubtitle: "İz ve net uzaklık",
  chapterTitle: "Yer değiştirme",
  subject: "Fen Bilimleri",
  teacherName: "Deniz",
  teacherVoice: "Fenrir",
  exampleKeyframes: [
    {
      hook: "showSpeed",
      offsetMs: 0,
      op: "SHOW_SPEED",
      params: {
        path: 400,
        displacement: 0,
        showDisplacement: true,
        pathSum: 110,
        displacementNet: 50,
        direction: "doğu",
        straight: 120,
        distanceUnit: "m",
        note: "yer değiştirme",
        marks: [
          { slot: "loop", value: 400, atMs: 0 },
          { slot: "loop-again", value: 400, atMs: 0 },
          { slot: "back", value: 0, atMs: 0 },
          { slot: "east", value: 80, atMs: 0 },
          { slot: "west", value: 30, atMs: 0 },
          { slot: "east-b", value: 80, atMs: 0 },
          { slot: "west-b", value: 30, atMs: 0 },
          { slot: "path-sum", value: 110, atMs: 0 },
          { slot: "east-c", value: 80, atMs: 0 },
          { slot: "west-c", value: 30, atMs: 0 },
          { slot: "net", value: 50, atMs: 0 },
          { slot: "straight", value: 120, atMs: 0 },
          { slot: "straight-again", value: 120, atMs: 0 },
        ],
      },
    },
  ],
});
