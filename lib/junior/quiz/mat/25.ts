import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (25/25). */
export const JUNIOR_MAT_QUIZ_25 = {
  lessonKey: "jr_06_mat-25",
  title: "Sıvı ölçme",
  tellGuides: [
    "1 litre ile 1 mililitre ilişkisini anlatabilir misin?",
    "1 desimetre küpün neden 1 litre ettiğini söyleyebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "1 litre kaç mililitredir?",
      options: [
      "1.000",
      "100",
      "10",
      "10.000",
      ],
      correctAnswerIndex: 0,
      hint: "1 dm³ = 1 L = 1.000 mL.",
      explanation: "Adım 1: 1 litre 1.000 mililitredir. Adım 2: 1 desimetre küp 1 litre eder. Adım 3: Bu üçü aynı hacmi anlatır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "2,5 litre kaç mililitredir?",
      options: [
      "2.500",
      "250",
      "25",
      "25.000",
      ],
      correctAnswerIndex: 0,
      hint: "2,5 çarpı 1.000.",
      explanation: "Adım 1: 1 L = 1.000 mL. Adım 2: 2,5 çarpı 1.000 yapılır. Adım 3: Sonuç 2.500 mL'dir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sulu boya şişesi 2,5 L tutuyor. Bunu mililitre olarak etikete yazmak istersen ne yazarsın?",
      options: [
      "2500 mL",
      "250 mL",
      "25 mL",
      "2,5 mL",
      ],
      correctAnswerIndex: 0,
      hint: "Litre mililitreye çevrilir.",
      explanation: "Adım 1: 2,5 litre vardır. Adım 2: 2,5 × 1000 = 2500. Adım 3: Etiket 2500 mL olmalıdır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
