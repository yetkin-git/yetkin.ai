import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (12/20). */
export const JUNIOR_FEN_QUIZ_12 = {
  lessonKey: "jr_06_fen-12",
  title: "Yoğunluk",
  tellGuides: [
    "Yoğunluk formülünü bir örnekle anlatabilir misin?",
    "Bir cismin suda yüzmesi yoğunlukla nasıl bağlanır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yoğunluk nasıl bulunur?",
      options: [
      "Kütle bölü hacim",
      "Hacim bölü kütle",
      "Yol bölü zaman",
      "Kuvvet artı yön",
      ],
      correctAnswerIndex: 0,
      hint: "d = m / V",
      explanation: "Adım 1: Yoğunluk ayırt edici bir özelliktir. Adım 2: Formül d = kütle / hacim'dir. Adım 3: Birimi genelde g/cm³ veya kg/m³ olur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Kütlesi 20 g, hacmi 10 cm³ olan maddenin yoğunluğu kaçtır?",
      options: [
      "2 g/cm³",
      "0,5 g/cm³",
      "30 g/cm³",
      "200 g/cm³",
      ],
      correctAnswerIndex: 0,
      hint: "20'yi 10'a böl.",
      explanation: "Adım 1: d = m / V. Adım 2: 20 ÷ 10 = 2. Adım 3: Yoğunluk 2 g/cm³'tür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yağ, su ve bal aynı kapta katmanlaşıyor. En altta hangisi olur?",
      options: [
      "Bal (yoğunluğu en büyük)",
      "Yağ (yoğunluğu en büyük)",
      "Su (yoğunluğu en küçük)",
      "Hepsi aynı yoğunluktadır",
      ],
      correctAnswerIndex: 0,
      hint: "Yoğunluk kulesinde en ağır altta.",
      explanation: "Adım 1: Yoğunluğu büyük madde alta çöker. Adım 2: Bal su ve yağdan yoğundur. Adım 3: Bu yüzden en altta bal, ortada su, üstte yağ görünür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
