import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (11/20). */
export const JUNIOR_SOSYAL_QUIZ_11 = {
  lessonKey: "jr_06_sosyal-11",
  title: "Türkiye'nin yeryüzü şekilleri ve bitki örtüsü",
  tellGuides: [
    "Yeryüzü şekillerinin iklimi nasıl böldüğünü anlatır mısın?",
    "Bitki örtüsünün yükselti ve iklimle bağını bir örnekle söyler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yeryüzü şekilleri neyi kapsar?",
      options: [
      "Dağ, ova, plato gibi yüzey biçimlerini",
      "Yalnızca nüfus sayısını",
      "Yalnızca parti listelerini",
      "Yalnızca vergi türlerini",
      ],
      correctAnswerIndex: 0,
      hint: "Yeryüzünün kabartı ve çukurlukları.",
      explanation: "Adım 1: Dağ, ova, plato yeryüzü şeklidir. Adım 2: Bunlar iklim ve yerleşimi etkiler. Adım 3: Nüfus veya vergi tanımı değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Yüksek dağların denize paralel uzanması kıyı ile iç kesim arasında neyi güçleştirir?",
      options: [
      "Nemli havanın içlere kolayca geçmesini",
      "Hiçbir iklim farkını",
      "Yalnızca boylam hesaplarını",
      "Vergi toplamasını",
      ],
      correctAnswerIndex: 0,
      hint: "Dağlar nemli havanın yolunu kesebilir.",
      explanation: "Adım 1: Denize paralel dağlar bariyer gibi davranır. Adım 2: Nemli hava içlere zor geçer. Adım 3: Bu yüzden kıyı ve iç kesim bitki örtüsü farklılaşır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Aynı enlemde kıyıda orman, içte bozkır görülüyorsa öğrenci neyi çıkarır?",
      options: [
      "Bitki örtüsü yalnız enleme değil, yükselti ve nem koşullarına da bağlıdır",
      "Bitki örtüsü rastgele değişir",
      "Enlem hiç işe yaramaz",
      "Bozkır yalnız kutupta olur",
      ],
      correctAnswerIndex: 0,
      hint: "Aynı enlem, farklı nem ve yükselti.",
      explanation: "Adım 1: Enlem tek etken değildir. Adım 2: Nem ve yükselti bitkiyi değiştirir. Adım 3: Bu çıkarım LGS sosyal okuryazarlığına uygundur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
