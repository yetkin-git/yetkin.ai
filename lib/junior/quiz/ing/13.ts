import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (13/20). */
export const JUNIOR_ING_QUIZ_13 = {
  lessonKey: "jr_06_ing_main-13",
  title: "Visited, swam ve played",
  tellGuides: [
    "Tell three things you did last summer using past simple.",
    "What is the difference between regular -ed verbs and irregular verbs like swam?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Swim fiilinin geçmiş hali nedir?",
      options: [
        "swam",
        "swimmed",
        "swimming",
        "swims",
      ],
      correctAnswerIndex: 0,
      hint: "Swim özel (irregular) fiildir.",
      explanation: "Adım 1: Swim irregular'dır. Adım 2: Geçmiş hali swam'dır. Adım 3: Swimmed yanlış biçimdir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru geçmiş zaman cümlesidir?",
      options: [
        "I visited my grandma last summer",
        "I visit my grandma last summer",
        "I visiting my grandma last summer",
        "I visits my grandma last summer",
      ],
      correctAnswerIndex: 0,
      hint: "Visit düzenli fiildir → visited.",
      explanation: "Adım 1: Last summer geçmiş zamandır. Adım 2: Visit → visited. Adım 3: I visited… doğru cümledir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Did you ___ in the sea?» Boşluğa hangisi gelir?",
      options: [
        "swim",
        "swam",
        "swimming",
        "swamned",
      ],
      correctAnswerIndex: 0,
      hint: "Did gelince fiil yalın kalır.",
      explanation: "Adım 1: Did soru yardımcısıdır. Adım 2: Did'den sonra fiil birinci haldedir. Adım 3: Swim doğrudur; swam soruda kullanılmaz.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
