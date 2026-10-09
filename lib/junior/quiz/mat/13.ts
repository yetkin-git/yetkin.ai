import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (13/25). */
export const JUNIOR_MAT_QUIZ_13 = {
  lessonKey: "jr_06_mat-13",
  title: "Kesirlerde çarpma ve bölme",
  tellGuides: [
    "Kesir çarpmada pay ve paydanın nasıl işlendiğini anlatabilir misin?",
    "Kesir bölmede ikinci kesiri neden ters çevirirsin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İki kesri çarparken doğru kural hangisidir?",
      options: [
      "Pay payla, payda paydayla çarpılır",
      "Yalnız paydalar çarpılır",
      "Önce paydalar eşitlenir",
      "İkinci kesir ters çevrilip çıkarılır",
      ],
      correctAnswerIndex: 0,
      hint: "Bölmede ikinci kesir ters çevrilir; çarpmada çevrilmez.",
      explanation: "Adım 1: Çarpmada paylar çarpılır. Adım 2: Paydalar çarpılır. Adım 3: Bölmede ise ikinci kesir ters çevrilip çarpılır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Yarımın yarısı kaçtır?",
      options: [
      "Dörtte bir",
      "Bir",
      "İki",
      "Dörtte üç",
      ],
      correctAnswerIndex: 0,
      hint: "1/2 çarpı 1/2 yap.",
      explanation: "Adım 1: 1 çarpı 1, 1 eder. Adım 2: 2 çarpı 2, 4 eder. Adım 3: Sonuç dörtte birdir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yarım pizzayı çeyrek dilimlere bölersen kaç dilim çıkar?",
      options: [
      "2",
      "1/2",
      "1/8",
      "4",
      ],
      correctAnswerIndex: 0,
      hint: "Yarım bölü çeyrek: ikinci kesri ters çevir.",
      explanation: "Adım 1: Yarım bölü çeyrek, 1/2 çarpı 4/1 demektir. Adım 2: 4/2, 2 eder. Adım 3: İki çeyrek dilim çıkar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
