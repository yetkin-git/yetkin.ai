import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (18/20). */
export const JUNIOR_TURKCE_QUIZ_18 = {
  lessonKey: "jr_06_turkce-18",
  title: "de, da, ki ve mi'nin yazımı",
  tellGuides: [
    "Bağlaç de/da ile bulunma eki -de/-da farkını kendi sözlerinle anlatır mısın?",
    "Soru eki mi'nin neden her zaman ayrı yazıldığını açıklar mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Bağlaç olan de / da nasıl yazılır?",
      options: [
      "Ayrı yazılır",
      "Her zaman bitişik yazılır",
      "Yalnızca büyük harfle yazılır",
      "Yalnızca tırnak içinde yazılır",
      ],
      correctAnswerIndex: 0,
      hint: "«Ali de geldi.» örneğini düşün.",
      explanation: "Adım 1: Bağlaç de/da ayrı yazılır. Adım 2: Bulunma eki bitişiktir (evde). Adım 3: Doğru seçenek ayrı yazımdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisinde bulunma eki vardır?",
      options: [
      "Ali evde.",
      "Ali de geldi.",
      "O da geldi.",
      "Geldin mi?",
      ],
      correctAnswerIndex: 0,
      hint: "Hangisi «nerede?» sorusuna cevap verir?",
      explanation: "Adım 1: evde bulunma ekidir ve bitişiktir. Adım 2: Ali de / O da bağlaçtır. Adım 3: mi soru ekidir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Yarınki» ve «ki bağlacı» için hangisi doğrudur?",
      options: [
      "Yarınki bitişik; bağlaç ki ayrıdır",
      "İkisi de her zaman ayrıdır",
      "İkisi de her zaman bitişiktir",
      "İkisi de soru ekidir",
      ],
      correctAnswerIndex: 0,
      hint: "seninki / yarınki bitişik; «ki» bağlacı ayrıdır.",
      explanation: "Adım 1: Bağlaç ki ayrı yazılır. Adım 2: yarınki, seninki bitişiktir. Adım 3: Soru eki mi her zaman ayrıdır; ki değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
