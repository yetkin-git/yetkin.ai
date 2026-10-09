import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (2/25). */
export const JUNIOR_MAT_QUIZ_2 = {
  lessonKey: "jr_06_mat-2",
  title: "İşlem önceliği",
  tellGuides: [
    "Parantez, üs, çarpma ve toplama sırasını kendi cümlenle sıralayabilir misin?",
    "3 artı 4 çarpı 2 neden 11 eder, 14 etmez?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İşlem önceliğinde ilk bakılan yer hangisidir?",
      options: [
      "Parantez içi",
      "Toplama",
      "Çıkarma",
      "Yalnızca soldaki sayı",
      ],
      correctAnswerIndex: 0,
      hint: "Önce parantez, sonra üs, sonra çarpma ve bölme gelir.",
      explanation: "Adım 1: Parantez varsa önce içi biter. Adım 2: Sonra üs gelir. Adım 3: Ardından çarpma ve bölme, en sonda toplama ve çıkarma yapılır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "3 artı 4 çarpı 2 kaç eder?",
      options: [
      "14",
      "11",
      "10",
      "24",
      ],
      correctAnswerIndex: 1,
      hint: "Çarpma, toplamanın önüne geçer.",
      explanation: "Adım 1: Önce 4 çarpı 2 yapılır; 8 eder. Adım 2: Sonra 3 artı 8 yapılır. Adım 3: Sonuç 11'dir. Önce toplarsan 14 bulursun; bu tuzaktır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Market fişinde 3 liralık silgi ve iki kalem var. Her kalem 4 lira. 3 artı 4 çarpı 2 ne kadar tutar?",
      options: [
      "11 lira",
      "14 lira",
      "7 lira",
      "24 lira",
      ],
      correctAnswerIndex: 0,
      hint: "Önce kalemlerin tutarını çarp, sonra silgiyi ekle.",
      explanation: "Adım 1: İki kalem 4 çarpı 2, 8 liradır. Adım 2: Silgi 3 liradır. Adım 3: 3 artı 8, 11 liradır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
