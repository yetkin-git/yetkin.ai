import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (7/20). */
export const JUNIOR_ING_QUIZ_7 = {
  lessonKey: "jr_06_ing_main-7",
  title: "Sunny, rainy ve cold",
  tellGuides: [
    "Describe today's weather in two English sentences.",
    "What do people usually do when it is rainy?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Hava durumu cümlesi nasıl kurulur?",
      options: [
        "It is + hava sıfatı",
        "I am + hava sıfatı",
        "He are + hava sıfatı",
        "They was + hava sıfatı",
      ],
      correctAnswerIndex: 0,
      hint: "Hava için It is kullanılır.",
      explanation: "Adım 1: Hava cümlesi It is ile başlar. Adım 2: Sunny, rainy, cold sıfat gelir. Adım 3: It is sunny doğru kalıptır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Diyalog: «What's the weather like?» — «___.»",
      options: [
        "It is rainy today",
        "I am rainy today",
        "She likes rainy",
        "We were doctor",
      ],
      correctAnswerIndex: 0,
      hint: "Weather sorusuna It is ile cevap ver.",
      explanation: "Adım 1: What's the weather like hava sorusudur. Adım 2: Cevap It is … şeklindedir. Adım 3: It is rainy today doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Tablo: Monday sunny · Tuesday rainy · Wednesday cold. «On Tuesday it is ___.»",
      options: [
        "rainy",
        "sunny",
        "hot",
        "snowy",
      ],
      correctAnswerIndex: 0,
      hint: "Tuesday satırına bak.",
      explanation: "Adım 1: Tuesday rainy yazıyor. Adım 2: Monday sunny, Wednesday cold ayrıdır. Adım 3: Boşluk rainy ile dolar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
