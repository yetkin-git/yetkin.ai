import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (6/20). */
export const JUNIOR_TURKCE_QUIZ_6 = {
  lessonKey: "jr_06_turkce-6",
  title: "Neden-sonuç, amaç-sonuç ve koşul-sonuç cümleleri",
  tellGuides: [
    "Neden-sonuç ile amaç-sonucu kendi sözlerinle ayırır mısın?",
    "«İçin» sözcüğünün her zaman amaç olmadığını bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Amaç-sonuç cümlesi ne bildirir?",
      options: [
      "Hedef / amaç",
      "Geçmiş bir sebep",
      "Yalnızca soru",
      "Yalnızca noktalama",
      ],
      correctAnswerIndex: 0,
      hint: "«Dinlenmek için yattı» cümlesindeki hedefi düşün.",
      explanation: "Adım 1: Amaç-sonuç hedef bildirir. Adım 2: Neden-sonuç sebep bildirir. Adım 3: Doğru seçenek hedeftir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Hasta olduğu için gelmedi.» cümlesi hangi türdedir?",
      options: [
      "Neden-sonuç",
      "Amaç-sonuç",
      "Koşul-sonuç",
      "Öznel yargı",
      ],
      correctAnswerIndex: 0,
      hint: "Hastalık, gelmemenin sebebi midir?",
      explanation: "Adım 1: «İçin» burada sebep bağlar. Adım 2: Hastalık olmuş bir sebeptir. Adım 3: Bu neden-sonuç cümlesidir; amaç değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ela «Yağmur yağarsa pikniğe gitmeyiz.» diyor. Hangisi doğrudur?",
      options: [
      "Koşul-sonuç; henüz olmamış şarta bağlıdır",
      "Amaç-sonuçtur",
      "Yalnızca nesnel tanımdır",
      "Terim anlamdır",
      ],
      correctAnswerIndex: 0,
      hint: "Yağmur henüz yağmadı; şart bekleniyor.",
      explanation: "Adım 1: «Yağarsa» henüz gerçekleşmemiş şarttır. Adım 2: Sonuç şarta bağlanmıştır. Adım 3: Bu koşul-sonuç cümlesidir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
