import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (19/25). */
export const JUNIOR_MAT_QUIZ_19 = {
  lessonKey: "jr_06_mat-19",
  title: "Veri analizi",
  tellGuides: [
    "Ortalama ile açıklığı nasıl ayırırsın?",
    "4, 6 ve 8 için ortalama ve açıklığı nasıl bulursun?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ortalama nasıl bulunur?",
      options: [
      "Toplamın veri sayısına bölümü",
      "En büyük eksi en küçük",
      "Yalnızca en büyük sayı",
      "Sıklığın kendisi",
      ],
      correctAnswerIndex: 0,
      hint: "Açıklık en büyük ile en küçüğün farkıdır.",
      explanation: "Adım 1: Veriler toplanır. Adım 2: Toplam veri sayısına bölünür. Adım 3: Bu ortalamadır. Açıklık ayrı iştir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "4, 6 ve 8 sayılarının ortalaması kaçtır?",
      options: [
      "6",
      "4",
      "8",
      "18",
      ],
      correctAnswerIndex: 0,
      hint: "Topla, sonra 3'e böl.",
      explanation: "Adım 1: 4 artı 6 artı 8, 18 eder. Adım 2: 18 bölü 3, 6 eder. Adım 3: Ortalama 6'dır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir takımın gol sayıları 4, 6 ve 8'dir. Açıklık kaçtır?",
      options: [
      "4",
      "6",
      "18",
      "2",
      ],
      correctAnswerIndex: 0,
      hint: "En büyük eksi en küçük.",
      explanation: "Adım 1: En büyük 8, en küçük 4'tür. Adım 2: 8 eksi 4, 4 eder. Adım 3: Açıklık 4'tür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
