import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (8/20). */
export const JUNIOR_FEN_QUIZ_8 = {
  lessonKey: "jr_06_fen-8",
  title: "Boşaltım sistemi",
  tellGuides: [
    "Böbreklerin temel görevini anlatabilir misin?",
    "Deri ve akciğer boşaltıma nasıl yardım eder?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Kanı süzüp idrar oluşturan organ hangisidir?",
      options: [
      "Böbrek",
      "Kalp",
      "Göz",
      "Kulak",
      ],
      correctAnswerIndex: 0,
      hint: "İki tane, bel hizasındadır.",
      explanation: "Adım 1: Boşaltımın ana organı böbrektir. Adım 2: Böbrekler kanı süzer. Adım 3: Atıklarla birlikte idrar oluşur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "İdrarı bir süre depolayan yapı hangisidir?",
      options: [
      "İdrar kesesi",
      "Alveol",
      "Eklem",
      "Safra kesesi",
      ],
      correctAnswerIndex: 0,
      hint: "Depo organı mesanedir.",
      explanation: "Adım 1: Böbrekte oluşan idrar kanallarla iner. Adım 2: İdrar kesesinde (mesane) birikir. Adım 3: Uygun zamanda vücuttan atılır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sıcak günde terlemek boşaltım açısından neyi gösterir?",
      options: [
      "Derinin de boşaltıma yardımcı olduğunu",
      "Derinin yalnız ses ürettiğini",
      "Terin sindirim enzimi olduğunu",
      "Terin elektriği yalıttığını",
      ],
      correctAnswerIndex: 0,
      hint: "Boşaltım yalnız böbrek değildir.",
      explanation: "Adım 1: Ana boşaltım böbrekledir. Adım 2: Deri terle, akciğer solukla, kalın bağırsak dışkıyla yardımcı olur. Adım 3: Terlemek derinin boşaltıma katkısıdır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
