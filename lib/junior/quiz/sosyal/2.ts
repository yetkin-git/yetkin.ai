import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (2/20). */
export const JUNIOR_SOSYAL_QUIZ_2 = {
  lessonKey: "jr_06_sosyal-2",
  title: "Toplumsal uyum ve yardımlaşma",
  tellGuides: [
    "Toplumsal uyum ile yardımlaşmayı nasıl ayırırsın?",
    "Sırada beklemek hangi değere ve hangi uyuma örnektir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Toplumsal uyum neyi anlatır?",
      options: [
      "Birlikte yaşarken kurallara ve birbirine saygı göstermek",
      "Herkesin aynı kıyafeti giymesi",
      "Yalnızca akrabalarla konuşmak",
      "Kuralları hiç dinlememek",
      ],
      correctAnswerIndex: 0,
      hint: "Birlikte yaşamayı kolaylaştıran tutumu düşün.",
      explanation: "Adım 1: Uyum, birlikte yaşamayı düzenler. Adım 2: Saygı ve kurallar bu düzenin parçasıdır. Adım 3: Aynı kıyafet veya yalnız akraba olmak uyum tanımı değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Deprem sonrası komşuların ortak yardım çadırı kurması neye örnektir?",
      options: [
      "Yardımlaşma ve toplumsal dayanışma",
      "Önyargı",
      "Mutlak konum",
      "Vergi kaçırma",
      ],
      correctAnswerIndex: 0,
      hint: "Bir ihtiyacı birlikte karşılamak hangi davranıştır?",
      explanation: "Adım 1: Yardımlaşma, ihtiyacı olanı desteklemektir. Adım 2: Ortak çadır kurmak dayanışmadır. Adım 3: Bu, önyargı veya konum bilgisiyle karışmaz.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Otobüste yaşlı bir yolcuya yer vermek ile «benim işim değil» demek arasındaki fark nedir?",
      options: [
      "İlki yardımlaşma ve uyumu güçlendirir; ikincisi ortak yaşamı zayıflatır",
      "İkisi de aynı vatandaşlık hakkıdır",
      "Yer vermek vergi ödemektir",
      "«Benim işim değil» demek anayasal bir görevdir",
      ],
      correctAnswerIndex: 0,
      hint: "Küçük bir nezaket, ortak yaşamı nasıl etkiler?",
      explanation: "Adım 1: Yer vermek yardımlaşma örneğidir. Adım 2: Uyum, başkasının ihtiyacını görmeyi içerir. Adım 3: Reddetmek hak veya vergi değildir; dayanışmayı zayıflatır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
