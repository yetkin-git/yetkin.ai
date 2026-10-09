import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (12/20). */
export const JUNIOR_ING_QUIZ_12 = {
  lessonKey: "jr_06_ing_main-12",
  title: "Was ve were ile geçmiş tarih",
  tellGuides: [
    "Where were you yesterday? Answer in a full English sentence.",
    "When do we use was and when do we use were?",
    "Say one sentence with on Monday and one with in 2015.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Was hangi öznelerle kullanılır?",
      options: [
        "I, he, she, it",
        "You, we, they",
        "Yalnızca they",
        "Yalnızca we",
      ],
      correctAnswerIndex: 0,
      hint: "Was tekil; were çoğul ve you.",
      explanation: "Adım 1: Was tekil öznelerdedir. Adım 2: I/he/she/it was. Adım 3: You/we/they were'dir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru cümledir?",
      options: [
        "They were at the park yesterday",
        "They was at the park yesterday",
        "They are at the park yesterday",
        "They is at the park yesterday",
      ],
      correctAnswerIndex: 0,
      hint: "They ile were gelir.",
      explanation: "Adım 1: They çoğuldur. Adım 2: Geçmişte were kullanılır. Adım 3: They were at the park yesterday doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«I ___ born in 2014.» Boşluğa hangisi gelir?",
      options: [
        "was",
        "were",
        "am",
        "are",
      ],
      correctAnswerIndex: 0,
      hint: "I ile geçmişte was.",
      explanation: "Adım 1: Özne I'dır. Adım 2: Doğum yılı geçmiştedir. Adım 3: I was born in 2014 kalıbı doğrudur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
