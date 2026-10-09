import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (20/20). */
export const JUNIOR_TURKCE_QUIZ_20 = {
  lessonKey: "jr_06_turkce-20",
  title: "Üç nokta, soru, ünlem, kesme ve tırnak",
  tellGuides: [
    "Üç nokta, soru, ünlem, kesme ve tırnağın işlerini kendi sözlerinle anlatır mısın?",
    "Soru eki mi ile soru işaretinin aynı iş olmadığını neden söylersin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Üç nokta işareti ne gösterir?",
      options: [
      "Sözün sürdüğünü / eksik bırakıldığını",
      "Cümleyi kesin bitirdiğini",
      "Yalnızca hitabı",
      "Yalnızca iyelik ekini",
      ],
      correctAnswerIndex: 0,
      hint: "Söz yarım kalmış gibi durur.",
      explanation: "Adım 1: Üç nokta sözün sürdüğünü gösterir. Adım 2: Nokta cümleyi bitirir. Adım 3: Hitap ve iyelik başka işlerdir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Ankara'ya» yazımında kesme ne yapar?",
      options: [
      "Eki özel addan ayırır",
      "Soru sorar",
      "Şaşma bildirir",
      "Başkasının sözünü alır",
      ],
      correctAnswerIndex: 0,
      hint: "Özel ada gelen eki düşün.",
      explanation: "Adım 1: Ankara özel addır. Adım 2: Kesme eki ayırır. Adım 3: Soru, ünlem ve tırnak farklı işlerdir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Geldin mi?» cümlesinde mi ve soru işareti için hangisi doğrudur?",
      options: [
      "mi soru ekidir (ayrı); soru işareti soruyu bitirir — aynı iş değildir",
      "İkisi de aynı işarettir",
      "mi kesme işaretidir",
      "Soru işareti bağlaçtır",
      ],
      correctAnswerIndex: 0,
      hint: "Biri ek, biri noktalama işaretidir.",
      explanation: "Adım 1: mi soru ekidir ve ayrı yazılır. Adım 2: Soru işareti soruyu bitirir. Adım 3: İkisi birlikte çalışır ama aynı iş değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
