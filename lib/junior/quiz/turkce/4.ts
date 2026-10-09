import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (4/20). */
export const JUNIOR_TURKCE_QUIZ_4 = {
  lessonKey: "jr_06_turkce-4",
  title: "Söz sanatları",
  tellGuides: [
    "Benzetme, kişileştirme ve konuşturmayı kendi sözlerinle ayırır mısın?",
    "Karşıtlığın bir araya getirdiği zıtlıkları bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Benzetmede sık görülen bağ sözcükler hangileridir?",
      options: [
      "gibi, kadar",
      "ama, fakat",
      "ve, ile",
      "mi, mı",
      ],
      correctAnswerIndex: 0,
      hint: "«Kar gibi beyaz» cümlesindeki bağa bak.",
      explanation: "Adım 1: Benzetmede iki şey birbirine yaklaştırılır. Adım 2: Sık bağlar gibi ve kadardır. Adım 3: Diğerleri bağlaç veya soru ekidir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Rüzgâr fısıldadı.» cümlesinde hangi söz sanatı vardır?",
      options: [
      "Kişileştirme",
      "Benzetme",
      "Karşıtlık",
      "Tanımlama",
      ],
      correctAnswerIndex: 0,
      hint: "Cansıza insan hali verilmiş midir?",
      explanation: "Adım 1: Rüzgâr cansızdır. Adım 2: Fısıldamak insan eylemidir. Adım 3: Cansıza insan hali vermek kişileştirmedir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ayşe «Güneş bana «Merhaba!» dedi.» cümlesini inceliyor. Hangisi doğru tanıdır?",
      options: [
      "Konuşturma; cansıza söz söyletilmiştir",
      "Yalnızca benzetmedir",
      "Zıt anlamdır",
      "Noktalama hatasıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Cansıza gerçekten söz mü verildi?",
      explanation: "Adım 1: Güneş cansızdır. Adım 2: Ona söz söyletilmiştir. Adım 3: Bu konuşturmadır; kişileştirmeden bir adım ötedir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
