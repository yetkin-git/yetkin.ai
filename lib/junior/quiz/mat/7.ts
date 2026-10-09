import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (7/25). */
export const JUNIOR_MAT_QUIZ_7 = {
  lessonKey: "jr_06_mat-7",
  title: "Ortak bölen ve ortak kat",
  tellGuides: [
    "En büyük ortak bölen ile en küçük ortak katı nasıl ayırırsın?",
    "8 ve 12 için EBOB ve EKOK nasıl bulunur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "En büyük ortak bölen (EBOB) neyi seçer?",
      options: [
      "İki sayıyı da bölen en büyük sayıyı",
      "İki sayının toplamını",
      "En küçük asal sayıyı",
      "Yalnızca 1'i",
      ],
      correctAnswerIndex: 0,
      hint: "Bölen küçük listede, kat büyük listede durur.",
      explanation: "Adım 1: Ortak bölenler iki sayıyı da böler. Adım 2: Bunların en büyüğü EBOB'tur. Adım 3: Ortak katların en küçüğü EKOK'tur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "8 ve 12 için en büyük ortak bölen kaçtır?",
      options: [
      "2",
      "4",
      "24",
      "96",
      ],
      correctAnswerIndex: 1,
      hint: "8'in bölenleri: 1, 2, 4, 8. Ortak olanların en büyüğünü seç.",
      explanation: "Adım 1: 8'in bölenleri 1, 2, 4, 8. Adım 2: 12'nin bölenleri 1, 2, 3, 4, 6, 12. Adım 3: Ortakların en büyüğü 4'tür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "İki zil 8 ve 12 dakikada bir çalıyor. Aynı anda çaldıktan sonra yeniden birlikte kaçıncı dakikada çalar?",
      options: [
      "4",
      "20",
      "24",
      "96",
      ],
      correctAnswerIndex: 2,
      hint: "Bu soru en küçük ortak katı ister.",
      explanation: "Adım 1: Ortak katlar 24, 48, 72… diye gider. Adım 2: En küçüğü 24'tür. Adım 3: Ziller 24. dakikada yeniden birlikte çalar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
