import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (5/20). */
export const JUNIOR_FEN_QUIZ_5 = {
  lessonKey: "jr_06_fen-5",
  title: "Dolaşım sistemi",
  tellGuides: [
    "Dolaşım sisteminin üç temel parçasını söyleyebilir misin?",
    "Büyük ve küçük kan dolaşımını nasıl ayırırsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Dolaşım sistemini oluşturan üç temel yapı hangisidir?",
      options: [
      "Kalp, kan ve damarlar",
      "Kemik, eklem ve kas",
      "Böbrek, idrar ve deri",
      "Göz, kulak ve dil",
      ],
      correctAnswerIndex: 0,
      hint: "Pompa, taşıyıcı sıvı ve yollar.",
      explanation: "Adım 1: Kalp kanı pompalar. Adım 2: Kan oksijen ve besinleri taşır. Adım 3: Damarlar kanın dolaştığı yollardır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Küçük kan dolaşımı hangi iki organ arasındadır?",
      options: [
      "Kalp ile akciğer",
      "Kalp ile ayak",
      "Mide ile bağırsak",
      "Beyin ile omurilik",
      ],
      correctAnswerIndex: 0,
      hint: "Küçük dolaşım oksijen almak içindir.",
      explanation: "Adım 1: Küçük dolaşım kalpten akciğere gider. Adım 2: Akciğerde gaz alışverişi olur. Adım 3: Kan tekrar kalbe döner. Büyük dolaşım vücut genelidir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Koşudan sonra nabız hızlanır. Bu, kalbin hangi işini gösterir?",
      options: [
      "Kanı daha hızlı pompaladığını",
      "Ses dalgası ürettiğini",
      "Yoğunluk ölçtüğünü",
      "Işık soğurduğunu",
      ],
      correctAnswerIndex: 0,
      hint: "Kaslar daha çok oksijen ister.",
      explanation: "Adım 1: Koşuda kaslar daha fazla oksijen ister. Adım 2: Kalp daha sık kasılarak kanı hızlandırır. Adım 3: Nabız artışı bu pompalama hızının göstergesidir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
