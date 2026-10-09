import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (5/20). */
export const JUNIOR_ING_QUIZ_5 = {
  lessonKey: "jr_06_ing_main-5",
  title: "Şehirde şu an ne oluyor",
  tellGuides: [
    "Look around and say three things happening now with present continuous.",
    "What is the difference between I walk and I am walking?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Present continuous hangi durumu anlatır?",
      options: [
        "Şu anda olan işi",
        "Yalnızca dünü",
        "Yalnızca gelecek yılı",
        "Hiç yapılmayan işi",
      ],
      correctAnswerIndex: 0,
      hint: "Am/is/are + -ing şimdiyi anlatır.",
      explanation: "Adım 1: Present continuous şu anı anlatır. Adım 2: Am/is/are ve -ing ile kurulur. Adım 3: Alışkanlık için simple present kullanılır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru present continuous cümlesidir?",
      options: [
        "They are shopping now",
        "They shopping now",
        "They is shopping now",
        "They shopped now",
      ],
      correctAnswerIndex: 0,
      hint: "They ile are kullanılır.",
      explanation: "Adım 1: They çoğuldur. Adım 2: Are + shopping gerekir. Adım 3: They are shopping now doğrudur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Tabela: «Bus stop». Metin: «A woman is waiting. Two boys are talking.» Hangisi doğrudur?",
      options: [
        "İki çocuk şu an konuşuyor",
        "Kadın dün bekledi",
        "Çocuklar alışveriş yapıyor",
        "Kimse hareket etmiyor",
      ],
      correctAnswerIndex: 0,
      hint: "Are talking satırını oku.",
      explanation: "Adım 1: Are talking şu anı anlatır. Adım 2: Two boys öznesidir. Adım 3: Doğru çıkarım çocukların konuşmasıdır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
