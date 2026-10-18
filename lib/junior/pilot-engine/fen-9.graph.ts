import { JUNIOR_FEN_9, JUNIOR_FEN_9_SCENARIO } from "@/lib/junior/content/fen/9";
import { buildLessonGraphTimeline, insertSpeechHook } from "@/lib/junior/pilot-engine/graph-clock";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";

/**
 * `jr_06_fen-9` bileşke kuvvet.
 * 5 N + 3 N = 8 N sağa. 7 N − 4 N = 3 N sağa. 6 N ve 6 N, bileşke 0.
 * 8 N − 2 N = 6 N sağa. İndirgeyici newtonları toplamaz.
 */
const example = JUNIOR_FEN_9_SCENARIO.example.replace(/\s+/g, " ").trim();
const exampleMarked = insertSpeechHook(example, "5 newton", "showForce");

export const JR_06_FEN_9_TIMELINE: TimelineJSON = buildLessonGraphTimeline({
  lessonKey: "jr_06_fen-9",
  title: JUNIOR_FEN_9_SCENARIO.title,
  listenText: JUNIOR_FEN_9.listenText,
  example,
  exampleMarked,
  audioPath: "/media/junior/audio/jr_06_fen-9.mp3",
  layout: "force",
  stageTitle: "Bileşke kuvvet",
  stageSubtitle: "Yön ve newton",
  chapterTitle: "Kuvvet",
  subject: "Fen Bilimleri",
  teacherName: "Deniz",
  teacherVoice: "Fenrir",
  exampleKeyframes: [
    {
      hook: "showForce",
      offsetMs: 0,
      op: "SHOW_FORCE",
      params: {
        unit: "N",
        sameA: 5,
        sameB: 3,
        sameResult: 8,
        sameWay: "sağa",
        oppositeA: 7,
        oppositeB: 4,
        oppositeResult: 3,
        oppositeWay: "sağa",
        balanceA: 6,
        balanceB: 6,
        balanceResult: 0,
        showBalance: true,
        unbalancedA: 8,
        unbalancedB: 2,
        unbalancedResult: 6,
        unbalancedWay: "sağa",
        note: "dengelenmiştir",
        marks: [
          { slot: "same-a", value: 5, atMs: 0 },
          { slot: "same-b", value: 3, atMs: 0 },
          { slot: "same-a2", value: 5, atMs: 0 },
          { slot: "same-b2", value: 3, atMs: 0 },
          { slot: "same-result", value: 8, atMs: 0 },
          { slot: "opp-a", value: 7, atMs: 0 },
          { slot: "opp-b", value: 4, atMs: 0 },
          { slot: "opp-a2", value: 7, atMs: 0 },
          { slot: "opp-b2", value: 4, atMs: 0 },
          { slot: "opp-result", value: 3, atMs: 0 },
          { slot: "bal-a", value: 6, atMs: 0 },
          { slot: "bal-b", value: 6, atMs: 0 },
          { slot: "bal-result", value: 0, token: "sıfır", atMs: 0 },
          { slot: "unbal-a", value: 8, atMs: 0 },
          { slot: "unbal-b", value: 2, atMs: 0 },
          { slot: "unbal-result", value: 6, atMs: 0 },
        ],
      },
    },
  ],
});
