import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (24/25). */
export const JUNIOR_MAT_QUIZ_24 = {
  lessonKey: "jr_06_mat-24",
  title: "Prizmalar ve hacim",
  tellGuides: [
    "Dikdörtgenler prizmasının hacmini nasıl bulduğunu anlatabilir misin?",
    "İki kenarın çarpımının neden yalnız taban alanı olduğunu söyleyebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Dikdörtgenler prizmasının hacmi nasıl bulunur?",
      options: [
      "Üç uzunluğun çarpımı",
      "Yalnızca iki kenarın çarpımı",
      "Kenarların toplamı",
      "Yüzey alanı",
      ],
      correctAnswerIndex: 0,
      hint: "en × boy × yükseklik.",
      explanation: "Adım 1: Hacim üç uzunluğun çarpımıdır. Adım 2: İki kenarın çarpımı yalnız taban alanıdır. Adım 3: Birim cm³'tür.",
    },
    {
      id: "q2",
      level: "apply",
      question: "4 cm, 3 cm ve 2 cm'lik kutunun hacmi kaç cm³'tür?",
      options: [
      "24",
      "12",
      "9",
      "14",
      ],
      correctAnswerIndex: 0,
      hint: "4 çarpı 3 çarpı 2.",
      explanation: "Adım 1: 4 çarpı 3, 12 eder. Adım 2: 12 çarpı 2, 24 eder. Adım 3: Hacim 24 cm³'tür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Koli 4 cm × 3 cm × 2 cm. Taban alanı ile hacmi karıştırmamak için ne demelisin?",
      options: [
      "4 çarpı 3 yalnız taban alanıdır; hacim için yükseklik de çarpılır",
      "Hacim her zaman 12'dir",
      "Yükseklik gerekmez",
      "Alan ile hacim aynıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Taban alanı 12 cm²; hacim 24 cm³.",
      explanation: "Adım 1: 4 çarpı 3, 12 cm² taban alanıdır. Adım 2: Yükseklik 2 cm çarpılır. Adım 3: Hacim 24 cm³ olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
