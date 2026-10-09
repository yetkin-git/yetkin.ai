import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (9/20). */
export const JUNIOR_ING_QUIZ_9 = {
  lessonKey: "jr_06_ing_main-9",
  title: "Lunaparkta rides ve fun",
  tellGuides: [
    "Talk about a fun ride and say I think it is…",
    "Can you invite a friend to a fair in two English sentences?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "«I think the roller coaster is fun.» cümlesinde I think ne yapar?",
      options: [
        "Görüş bildirir",
        "Saati söyler",
        "Meslek adlandırır",
        "Geçmiş zaman kurar",
      ],
      correctAnswerIndex: 0,
      hint: "I think = bence.",
      explanation: "Adım 1: I think görüş başlatır. Adım 2: Fun eğlenceli demektir. Adım 3: Bu cümle bir oyuncak hakkındaki görüştür.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi lunaparkta doğal bir cümledir?",
      options: [
        "The Ferris wheel is exciting",
        "The Ferris wheel is recycling",
        "The Ferris wheel was born in 2014",
        "The Ferris wheel shouldn't water",
      ],
      correctAnswerIndex: 0,
      hint: "Exciting heyecan verici demektir.",
      explanation: "Adım 1: Ferris wheel bir oyuncaktır. Adım 2: Exciting duygu/görüş sıfatıdır. Adım 3: Diğer şıklar konu dışı kalır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ali: «I like the carousel. I think it is safe.» Ece: «I don't like it. I think it is boring.» Hangisi doğrudur?",
      options: [
        "İki kişi aynı oyuncak hakkında farklı görüş söyler",
        "İkisi de aynı cümleyi tekrarlar",
        "Kimse görüş bildirmez",
        "Bu bir hava tahmini diyalogudur",
      ],
      correctAnswerIndex: 0,
      hint: "Safe ve boring farklı sıfatlardır.",
      explanation: "Adım 1: Ali safe diyor. Adım 2: Ece boring diyor. Adım 3: Aynı konu, iki farklı görüştür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
