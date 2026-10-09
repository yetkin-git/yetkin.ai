import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (2/20). */
export const JUNIOR_TURKCE_QUIZ_2 = {
  lessonKey: "jr_06_turkce-2",
  title: "Eş anlam, zıt anlam ve yakın anlamlı sözcükler",
  tellGuides: [
    "Eş anlam, zıt anlam ve yakın anlam arasındaki farkı kendi sözlerinle anlatır mısın?",
    "Yakın anlamlı iki sözcüğün her cümlede yer değiştirememesini bir örnekle açıklar mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Eş anlamlı sözcükler hangisidir?",
      options: [
      "Aynı veya çok yakın işi söyleyen sözcükler",
      "Karşıt anlamlı sözcükler",
      "Yalnızca aynı harfle başlayan sözcükler",
      "Sadece terim olan sözcükler",
      ],
      correctAnswerIndex: 0,
      hint: "Cevap ile yanıt gibi aynı işi söyleyenleri düşün.",
      explanation: "Adım 1: Eş anlamlılar aynı veya çok yakın anlam taşır. Adım 2: Zıt anlamlılar karşıttır. Adım 3: Bu yüzden doğru seçenek aynı işi söyleyen sözcüklerdir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Açık» sözcüğünün zıt anlamlısı hangisidir?",
      options: [
      "Kapalı",
      "Geniş",
      "Yakın",
      "Hoş",
      ],
      correctAnswerIndex: 0,
      hint: "Kapı açıkken karşıtı nedir?",
      explanation: "Adım 1: Zıt anlam karşıtlık taşır. Adım 2: Açık ile kapalı birbirinin karşıtıdır. Adım 3: Geniş, yakın ve hoş zıt anlam değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Deniz «güzel» ile «hoş»u her cümlede değiş tokuş edebileceğini düşünüyor. Hangisi doğru düzeltmedir?",
      options: [
      "Yakın anlamlıdırlar; her cümlede yer değiştirmeyebilirler",
      "Tam eş anlamlıdırlar; her yerde değişirler",
      "Zıt anlamlıdırlar",
      "Terim anlamdırlar",
      ],
      correctAnswerIndex: 0,
      hint: "Yakın anlam benzerdir ama her bağlamda aynı değildir.",
      explanation: "Adım 1: Güzel ile hoş yakın anlamlıdır. Adım 2: Yakın anlamlılar her cümlede yer değiştirmeyebilir. Adım 3: Bu yüzden Deniz’in düşüncesi düzeltilmelidir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
