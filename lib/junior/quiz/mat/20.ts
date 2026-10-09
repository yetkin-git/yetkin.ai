import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (20/25). */
export const JUNIOR_MAT_QUIZ_20 = {
  lessonKey: "jr_06_mat-20",
  title: "Komşu, tümler, bütünler ve ters açılar",
  tellGuides: [
    "Tümler ve bütünler açıların farkını anlatabilir misin?",
    "Ters açıların neden eşit olduğunu bir örnekle söyleyebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Tümler açıların toplamı kaç derecedir?",
      options: [
      "90",
      "180",
      "360",
      "45",
      ],
      correctAnswerIndex: 0,
      hint: "Bütünler 180, tümler 90'dır.",
      explanation: "Adım 1: Tümler açıların toplamı 90 derecedir. Adım 2: Bütünler açıların toplamı 180 derecedir. Adım 3: Ters açılar eşittir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "30 derecenin tümleri kaç derecedir?",
      options: [
      "60",
      "150",
      "90",
      "30",
      ],
      correctAnswerIndex: 0,
      hint: "90 eksi 30.",
      explanation: "Adım 1: Tümler için 90 eksi 30 yapılır. Adım 2: Sonuç 60'tır. Adım 3: Bütünler olsa 180 eksi 30, 150 olurdu.",
    },
    {
      id: "q3",
      level: "skill",
      question: "İki yol kesişiyor. Bir açı 30 derece. Tersindeki açı kaç derecedir?",
      options: [
      "30",
      "60",
      "150",
      "90",
      ],
      correctAnswerIndex: 0,
      hint: "Ters açılar eşittir.",
      explanation: "Adım 1: Kesişen doğrularda ters açılar eşittir. Adım 2: Verilen açı 30'dur. Adım 3: Tersi de 30 derecedir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
