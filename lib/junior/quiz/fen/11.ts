import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (11/20). */
export const JUNIOR_FEN_QUIZ_11 = {
  lessonKey: "jr_06_fen-11",
  title: "Maddenin tanecikli yapısı",
  tellGuides: [
    "Katı, sıvı ve gazda tanecik dizilişini nasıl ayırırsın?",
    "Sıcaklık artınca taneciklere ne olur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Maddeler neyden oluşur?",
      options: [
      "Taneciklerden",
      "Yalnızca sesten",
      "Yalnızca ışıktan",
      "Yalnızca boşluktan",
      ],
      correctAnswerIndex: 0,
      hint: "Gözle görülmeyen küçük birimler.",
      explanation: "Adım 1: Madde tanecikli yapıdadır. Adım 2: Katı, sıvı ve gaz hepsi taneciklerden oluşur. Adım 3: Fark, taneciklerin dizilişi ve hareketindedir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Tanecikler en düzgün ve en sık nasıl dizilir?",
      options: [
      "Katıda",
      "Sıvıda",
      "Gazda",
      "Boşlukta",
      ],
      correctAnswerIndex: 0,
      hint: "Sabit şekil = sıkı düzen.",
      explanation: "Adım 1: Katıda tanecikler düzenli ve yakındır. Adım 2: Sıvıda daha serbest kayarlar. Adım 3: Gazda birbirinden uzak ve hızlıdır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Balon güneşte şişiyor gibi gerginleşiyor. Bilimsel açıklama hangisidir?",
      options: [
      "Sıcaklık artınca gaz tanecikleri daha hızlı hareket eder",
      "Ses boşlukta yayıldığı için",
      "Yoğunluk formülü değiştiği için",
      "Kan grubu değiştiği için",
      ],
      correctAnswerIndex: 0,
      hint: "Isı → hareket hızı.",
      explanation: "Adım 1: Güneş balon içindeki havayı ısıtır. Adım 2: Tanecik hareketi hızlanır. Adım 3: Tanecikler duvarlara daha sık çarpar; balon gerginleşir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
