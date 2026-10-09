import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (18/20). */
export const JUNIOR_ING_QUIZ_18 = {
  lessonKey: "jr_06_ing_main-18",
  title: "Should ve shouldn't",
  tellGuides: [
    "Give two tips with should and one warning with shouldn't for the planet.",
    "Does the verb after should stay in the base form? Explain with an example.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Should ne işe yarar?",
      options: [
        "Öneri verir",
        "Yalnızca geçmiş anlatır",
        "Saati sorar",
        "Artikeli seçer",
      ],
      correctAnswerIndex: 0,
      hint: "Should = yapmalısın; shouldn't = yapmamalısın.",
      explanation: "Adım 1: Should öneri kalıbıdır. Adım 2: Shouldn't vazgeçirir. Adım 3: Sonraki fiil yalın kalır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru öneridir?",
      options: [
        "You should turn off the lights",
        "You should turning off the lights",
        "You shouldn't to waste water",
        "You should turns off the lights",
      ],
      correctAnswerIndex: 0,
      hint: "Should + yalın fiil.",
      explanation: "Adım 1: Should'dan sonra fiil yalındır. Adım 2: Turn off doğru biçimdir. Adım 3: Turning/turns/to waste yanlış eklerdir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«We shouldn't throw plastic into the sea.» Bu cümle ne der?",
      options: [
        "Plastiği denize atmamalıyız",
        "Plastiği denize atmalıyız",
        "Deniz çok sıcaktır",
        "Bugün yağmur yağacak",
      ],
      correctAnswerIndex: 0,
      hint: "Shouldn't yasak/uyarıdır.",
      explanation: "Adım 1: Shouldn't = yapmamalı. Adım 2: Throw plastic into the sea = denize plastik atmak. Adım 3: Cümle bunu yasaklar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
