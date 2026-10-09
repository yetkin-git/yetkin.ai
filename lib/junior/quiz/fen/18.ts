import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (18/20). */
export const JUNIOR_FEN_QUIZ_18 = {
  lessonKey: "jr_06_fen-18",
  title: "Sistemlerin sağlığı",
  tellGuides: [
    "Sistemleri korumak için günlük üç alışkanlığı söyleyebilir misin?",
    "İlk yardımda ilk iki adımı sırayla anlatabilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Sistemlerin sağlığını koruyan temel alışkanlıklar hangileridir?",
      options: [
      "Düzenli beslenme, uyku ve hareket",
      "Geceleri güneşe bakmak",
      "Hiç su içmemek",
      "Sürekli gürültülü ortam",
      ],
      correctAnswerIndex: 0,
      hint: "Üç temel: ye, uyu, hareket et.",
      explanation: "Adım 1: Beslenme enerji ve onarım sağlar. Adım 2: Uyku dinlenme verir. Adım 3: Hareket kas, kalp ve solunumu güçlendirir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "İlk yardımda öncelik sırası hangisidir?",
      options: [
      "Güvenli ortam kur, 112'yi ara",
      "Önce yiyecek ver, sonra bekle",
      "Önce su içir, sonra taşı",
      "Önce güneşe bak, sonra koş",
      ],
      correctAnswerIndex: 0,
      hint: "Güvenlik + yardım çağrısı.",
      explanation: "Adım 1: Önce ortam güvenli olmalıdır. Adım 2: Sonra 112 aranır. Adım 3: Bilinci kapalı kişiye yiyecek-su verilmez.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Parkta bir kişi baygın. Doğru davranış hangisidir?",
      options: [
      "Ortamı güvenli tut, 112 ara; yiyecek-su verme",
      "Hemen su ve ekmek ver",
      "Kişiyi yalnız bırakıp uzaklaş",
      "Güneşe çıplak gözle baktır",
      ],
      correctAnswerIndex: 0,
      hint: "Bilinç kapalıysa ağızdan bir şey verilmez.",
      explanation: "Adım 1: Güvenlik sağlanır. Adım 2: 112 aranır. Adım 3: Bilinci kapalıysa yiyecek ve su verilmez; boğulma riski vardır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
