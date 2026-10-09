import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (8/25). */
export const JUNIOR_MAT_QUIZ_8 = {
  lessonKey: "jr_06_mat-8",
  title: "Kümeler",
  tellGuides: [
    "Kümenin elemanı belli olmak ne demektir?",
    "Boş küme ile birleşimde ortak elemanın bir kez yazılmasını anlatabilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Boş küme için doğru olan hangisidir?",
      options: [
      "Hiç elemanı yoktur",
      "Yalnızca 0 elemanıdır",
      "Her sayıyı taşır",
      "İki elemanı vardır",
      ],
      correctAnswerIndex: 0,
      hint: "0 bir sayı olabilir; boş küme ise hiç eleman taşımaz.",
      explanation: "Adım 1: Kümenin elemanı bellidir. Adım 2: Boş kümede hiç eleman yoktur. Adım 3: 0, boş küme demek değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "A = {1, 2, 3} ve B = {3, 4} birleşiminde kaç eleman vardır?",
      options: [
      "5",
      "4",
      "3",
      "2",
      ],
      correctAnswerIndex: 1,
      hint: "Ortak eleman birleşimde bir kez yazılır.",
      explanation: "Adım 1: Birleşim {1, 2, 3, 4} olur. Adım 2: 3 ortak olduğu için bir kez yazılır. Adım 3: Toplam 4 eleman vardır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sınıfta 3 kişi hem futbol hem basket oynuyor. Futbol kümesi 8, basket kümesi 6 kişiyse birleşimde en az kaç kişi vardır?",
      options: [
      "11",
      "14",
      "3",
      "8",
      ],
      correctAnswerIndex: 0,
      hint: "Ortakları bir kez say: 8 artı 6 eksi 3.",
      explanation: "Adım 1: 8 artı 6, 14 eder ama ortaklar iki kez sayılmıştır. Adım 2: Ortak 3 çıkarılır. Adım 3: Birleşimde 11 kişi kalır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
