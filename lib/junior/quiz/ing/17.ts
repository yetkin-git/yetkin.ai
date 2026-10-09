import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (17/20). */
export const JUNIOR_ING_QUIZ_17 = {
  lessonKey: "jr_06_ing_main-17",
  title: "Çevreyi korumak ve recycling",
  tellGuides: [
    "Explain recycling in two English sentences.",
    "What can you do at home to protect the planet?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Recycling ne demektir?",
      options: [
        "Atığı cinsine göre ayırıp yeniden kullanıma hazırlamak",
        "Her şeyi çöpe karıştırmak",
        "Yalnızca su içmek",
        "Saati söylemek",
      ],
      correctAnswerIndex: 0,
      hint: "Plastic, paper, glass ayrı kutulara gider.",
      explanation: "Adım 1: Recycling geri dönüşümdür. Adım 2: Atıklar ayrılır. Adım 3: Karıştırmak recycling değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi çevre dostu bir cümledir?",
      options: [
        "We recycle plastic bottles",
        "We throw all waste together",
        "We waste water every day",
        "We burn plastic at home",
      ],
      correctAnswerIndex: 0,
      hint: "Recycle olumlu çevre eylemidir.",
      explanation: "Adım 1: Recycle plastic bottles geri dönüşümdür. Adım 2: Diğer şıklar çevreyi zedeler. Adım 3: Doğru seçenek geri dönüşümdür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Okul afişi: «Put paper here. Put glass there. Keep water clean.» Hangisi afişin ana fikridir?",
      options: [
        "Atıkları ayır ve suyu koru",
        "Sadece oyun oyna",
        "Meslek seç",
        "Hava tahminini yaz",
      ],
      correctAnswerIndex: 0,
      hint: "Paper/glass ayırma + clean water.",
      explanation: "Adım 1: Paper ve glass ayrı yerlere konur. Adım 2: Keep water clean suyu korur. Adım 3: Ana fikir çevre korumadır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
