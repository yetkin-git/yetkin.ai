import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (29). */
export const JUNIOR_MAT_QUIZ_29 = {
  lessonKey: "jr_06_mat-29",
  title: "Cebirsel ifadede algoritma",
  tellGuides: [
    "2x artı 6 ifadesinde hangi işlem önce gelir?",
    "Aynı ifadeye iki farklı sayı koyunca ne değişir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Cebirsel ifadede algoritma neyi sabit tutar?",
      options: [
        "İşlem sırasını",
        "Bilinmeyenin değerini",
        "Sonucu",
        "Birimi",
      ],
      correctAnswerIndex: 0,
      hint: "Girdi değişebilir. Adım sırası kalır.",
      explanation: "Adım 1: Algoritma sıra demektir. Adım 2: Bilinmeyenin yerine başka sayı konabilir. Adım 3: Sıra bozulursa sonuç değişir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "x yerine 4 konunca 2x artı 6 kaç eder?",
      options: [
        "12",
        "10",
        "14",
        "24",
      ],
      correctAnswerIndex: 2,
      hint: "Önce 2 çarpı 4. Sonra 6 ekle.",
      explanation: "Adım 1: 2 çarpı 4, 8 eder. Adım 2: 8 artı 6, 14 eder. Adım 3: 2 ile 6'yı önce toplamak bu algoritma değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Aynı ifadede x yerine 5 konunca sonuç neden 16 olur?",
      options: [
        "Çünkü 2 çarpı 5 artı 6, 16 eder",
        "Çünkü 5 artı 6, 11 eder",
        "Çünkü x silinir",
        "Çünkü 2x, 25 olur",
      ],
      correctAnswerIndex: 0,
      hint: "Algoritma aynı. Girdi 5 oldu.",
      explanation: "Adım 1: 2 çarpı 5, 10 eder. Adım 2: 10 artı 6, 16 eder. Adım 3: İfade durur, konan sayı değişir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
