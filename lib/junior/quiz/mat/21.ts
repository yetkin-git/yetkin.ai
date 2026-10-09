import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (21/25). */
export const JUNIOR_MAT_QUIZ_21 = {
  lessonKey: "jr_06_mat-21",
  title: "Paralelkenar ve üçgenin alanı",
  tellGuides: [
    "Paralelkenar alanının taban çarpı yükseklik olduğunu anlatabilir misin?",
    "Üçgen alanının neden bunun yarısı olduğunu söyleyebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Paralelkenarın alanı nasıl bulunur?",
      options: [
      "Taban çarpı yükseklik",
      "Yalnızca çevre",
      "Eğik kenar çarpı taban",
      "Üç kenarın toplamı",
      ],
      correctAnswerIndex: 0,
      hint: "Eğik kenar yükseklik değildir.",
      explanation: "Adım 1: Alan = taban çarpı yükseklik. Adım 2: Yükseklik tabana diktir. Adım 3: Üçgen alanı bunun yarısıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Taban 8 cm, yükseklik 5 cm olan paralelkenarın alanı kaç cm²'dir?",
      options: [
      "40",
      "13",
      "20",
      "80",
      ],
      correctAnswerIndex: 0,
      hint: "8 çarpı 5.",
      explanation: "Adım 1: 8 çarpı 5 yapılır. Adım 2: Sonuç 40 cm²'dir. Adım 3: Aynı ölçülerde üçgen 20 cm² olur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bahçede tabanı 8 m, yüksekliği 5 m olan üçgen çimenlik var. Alanı kaç m²'dir?",
      options: [
      "20",
      "40",
      "13",
      "80",
      ],
      correctAnswerIndex: 0,
      hint: "Üçgen = (taban çarpı yükseklik) / 2.",
      explanation: "Adım 1: 8 çarpı 5, 40 eder. Adım 2: Üçgen olduğu için 40 bölü 2 yapılır. Adım 3: Alan 20 m²'dir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
