import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (13/20). */
export const JUNIOR_FEN_QUIZ_13 = {
  lessonKey: "jr_06_fen-13",
  title: "Madde ve ısı",
  tellGuides: [
    "Isı ile sıcaklık arasındaki farkı anlatabilir misin?",
    "Metal kaşık ile tahta kaşık ısıyı nasıl farklı iletir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Isı ve sıcaklık için doğru yargı hangisidir?",
      options: [
      "Aynı kavram değildir",
      "Tamamen aynıdır",
      "Yalnızca seste ölçülür",
      "Yalnızca kan grubudur",
      ],
      correctAnswerIndex: 0,
      hint: "Biri enerji aktarımı, biri ölçüm.",
      explanation: "Adım 1: Sıcaklık bir cismin sıcaklık derecesidir. Adım 2: Isı, sıcaklık farkından dolayı aktarılan enerjidir. Adım 3: Bu yüzden ikisi aynı kavram değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Isıyı iyi ileten maddeler genelde hangileridir?",
      options: [
      "Metaller",
      "Tahta ve plastik",
      "Kuru hava",
      "Cam yünü",
      ],
      correctAnswerIndex: 0,
      hint: "Mutfaktaki metal kaşığı düşün.",
      explanation: "Adım 1: Metaller ısı iletkenidir. Adım 2: Tahta, plastik ve hava yalıtır. Adım 3: Bu yüzden sıcak çorbada metal kaşık çabuk ısınır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Kışın pencerede çift cam kullanılmasının amacı nedir?",
      options: [
      "Isı geçişini yavaşlatmak (yalıtım)",
      "Sesi boşlukta hızlandırmak",
      "Yoğunluğu sonsuz yapmak",
      "Kan dolaşımını durdurmak",
      ],
      correctAnswerIndex: 0,
      hint: "Yalıtım ısı kaybını azaltır.",
      explanation: "Adım 1: Ev içi ile dışarı arasında sıcaklık farkı vardır. Adım 2: Yalıtım malzemeleri ısı geçişini yavaşlatır. Adım 3: Çift cam aradaki hava ile yalıtım sağlar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
