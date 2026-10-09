import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (2/20). */
export const JUNIOR_ING_QUIZ_2 = {
  lessonKey: "jr_06_ing_main-2",
  title: "He, she ve it ile simple present",
  tellGuides: [
    "Explain when we add -s to a verb in simple present.",
    "Tell your brother's or sister's morning routine in 3 sentences with he or she.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "He, she ve it öznesinde simple present fiile ne olur?",
      options: [
        "Fiile -s / -es gelir",
        "Fiil hep yalın kalır",
        "Fiile -ing eklenir",
        "Fiil tamamen silinir",
      ],
      correctAnswerIndex: 0,
      hint: "Üçüncü tekil şahısta fiil değişir.",
      explanation: "Adım 1: Simple present alışkanlık anlatır. Adım 2: He/she/it ile fiile -s gelir. Adım 3: I ile fiil yalın kalır; üçüncü tekilde ek vardır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru cümledir?",
      options: [
        "She goes to school",
        "She go to school",
        "She going to school",
        "She to go school",
      ],
      correctAnswerIndex: 0,
      hint: "Go fiili she ile goes olur.",
      explanation: "Adım 1: Özne she'dir. Adım 2: Go → goes olur. Adım 3: She goes to school doğru kalıptır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«I play football. He ___ football.» Boşluğa hangisi gelir?",
      options: [
        "plays",
        "play",
        "playing",
        "played",
      ],
      correctAnswerIndex: 0,
      hint: "He öznesi fiile -s ister.",
      explanation: "Adım 1: I ile play yalın kalır. Adım 2: He üçüncü tekildir. Adım 3: Bu yüzden plays doğrudur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
