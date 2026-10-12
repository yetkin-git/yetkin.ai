import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — Universe, will. */
export const JUNIOR_ING_QUIZ_9 = {
  lessonKey: "jr_06_ing_main-9",
  title: "Universe: gelecekte will",
  tellGuides: [
    "Uzayla ilgili bir gelecek cümlesini will ile kur.",
    "Will ile every night alışkanlığını ayır.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Will'den sonra fiil nasıl durur?",
      options: ["Yalın fiil", "Fiile s eklenmiş hali", "Fiile ing eklenmiş hali", "Am is are ile birlikte"],
      correctAnswerIndex: 0,
      hint: "Will fiili yalın bırakır.",
      explanation:
        "Adım 1: Will gelecek yardımcısıdır. Adım 2: Ardından yalın fiil gelir. Adım 3: I will visit doğru, I will visiting yanlıştır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Gelecek ay planetaryuma gideceğim.» cümlesi hangisidir?",
      options: [
        "I will visit the planetarium next month",
        "I visit the planetarium next month",
        "I will visits the planetarium",
        "I am visit the planetarium yesterday",
      ],
      correctAnswerIndex: 0,
      hint: "Next month gelecek işaretidir.",
      explanation:
        "Adım 1: Next month geleceği gösterir. Adım 2: Kalıp will ve yalın fiildir. Adım 3: I will visit the planetarium doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Ece'nin defterinde iki satır var. Birinci satır «I watch the stars every night», ikinci satır «I will visit the planetarium next month». Hangi satır geleceği anlatır ve neden?",
      options: [
        "İkinci satır, çünkü will ve next month gelecektir",
        "Birinci satır, çünkü every night gelecektir",
        "İkisi de will taşıdığı için gelecektir",
        "İkisi de simple present olduğu için gelecektir",
      ],
      correctAnswerIndex: 0,
      hint: "Every night alışkanlıktır.",
      explanation:
        "Adım 1: Every night tekrar eden bir alışkanlıktır. Adım 2: Will ve next month geleceği kurar. Adım 3: Gelecek satır planetaryum cümlesidir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
