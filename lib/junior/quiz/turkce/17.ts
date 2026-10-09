import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (17/20). */
export const JUNIOR_TURKCE_QUIZ_17 = {
  lessonKey: "jr_06_turkce-17",
  title: "Büyük harfler ve sayıların yazımı",
  tellGuides: [
    "Özel adların neden büyük harfle yazıldığını kendi sözlerinle anlatır mısın?",
    "Üç elma ile tarih/saat yazımı arasındaki farkı açıklar mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Cümle hızlı nasıl başlamalıdır?",
      options: [
      "Büyük harfle",
      "Küçük harfle",
      "Ünlemle",
      "Kesme işaretiyle",
      ],
      correctAnswerIndex: 0,
      hint: "İlk harf kuralını düşün.",
      explanation: "Adım 1: Cümle büyük harfle başlar. Adım 2: Özel adlar da büyük yazılır. Adım 3: Ay ve gün adları cümle ortasında küçük kalabilir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi doğru yazımdır?",
      options: [
      "Üç elma aldım.",
      "3 elma aldım. (zorunlu tek doğru)",
      "ankara'ya gittim.",
      "ali geldi.",
      ],
      correctAnswerIndex: 0,
      hint: "Küçük sayılar yazıyla yazılır; özel ad büyük harfle başlar.",
      explanation: "Adım 1: Üç gibi küçük sayılar yazıyla yazılır. Adım 2: Ankara ve Ali özel addır; büyük yazılır. Adım 3: Doğru seçenek «Üç elma aldım.»dır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Tarih, saat ve para hangi biçimde yazılır?",
      options: [
      "Rakamla",
      "Her zaman yazıyla",
      "Yalnızca noktalı virgülle",
      "Yalnızca tırnak içinde",
      ],
      correctAnswerIndex: 0,
      hint: "8 Ekim, 14.30, 50 TL örneklerini düşün.",
      explanation: "Adım 1: Küçük sayılar yazıyla yazılabilir. Adım 2: Tarih, saat ve para rakamla yazılır. Adım 3: Doğru seçenek rakamladır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
