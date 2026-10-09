import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (22/25). */
export const JUNIOR_MAT_QUIZ_22 = {
  lessonKey: "jr_06_mat-22",
  title: "Alan ölçü birimleri ve arazi",
  tellGuides: [
    "1 m² ile 1 cm² arasındaki ilişkiyi anlatabilir misin?",
    "Dönüm ve hektar nasıl ilişkilidir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "1 metre kare kaç santimetre karedir?",
      options: [
      "10.000",
      "100",
      "1.000",
      "10",
      ],
      correctAnswerIndex: 0,
      hint: "1 m = 100 cm; alan için 100 çarpı 100.",
      explanation: "Adım 1: 1 m, 100 cm'dir. Adım 2: Alan için 100 çarpı 100 yapılır. Adım 3: 1 m² = 10.000 cm²'dir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "1 hektar kaç dönümdür?",
      options: [
      "10",
      "100",
      "1.000",
      "10.000",
      ],
      correctAnswerIndex: 0,
      hint: "1 hektar 10.000 m², 1 dönüm 1.000 m²'dir.",
      explanation: "Adım 1: 1 hektar = 10.000 m². Adım 2: 1 dönüm = 1.000 m². Adım 3: 10.000 bölü 1.000, 10 dönümdür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Çiftçinin 2 hektar tarlası vardır. Bu kaç dönümdür?",
      options: [
      "20",
      "2",
      "200",
      "10",
      ],
      correctAnswerIndex: 0,
      hint: "1 hektar = 10 dönüm.",
      explanation: "Adım 1: 1 hektar 10 dönümdür. Adım 2: 2 hektar için 2 çarpı 10 yapılır. Adım 3: Sonuç 20 dönümdür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
