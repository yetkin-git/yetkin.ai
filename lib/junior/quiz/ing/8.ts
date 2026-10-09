import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (8/20). */
export const JUNIOR_ING_QUIZ_8 = {
  lessonKey: "jr_06_ing_main-8",
  title: "Happy, anxious ve scared",
  tellGuides: [
    "Name three feelings and say when you feel them.",
    "How is I am happy different from It is sunny?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Duygu cümlesi nasıl kurulur?",
      options: [
        "I am / He is + duygu sıfatı",
        "It is + duygu sıfatı (her zaman)",
        "I are happy",
        "Weather + feeling",
      ],
      correctAnswerIndex: 0,
      hint: "Duygu kişiye, hava It is'e bağlanır.",
      explanation: "Adım 1: Duygu I am / she is ile kurulur. Adım 2: Hava It is ile kurulur. Adım 3: I am happy doğru duygu kalıbıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru duygu cümlesidir?",
      options: [
        "She is scared of the dark",
        "She are scared of the dark",
        "She scared is dark",
        "It is scared of the dark",
      ],
      correctAnswerIndex: 0,
      hint: "She ile is kullanılır.",
      explanation: "Adım 1: Özne she'dir. Adım 2: Is + scared gerekir. Adım 3: Of korkunun nesnesini bağlar.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ece sınavdan önce gergin, notu görünce mutlu. Hangisi doğru eşleştirmedir?",
      options: [
        "Before: anxious · After: happy",
        "Before: sunny · After: rainy",
        "Before: bigger · After: cheaper",
        "Before: was · After: were",
      ],
      correctAnswerIndex: 0,
      hint: "Anxious gergin, happy mutlu demektir.",
      explanation: "Adım 1: Sınav öncesi gerginlik anxious'tır. Adım 2: İyi not sonrası happy'dir. Adım 3: Hava veya karşılaştırma bu senaryoya girmez.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
