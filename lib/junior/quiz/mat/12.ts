import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (12/25). */
export const JUNIOR_MAT_QUIZ_12 = {
  lessonKey: "jr_06_mat-12",
  title: "Paydayı eşitleyerek toplama",
  tellGuides: [
    "Paydalar farklıyken önce neden denk kesir kurduğunu anlatabilir misin?",
    "Yarım artı dörtte bir nasıl dörtte üç olur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Paydalar farklıysa ilk adım nedir?",
      options: [
      "Paydayı eşitleyip denk kesir kurmak",
      "Doğrudan payları toplamak",
      "Paydaları çıkarmak",
      "Kesirleri ters çevirmek",
      ],
      correctAnswerIndex: 0,
      hint: "Aynı dilim boyuna gelmeden pay toplanmaz.",
      explanation: "Adım 1: Farklı payda, farklı dilim boyudur. Adım 2: Önce ortak payda bulunur. Adım 3: Denk kesirler yazılıp paylar toplanır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Yarım artı dörtte bir kaç eder?",
      options: [
      "Dörtte üç",
      "İki bölü altı",
      "Üçte iki",
      "Beşte iki",
      ],
      correctAnswerIndex: 0,
      hint: "Yarım, dörtte ikidir.",
      explanation: "Adım 1: Yarım, dörtte ikiye denktir. Adım 2: Dörtte iki artı dörtte bir, dörtte üç eder. Adım 3: İki bölü altı bu işlemin sonucu değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Şişenin yarısı dolu. Dörtte bir daha doldurdun. Şişenin kaçı dolu oldu?",
      options: [
      "Dörtte üç",
      "Dörtte bir",
      "İki bölü altı",
      "Beşte iki",
      ],
      correctAnswerIndex: 0,
      hint: "Yarımı dörtte iki yaz, sonra ekle.",
      explanation: "Adım 1: Yarım = dörtte iki. Adım 2: Dörtte bir eklenir. Adım 3: Toplam dörtte üçtür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
