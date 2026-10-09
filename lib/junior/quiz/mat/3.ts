import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (3/25). */
export const JUNIOR_MAT_QUIZ_3 = {
  lessonKey: "jr_06_mat-3",
  title: "Ortak çarpan ve dağılma",
  tellGuides: [
    "Dağılma özelliğini bir çarpım örneğiyle anlatabilir misin?",
    "Ortak çarpanı parantezin önüne çıkarmak ne işe yarar?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Dağılma özelliği neyi söyler?",
      options: [
      "Çarpımı toplama üzerine yayar",
      "Yalnızca toplamayı siler",
      "Paydayı büyütür",
      "Üssü yaralar",
      ],
      correctAnswerIndex: 0,
      hint: "6 çarpı (5 artı 3) ile 6 çarpı 5 artı 6 çarpı 3 aynı iştir.",
      explanation: "Adım 1: Dağılma, çarpımı toplamanın her parçasına yayar. Adım 2: Ortak çarpan parantezin önünde kalır. Adım 3: Sonuç değişmez, yazım kolaylaşır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "6 çarpı 8 ile 6 çarpı 5 artı 6 çarpı 3 için doğru olan hangisidir?",
      options: [
      "İkisi de 48 eder",
      "İlki 48, ikincisi 30 eder",
      "İkisi de 18 eder",
      "İlki 14 eder",
      ],
      correctAnswerIndex: 0,
      hint: "8, 5 artı 3 diye açılabilir.",
      explanation: "Adım 1: 6 çarpı 8, 48 eder. Adım 2: 6 çarpı 5, 30; 6 çarpı 3, 18 eder. Adım 3: 30 artı 18, 48 eder. İkisi aynıdır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sınıfta 6 sıra var. Her sırada 5 defter ve 3 kalem duruyor. Toplam eşya sayısı nasıl bulunur?",
      options: [
      "6 çarpı (5 artı 3)",
      "6 artı 5 artı 3",
      "6 çarpı 5 eksi 3",
      "Yalnızca 5 artı 3",
      ],
      correctAnswerIndex: 0,
      hint: "Her sıradaki eşyayı topla, sonra sıra sayısıyla çarp.",
      explanation: "Adım 1: Bir sırada 5 artı 3, 8 eşya vardır. Adım 2: 6 sıra için 6 çarpı 8 yapılır. Adım 3: Dağılma ile 6 çarpı 5 artı 6 çarpı 3 de aynı 48'i verir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
