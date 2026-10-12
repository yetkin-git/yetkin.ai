import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — World and Culture, ülke ve milliyet. */
export const JUNIOR_ING_QUIZ_10 = {
  lessonKey: "jr_06_ing_main-10",
  title: "World and Culture: ülke ve milliyet",
  tellGuides: [
    "Ülkeni ve milliyetini iki İngilizce cümleyle söyle.",
    "From ile is farkını Turkey ve Turkish üzerinden kur.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ülke adı hangi sözcükle bağlanır?",
      options: ["from", "is nationality", "will", "have got"],
      correctAnswerIndex: 0,
      hint: "From ülke ister.",
      explanation:
        "Adım 1: Ülke adı from ile gelir. Adım 2: Milliyet sıfatı is ile gelir. Adım 3: I am from Turkey doğrudur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«O Japonya'dan ve Japon.» cümle çifti hangisidir?",
      options: [
        "She is from Japan and she is Japanese",
        "She is from Japanese and she is Japan",
        "She is Japan from Japanese",
        "She has got from Japan",
      ],
      correctAnswerIndex: 0,
      hint: "Japan ülke, Japanese milliyettir.",
      explanation:
        "Adım 1: From ülke adı Japan ile kurulur. Adım 2: Is milliyet sıfatı Japanese ile kurulur. Adım 3: İki cümle bu sırayla doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Sınıf tablosunda Ece «I am from Turkish» yazmış, yanında «I am Turkey» yazmış. İki satır da yanlışsa doğru çift hangisidir?",
      options: [
        "I am from Turkey ve I am Turkish",
        "I am from Turkish ve I am Turkey",
        "I am from Japanese ve I am Japan",
        "I will from Turkey ve I are Turkish",
      ],
      correctAnswerIndex: 0,
      hint: "From ülke, is milliyet.",
      explanation:
        "Adım 1: Turkish bir milliyet sıfatıdır, ülke adı değildir. Adım 2: Turkey ülke adıdır. Adım 3: Doğru çift from Turkey ve am Turkish olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
