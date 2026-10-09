import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (10/20). */
export const JUNIOR_FEN_QUIZ_10 = {
  lessonKey: "jr_06_fen-10",
  title: "Sabit süratli hareket",
  tellGuides: [
    "Sürat formülünü ve birimini kendi sözünle söyleyebilir misin?",
    "Sabit süratte yol-zaman grafiği nasıl görünür?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Sürat nasıl hesaplanır?",
      options: [
      "Yol bölü zaman",
      "Zaman bölü yol",
      "Kütle bölü hacim",
      "Kuvvet artı yön",
      ],
      correctAnswerIndex: 0,
      hint: "S = x / t",
      explanation: "Adım 1: Sürat, alınan yolun geçen zamana bölümüdür. Adım 2: Formül S = yol / zaman'dır. Adım 3: Birimi genelde m/s veya km/sa olur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Bir bisiklet 100 metreyi 20 saniyede sabit süratle alıyor. Sürati kaç m/s'dir?",
      options: [
      "5",
      "20",
      "100",
      "2",
      ],
      correctAnswerIndex: 0,
      hint: "100'ü 20'ye böl.",
      explanation: "Adım 1: S = yol / zaman. Adım 2: 100 ÷ 20 = 5. Adım 3: Sürat 5 m/s'dir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yol-zaman grafiğinde sabit süratli hareket nasıl görünür?",
      options: [
      "Eğimi sabit bir doğru",
      "Dikey bir nokta",
      "Yalnızca daire",
      "Ses dalgası eğrisi",
      ],
      correctAnswerIndex: 0,
      hint: "Zaman arttıkça yol düzenli artar.",
      explanation: "Adım 1: Sabit süratte eşit zamanlarda eşit yol alınır. Adım 2: Yol-zaman grafiği düz bir doğrudur. Adım 3: Eğim sürati gösterir; sürat-zaman grafiği ise yatay doğru olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
