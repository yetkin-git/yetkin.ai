import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (7/25). */
export const JUNIOR_MAT_QUIZ_7 = {
  lessonKey: "jr_06_mat-3",
  title: "Ortak bölen ve ortak kat",
  tellGuides: [
    "Ortak bölenler ile ortak katları nasıl ayırırsın?",
    "8 ve 12 için ortak bölenler ve ortak katlar nasıl bulunur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ortak bölenler neyi seçer?",
      options: [
        "İki sayıyı da bölen sayıları",
        "İki sayının toplamını",
        "En küçük asal sayıyı",
        "Yalnızca 1'i",
      ],
      correctAnswerIndex: 0,
      hint: "Ortak bölenler küçük listede, ortak katlar büyük listede durur.",
      explanation: "Adım 1: Ortak bölenler iki sayıyı da böler. Adım 2: Bu ortak bölenlerin en büyüğü seçilir. Adım 3: Ortak katlar iki sayının da katıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "8 ve 12 için ortak bölenlerin en büyüğü kaçtır?",
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
      hint: "Ortak katlar büyük listede durur. İlk buluştukları sayı seçilir.",
      explanation: "Adım 1: Ortak katlar 24, 48, 72… diye gider. Adım 2: En küçüğü 24'tür. Adım 3: Ziller 24. dakikada yeniden birlikte çalar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
