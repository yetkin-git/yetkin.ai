import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (15/25). */
export const JUNIOR_MAT_QUIZ_15 = {
  lessonKey: "jr_06_mat-15",
  title: "Ondalık sayılarla işlem",
  tellGuides: [
    "Ondalık toplamada virgülleri neden alt alta getirdiğini anlatabilir misin?",
    "10 ile çarpınca virgül neden bir basamak sağa kayar?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ondalık sayıları toplarken ilk kural nedir?",
      options: [
      "Virgülleri alt alta getirmek",
      "Virgülleri silmek",
      "Paydaları çarpmak",
      "Üssü büyütmek",
      ],
      correctAnswerIndex: 0,
      hint: "Aynı basamaklar üst üste gelsin.",
      explanation: "Adım 1: Virgüller alt alta yazılır. Adım 2: Basamaklar hizalanır. Adım 3: Toplama veya çıkarma yapılır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "2,40 artı 1,35 kaç eder?",
      options: [
      "3,75",
      "3,65",
      "4,75",
      "2,75",
      ],
      correctAnswerIndex: 0,
      hint: "Virgülleri hizala; yüzdeleri topla.",
      explanation: "Adım 1: 2,40 ile 1,35 alt alta yazılır. Adım 2: 40 artı 35, 75 eder. Adım 3: Tamlar 2 artı 1, 3 eder; sonuç 3,75'tir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "1,25 metrelik ip 10 kat uzatılırsa yeni uzunluk kaç metre olur?",
      options: [
      "12,5",
      "1,250",
      "0,125",
      "11,25",
      ],
      correctAnswerIndex: 0,
      hint: "10 ile çarpınca virgül bir basamak sağa kayar.",
      explanation: "Adım 1: 1,25 çarpı 10. Adım 2: Virgül bir basamak sağa kayar. Adım 3: Sonuç 12,5 metredir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
