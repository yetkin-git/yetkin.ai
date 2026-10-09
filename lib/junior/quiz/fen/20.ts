import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (20/20). */
export const JUNIOR_FEN_QUIZ_20 = {
  lessonKey: "jr_06_fen-20",
  title: "Elektriksel direnç",
  tellGuides: [
    "Direnç nedir; lamba parlaklığıyla nasıl bağlanır?",
    "Telin boyu ve kesiti direnci nasıl değiştirir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Elektriksel direnç nedir?",
      options: [
      "İletkenin akıma gösterdiği zorluk",
      "Sesin yansıması",
      "Kanın Rh değeri",
      "Gezegenin yörüngesi",
      ],
      correctAnswerIndex: 0,
      hint: "Akımı «zorlaştıran» özellik.",
      explanation: "Adım 1: Akım iletkenden geçer. Adım 2: İletken akıma zorluk gösterebilir. Adım 3: Bu zorluğa direnç denir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Aynı cins telde boy artarsa direnç ne olur?",
      options: [
      "Artar",
      "Azalır",
      "Hep sıfır kalır",
      "Sese dönüşür",
      ],
      correctAnswerIndex: 0,
      hint: "Uzun yol = daha çok engel.",
      explanation: "Adım 1: Tel uzadıkça elektronlar daha uzun yol alır. Adım 2: Bu da direnci artırır. Adım 3: Kesit artarsa direnç azalır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Devrede aynı pil varken tel kısaltılınca lamba daha parlak yanıyor. Neden?",
      options: [
      "Kısa telde direnç azalır; akım artar",
      "Kısa telde direnç artar; akım azalır",
      "Ses boşlukta yayıldığı için",
      "Yoğunluk formülü değiştiği için",
      ],
      correctAnswerIndex: 0,
      hint: "Parlaklık akımla artar.",
      explanation: "Adım 1: Tel kısaldıkça direnç düşer. Adım 2: Direnç düşünce akım artar. Adım 3: Daha büyük akım lambayı daha parlak yakar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
