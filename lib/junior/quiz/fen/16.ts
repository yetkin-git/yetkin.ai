import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (16/20). */
export const JUNIOR_FEN_QUIZ_16 = {
  lessonKey: "jr_06_fen-16",
  title: "Denetleyici ve düzenleyici sistemler",
  tellGuides: [
    "Sinir sisteminin temel organlarını sayabilir misin?",
    "Refleks ile hormon denetimini nasıl ayırırsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Sinir sistemi hangi yapılardan oluşur?",
      options: [
      "Beyin, omurilik ve sinirler",
      "Kalp, damar ve kan",
      "Böbrek, idrar ve deri",
      "Güneş, Ay ve Dünya",
      ],
      correctAnswerIndex: 0,
      hint: "Merkez + yol + uçlar.",
      explanation: "Adım 1: Beyin düşünme ve denetimin merkezidir. Adım 2: Omurilik omurga içindedir. Adım 3: Sinirler mesajları taşır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Eline iğne battığında aniden çekmeni kim yönetir?",
      options: [
      "Omurilik (refleks)",
      "Yalnızca mide",
      "Yalnızca Ay",
      "Yalnızca deri rengi",
      ],
      correctAnswerIndex: 0,
      hint: "Çok hızlı, düşünmeden olur.",
      explanation: "Adım 1: Refleks istemsiz ve hızlıdır. Adım 2: Mesaj omuriliğe gider. Adım 3: Omurilik hemen kaslara çekme emri verir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Büyüme döneminde boy uzaması büyük ölçüde neyle denetlenir?",
      options: [
      "İç salgı bezlerinin ürettiği hormonlarla",
      "Yalnızca diş minesinin rengiyle",
      "Yalnızca sesin yankısıyla",
      "Yalnızca sürat formülüyle",
      ],
      correctAnswerIndex: 0,
      hint: "Düzenleyici sistem = hormon.",
      explanation: "Adım 1: İç salgı bezleri hormon üretir. Adım 2: Hormonlar kanla taşınır. Adım 3: Büyüme gibi uzun süreli düzenlemeler hormonlarla yapılır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
