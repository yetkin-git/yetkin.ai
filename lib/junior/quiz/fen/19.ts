import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (19/20). */
export const JUNIOR_FEN_QUIZ_19 = {
  lessonKey: "jr_06_fen-19",
  title: "İletken ve yalıtkan maddeler",
  tellGuides: [
    "İletken ve yalıtkan maddeleri örneklerle ayırabilir misin?",
    "Tuzlu su ile saf su elektrik açısından nasıl farklıdır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Elektrik akımını iyi ileten maddeler hangileridir?",
      options: [
      "Metaller",
      "Plastik ve lastik",
      "Kuru tahta",
      "Cam",
      ],
      correctAnswerIndex: 0,
      hint: "Tel genelde bakırdır.",
      explanation: "Adım 1: Metaller serbest elektron taşır. Adım 2: Bu yüzden elektrik iletir. Adım 3: Plastik, cam ve lastik yalıtkandır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi yalıtkandır?",
      options: [
      "Plastik kaplama",
      "Bakır tel",
      "Demir çivi",
      "Alüminyum folyo",
      ],
      correctAnswerIndex: 0,
      hint: "Kablo dışındaki malzeme.",
      explanation: "Adım 1: Kablo içinde metal iletir. Adım 2: Dışındaki plastik akımı geçirmez. Adım 3: Plastik yalıtkandır; dokunmayı güvenli kılar.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Deneyde saf su lambayı yakmıyor, tuz eklenince lamba yanıyor. Sonuç nedir?",
      options: [
      "Tuzlu su iletkendir; saf su yalıtkan sayılır",
      "Saf su her zaman en iyi iletkendir",
      "Tuz sesi soğurur",
      "Tuz yoğunluğu sonsuz yapar",
      ],
      correctAnswerIndex: 0,
      hint: "İyonlar akımı taşır.",
      explanation: "Adım 1: Saf suda iletim zayıftır. Adım 2: Tuz çözününce iyonlar oluşur. Adım 3: İyonlar akımı taşıdığı için tuzlu su iletken davranır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
