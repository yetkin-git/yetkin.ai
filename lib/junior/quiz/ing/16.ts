import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (16/20). */
export const JUNIOR_ING_QUIZ_16 = {
  lessonKey: "jr_06_ing_main-16",
  title: "In, on, under, behind ve next to",
  tellGuides: [
    "Describe where three things are in your room using in, on, under, behind, or next to.",
    "What is the difference between on the table and under the table?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yer edatı (preposition of place) ne işe yarar?",
      options: [
        "Eşyanın konumunu söyler",
        "Saati sorar",
        "Meslek adlandırır",
        "Duyguyu siler",
      ],
      correctAnswerIndex: 0,
      hint: "In, on, under konum söyler.",
      explanation: "Adım 1: Yer edatı konumu gösterir. Adım 2: In içinde, on üstünde, under altındadır. Adım 3: Behind arkasında, next to yanındadır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Kitap masanın üstündeyse hangisi doğrudur?",
      options: [
        "The book is on the table",
        "The book is in the table",
        "The book is under the table",
        "The book is behind the table",
      ],
      correctAnswerIndex: 0,
      hint: "On = üstünde.",
      explanation: "Adım 1: Üstünde = on. Adım 2: In içini, under altını anlatır. Adım 3: The book is on the table doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Görsel: kedi koltuğun arkasında, top koltuğun yanında. Hangisi doğru çifttir?",
      options: [
        "The cat is behind the sofa. The ball is next to the sofa",
        "The cat is on the sofa. The ball is in the sofa",
        "The cat is under the sofa. The ball is on the cat",
        "The cat is next to the ball. The sofa is under the sky only",
      ],
      correctAnswerIndex: 0,
      hint: "Behind arkasında, next to yanındadır.",
      explanation: "Adım 1: Behind = arkasında → kedi. Adım 2: Next to = yanında → top. Adım 3: Doğru çift budur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
