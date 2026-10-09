import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (12/20). */
export const JUNIOR_TURKCE_QUIZ_12 = {
  lessonKey: "jr_06_turkce-12",
  title: "Metin türleri",
  tellGuides: [
    "Hikâye, anı, mektup, tiyatro ve gezi yazısını kendi sözlerinle ayırır mısın?",
    "Anının neden çoğu zaman birinci kişiyle anlatıldığını açıklar mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Anı metni nasıl anlatılır?",
      options: [
      "Yaşanmışı çoğu zaman birinci kişiyle anlatır",
      "Yalnızca kurmaca diyalogdur",
      "Yalnızca hitap yazısıdır",
      "Yalnızca noktalama listesidir",
      ],
      correctAnswerIndex: 0,
      hint: "«Ben o gün…» anlatımını düşün.",
      explanation: "Adım 1: Anı yaşanmışı anlatır. Adım 2: Çoğu zaman birinci kişidedir. Adım 3: Hikâye kurmaca olabilir; mektupta hitap vardır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Kişilerin konuşmasıyla ilerleyen metin türü hangisidir?",
      options: [
      "Tiyatro",
      "Gezi yazısı",
      "Anı",
      "Tanım paragrafı",
      ],
      correctAnswerIndex: 0,
      hint: "Sahne ve replikleri düşün.",
      explanation: "Adım 1: Tiyatro konuşmalarla ilerler. Adım 2: Gezi yazısı yer ve izlenim taşır. Adım 3: Anı yaşanmışı anlatır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Metinde «Sevgili arkadaşım,» hitabı ve özlem cümleleri var. Hangisi en uygundur?",
      options: [
      "Mektup",
      "Tiyatro",
      "Yalnızca atasözü listesi",
      "İsim kökü listesi",
      ],
      correctAnswerIndex: 0,
      hint: "Hitap hangi türde sık görülür?",
      explanation: "Adım 1: Mektupta hitap vardır. Adım 2: Özlem ve sesleniş mektuba uyar. Adım 3: Tiyatro replikle ilerler; bu örnek mektuptur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
