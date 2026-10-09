import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (6/25). */
export const JUNIOR_MAT_QUIZ_6 = {
  lessonKey: "jr_06_mat-6",
  title: "Asal sayılar ve asal çarpanlar",
  tellGuides: [
    "Asal sayıyı kendi cümlenle tanımlayabilir misin?",
    "1 neden asal değildir? 12'yi asal çarpanlara nasıl ayırırsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Asal sayı için doğru olan hangisidir?",
      options: [
      "1'den büyüktür ve yalnız 1 ile kendisine bölünür",
      "Yalnızca çift sayılardır",
      "1 de asaldır",
      "Her tek sayı asaldır",
      ],
      correctAnswerIndex: 0,
      hint: "1 asal değildir. 2 en küçük asal sayıdır.",
      explanation: "Adım 1: Asal sayı 1'den büyüktür. Adım 2: Yalnız 1 ve kendisiyle kalansız bölünür. Adım 3: 1'in tek böleni kendisidir; asal sayılmaz.",
    },
    {
      id: "q2",
      level: "apply",
      question: "12 sayısının asal çarpanlara ayrılmış hâli hangisidir?",
      options: [
      "2 çarpı 2 çarpı 3",
      "4 çarpı 3",
      "6 çarpı 2",
      "1 çarpı 12",
      ],
      correctAnswerIndex: 0,
      hint: "Asal olmayan çarpanları tekrar böl.",
      explanation: "Adım 1: 12, 2 çarpı 6 diye açılır. Adım 2: 6, 2 çarpı 3'tür. Adım 3: Hepsi asal olunca 2 çarpı 2 çarpı 3 kalır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Hangisi asal sayıdır?",
      options: [
      "9",
      "15",
      "7",
      "1",
      ],
      correctAnswerIndex: 2,
      hint: "9 ve 15 başka çarpan taşır. 1 asal değildir.",
      explanation: "Adım 1: 9, 3 çarpı 3'tür; asal değildir. Adım 2: 15, 3 çarpı 5'tir. Adım 3: 7 yalnız 1 ve 7'ye bölünür; asaldır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
