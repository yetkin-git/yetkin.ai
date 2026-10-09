import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (6/20). */
export const JUNIOR_ING_QUIZ_6 = {
  lessonKey: "jr_06_ing_main-6",
  title: "Bigger ve cheaper ile karşılaştırma",
  tellGuides: [
    "Compare two shops using bigger, cheaper, or more expensive.",
    "When do we use -er and when do we use more?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Kısa sıfatlarla karşılaştırma nasıl yapılır?",
      options: [
        "Sıfata -er eklenir ve than kullanılır",
        "Sıfata -ing eklenir",
        "Sıfat silinir",
        "Yalnızca was kullanılır",
      ],
      correctAnswerIndex: 0,
      hint: "Big → bigger than.",
      explanation: "Adım 1: Kısa sıfat -er alır. Adım 2: Than kıyaslar. Adım 3: Bigger than doğru kalıptır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru karşılaştırmadır?",
      options: [
        "This bag is cheaper than that bag",
        "This bag is cheap than that bag",
        "This bag more cheap that bag",
        "This bag cheapest than bag",
      ],
      correctAnswerIndex: 0,
      hint: "Cheap → cheaper than.",
      explanation: "Adım 1: Cheap kısa sıfattır. Adım 2: Cheaper + than gerekir. Adım 3: This bag is cheaper than that bag doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Shop A: 50 TL. Shop B: 80 TL. Hangisi doğru cümledir?",
      options: [
        "Shop A is cheaper than Shop B",
        "Shop A is more expensive than Shop B",
        "Shop B is cheaper than Shop A",
        "The prices are the same",
      ],
      correctAnswerIndex: 0,
      hint: "50, 80'den küçüktür.",
      explanation: "Adım 1: 50 < 80. Adım 2: Daha ucuz = cheaper. Adım 3: Shop A is cheaper than Shop B doğrudur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
