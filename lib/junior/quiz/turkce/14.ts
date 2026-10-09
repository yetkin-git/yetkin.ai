import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (14/20). */
export const JUNIOR_TURKCE_QUIZ_14 = {
  lessonKey: "jr_06_turkce-14",
  title: "İsim ve fiil kökü",
  tellGuides: [
    "İsim kökü ile fiil kökünü kendi sözlerinle ayırır mısın?",
    "«Gözlük» sözcüğünün neden tek başına kök olmadığını anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Kök nedir?",
      options: [
      "Anlamı taşıyan en küçük parça",
      "Yalnızca çoğul eki",
      "Yalnızca nokta işareti",
      "Yalnızca paragraf başlığı",
      ],
      correctAnswerIndex: 0,
      hint: "Göz, taş, gel, yaz gibi parçaları düşün.",
      explanation: "Adım 1: Kök anlamı taşıyan en küçük parçadır. Adım 2: İsim kökü ad, fiil kökü iş taşır. Adım 3: Ekler köke eklenir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi fiil köküdür?",
      options: [
      "gel",
      "göz",
      "taş",
      "ev",
      ],
      correctAnswerIndex: 0,
      hint: "Hangisi bir iş / eylem taşır?",
      explanation: "Adım 1: Fiil kökü iş taşır. Adım 2: gel, yaz, sev böyledir. Adım 3: göz, taş, ev isim köküdür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ada «gözlük» sözcüğünü kök sayıyor. Hangisi doğru düzeltmedir?",
      options: [
      "Göz köktür; gözlük türemiş sözcüktür",
      "Gözlük isim köküdür",
      "Gözlük fiil köküdür",
      "Gözlük mastar ekidir",
      ],
      correctAnswerIndex: 0,
      hint: "Göz + lük ayrımını düşün.",
      explanation: "Adım 1: Kök en küçük anlamlı parçadır. Adım 2: göz köktür. Adım 3: gözlük yapım ekiyle türemiştir; tek başına kök değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
