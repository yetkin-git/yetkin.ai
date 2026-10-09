import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (17/25). */
export const JUNIOR_MAT_QUIZ_17 = {
  lessonKey: "jr_06_mat-17",
  title: "Cebirsel ifadeler",
  tellGuides: [
    "Benzer terimlerin neden toplanabildiğini anlatabilir misin?",
    "3x artı 2x neden 5x eder de 5x artı 4 neden 9x olmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Cebirsel ifadede benzer terim nedir?",
      options: [
      "Aynı harfli ve aynı üslü terimler",
      "Her sayı",
      "Yalnızca sabit sayılar",
      "Farklı harflerin toplamı",
      ],
      correctAnswerIndex: 0,
      hint: "3x ile 2x benzerdir. 5x ile 4 benzer değildir.",
      explanation: "Adım 1: Benzer terimler aynı harfi taşır. Adım 2: Katsayılar toplanır. Adım 3: Sabit sayı harfli terimle birleşmez.",
    },
    {
      id: "q2",
      level: "apply",
      question: "3x artı 2x kaç eder?",
      options: [
      "5x",
      "6x",
      "5",
      "x",
      ],
      correctAnswerIndex: 0,
      hint: "Katsayıları topla; x yerinde kalsın.",
      explanation: "Adım 1: 3 ve 2 katsayılardır. Adım 2: 3 artı 2, 5 eder. Adım 3: Sonuç 5x'tir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir kutuda 5x top, yanında 4 top daha var. Toplamı 9x yazmak neden yanlıştır?",
      options: [
      "5x ile 4 benzer terim değildir",
      "x her zaman 1'dir",
      "Toplama yasaktır",
      "4 de x ile çarpılmalıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Harfli terim ile sabit toplanıp tek terim olmaz.",
      explanation: "Adım 1: 5x harfli terimdir. Adım 2: 4 sabittir. Adım 3: Toplam 5x artı 4 olarak kalır; 9x olmaz.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
