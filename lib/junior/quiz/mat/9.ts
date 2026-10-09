import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (9/25). */
export const JUNIOR_MAT_QUIZ_9 = {
  lessonKey: "jr_06_mat-9",
  title: "Tam sayılar ve mutlak değer",
  tellGuides: [
    "Sayı doğrusunda sağdaki sayının neden daha büyük olduğunu anlatabilir misin?",
    "Mutlak değerin 0'a uzaklık olduğunu bir örnekle söyleyebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Mutlak değer neyi ölçer?",
      options: [
      "Sayının 0'a uzaklığını",
      "Sayının iki katını",
      "Yalnızca eksi işareti",
      "Paydayı",
      ],
      correctAnswerIndex: 0,
      hint: "Mutlak değer eksi çıkmaz; uzaklık pozitiftir.",
      explanation: "Adım 1: Mutlak değer, sayının 0'a uzaklığıdır. Adım 2: Uzaklık eksi olmaz. Adım 3: Eksi 4'ün mutlak değeri 4'tür.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Eksi 4'ün mutlak değeri kaçtır?",
      options: [
      "-4",
      "4",
      "0",
      "8",
      ],
      correctAnswerIndex: 1,
      hint: "0'a uzaklığı say; işaret uzaklıkta kalmaz.",
      explanation: "Adım 1: Eksi 4, 0'ın 4 birim solundadır. Adım 2: Uzaklık 4'tür. Adım 3: Mutlak değer 4'tür, eksi 4 değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Termometre eksi 3 dereceyi gösteriyor. 0'a uzaklık kaç derecedir?",
      options: [
      "3",
      "-3",
      "0",
      "6",
      ],
      correctAnswerIndex: 0,
      hint: "Mutlak değer sorusudur.",
      explanation: "Adım 1: Eksi 3, 0'ın 3 birim altındadır. Adım 2: Uzaklık 3'tür. Adım 3: Mutlak değer 3'tür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
