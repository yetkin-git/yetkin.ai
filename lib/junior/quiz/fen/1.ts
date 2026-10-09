import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (1/20). */
export const JUNIOR_FEN_QUIZ_1 = {
  lessonKey: "jr_06_fen-1",
  title: "Güneş sistemindeki gezegenler",
  tellGuides: [
    "Güneş neden bir gezegen değildir?",
    "Sekiz gezegeni Güneş'ten dışa doğru sırayla sayabilir misin?",
    "Ay ile Plüton'u gezegen sırasına neden katmıyoruz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Güneş sisteminin merkezindeki gök cismi nedir?",
      options: [
      "Güneş (yıldız)",
      "Dünya",
      "Ay",
      "Jüpiter",
      ],
      correctAnswerIndex: 0,
      hint: "Merkezdeki cisim ışık üretir; gezegen değildir.",
      explanation: "Adım 1: Güneş sistemi Güneş ve çevresindeki gök cisimlerinden oluşur. Adım 2: Merkezde Güneş vardır. Adım 3: Güneş bir yıldızdır; gezegen veya uydu değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Güneş'ten dışa doğru üçüncü gezegen hangisidir?",
      options: [
      "Venüs",
      "Dünya",
      "Mars",
      "Merkür",
      ],
      correctAnswerIndex: 1,
      hint: "Sıra: Merkür, Venüs, Dünya, Mars…",
      explanation: "Adım 1: Güneş'e en yakın Merkür'dür. Adım 2: Sonra Venüs gelir. Adım 3: Üçüncü sırada Dünya vardır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ela gece gökyüzüne bakıyor. Ay'ı görüp «İşte dokuzuncu gezegen!» diyor. Hangisi doğru düzeltmedir?",
      options: [
      "Ay bir uydudur; sekiz gezegen listesine girmez",
      "Ay cüce gezegendir; listeye eklenir",
      "Ay en uzak gezegendir",
      "Ay Güneş'in kardeş yıldızıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Ay Dünya'nın çevresinde dolanır.",
      explanation: "Adım 1: Gezegen bir yıldızın çevresinde dolanan büyük gök cismidir. Adım 2: Ay Dünya'nın çevresinde dolandığı için uydudur. Adım 3: Bu yüzden sekiz gezegen sırasına eklenmez.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
