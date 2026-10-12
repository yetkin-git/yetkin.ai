import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — Universe, there is. */
export const JUNIOR_ING_QUIZ_6 = {
  lessonKey: "jr_06_ing_main-6",
  title: "Universe: gökyüzü ve there is",
  tellGuides: [
    "Güneş ve Ay için birer İngilizce cümle kur.",
    "There is ile there are farkını bir örnekle söyle.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Çoğul varlık hangi kalıpla söylenir?",
      options: ["There are", "There is", "There am", "There be"],
      correctAnswerIndex: 0,
      hint: "Are çoğulla gelir.",
      explanation:
        "Adım 1: Tekil için there is kullanılır. Adım 2: Çoğul için there are gelir. Adım 3: There are eight planets doğrudur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Güneş bir yıldızdır.» cümlesi hangisidir?",
      options: ["The Sun is a star", "The Sun is a planet", "The Moon is a star", "There are a Sun"],
      correctAnswerIndex: 0,
      hint: "Sun star diye tanımlanır.",
      explanation:
        "Adım 1: Güneş'in İngilizcesi the Sun'dır. Adım 2: O bir yıldızdır, gezegen değildir. Adım 3: The Sun is a star doğru cümledir.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Gökyüzü tablosunda bir dolunay, birçok yıldız ve sekiz gezegen yazılı. «There is many stars» satırı neden düzeltilir ve doğru cümle nedir?",
      options: [
        "Yıldızlar çoğuldur: There are many stars",
        "Yıldız tek olduğu için There is a stars",
        "Gezegenler there is ile sayılır",
        "Ay için There are a moon yazılır",
      ],
      correctAnswerIndex: 0,
      hint: "Many çoğul işaretidir.",
      explanation:
        "Adım 1: Many stars birden çok yıldız demektir. Adım 2: Çoğul there are ister. Adım 3: Doğru cümle There are many stars olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
