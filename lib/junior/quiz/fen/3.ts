import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (3/20). */
export const JUNIOR_FEN_QUIZ_3 = {
  lessonKey: "jr_06_fen-3",
  title: "Destek ve hareket sistemi",
  tellGuides: [
    "Kemik, eklem ve kasın görevlerini kendi cümlenle ayırabilir misin?",
    "Hareket nasıl oluşur; kaslar ne yapar?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Vücuda şekil veren ve organları koruyan yapı hangisidir?",
      options: [
      "Kemikler",
      "Kan",
      "Alveol",
      "İdrar kesesi",
      ],
      correctAnswerIndex: 0,
      hint: "İskelet sistemi destek ve koruma sağlar.",
      explanation: "Adım 1: Destek ve hareket sisteminde kemikler iskeleti oluşturur. Adım 2: Kemikler vücuda şekil verir. Adım 3: Ayrıca organları dış etkilerden korur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Dirsekte kemiklerin birbirine bağlandığı yapıya ne denir?",
      options: [
      "Eklem",
      "Alveol",
      "Safra",
      "Direnç",
      ],
      correctAnswerIndex: 0,
      hint: "Kemik–kemik birleşim yerini düşün.",
      explanation: "Adım 1: İki kemiğin birleştiği yere eklem denir. Adım 2: Dirsek bir eklem örneğidir. Adım 3: Eklemler hareketi kolaylaştırır; kaslar da bu eklemler üzerinden iş yapar.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Deniz topu kaldırmak için kolunu büktü. Bu harekette asıl «çekme–gevşeme» işini kim yapar?",
      options: [
      "Kaslar",
      "Yalnızca deri",
      "Yalnızca tırnaklar",
      "Yalnızca saç telleri",
      ],
      correctAnswerIndex: 0,
      hint: "Kasılıp gevşeyen doku harekettir.",
      explanation: "Adım 1: Kemikler destek verir ama kendi başına kasılmaz. Adım 2: Kaslar kasılıp gevşeyerek kemikleri hareket ettirir. Adım 3: Topu kaldırmak için kaslar çalışır; eklem hareketi mümkün kılar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
