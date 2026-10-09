import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (15/20). */
export const JUNIOR_ING_QUIZ_15 = {
  lessonKey: "jr_06_ing_main-15",
  title: "Kitap okumaktan söz etmek",
  tellGuides: [
    "Talk about a book: its type and your opinion.",
    "Can you say I like this story because… in English?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Kitap türü ile kişisel görüş nasıl ayrılır?",
      options: [
        "Tür kitabı sınıflar; görüş senin fikrindir",
        "İkisi de aynı şeydir",
        "Tür yalnızca yazardır",
        "Görüş yalnızca kapak rengiidir",
      ],
      correctAnswerIndex: 0,
      hint: "Adventure tür; I think görüştür.",
      explanation: "Adım 1: Tür (story, adventure) kitabı sınıflar. Adım 2: I think / I like görüştür. Adım 3: İkisi ayrı söylenir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi kitap hakkında doğal bir cümledir?",
      options: [
        "This is an adventure story. I think it is exciting",
        "This is an adventure story. It is a doctor",
        "This is an adventure story. It was born in 2015",
        "This is an adventure story. Recycle the plastic",
      ],
      correctAnswerIndex: 0,
      hint: "Tür + görüş yan yana durur.",
      explanation: "Adım 1: Adventure story türdür. Adım 2: I think it is exciting görüştür. Adım 3: Diğer şıklar konu dışıdır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ayşe: «I read a funny comic. I don't like sad stories.» Hangisi doğrudur?",
      options: [
        "Ayşe komik çizgi roman okur; üzgün hikâyeleri sevmez",
        "Ayşe üzgün hikâyeleri sever",
        "Ayşe hiç kitap okumaz",
        "Ayşe yalnızca ders kitabı okur",
      ],
      correctAnswerIndex: 0,
      hint: "Funny comic ve don't like satırlarına bak.",
      explanation: "Adım 1: Funny comic = komik çizgi roman. Adım 2: Don't like sad stories = üzgün hikâye sevmez. Adım 3: Doğru çıkarım budur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
