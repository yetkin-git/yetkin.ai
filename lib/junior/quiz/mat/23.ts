import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (23/25). */
export const JUNIOR_MAT_QUIZ_23 = {
  lessonKey: "jr_06_mat-23",
  title: "Çember",
  tellGuides: [
    "Çember ile daire arasındaki farkı anlatabilir misin?",
    "Yarıçap ile çapın ilişkisini bir örnekle söyleyebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Çember ile daire farkı nedir?",
      options: [
      "Çember çizgidir; daire iç bölgeyi de taşır",
      "İkisi aynıdır",
      "Daire yalnız çizgidir",
      "Çember alan demektir",
      ],
      correctAnswerIndex: 0,
      hint: "Çap, iki yarıçapa eşittir.",
      explanation: "Adım 1: Çember, sınır çizgisidir. Adım 2: Daire, içini de kapsar. Adım 3: Çap = 2 çarpı yarıçap.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Yarıçap 5 cm ise çap kaç cm'dir?",
      options: [
      "10",
      "5",
      "25",
      "2,5",
      ],
      correctAnswerIndex: 0,
      hint: "Çap = 2 çarpı yarıçap.",
      explanation: "Adım 1: Yarıçap 5 cm'dir. Adım 2: 2 çarpı 5 yapılır. Adım 3: Çap 10 cm'dir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bahçe fıskiyesi merkezden 5 m uzağa su atıyor. Sulanan dairenin çapı kaç metredir?",
      options: [
      "10",
      "5",
      "25",
      "15",
      ],
      correctAnswerIndex: 0,
      hint: "Yarıçap 5 m; çap iki katıdır.",
      explanation: "Adım 1: Yarıçap 5 m'dir. Adım 2: Çap 2 çarpı 5'tir. Adım 3: Çap 10 m'dir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
