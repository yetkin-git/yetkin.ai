import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (36). */
export const JUNIOR_MAT_QUIZ_36 = {
  lessonKey: "jr_06_mat-22",
  title: "Merkez açı ve gördüğü yay",
  tellGuides: [
    "Merkez açı ile gördüğü yayı nasıl eşlersin?",
    "90 derece neden çeyrek çemberdir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Merkez açının gördüğü yayın derece ölçüsü nasıldır?",
      options: [
        "Açıya eşittir",
        "Açının iki katıdır",
        "Hep 180 derecedir",
        "Santimetre cinsindendir",
      ],
      correctAnswerIndex: 0,
      hint: "Yay ve açı aynı dereceyi paylaşır.",
      explanation: "Adım 1: Merkez açının gördüğü yay, açıyla aynı derecededir. Adım 2: Tam çember 360 derecedir. Adım 3: Yayın santimetre boyu ayrı bir çevre hesabıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "90 derecelik merkez açı çemberin ne kadarını görür?",
      options: [
        "Yarısını",
        "Dörtte birini",
        "Tamamını",
        "Altıda birini",
      ],
      correctAnswerIndex: 1,
      hint: "360 bölü 90, 4 eder.",
      explanation: "Adım 1: Tam çember 360 derecedir. Adım 2: 360 bölü 90, 4 eder. Adım 3: 90 derece, çeyrek yaydır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Merkez açı 180 derece ise yay neden yarım çemberdir?",
      options: [
        "Çünkü 180, 360'ın yarısıdır",
        "Çünkü çap silinir",
        "Çünkü pi 180'dir",
        "Çünkü yarıçap 180 olur",
      ],
      correctAnswerIndex: 0,
      hint: "Yayın derecesi açıya eşittir.",
      explanation: "Adım 1: Yay da 180 derecedir. Adım 2: 180, 360'ın yarısıdır. Adım 3: Bu yüzden yay yarım çemberdir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
