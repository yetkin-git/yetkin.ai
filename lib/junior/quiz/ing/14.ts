import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (14/20). */
export const JUNIOR_ING_QUIZ_14 = {
  lessonKey: "jr_06_ing_main-14",
  title: "Tatil etkinliği ve hava",
  tellGuides: [
    "Describe a holiday day: one past activity and the weather that day.",
    "Can you connect It was sunny with We played outside?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Geçmiş hava nasıl söylenir?",
      options: [
        "It was sunny / rainy / cold",
        "It is was sunny",
        "I am sunny yesterday",
        "They sunny were",
      ],
      correctAnswerIndex: 0,
      hint: "Geçmiş havada It was kullanılır.",
      explanation: "Adım 1: Hava It is ile kurulur. Adım 2: Geçmişte was gelir. Adım 3: It was sunny doğru kalıptır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi tatil gününü doğru anlatır?",
      options: [
        "It was sunny. We played outside",
        "It is sunny. We play outside yesterday",
        "It was sunny. We plays outside",
        "It sunny. We swimming",
      ],
      correctAnswerIndex: 0,
      hint: "Geçmiş hava + geçmiş etkinlik.",
      explanation: "Adım 1: It was sunny geçmiş havadır. Adım 2: Played geçmiş etkinliktir. Adım 3: İkisi aynı günde yan yana durur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Günlük: «Morning: rainy — stayed home. Afternoon: sunny — swam.» Hangisi doğrudur?",
      options: [
        "Öğleden sonra hava açınca denize girdiler",
        "Sabah güneşliydi ve yüzdüler",
        "Bütün gün yağmur yağdı ve dışarı çıktılar",
        "Hava hiç değişmedi",
      ],
      correctAnswerIndex: 0,
      hint: "Afternoon satırını oku.",
      explanation: "Adım 1: Afternoon sunny. Adım 2: Swam yüzmek demektir. Adım 3: Sabah yağmurlu ve evde kaldılar; doğru çıkarım öğleden sonradır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
