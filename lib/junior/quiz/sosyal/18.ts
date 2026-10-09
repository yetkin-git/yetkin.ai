import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (18/20). */
export const JUNIOR_SOSYAL_QUIZ_18 = {
  lessonKey: "jr_06_sosyal-18",
  title: "Devletin organları",
  tellGuides: [
    "Yasama, yürütme ve yargıyı kendi sözlerinle ayırır mısın?",
    "Bir haberde geçen işin hangi organa ait olduğunu nasıl anlarsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yasama organı Türkiye'de hangisidir?",
      options: [
      "Türkiye Büyük Millet Meclisi",
      "Yalnızca mahkemeler",
      "Yalnızca valilikler",
      "İklim istasyonları",
      ],
      correctAnswerIndex: 0,
      hint: "Kanun yapan organ.",
      explanation: "Adım 1: Yasama kanun yapar. Adım 2: Bu iş TBMM'nindir. Adım 3: Mahkeme yargı, uygulama ise yürütme tarafındadır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Cumhurbaşkanının kanunları uygulayan ekibin başında olması hangi organı gösterir?",
      options: [
      "Yürütme",
      "Yasama",
      "Yargı",
      "Kervansaray",
      ],
      correctAnswerIndex: 0,
      hint: "Uygulama tarafı.",
      explanation: "Adım 1: Yürütme kanunları uygular. Adım 2: Başında Cumhurbaşkanı vardır. Adım 3: Kanun yazmak yasama, yargılamak yargıdır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir dava sonucu mahkemeden çıkıyorsa bu haber hangi organla ilgilidir?",
      options: [
      "Yargı",
      "Yalnızca yasama",
      "Yalnızca İpek Yolu",
      "Yalnızca iklim",
      ],
      correctAnswerIndex: 0,
      hint: "Bağımsız mahkemeler.",
      explanation: "Adım 1: Yargı bağımsız mahkemelerdir. Adım 2: Dava kararı yargı işidir. Adım 3: Üç organ birbirinin işini almaz.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
