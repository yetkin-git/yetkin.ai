import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (9/20). */
export const JUNIOR_TURKCE_QUIZ_9 = {
  lessonKey: "jr_06_turkce-9",
  title: "Paragrafta yardımcı fikirler",
  tellGuides: [
    "Yardımcı fikrin ana fikri nasıl taşıdığını kendi sözlerinle anlatır mısın?",
    "Yardımcı cümlenin ikinci ana fikir olmadığını neden söylersin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yardımcı fikir ne iş yapar?",
      options: [
      "Ana fikri taşır; yerine geçmez",
      "Ana fikrin yerini alır",
      "Konuyu siler",
      "Noktalama ekler",
      ],
      correctAnswerIndex: 0,
      hint: "Gölge ve yuva örnekleri ana fikri besler.",
      explanation: "Adım 1: Ana fikir tektir. Adım 2: Yardımcı fikir onu destekler. Adım 3: Yerine geçmez.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Ana fikir «Ağaçlar canlılara yarar sağlar.» ise «Kuşlara yuva olur.» ne olur?",
      options: [
      "Yardımcı fikir",
      "İkinci ana fikir",
      "Konu başlığı",
      "Örtülü anlam",
      ],
      correctAnswerIndex: 0,
      hint: "Yuva, yarar yargısını besleyen bir örnektir.",
      explanation: "Adım 1: Ana fikir yarar sağlamaktır. Adım 2: Yuva bu yararı örneklendirir. Adım 3: Bu yardımcı fikirdir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sude yardımcı cümleyi ikinci ana fikir sayıyor. Hangisi doğru düzeltmedir?",
      options: [
      "Metinde ana fikir tektir; yardımcı ikinci ana fikir değildir",
      "Her yardımcı cümle yeni ana fikirdir",
      "Yardımcı fikir konuyu değiştirir",
      "Yardımcı fikir terim anlamdır",
      ],
      correctAnswerIndex: 0,
      hint: "Ana fikir sayısı kaçtır?",
      explanation: "Adım 1: Ana fikir tektir. Adım 2: Yardımcı cümle onu taşır. Adım 3: İkinci ana fikir olmaz.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
