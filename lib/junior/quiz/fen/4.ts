import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (4/20). */
export const JUNIOR_FEN_QUIZ_4 = {
  lessonKey: "jr_06_fen-4",
  title: "Sindirim sistemi",
  tellGuides: [
    "Fiziksel ve kimyasal sindirimi nasıl ayırırsın?",
    "Besinlerin emilimi hangi organda olur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Besini dişlerle küçük parçalara ayırmak hangi sindirimdir?",
      options: [
      "Fiziksel sindirim",
      "Kimyasal sindirim",
      "Boşaltım",
      "Solunum",
      ],
      correctAnswerIndex: 0,
      hint: "Parçalama mekaniktir; enzim yok.",
      explanation: "Adım 1: Fiziksel sindirim besini küçük parçalara ayırır. Adım 2: Çiğneme bunun örneğidir. Adım 3: Kimyasal sindirimde enzimler kullanılır; bu soruda enzim yoktur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Enzimlerle besinlerin parçalanmasına ne denir?",
      options: [
      "Kimyasal sindirim",
      "Yalnızca çiğneme",
      "Kan dolaşımı",
      "Ses yansıması",
      ],
      correctAnswerIndex: 0,
      hint: "Enzim = kimyasal iş.",
      explanation: "Adım 1: Kimyasal sindirim enzimlerle olur. Adım 2: Besin molekülleri daha küçük birimlere ayrılır. Adım 3: Bu, çiğnemeden farklı bir süreçtir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Öğle yemeğinden sonra besinlerin kana karışması için asıl emilim yeri neresidir?",
      options: [
      "İnce bağırsak",
      "Ağız boşluğu",
      "Burun boşluğu",
      "Kulak zarı",
      ],
      correctAnswerIndex: 0,
      hint: "Emilim yolu uzun ve kıvrımlıdır.",
      explanation: "Adım 1: Ağız ve midede parçalama başlar. Adım 2: Emilimin asıl yeri ince bağırsaktır. Adım 3: Orada sindirilmiş besinler kana geçer.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
