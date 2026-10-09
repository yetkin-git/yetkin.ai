import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (19/20). */
export const JUNIOR_TURKCE_QUIZ_19 = {
  lessonKey: "jr_06_turkce-19",
  title: "Nokta, virgül, noktalı virgül ve iki nokta",
  tellGuides: [
    "Nokta, virgül, noktalı virgül ve iki noktanın işlerini kendi sözlerinle anlatır mısın?",
    "İçinde virgül olan öbekleri ayırmak için neden noktalı virgül kullandığımızı açıklar mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Nokta ne iş yapar?",
      options: [
      "Cümleyi bitirir",
      "Hitabı ayırır",
      "Soru sorar",
      "Şaşma bildirir",
      ],
      correctAnswerIndex: 0,
      hint: "Tam cümle sonunda hangi işaret durur?",
      explanation: "Adım 1: Nokta cümleyi bitirir. Adım 2: Virgül eş görevlileri ve hitabı ayırır. Adım 3: Soru ve ünlem ayrı işlerdir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Ali, buraya gel.» cümlesinde virgül neden vardır?",
      options: [
      "Hitabı ayırmak için",
      "Cümleyi bitirmek için",
      "Soru sormak için",
      "Kesme yerine",
      ],
      correctAnswerIndex: 0,
      hint: "Ali’ye sesleniş vardır.",
      explanation: "Adım 1: Ali hitaptır. Adım 2: Virgül hitabı ayırır. Adım 3: Nokta bitirir; soru ve kesme başka işlerdir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Açıklama ve örnekten önce hangi işaret durur?",
      options: [
      "İki nokta",
      "Ünlem",
      "Kesme",
      "Soru eki mi",
      ],
      correctAnswerIndex: 0,
      hint: "«İşte örnek: …» kalıbını düşün.",
      explanation: "Adım 1: İki nokta açıklama ve örnekten önce durur. Adım 2: Noktalı virgül virgüllü öbekleri ayırır. Adım 3: Doğru seçenek iki noktadır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
