import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (11/20). */
export const JUNIOR_ING_QUIZ_11 = {
  lessonKey: "jr_06_ing_main-11",
  title: "Doctor, architect ve vet",
  tellGuides: [
    "Name three jobs and say what each person does.",
    "Explain when we use a and when we use an before a job.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "«a» ve «an» neye göre seçilir?",
      options: [
        "Sonraki sözcüğün ilk sesine göre",
        "Yalnızca mesleğin zorluğuna göre",
        "Yalnızca hava durumuna göre",
        "Hiçbir kurala göre değil",
      ],
      correctAnswerIndex: 0,
      hint: "Ünlü sesle başlayanlarda an.",
      explanation: "Adım 1: A/an belirsiz artikellerdir. Adım 2: İlk ses ünlüyse an, değilse a gelir. Adım 3: An architect, a doctor böyledir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru meslektir?",
      options: [
        "She is a vet. She helps animals",
        "She is an vet. She builds houses",
        "She is a architect. She cooks food",
        "She is doctor. She flies planes",
      ],
      correctAnswerIndex: 0,
      hint: "Vet hayvanlara yardım eder; a vet doğrudur.",
      explanation: "Adım 1: Vet ünsüzle başlar → a vet. Adım 2: İş hayvanlara yardımdır. Adım 3: Diğer şıklarda hem artikel hem iş yanlışır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Kartlar: doctor → helps sick people · architect → designs buildings · vet → helps animals. Hangisi doğrudur?",
      options: [
        "Architect binaları tasarlar",
        "Doctor hayvanları tedavi eder",
        "Vet binaları tasarlar",
        "Üç meslek de aynı işi yapar",
      ],
      correctAnswerIndex: 0,
      hint: "Designs buildings satırına bak.",
      explanation: "Adım 1: Architect = designs buildings. Adım 2: Doctor insanlara, vet hayvanlara bakar. Adım 3: Doğru eşleşme mimardır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
