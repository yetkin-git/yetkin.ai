import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (20/20). */
export const JUNIOR_SOSYAL_QUIZ_20 = {
  lessonKey: "jr_06_sosyal-20",
  title: "Ülkeler arası ticaret ve kültürel etkileşim",
  tellGuides: [
    "İhracat ile ithalatı kendi sözlerinle ayırır mısın?",
    "Ticaretin kültürel etkileşime nasıl yol açtığını bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İhracat ne demektir?",
      options: [
      "Ülkenin yurt dışına mal veya hizmet satması",
      "Yalnızca yurt içinden alışveriş",
      "Vergiyi silmek",
      "Enlem çizmek",
      ],
      correctAnswerIndex: 0,
      hint: "Dışarıya satış.",
      explanation: "Adım 1: İhracat dışarıya satıştır. Adım 2: İthalat dışarıdan alıştır. Adım 3: İkisi birlikte dış ticareti oluşturur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Bir ülke fındık satıp karşılığında makine alıyorsa bu neyi gösterir?",
      options: [
      "İhracat ve ithalatın birlikte işlediğini",
      "Ticaretin yasak olduğunu",
      "Yalnızca göreceli konumu",
      "Yalnızca önyargıyı",
      ],
      correctAnswerIndex: 0,
      hint: "Satış + alış = dış ticaret.",
      explanation: "Adım 1: Fındık satmak ihracattır. Adım 2: Makine almak ithalattır. Adım 3: Dış ticaret bu iki yönle yürür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ticaret yollarıyla yeni yemek, müzik veya kelimelerin yaygınlaşması neyin örneğidir?",
      options: [
      "Kültürel etkileşim",
      "Yenilenemez maden",
      "Yargı organı",
      "Mutlak konum hesabı",
      ],
      correctAnswerIndex: 0,
      hint: "Mal gider, kültür de taşınır.",
      explanation: "Adım 1: Ticaret insanları buluşturur. Adım 2: Alışkanlık ve kültür de taşınır. Adım 3: Bu kültürel etkileşimdir; maden veya yargı değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
