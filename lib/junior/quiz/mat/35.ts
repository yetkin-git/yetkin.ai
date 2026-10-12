import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (35). */
export const JUNIOR_MAT_QUIZ_35 = {
  lessonKey: "jr_06_mat-35",
  title: "Çember uzunluğu problemleri",
  tellGuides: [
    "Bir tur ile iki turu nasıl ayırırsın?",
    "Yarıçap verilince çapa neden ihtiyaç duyarsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Tekerleğin bir tam turu hangi uzunluğa eşittir?",
      options: [
        "Çemberin çevresine",
        "Yalnızca çapına",
        "Yarıçapına",
        "Pi sayısının kendisine",
      ],
      correctAnswerIndex: 0,
      hint: "Tur, kenarın tamamını dolanır.",
      explanation: "Adım 1: Bir tur çevre kadar yoldur. Adım 2: Çevre, çap çarpı pi eder. Adım 3: Çap tek başına tur değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Çap 2 metre ve pi yaklaşık 3 ise bir tur yaklaşık kaç metredir?",
      options: [
        "2",
        "5",
        "6",
        "8",
      ],
      correctAnswerIndex: 2,
      hint: "2 çarpı 3.",
      explanation: "Adım 1: Çevre yaklaşık çap çarpı 3'tür. Adım 2: 2 çarpı 3, 6 eder. Adım 3: Bir tur yaklaşık 6 metredir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Aynı tekerlek iki tur atınca yol neden yaklaşık 12 metre olur?",
      options: [
        "Çünkü bir tur 6 metredir ve iki tur bunu ikiye katlar",
        "Çünkü çapa 2 eklenir",
        "Çünkü yarıçap 12 olur",
        "Çünkü pi silinir",
      ],
      correctAnswerIndex: 0,
      hint: "Tur sayısı çevre ile çarpılır.",
      explanation: "Adım 1: Bir tur yaklaşık 6 metredir. Adım 2: İki tur 6 çarpı 2, 12 eder. Adım 3: Çapa 2 eklemek bu yol değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
