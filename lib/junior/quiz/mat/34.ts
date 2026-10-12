import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (34). */
export const JUNIOR_MAT_QUIZ_34 = {
  lessonKey: "jr_06_mat-34",
  title: "Çember uzunluğu ile çap",
  tellGuides: [
    "Çap ile yarıçapı nasıl ayırırsın?",
    "Çevre formülünde neden çap durur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Çemberin çevre uzunluğu hangi çarpımdır?",
      options: [
        "Çap çarpı pi",
        "Yarıçap artı pi",
        "Çap bölü 2",
        "Pi eksi çap",
      ],
      correctAnswerIndex: 0,
      hint: "Formül çarpı çaptır.",
      explanation: "Adım 1: Çevre, çap ile pi'nin çarpımıdır. Adım 2: Yarıçap, çapın yarısıdır. Adım 3: Pi yaklaşık 3,14 alınır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Çap 10 santimetre ise yarıçap kaç santimetredir?",
      options: [
        "20",
        "10",
        "5",
        "3,14",
      ],
      correctAnswerIndex: 2,
      hint: "Yarıçap çapın yarısıdır.",
      explanation: "Adım 1: Çap 10 ise yarıçap 5'tir. Adım 2: 10'un yarısı 5 eder. Adım 3: 20, çapın iki katı olurdu.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Pi yaklaşık 3 alınırsa çapı 10 olan çemberin çevresi yaklaşık kaçtır?",
      options: [
        "13",
        "30",
        "10",
        "3",
      ],
      correctAnswerIndex: 1,
      hint: "10 çarpı 3.",
      explanation: "Adım 1: Çevre yaklaşık çap çarpı 3'tür. Adım 2: 10 çarpı 3, 30 eder. Adım 3: 3,14 ile daha yakın değer 31,4 olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
