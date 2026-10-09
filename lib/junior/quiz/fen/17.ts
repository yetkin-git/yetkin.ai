import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (17/20). */
export const JUNIOR_FEN_QUIZ_17 = {
  lessonKey: "jr_06_fen-17",
  title: "Duyu organları",
  tellGuides: [
    "Beş duyu organını ve görevlerini anlatabilir misin?",
    "Kulak neden hem işitme hem denge organıdır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Gözde ışığın alındığı tabaka hangisidir?",
      options: [
      "Ağ tabaka (retina)",
      "Kulak zarı",
      "Diyafram",
      "Alveol",
      ],
      correctAnswerIndex: 0,
      hint: "Gözün arkasındaki duyarlı katman.",
      explanation: "Adım 1: Işık göze girer. Adım 2: Görüntü ağ tabakada oluşur. Adım 3: Sinirler bu bilgiyi beyne iletir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hem işitme hem denge ile ilgili organ hangisidir?",
      options: [
      "Kulak",
      "Dil",
      "Burun",
      "Deri",
      ],
      correctAnswerIndex: 0,
      hint: "İç kulakta denge organı da vardır.",
      explanation: "Adım 1: Kulak sesi alır. Adım 2: İç kulakta denge yapıları vardır. Adım 3: Bu yüzden kulak hem işitme hem denge organıdır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Gözün bağlı bir elma tatlı mı ekşi mi anlaşılmaz. Eksik duyu hangisidir?",
      options: [
      "Tat alma (dil)",
      "Yalnızca işitme",
      "Yalnızca denge",
      "Yalnızca solunum",
      ],
      correctAnswerIndex: 0,
      hint: "Tat dildeki tomurcuklarla alınır.",
      explanation: "Adım 1: Görünüş görme ile gelir. Adım 2: Tat için dil gerekir. Adım 3: Göz bağlıyken tat alma yapılmazsa ekşi–tatlı ayrılmaz.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
