import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (11/20). */
export const JUNIOR_TURKCE_QUIZ_11 = {
  lessonKey: "jr_06_turkce-11",
  title: "Anlatım biçimleri ve düşünceyi geliştirme yolları",
  tellGuides: [
    "Öyküleme, betimleme, açıklama ve tartışmayı kendi sözlerinle ayırır mısın?",
    "Örnekleme veya karşılaştırma gibi bir düşünceyi geliştirme yolunu bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Öyküleme ne anlatır?",
      options: [
      "Olay anlatır",
      "Yalnızca görünüşü gösterir",
      "Yalnızca sayı verir",
      "Yalnızca tanım yazar",
      ],
      correctAnswerIndex: 0,
      hint: "Zaman içinde olup bitenleri düşün.",
      explanation: "Adım 1: Öyküleme olay anlatır. Adım 2: Betimleme görünüşü gösterir. Adım 3: Açıklama bilgi verir; tartışma savunur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Kalem kırmızı, kenarı yıpranmıştı.» cümlesi hangi anlatım biçimine yakındır?",
      options: [
      "Betimleme",
      "Öyküleme",
      "Tartışma",
      "Tanık gösterme",
      ],
      correctAnswerIndex: 0,
      hint: "Görünüş mü anlatılıyor, olay mı?",
      explanation: "Adım 1: Renk ve yıpranma görünüştür. Adım 2: Bu betimlemedir. Adım 3: Olay zinciri yoktur; öyküleme değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yazar düşüncesini güçlendirmek için bir uzman adı veriyor. Bu hangi yoldur?",
      options: [
      "Tanık gösterme",
      "Yalnızca betimleme",
      "Yapım eki",
      "Kesme işareti",
      ],
      correctAnswerIndex: 0,
      hint: "Başkasının sözü veya adı düşünceyi nasıl güçlendirir?",
      explanation: "Adım 1: Düşünceyi geliştirme yollarından biri tanık göstermedir. Adım 2: Uzman adı buna örnektir. Adım 3: Betimleme görünüş; ek ve noktalama ayrı işlerdir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
