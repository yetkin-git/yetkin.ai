import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (15/20). */
export const JUNIOR_TURKCE_QUIZ_15 = {
  lessonKey: "jr_06_turkce-15",
  title: "Yapım ekleri ve sözcük türetme",
  tellGuides: [
    "Yapım eki ile çekim ekinin kelimenin anlamında yaptığı değişikliği kendi sözlerinle anlatır mısın?",
    "Dört türetme yolundan birini bir örnekle açıklar mısın?",
    "«Evler» ile «evli» arasındaki farkı anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yapım eki ne yapar?",
      options: [
      "Yeni anlamlı sözcük türetir",
      "Yalnızca çoğul yapar",
      "Yalnızca soru sorar",
      "Yalnızca nokta koyar",
      ],
      correctAnswerIndex: 0,
      hint: "Göz → gözlük değişimini düşün.",
      explanation: "Adım 1: Yapım eki yeni sözcük türetir. Adım 2: Anlam ve bazen tür değişir. Adım 3: Çekim eki görev verir; türetmez.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«gözlük» sözcüğünde hangi türetme vardır?",
      options: [
      "İsimden isim",
      "Fiilden fiil",
      "Yalnızca çekim",
      "Koşul-sonuç",
      ],
      correctAnswerIndex: 0,
      hint: "göz bir isimdir; gözlük de bir addır.",
      explanation: "Adım 1: göz isim köküdür. Adım 2: lük yapım ekidir. Adım 3: Yeni bir isim doğmuştur; isimden isim türetmedir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Evler» ile «evli» karşılaştırılıyor. Hangisi doğrudur?",
      options: [
      "Evler çekimdir (anlam aynı); evli yapımdır (yeni anlam)",
      "İkisi de yapım ekidir",
      "İkisi de fiil köküdür",
      "İkisi de atasözüdür",
      ],
      correctAnswerIndex: 0,
      hint: "Evler hâlâ ev midir? Evli yeni bir kimlik midir?",
      explanation: "Adım 1: Evler hâlâ evdir; çoğul çekimdir. Adım 2: Evli yeni anlam taşır; yapım ekidir. Adım 3: Yapım türetir, çekim görev verir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
