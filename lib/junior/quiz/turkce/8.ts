import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (8/20). */
export const JUNIOR_TURKCE_QUIZ_8 = {
  lessonKey: "jr_06_turkce-8",
  title: "Paragrafta ana fikir ve konu",
  tellGuides: [
    "Konu ile ana fikri kendi sözlerinle ayırır mısın?",
    "Örnek cümlenin neden ana fikir olmadığını bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ana fikir nedir?",
      options: [
      "Paragrafın asıl yargısı (tektir)",
      "Yargısız genel alan",
      "Yalnızca örnek cümle",
      "Yalnızca başlık",
      ],
      correctAnswerIndex: 0,
      hint: "Konu alandır; ana fikir o alandaki asıl yargıdır.",
      explanation: "Adım 1: Konu yargısız alandır. Adım 2: Ana fikir asıl yargıdır ve tektir. Adım 3: Örnek cümle ana fikir değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Ağaçların yararı» ifadesi paragrafta neye karşılık gelir?",
      options: [
      "Konu",
      "Ana fikir",
      "Yardımcı fikir",
      "Sonuç cümlesi",
      ],
      correctAnswerIndex: 0,
      hint: "Yargı var mı, yoksa alan mı?",
      explanation: "Adım 1: «Ağaçların yararı» yargı taşımaz. Adım 2: Bu bir alandır. Adım 3: Bu yüzden konudur; ana fikir değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Metinde «Ağaçlar canlılara yarar sağlar.» ve «Gölge verir.» var. Hangisi ana fikirdir?",
      options: [
      "Ağaçlar canlılara yarar sağlar",
      "Gölge verir",
      "Ağaçların yararı",
      "Canlılar",
      ],
      correctAnswerIndex: 0,
      hint: "Asıl yargı hangisidir? Gölge bir örnektir.",
      explanation: "Adım 1: Ana fikir asıl yargıdır. Adım 2: «Yarar sağlar» asıl yargıdır. Adım 3: Gölge örnek / yardımcı iz taşır; konu ise yargısız alandır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
