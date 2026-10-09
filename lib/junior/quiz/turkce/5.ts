import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (5/20). */
export const JUNIOR_TURKCE_QUIZ_5 = {
  lessonKey: "jr_06_turkce-5",
  title: "Öznel ve nesnel anlatımlı cümleler",
  tellGuides: [
    "Öznel ve nesnel cümleyi kendi sözlerinle ayırır mısın?",
    "İçinde sayı olan her cümlenin nesnel olmayabileceğini bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Nesnel cümle nasıl tanımlanır?",
      options: [
      "Ölçülebilir ve herkes için aynı olan yargı",
      "Duygu ve kişisel yorum taşıyan yargı",
      "Yalnızca soru cümlesi",
      "Yalnızca ünlem cümlesi",
      ],
      correctAnswerIndex: 0,
      hint: "Herkesin aynı ölçebileceği bilgiyi düşün.",
      explanation: "Adım 1: Nesnel yargı ölçülür ve kişiden kişiye değişmez. Adım 2: Öznel yargı duygu ve yorum taşır. Adım 3: Doğru seçenek ölçülebilir ortak yargıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi öznel bir cümledir?",
      options: [
      "Bu masa çok güzel.",
      "Bu masa tahtadır.",
      "Bu masa iki metredir.",
      "Bu masanın dört ayağı vardır.",
      ],
      correctAnswerIndex: 0,
      hint: "Hangisi kişisel beğeni taşır?",
      explanation: "Adım 1: Tahta, ölçü ve ayak sayısı ölçülebilir. Adım 2: «Çok güzel» kişisel yorumdur. Adım 3: Bu yüzden özneldir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Can «Bu film 120 dakikadır ve efsane bir filmdir.» diyor. Hangisi doğru ayrımıdır?",
      options: [
      "İlk yargı nesnel, ikinci yargı özneldir",
      "İkisi de nesneldir",
      "İkisi de özneldir",
      "İkisi de terim anlamdır",
      ],
      correctAnswerIndex: 0,
      hint: "Süre ölçülür; «efsane» yorumdur.",
      explanation: "Adım 1: 120 dakika ölçülebilir; nesneldir. Adım 2: «Efsane» kişisel beğenidir; özneldir. Adım 3: Sayı var diye tüm cümle nesnel olmaz.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
