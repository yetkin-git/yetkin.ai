import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (13/20). */
export const JUNIOR_SOSYAL_QUIZ_13 = {
  lessonKey: "jr_06_sosyal-13",
  title: "Doğal kaynaklarımız ve sürdürülebilirlik",
  tellGuides: [
    "Yenilenebilir ve yenilenemez kaynağı nasıl ayırırsın?",
    "Sürdürülebilirliğin «yarını da hesaba katmak» olduğunu bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yenilenemez doğal kaynak için hangisi doğrudur?",
      options: [
      "Tükendiğinde kısa sürede yeniden oluşmaz",
      "Her gece kendiliğinden çoğalır",
      "Hiç kullanılmaz",
      "Yalnızca rüzgârdır",
      ],
      correctAnswerIndex: 0,
      hint: "Kömür ve petrol bu taraftadır.",
      explanation: "Adım 1: Yenilenemez kaynak çok uzun sürede oluşur. Adım 2: Aşırı kullanımda tükenir. Adım 3: Rüzgâr yenilenebilir taraftadır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Ormanı bilinçsiz kesmek hangi ilkeye aykırıdır?",
      options: [
      "Sürdürülebilirlik",
      "Mutlak konum",
      "Hicret",
      "Yasama organı",
      ],
      correctAnswerIndex: 0,
      hint: "Yarını da düşünen kullanım.",
      explanation: "Adım 1: Sürdürülebilirlik, kaynağı yarın için de korumaktır. Adım 2: Bilinçsiz kesim yenilenmeyi bozar. Adım 3: Konum veya Hicret ile ilgili değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Okulda kâğıdı iki yüz kullanmak ve ışığı gereksiz yere açık bırakmamak neyi öğretir?",
      options: [
      "Küçük tasarrufun kaynak korumasına katkı verdiğini",
      "Verginin kaldırıldığını",
      "İklimin tek tip olduğunu",
      "Doğal kaynağın sonsuz olduğunu",
      ],
      correctAnswerIndex: 0,
      hint: "Günlük alışkanlık = sürdürülebilirlik pratiği.",
      explanation: "Adım 1: Kaynak sınırlıdır. Adım 2: Tasarruf tüketimi azaltır. Adım 3: Bu, sürdürülebilir vatandaşlık davranışıdır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
