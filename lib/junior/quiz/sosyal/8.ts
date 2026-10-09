import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (8/20). */
export const JUNIOR_SOSYAL_QUIZ_8 = {
  lessonKey: "jr_06_sosyal-8",
  title: "İpek Yolu ve kültürel etkileşim",
  tellGuides: [
    "İpek Yolu'nu yalnız ipek hattı olarak mı, yoksa kültür yolu olarak mı anlatırsın?",
    "Kervanın taşıdığı bir mal ve bir fikir örneği verebilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İpek Yolu nedir?",
      options: [
      "Çin'den Anadolu ve Akdeniz'e uzanan ticaret ve karşılaşma yolu",
      "Yalnızca bir demiryolu hattı",
      "Modern otoyol vergisi",
      "Yalnız denizaltı kablosu",
      ],
      correctAnswerIndex: 0,
      hint: "Mal ve kültürün birlikte yürüdüğü yol.",
      explanation: "Adım 1: İpek Yolu tarihi bir ticaret yoludur. Adım 2: Çin'den batıya uzanır. Adım 3: Yalnız demiryolu veya vergi değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Haritada kervansaray hangi işlevi gösterir?",
      options: [
      "Yolcuların ve kervanların konakladığı durak",
      "Yalnızca vergi dairesi",
      "Deniz feneri",
      "Modern havaalanı",
      ],
      correctAnswerIndex: 0,
      hint: "Yolda dinlenme ve güvenlik durağı.",
      explanation: "Adım 1: Kervansaray yol üstü konaktır. Adım 2: Ticaret güvenliğini artırır. Adım 3: Havaalanı veya vergi dairesi değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir metin «İpek Yolu'nda yalnız kumaş taşındı» diyor. Hangisi daha doğru tamamlamadır?",
      options: [
      "Mal yanında din, dil, bilim ve fikirler de taşındı; kültürel etkileşim oldu",
      "Hiçbir kültür alışverişi olmadı",
      "Yalnızca modern bilgisayar taşındı",
      "Yol hiç kullanılmadı",
      ],
      correctAnswerIndex: 0,
      hint: "Kervan mal ile fikri birlikte taşır.",
      explanation: "Adım 1: Ticaret mal taşır. Adım 2: İnsanlar fikir, inanç ve bilgi de taşır. Adım 3: Bu yüzden İpek Yolu kültürel etkileşim yoludur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
