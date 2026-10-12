import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (32). */
export const JUNIOR_MAT_QUIZ_32 = {
  lessonKey: "jr_06_mat-32",
  title: "Köşegenleri birbirini ortalayan dörtgenler",
  tellGuides: [
    "Köşegenlerin eşit olması ile birbirini ortalaması neden ayrıdır?",
    "Paralelkenarda kesişim noktası parçaları nasıl böler?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Köşegenler birbirini ortalıyorsa kesişim ne yapar?",
      options: [
        "Her köşegeni iki eşit parçaya böler",
        "Bir açıyı siler",
        "Dörtgeni çembere çevirir",
        "Kenarları birbirine dik yapar",
      ],
      correctAnswerIndex: 0,
      hint: "Orta nokta eşit parça demektir.",
      explanation: "Adım 1: Ortalamak, orta noktada kesişmektir. Adım 2: Her köşegen iki eşit uzunluğa ayrılır. Adım 3: Bu model paralelkenardadır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "10 santimetrelik köşegen ortalanırsa parçalar kaç santimetre olur?",
      options: [
        "2 ve 8",
        "4 ve 6",
        "5 ve 5",
        "10 ve 10",
      ],
      correctAnswerIndex: 2,
      hint: "10'un yarısı 5'tir.",
      explanation: "Adım 1: Orta nokta uzunluğu ikiye böler. Adım 2: 10 bölü 2, 5 eder. Adım 3: Parçalar 5 ve 5 santimetredir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "İki köşegen de 10 santimetre diye eşitse neden birbirini ortalamış sayılmaz?",
      options: [
        "Çünkü kesişim birini 2, diğerini 8 bölebilir",
        "Çünkü eşit köşegen yasaktır",
        "Çünkü dörtgen üçgene döner",
        "Çünkü 10 asal sayıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Eşit uzunluk, orta nokta değildir.",
      explanation: "Adım 1: Uzunlukların eşit olması ayrı bir özelliktir. Adım 2: Ortalamak, parçaların kendi içinde eşit olmasıdır. Adım 3: 2 ve 8 bölünmesi orta nokta değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
