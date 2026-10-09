import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (7/20). */
export const JUNIOR_FEN_QUIZ_7 = {
  lessonKey: "jr_06_fen-7",
  title: "Solunum sistemi",
  tellGuides: [
    "Soluk alma ve vermede diyaframın rolünü anlatabilir misin?",
    "Gaz alışverişi nerede olur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Soluk alma ve vermeyi sağlayan kas hangisidir?",
      options: [
      "Diyafram",
      "Kalp kapağı",
      "Böbrek",
      "Kulak zarı",
      ],
      correctAnswerIndex: 0,
      hint: "Göğüs boşluğunun altındaki kastır.",
      explanation: "Adım 1: Diyafram göğüs boşluğunun altındadır. Adım 2: Kasılınca göğüs genişler, soluk alınır. Adım 3: Gevşeyince soluk verilir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Oksijen ile karbondioksit değişimi nerede olur?",
      options: [
      "Alveollerde",
      "Mide duvarında",
      "Tırnak kökünde",
      "Saç telinde",
      ],
      correctAnswerIndex: 0,
      hint: "Akciğerdeki ince kesecikler.",
      explanation: "Adım 1: Hava bronşlardan alveollere ulaşır. Adım 2: Alveol duvarı incedir. Adım 3: Orada oksijen kana, karbondioksit dışarı geçer.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Derin nefes alıp üfleme yarışında doğru bilimsel ifade hangisidir?",
      options: [
      "Oksijen kana geçer, karbondioksit dışarı verilir",
      "Karbondioksit kana girer, oksijen dışarı atılır",
      "Ses boşlukta daha hızlı yayılır",
      "Kemikler gaz alışverişi yapar",
      ],
      correctAnswerIndex: 0,
      hint: "Alınan oksijen, verilen karbondioksit.",
      explanation: "Adım 1: Soluk alırken oksijen alveollere gelir. Adım 2: Oksijen kana geçer. Adım 3: Hücrelerden gelen karbondioksit solukla dışarı verilir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
