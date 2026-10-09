import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (16/20). */
export const JUNIOR_TURKCE_QUIZ_16 = {
  lessonKey: "jr_06_turkce-16",
  title: "İsim çekim ekleri",
  tellGuides: [
    "Çekim ekinin türü değiştirmeden görev verdiğini kendi sözlerinle anlatır mısın?",
    "Hal eklerinden birini (yönelme, belirtme, bulunma, ayrılma) örnekle açıklar mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Çekim eki ne yapar?",
      options: [
      "Görev verir; türü değiştirmez",
      "Yeni sözcük türetir",
      "Ana fikir kurar",
      "Sesteşlik yaratır",
      ],
      correctAnswerIndex: 0,
      hint: "Ev → evler hâlâ ev midir?",
      explanation: "Adım 1: Çekim eki cümlede görev verir. Adım 2: Tür ve temel anlam değişmez. Adım 3: Yapım eki türetir; çekim türetmez.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«evde» sözcüğündeki -de eki hangi haldedir?",
      options: [
      "Bulunma",
      "Yönelme",
      "Ayrılma",
      "Belirtme",
      ],
      correctAnswerIndex: 0,
      hint: "Nerede? sorusuna cevap verir.",
      explanation: "Adım 1: Hal ekleri yönelme, belirtme, bulunma, ayrılmadır. Adım 2: -de bulunma bildirir. Adım 3: evde = bulunma hali.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Evin kapısı» ile «Senin evin» karşılaştırmasında hangisi doğrudur?",
      options: [
      "Evin’de ilgi; senin evin’de iyelik öne çıkar",
      "İkisi de yapım ekidir",
      "İkisi de fiil köküdür",
      "İkisi de soru ekidir",
      ],
      correctAnswerIndex: 0,
      hint: "İlgi eki iki adı bağlar; iyelik sahiplik bildirir.",
      explanation: "Adım 1: Evin kapısı’nda ilgi bağı vardır. Adım 2: Senin evin sahiplik / iyelik taşır. Adım 3: İkisi de çekim alanındadır; yapım değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
