import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (2/20). */
export const JUNIOR_FEN_QUIZ_2 = {
  lessonKey: "jr_06_fen-2",
  title: "Güneş ve Ay tutulması",
  tellGuides: [
    "Güneş ve Ay tutulmaları arasındaki temel farkları anlatabilir misin?",
    "Güneş tutulması hangi evrede ve hangi zamanda olur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Güneş tutulmasında araya hangi gök cismi girer?",
      options: [
      "Ay",
      "Dünya",
      "Mars",
      "Jüpiter",
      ],
      correctAnswerIndex: 0,
      hint: "Güneş ile Dünya arasında kalan cisim Ay'dır.",
      explanation: "Adım 1: Tutulmada üç cisim aynı çizgiye gelir. Adım 2: Güneş tutulmasında Güneş–Ay–Dünya sırası vardır. Adım 3: Arada Ay olduğu için Ay'ın gölgesi Dünya'ya düşer.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Güneş tutulması hangi Ay evresinde ve hangi zamanda gerçekleşir?",
      options: [
      "Yeni ayda, gündüz",
      "Dolunayda, gece",
      "Yeni ayda, gece",
      "Dolunayda, gündüz",
      ],
      correctAnswerIndex: 0,
      hint: "Gündüz kararma = Güneş tutulması; o sırada Ay yenidir.",
      explanation: "Adım 1: Güneş tutulması gündüz olur. Adım 2: Ay, Güneş ile Dünya arasındadır; bu dizilim yeni ayda olur. Adım 3: Dolunayda olan ve gece görülen olay Ay tutulmasıdır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sınıfta fener (Güneş), portakal (Dünya) ve erik (Ay) ile model kuruluyor. Erik fener ile portakal arasındayken portakalın üzerine gölge düşüyor. Bu model neyi gösterir?",
      options: [
      "Güneş tutulmasını",
      "Ay tutulmasını",
      "Yalnızca dolunayı",
      "Gezegen sırasını",
      ],
      correctAnswerIndex: 0,
      hint: "Arada küçük top (Ay) varsa gündüz tutulması modelidir.",
      explanation: "Adım 1: Fener Güneş, portakal Dünya, erik Ay'dır. Adım 2: Erik ortadayken ışık kesilir ve Dünya'ya gölge düşer. Adım 3: Bu Güneş tutulması modelidir. Ay tutulmasında Dünya ortada olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
