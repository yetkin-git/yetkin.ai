import { JUNIOR_FEN_10, JUNIOR_FEN_10_SCENARIO } from "@/lib/junior/content/fen/10";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_fen-10` sabit sürat.
 * 120 m / 40 s = 3 m/s. 10 s sonra 30 m. 20 s sonra 60 m. 100 m / 20 s = 5 m/s.
 * İndirgeyici yolu zamana bölmez.
 */
const example = JUNIOR_FEN_10_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "120 metre", "showSpeed");

export const JR_06_FEN_10_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_fen-10",
  title: JUNIOR_FEN_10_SCENARIO.title,
  listenText: JUNIOR_FEN_10.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_fen-10.mp3",
  layout: "speed",
  stageTitle: "Sabit sürat",
  stageSubtitle: "Yol bölü zaman",
  chapterTitle: "Sürat",
  subject: "Fen Bilimleri",
  teacherName: "Deniz",
  teacherVoice: "Fenrir",
  exampleKeyframes: [
    {
      hook: "showSpeed",
      offsetMs: 0,
      op: "SHOW_SPEED",
      params: {
        distance: 120,
        time: 40,
        speed: 3,
        distanceUnit: "m",
        timeUnit: "s",
        speedUnit: "m/s",
        spanDistance: 30,
        spanTime: 10,
        laterDistance: 60,
        laterTime: 20,
        otherDistance: 100,
        otherTime: 20,
        otherSpeed: 5,
        note: "bölü",
        marks: [
          { slot: "distance", value: 120, atMs: 0 },
          { slot: "time", value: 40, atMs: 0 },
          { slot: "speed", value: 3, atMs: 0 },
          { slot: "span-time", value: 10, atMs: 0 },
          { slot: "span-distance", value: 30, atMs: 0 },
          { slot: "later-time", value: 20, atMs: 0 },
          { slot: "later-distance", value: 60, atMs: 0 },
          { slot: "other-distance", value: 100, atMs: 0 },
          { slot: "other-time", value: 20, atMs: 0 },
          { slot: "other-speed", value: 5, atMs: 0 },
        ],
      },
    },
  ],
});
