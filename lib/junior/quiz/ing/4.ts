import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (4/20). */
export const JUNIOR_ING_QUIZ_4 = {
  lessonKey: "jr_06_ing_main-4",
  title: "Rica etmek ve some, any",
  tellGuides: [
    "How do you politely ask for some juice at breakfast?",
    "When do we use some and when do we use any?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Some genellikle hangi cümlede kullanılır?",
      options: [
        "Olumlu cümlede",
        "Yalnızca geçmiş zamanda",
        "Yalnızca hava cümlesinde",
        "Hiçbir cümlede kullanılmaz",
      ],
      correctAnswerIndex: 0,
      hint: "Some olumlu; any soru/olumsuzdadır.",
      explanation: "Adım 1: Some olumlu cümlede miktar söyler. Adım 2: Any soru ve olumsuzdadır. Adım 3: Bu yüzden doğru seçenek olumlu cümledir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi kibar bir ricadır?",
      options: [
        "Can I have some water, please?",
        "Give me water now!",
        "I don't any water",
        "Water is me",
      ],
      correctAnswerIndex: 0,
      hint: "Can I have… please kibar kalıptır.",
      explanation: "Adım 1: Rica Can I have ile kurulur. Adım 2: Some olumlu ricada kullanılır. Adım 3: Please kibarlığı tamamlar.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Is there ___ milk in the fridge?» Boşluğa hangisi uygundur?",
      options: [
        "any",
        "some",
        "a",
        "an",
      ],
      correctAnswerIndex: 0,
      hint: "Soru cümlesinde any beklenir.",
      explanation: "Adım 1: Cümle sorudur. Adım 2: Soruda genelde any kullanılır. Adım 3: Some daha çok olumludadır; burada any doğrudur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
