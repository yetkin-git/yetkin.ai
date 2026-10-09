import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (11/25). */
export const JUNIOR_MAT_QUIZ_11 = {
  lessonKey: "jr_06_mat-11",
  title: "Payda aynıyken toplama",
  tellGuides: [
    "Paydalar aynıyken neden yalnız payların toplandığını anlatabilir misin?",
    "Paydayı toplamak neden yanlıştır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Paydalar aynıysa toplama nasıl yapılır?",
      options: [
      "Yalnız paylar toplanır, payda yerinde kalır",
      "Paydalar da toplanır",
      "Paylar çarpılır",
      "Kesirler ters çevrilir",
      ],
      correctAnswerIndex: 0,
      hint: "Dilim boyu değişmez; dilim sayısı artar.",
      explanation: "Adım 1: Payda dilimin boyudur. Adım 2: Aynı boyda dilimler birleşince pay artar. Adım 3: Payda yerinde kalır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Bir bölü dört artı iki bölü dört kaç eder?",
      options: [
      "Üç bölü dört",
      "Üç bölü sekiz",
      "İki bölü dört",
      "Bir bölü iki",
      ],
      correctAnswerIndex: 0,
      hint: "Payları topla: 1 artı 2. Paydaya dokunma.",
      explanation: "Adım 1: Paylar 1 ve 2'dir; 1 artı 2, 3 eder. Adım 2: Payda 4 kalır. Adım 3: Sonuç dörtte üçtür. Üç bölü sekiz tuzaktır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Aynı boy pasta dilimlerinden önce 1, sonra 2 dilim aldın. Pasta 4 dilime bölünmüştü. Ne kadar pasta aldın?",
      options: [
      "Dörtte üç",
      "Üç bölü sekiz",
      "İki bölü dört",
      "Beş bölü dört",
      ],
      correctAnswerIndex: 0,
      hint: "Payda aynı; payları topla.",
      explanation: "Adım 1: Bir bölü dört artı iki bölü dört. Adım 2: Paylar 3 olur, payda 4 kalır. Adım 3: Dörtte üç pasta almışsındır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
