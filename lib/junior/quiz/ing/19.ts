import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (19/20). */
export const JUNIOR_ING_QUIZ_19 = {
  lessonKey: "jr_06_ing_main-19",
  title: "Okul seçimi ve voting",
  tellGuides: [
    "Explain what a school election is in two English sentences.",
    "Why does every student get one vote?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Voting (oy vermek) ne demektir?",
      options: [
        "Bir seçimde tercihini bildirmek",
        "Sınıfı temizlemek",
        "Saati sormak",
        "Kitap türünü yazmak",
      ],
      correctAnswerIndex: 0,
      hint: "Vote = oy.",
      explanation: "Adım 1: Voting oy kullanmaktır. Adım 2: Seçimde tercih bildirilir. Adım 3: Temizlik veya saat sorusu değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi seçim gününe uygun cümledir?",
      options: [
        "I vote for Ayşe. She helps her friends",
        "I vote for Ayşe. She is sunny today",
        "I vote for Ayşe. Recycle the glass",
        "I vote for Ayşe. Half past seven",
      ],
      correctAnswerIndex: 0,
      hint: "Adayın sözü/davranışı seçimi destekler.",
      explanation: "Adım 1: Vote for adayı seçer. Adım 2: Helps her friends gerekçe verir. Adım 3: Hava veya saat seçim gerekçesi değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sınıfta 20 öğrenci var; herkes bir oy kullanır. Sonuç: Ali 12, Ece 8. Hangisi doğrudur?",
      options: [
        "Ali daha çok oy alır",
        "Ece daha çok oy alır",
        "Oylar eşit kalır",
        "Hiç kimse oy kullanmaz",
      ],
      correctAnswerIndex: 0,
      hint: "12, 8'den büyüktür; daha çok oy kimde?",
      explanation: "Adım 1: 12 ile 8 karşılaştırılır. Adım 2: Ali'nin oyu daha fazladır. Adım 3: Herkesin bir oyu olduğu için toplam 20'dir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
