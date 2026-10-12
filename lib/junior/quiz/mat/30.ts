import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (30). */
export const JUNIOR_MAT_QUIZ_30 = {
  lessonKey: "jr_06_mat-30",
  title: "İki paralel doğru ve bir kesenin açıları",
  tellGuides: [
    "Yöndeş açı ile bütünler komşuyu nasıl ayırırsın?",
    "Paralellik bozulursa eşitlik neden kalmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Paralel iki doğruyu bir kesen kesince yöndeş açılar nasıldır?",
      options: [
        "Eşittir",
        "Toplamı 90 derecedir",
        "Biri diğerinin iki katıdır",
        "Hepsi 45 derecedir",
      ],
      correctAnswerIndex: 0,
      hint: "Aynı yöndeki açı çifti eştir.",
      explanation: "Adım 1: Yöndeş açılar eşittir. Adım 2: İç ters açılar da eşittir. Adım 3: Komşu bütünler açı eşit değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Yöndeş açı 70 derece ise eş açı kaç derecedir?",
      options: [
        "110",
        "70",
        "20",
        "180",
      ],
      correctAnswerIndex: 1,
      hint: "Eş açı aynı dereceyi taşır.",
      explanation: "Adım 1: Yöndeş açılar eşittir. Adım 2: 70 derecenin eşi 70 derecedir. Adım 3: 110, bütünler komşudur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "70 derecelik açının bütünler komşusu neden 110 derecedir?",
      options: [
        "Çünkü 70 artı 110, 180 eder",
        "Çünkü paralel doğrular kesişir",
        "Çünkü kesen diktir",
        "Çünkü iç ters açı 110'dur",
      ],
      correctAnswerIndex: 0,
      hint: "Komşu açılar bir doğru açıyı paylaşır.",
      explanation: "Adım 1: Bütünler komşu açıların toplamı 180 derecedir. Adım 2: 180 eksi 70, 110 eder. Adım 3: Bu açı, yöndeş eş değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
