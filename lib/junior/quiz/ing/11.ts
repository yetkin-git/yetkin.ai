import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — World and Culture, kutlama ve yemek. */
export const JUNIOR_ING_QUIZ_11 = {
  lessonKey: "jr_06_ing_main-11",
  title: "World and Culture: kutlama ve yemek",
  tellGuides: [
    "Kendi bayram yemeğini we eat ile anlat.",
    "Başka bir kültür için they celebrate cümlesi kur.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Başka bir grubun yemeği hangi özneyle söylenir?",
      options: ["they", "we", "am", "is"],
      correctAnswerIndex: 0,
      hint: "They karşı grubu anlatır.",
      explanation:
        "Adım 1: We kendi grubumuzu söyler. Adım 2: They başka grubu söyler. Adım 3: They eat rice doğru öznedir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Türkiye'de ailemizle kutlarız.» cümlesi hangisidir?",
      options: [
        "In Turkey we celebrate with our family",
        "In Turkey they am celebrate family",
        "In Turkey we celebrates with our family",
        "In Turkey from celebrate we",
      ],
      correctAnswerIndex: 0,
      hint: "We celebrate yalın fiil ister.",
      explanation:
        "Adım 1: Kendi grubumuz we ile kurulur. Adım 2: Celebrate yalın kalır. Adım 3: In Turkey we celebrate with our family doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Sofra tablosunda birinci satır «In Turkey we eat baklava», ikinci satır «In Japan they eat rice dishes» diyor. İkinci satır neden they kullanır?",
      options: [
        "Çünkü Japonya'daki grup konuşanın kendi grubu değildir",
        "Çünkü baklava Japon yemeğidir",
        "Çünkü they tek bir kişiyi anlatır",
        "Çünkü we yalnız ülke adı ister",
      ],
      correctAnswerIndex: 0,
      hint: "They gözlenen diğer gruptur.",
      explanation:
        "Adım 1: Birinci satır konuşanın kendi sofrasıdır. Adım 2: İkinci satır başka bir ülkedir. Adım 3: O grup they ile anlatılır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
