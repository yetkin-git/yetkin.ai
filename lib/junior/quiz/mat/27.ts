import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (27). */
export const JUNIOR_MAT_QUIZ_27 = {
  lessonKey: "jr_06_mat-27",
  title: "Standart uzunluk ölçü birimleri",
  tellGuides: [
    "Santimetreden metreye geçerken neden bölersin?",
    "250 santimetre ile 250 metre neden aynı değildir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "1 metre kaç santimetredir?",
      options: [
        "10",
        "100",
        "1000",
        "60",
      ],
      correctAnswerIndex: 1,
      hint: "Metre, santimetreden büyüktür.",
      explanation: "Adım 1: 1 metre 100 santimetredir. Adım 2: 1 kilometre 1000 metredir. Adım 3: 10 santimetre 1 desimetredir; metreye yetmez.",
    },
    {
      id: "q2",
      level: "apply",
      question: "250 santimetre kaç metredir?",
      options: [
        "250 metre",
        "25 metre",
        "2,5 metre",
        "0,25 metre",
      ],
      correctAnswerIndex: 2,
      hint: "100 santimetre 1 metredir. Böl.",
      explanation: "Adım 1: 250 bölü 100, 2,5 eder. Adım 2: Birim büyüyünce sayı küçülür. Adım 3: 250 metre çok daha uzun bir yoldur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Okul bahçesindeki 3 kilometrelik parkuru metreye çevirirsek ne olur?",
      options: [
        "30 metre",
        "300 metre",
        "3000 metre",
        "3 metre",
      ],
      correctAnswerIndex: 2,
      hint: "1 kilometre 1000 metredir. Çarp.",
      explanation: "Adım 1: Küçük birime geçerken çarpılır. Adım 2: 3 çarpı 1000, 3000 eder. Adım 3: Parkurun uzunluğu 3000 metredir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
