import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (7/20). */
export const JUNIOR_TURKCE_QUIZ_7 = {
  lessonKey: "jr_06_turkce-7",
  title: "Cümlede örtülü anlam ve cümle yorumlama",
  tellGuides: [
    "Açık anlam ile örtülü anlamı kendi sözlerinle ayırır mısın?",
    "Yorum yaparken cümlede iz olmayan yargıyı neden eklemememiz gerektiğini anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Örtülü anlam nedir?",
      options: [
      "Doğrudan söylenmeyip sezdirilen anlam",
      "Sözlükteki ilk madde",
      "Yalnızca terim anlam",
      "Yalnızca noktalama",
      ],
      correctAnswerIndex: 0,
      hint: "Kapıyı çarparak çıkmak kızgınlığı nasıl sezdirir?",
      explanation: "Adım 1: Açık anlam doğrudan söylenir. Adım 2: Örtülü anlam sezdirilir. Adım 3: Doğru seçenek sezdirilen anlamdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Kapıyı çarparak çıktı.» cümlesinde örtülü olarak ne sezdirilir?",
      options: [
      "Kızgınlık / öfke",
      "Mutluluk",
      "Uykusuzluk",
      "Yemek saati",
      ],
      correctAnswerIndex: 0,
      hint: "Kapıyı çarpmak hangi duyguyu düşündürür?",
      explanation: "Adım 1: Kapıyı çarpmak sert bir davranıştır. Adım 2: Bu davranış kızgınlığı sezdirir. Adım 3: Metinde mutluluk veya yemek izi yoktur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Berk «Kapıyı çarparak çıktı; demek ki eve geç kaldı.» diyor. Hangisi doğru değerlendirmedir?",
      options: [
      "Geç kalma izi yok; eklenmemelidir",
      "Geç kalma kesin örtülü anlamdır",
      "Cümle nesnel tanımdır",
      "Bu bir atasözüdür",
      ],
      correctAnswerIndex: 0,
      hint: "Yorum, cümledeki ize dayanmalıdır.",
      explanation: "Adım 1: Kapıyı çarpmak öfkeyi sezdirir. Adım 2: Geç kalmaya dair iz yoktur. Adım 3: İzi olmayan yargı eklenmez.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
