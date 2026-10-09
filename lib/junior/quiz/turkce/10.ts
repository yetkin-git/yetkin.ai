import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (10/20). */
export const JUNIOR_TURKCE_QUIZ_10 = {
  lessonKey: "jr_06_turkce-10",
  title: "Paragrafın yapısı",
  tellGuides: [
    "Giriş, gelişme ve sonucun görevlerini kendi sözlerinle anlatır mısın?",
    "Konuya bağlanmayan cümlenin akışı nasıl bozduğunu bir örnekle açıklar mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Paragrafın giriş bölümü ne yapar?",
      options: [
      "Konuyu tanıtır",
      "Yalnızca sonucu yazar",
      "Noktalama ekler",
      "Atasözü uydurur",
      ],
      correctAnswerIndex: 0,
      hint: "İlk bölüm okuru nereye götürür?",
      explanation: "Adım 1: Giriş konuyu tanıtır. Adım 2: Gelişme açıklar. Adım 3: Sonuç toparlar.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Gelişme bölümünde beklenen iş hangisidir?",
      options: [
      "Konuyu açıklamak ve desteklemek",
      "Konuyu hiç anmamak",
      "Yalnızca ünlem koymak",
      "Başlığı silmek",
      ],
      correctAnswerIndex: 0,
      hint: "Gelişme, girişte açılan konuyu büyütür.",
      explanation: "Adım 1: Üç bölüm aynı konudadır. Adım 2: Gelişme açıklar ve destekler. Adım 3: Konuya bağlanmayan cümle akışı bozar.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Orman yararı anlatan paragrafa «Dün sinemaya gittim.» cümlesi eklenmiş. Hangisi doğrudur?",
      options: [
      "Konuya bağlanmaz; çıkınca akış düzelir",
      "Zorunlu sonuç cümlesidir",
      "Ana fikirdir",
      "Yapım ekidir",
      ],
      correctAnswerIndex: 0,
      hint: "Cümle orman konusuyla bağlanıyor mu?",
      explanation: "Adım 1: Paragraf orman yararı üzerinedir. Adım 2: Sinema cümlesi konuya bağlanmaz. Adım 3: Çıkınca paragraf düzelir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
