import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (10/20). */
export const JUNIOR_ING_QUIZ_10 = {
  lessonKey: "jr_06_ing_main-10",
  title: "Fuarda duyguyu söylemek",
  tellGuides: [
    "Say how you feel about a ride using excited about or scared of.",
    "Make a short fair dialogue with a feeling word.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "«excited about» hangi duyguyu bağlar?",
      options: [
        "Heyecanı bir şeye bağlar",
        "Korkuyu bir yere bağlar",
        "Saati söyler",
        "Meslek sorar",
      ],
      correctAnswerIndex: 0,
      hint: "Excited about = … hakkında heyecanlı.",
      explanation: "Adım 1: Excited heyecan demektir. Adım 2: About nesneyi bağlar. Adım 3: Scared of korkuyu bağlar; bu şık excited about'tır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru duygu cümlesidir?",
      options: [
        "I am scared of the ghost train",
        "I am scared about the ghost train",
        "I am sunny of the ghost train",
        "I scared the ghost train am",
      ],
      correctAnswerIndex: 0,
      hint: "Korku of ile bağlanır.",
      explanation: "Adım 1: Scared of kalıbı vardır. Adım 2: Ghost train korku nesnesidir. Adım 3: About burada yanlış edattır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Fuarda Ece roller coaster görünce gülümsüyor: «I am excited about this ride!» Hangisi doğru yorumdur?",
      options: [
        "Ece oyuncaktan heyecan duyuyor",
        "Ece oyuncaktan korkuyor",
        "Ece hava soruyor",
        "Ece meslek seçiyor",
      ],
      correctAnswerIndex: 0,
      hint: "Excited about heyecan bağlar.",
      explanation: "Adım 1: Excited about heyecanı bağlar. Adım 2: This ride oyuncağı gösterir. Adım 3: Korku scared of olurdu.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
