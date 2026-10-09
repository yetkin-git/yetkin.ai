import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (4/25). */
export const JUNIOR_MAT_QUIZ_4 = {
  lessonKey: "jr_06_mat-4",
  title: "Doğal sayı problemleri",
  tellGuides: [
    "Bir problemde önce hangi işi seçtiğini nasıl anlarsın?",
    "4 sıra ve her sırada 7 kitap varken neden 4 artı 7 yanlış yoldur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Doğal sayı probleminde ilk adım nedir?",
      options: [
      "Sorulan işi seçmek",
      "Hemen en büyük sayıyı yazmak",
      "Paydayı eşitlemek",
      "Üssü bulmak",
      ],
      correctAnswerIndex: 0,
      hint: "Önce ne istendiğini oku; sonra işlemi kur.",
      explanation: "Adım 1: Problem ne soruyorsa o iş seçilir. Adım 2: Sayılar bu işe yerleştirilir. Adım 3: Sonuç, sorunun cevabına oturur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "4 sırada her sırada 7 kitap varsa toplam kaç kitap vardır?",
      options: [
      "11",
      "28",
      "47",
      "3",
      ],
      correctAnswerIndex: 1,
      hint: "Her sıradaki kitapları sıra sayısıyla çarp.",
      explanation: "Adım 1: Her sırada 7 kitap vardır. Adım 2: 4 sıra için 4 çarpı 7 yapılır. Adım 3: Sonuç 28'dir. 4 artı 7, 11 eder; bu yanlış yoldur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Kütüphanede 5 rafta eşit sayıda kitap var. Toplam 40 kitapsa bir rafta kaç kitap vardır?",
      options: [
      "8",
      "45",
      "35",
      "5",
      ],
      correctAnswerIndex: 0,
      hint: "Toplamı raf sayısına böl.",
      explanation: "Adım 1: 40 kitap 5 rafa eşit dağılır. Adım 2: 40 bölü 5 yapılır. Adım 3: Her rafta 8 kitap vardır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
