import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (10/25). */
export const JUNIOR_MAT_QUIZ_10 = {
  lessonKey: "jr_06_mat-10",
  title: "Kesirleri karşılaştırma ve sıralama",
  tellGuides: [
    "Aynı paydada büyük payın neden kazandığını anlatabilir misin?",
    "Birim kesirde büyük paydanın neden küçülttüğünü bir örnekle söyleyebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Paydalar aynıysa hangisi doğrudur?",
      options: [
      "Büyük pay daha büyüktür",
      "Küçük pay daha büyüktür",
      "Paylar önemsizdir",
      "Her zaman eşittirler",
      ],
      correctAnswerIndex: 0,
      hint: "Aynı dilim boyunda daha çok dilim daha büyüktür.",
      explanation: "Adım 1: Payda dilimin boyudur. Adım 2: Pay, kaç dilim alındığını söyler. Adım 3: Payda aynıysa büyük pay kazanır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Dörtte üç ile üçte bir karşılaştırıldığında hangisi doğrudur?",
      options: [
      "Dörtte üç daha büyüktür",
      "Üçte bir daha büyüktür",
      "İkisi eşittir",
      "İkisi de birimden küçüktür ve karşılaştırılamaz",
      ],
      correctAnswerIndex: 0,
      hint: "Dörtte üç neredeyse bütün pastadır; üçte bir daha küçüktür.",
      explanation: "Adım 1: Dörtte üç, pastanın çoğudur. Adım 2: Üçte bir, pastanın küçük parçasıdır. Adım 3: Dörtte üç daha büyüktür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir pizzanın dörtte üçü yenmiş, diğerinin üçte biri yenmiş. Hangisi daha çok yenmiştir?",
      options: [
      "Dörtte üç yenilen pizza",
      "Üçte bir yenilen pizza",
      "İkisi aynıdır",
      "Karşılaştırılamaz",
      ],
      correctAnswerIndex: 0,
      hint: "Aynı bütün varsay; kesirleri karşılaştır.",
      explanation: "Adım 1: Dörtte üç, bütünün büyük kısmıdır. Adım 2: Üçte bir daha küçüktür. Adım 3: Dörtte üç yenilen pizza daha çok yenmiştir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
