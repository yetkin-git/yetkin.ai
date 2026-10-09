import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (1/25). */
export const JUNIOR_MAT_QUIZ_1 = {
  lessonKey: "jr_06_mat-1",
  title: "Üslü ifadede taban ve üs",
  tellGuides: [
    "Taban ile üs arasındaki farkı bir örnekle anlatabilir misin?",
    "2 üssü 3 ile 2 çarpı 3 neden aynı sonuç değildir?",
    "Üslü ifadeyi tekrarlı çarpım olarak nasıl kurarsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "2 üssü 3 ifadesinde taban ve üs hangisidir?",
      options: [
      "Taban 2, üs 3",
      "Taban 3, üs 2",
      "Taban 5, üs 1",
      "Taban 6, üs 0",
      ],
      correctAnswerIndex: 0,
      hint: "Alttaki sayı tabandır. Üstte küçük yazılan sayı üstür.",
      explanation: "Adım 1: Alttaki büyük sayı tabandır; burada 2. Adım 2: Üstteki küçük sayı üstür; burada 3. Adım 3: Yani 2 üssü 3 deriz.",
    },
    {
      id: "q2",
      level: "apply",
      question: "2 üssü 3 kaç eder?",
      options: [
      "6",
      "8",
      "5",
      "9",
      ],
      correctAnswerIndex: 1,
      hint: "Üs 3 ise tabanı üç kez yan yana çarp.",
      explanation: "Adım 1: 2 üssü 3, 2 çarpı 2 çarpı 2 demektir. Adım 2: 2 çarpı 2, 4 eder. Adım 3: 4 çarpı 2, 8 eder.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ela oyununda skor her tur ikiye katlanıyor. Üç tur sonra skor 2 üssü 3 kadar büyüyor. Kaç kat büyümüştür?",
      options: [
      "6 kat",
      "8 kat",
      "5 kat",
      "9 kat",
      ],
      correctAnswerIndex: 1,
      hint: "2 üssü 3 ile 2 çarpı 3 aynı iş değildir.",
      explanation: "Adım 1: Her tur ikiyle çarpılmak 2 üssü 3 demektir. Adım 2: 2 çarpı 2 çarpı 2, 8 eder. Adım 3: Skor 8 kat büyümüştür. 2 çarpı 3 olsa 6 kat olurdu; o yanlış tuzaktır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
