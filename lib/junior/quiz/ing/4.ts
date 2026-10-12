import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — Family Life, ev rutini. */
export const JUNIOR_ING_QUIZ_4 = {
  lessonKey: "jr_06_ing_main-4",
  title: "Family Life: evde rutin işler",
  tellGuides: [
    "Evdeki iki rutini simple present ile söyle.",
    "Always ile sometimes farkını birer cümlede göster.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "She ile cook fiili nasıl çekilir?",
      options: ["cooks", "cook", "cooking", "is cook"],
      correctAnswerIndex: 0,
      hint: "He ve she fiile s ister.",
      explanation:
        "Adım 1: She üçüncü tekil öznedir. Adım 2: Simple presentte fiile s gelir. Adım 3: She cooks dinner doğru biçimdir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Annem genellikle yemek pişirir.» cümlesi hangisidir?",
      options: [
        "She usually cooks dinner",
        "She usually cooking dinner",
        "She cook usually dinner",
        "She is usually cooks dinner",
      ],
      correctAnswerIndex: 0,
      hint: "Usually fiilden önce gelir.",
      explanation:
        "Adım 1: Alışkanlık simple presenttir. Adım 2: Usually, cooks fiilinden önce durur. Adım 3: She usually cooks dinner doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Ev tablosunda Ece her akşam sofrayı kurar, annesi genellikle yemek pişirir, kardeşi hiç çöp çıkarmaz. «He never takes out the rubbish» hangi satırı anlatır?",
      options: [
        "Kardeşin hiç yapmadığı işi",
        "Ece'nin her akşam kurduğu sofrayı",
        "Annenin genellikle pişirdiği yemeği",
        "Tam şu anda pişen yemeği",
      ],
      correctAnswerIndex: 0,
      hint: "Never hiçbir zaman demektir.",
      explanation:
        "Adım 1: He kardeşi işaret eder. Adım 2: Never o işin hiç yapılmadığını söyler. Adım 3: Cümle çöp çıkarma satırına aittir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
