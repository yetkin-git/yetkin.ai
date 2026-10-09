import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (5/25). */
export const JUNIOR_MAT_QUIZ_5 = {
  lessonKey: "jr_06_mat-5",
  title: "Çarpanlar, katlar ve bölünebilme",
  tellGuides: [
    "Çarpan ile kat arasındaki farkı bir örnekle anlatabilir misin?",
    "2, 5 ve 10 ile 3 ve 9 kurallarını nasıl ayırırsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Bir sayının çarpanı nedir?",
      options: [
      "Onu kalansız bölen sayı",
      "Ondan büyük her sayı",
      "Yalnızca 1",
      "Paydaya yazılan sayı",
      ],
      correctAnswerIndex: 0,
      hint: "Çarpan kalansız böler. Kat, çarpımla büyür.",
      explanation: "Adım 1: Çarpan, sayıyı kalansız böler. Adım 2: Kat, sayının 1, 2, 3… ile çarpılmış hâlleridir. Adım 3: 3, 12'nin çarpanıdır; 12, 3'ün katıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "24 sayısı hangi kurala göre 3'e tam bölünür?",
      options: [
      "Rakamlar toplamı 3'ün katıdır",
      "Son rakamı 4'tür",
      "Çift olduğu için",
      "10'dan büyük olduğu için",
      ],
      correctAnswerIndex: 0,
      hint: "3 ve 9 için rakam toplamına bak.",
      explanation: "Adım 1: 2 artı 4, 6 eder. Adım 2: 6, 3'ün katıdır. Adım 3: Bu yüzden 24, 3'e kalansız bölünür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "24 kişiyi beşerli dizerken neden 4 kişi açıkta kalır?",
      options: [
      "24, 5'e tam bölünmez",
      "24, 2'ye bölünmez",
      "24, 3'e bölünmez",
      "24 asal sayıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Son rakama bak; 4, 0 veya 5 değildir.",
      explanation: "Adım 1: 5'e bölünebilmek için son rakam 0 veya 5 olmalıdır. Adım 2: 24'ün sonu 4'tür. Adım 3: 24 bölü 5, 4 kalan verir; dört kişi açıkta kalır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
