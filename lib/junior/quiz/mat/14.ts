import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (14/25). */
export const JUNIOR_MAT_QUIZ_14 = {
  lessonKey: "jr_06_mat-14",
  title: "Ondalık gösterimi okumak",
  tellGuides: [
    "Virgülün solu ile sağı arasındaki farkı anlatabilir misin?",
    "0,5 ile 0,25'i kesir olarak nasıl okursun?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ondalık gösterimde virgülün sağı neyi gösterir?",
      options: [
      "Kesir kısmını",
      "Yalnızca tam kısmı",
      "Üssü",
      "Paydayı siler",
      ],
      correctAnswerIndex: 0,
      hint: "Sol tam, sağ kesirdir.",
      explanation: "Adım 1: Virgülün solu tam sayıdır. Adım 2: Sağı kesir kısmıdır. Adım 3: 0,5 yarım; 0,25 dörtte birdir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "0,4 ile 0,35 karşılaştırıldığında hangisi doğrudur?",
      options: [
      "0,4 daha büyüktür",
      "0,35 daha büyüktür",
      "İkisi eşittir",
      "Karşılaştırılamaz",
      ],
      correctAnswerIndex: 0,
      hint: "0,40 ile 0,35 yazıp bak.",
      explanation: "Adım 1: 0,4 yazılırsa 0,40 olur. Adım 2: 40 ile 35 karşılaştırılır. Adım 3: 0,4 daha büyüktür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Market etiketi 0,5 kg yazıyor. Bu hangi kesre denktir?",
      options: [
      "Yarım",
      "Dörtte bir",
      "Beşte iki",
      "On ikide bir",
      ],
      correctAnswerIndex: 0,
      hint: "0,5 = 5/10 = 1/2.",
      explanation: "Adım 1: 0,5, 5 bölü 10 demektir. Adım 2: Sadeleşince 1/2 olur. Adım 3: Yarım kilogramdır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
