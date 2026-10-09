import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (1/20). */
export const JUNIOR_SOSYAL_QUIZ_1 = {
  lessonKey: "jr_06_sosyal-1",
  title: "Değerlerimiz ve toplumdaki roller",
  tellGuides: [
    "Değer ile rol arasındaki farkı kendi sözlerinle anlatır mısın?",
    "Aynı kişinin bir günde taşıdığı iki rolü örnekle söyler misin?",
    "Rol değişirken değerin yanında kaldığını nasıl açıklarsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Sosyal Bilgilerde «değer» ne demektir?",
      options: [
      "Birlikte yaşamayı kolaylaştıran ilke",
      "Okuldaki sınıf numarası",
      "Haritadaki bir şehir adı",
      "Yalnızca bir spor takımındaki görev",
      ],
      correctAnswerIndex: 0,
      hint: "Saygı ve dürüstlük bu taraftadır; görev adı değildir.",
      explanation: "Adım 1: Değer, birlikte yaşamayı güzelleştiren ilkedir. Adım 2: Saygı, dürüstlük ve yardımlaşma değer örneğidir. Adım 3: Rol ise bir yerdeki görevdir; değerin kendisi değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Sabah kardeşine yardım eden, öğlen derste söz alan bir çocuk için hangisi doğrudur?",
      options: [
      "İki farklı rol, aynı kişinin değerleriyle birlikte yürür",
      "Rol değişince değerler de silinir",
      "Öğrenci olmak bir değerdir, kardeş olmak değildir",
      "Aynı kişi günde yalnız bir rol taşıyabilir",
      ],
      correctAnswerIndex: 0,
      hint: "Ortam değişince görev adı değişir; erdem yanında kalır.",
      explanation: "Adım 1: Evde kardeş, okulda öğrenci olmak iki ayrı roldür. Adım 2: Yardımlaşma ve saygı bu rollerin içinde değer olarak kalır. Adım 3: Aynı kişi birden fazla rol taşır; değerler silinmez.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ece, «Ben yalnızca öğrenciyim; başka hiçbir rolüm yok» diyor. Hangisi doğru düzeltmedir?",
      options: [
      "Aynı kişi evde, okulda ve oyunda farklı roller taşıyabilir",
      "Rol yalnızca kimlik kartındaki meslektir",
      "Değer ile rol aynı şeydir",
      "Rol bitince kişi toplumdan çıkar",
      ],
      correctAnswerIndex: 0,
      hint: "Gün içinde ortam değişince görev de değişir.",
      explanation: "Adım 1: Rol, bulunduğun ortamdaki görevdir. Adım 2: Ece evde kardeş, sahada oyuncu da olabilir. Adım 3: Bu yüzden «yalnız öğrenci» demek eksik kalır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
