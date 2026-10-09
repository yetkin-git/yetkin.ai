import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (15/20). */
export const JUNIOR_FEN_QUIZ_15 = {
  lessonKey: "jr_06_fen-15",
  title: "Sesin maddeyle etkileşimi",
  tellGuides: [
    "Yankı nedir; nasıl oluşur?",
    "Ses yalıtımında hangi malzemeler işe yarar?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Yankı nedir?",
      options: [
      "Sesin yansıması",
      "Sesin boşlukta kaybolması",
      "Isının iletilmesi",
      "Kanın süzülmesi",
      ],
      correctAnswerIndex: 0,
      hint: "Duvar veya dağ sesi geri yollar.",
      explanation: "Adım 1: Ses bir yüzeye çarpabilir. Adım 2: Geri dönen sese yankı denir. Adım 3: Yani yankı sesin yansımasıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Ses yalıtımında hangisi daha uygundur?",
      options: [
      "Halı, sünger, perde gibi soğurucu malzemeler",
      "Parlak metal ayna",
      "Boş cam kavanoz",
      "Açık pencere",
      ],
      correctAnswerIndex: 0,
      hint: "Yumuşak ve gözenekli yüzeyler soğurur.",
      explanation: "Adım 1: Sert düz yüzeyler sesi yansıtır. Adım 2: Yumuşak malzemeler sesi soğurur. Adım 3: Bu yüzden yalıtımda halı, sünger, perde kullanılır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sinema salonunda duvarlar kumaş kaplıdır. Amaç nedir?",
      options: [
      "Yankıyı azaltmak; sesi soğurmak",
      "Sesi boşlukta hızlandırmak",
      "Işığı tutulmaya çevirmek",
      "Yoğunluğu artırmak",
      ],
      correctAnswerIndex: 0,
      hint: "Net konuşma için az yansıma.",
      explanation: "Adım 1: Sert duvarlar yankı yapar. Adım 2: Kumaş sesi soğurur. Adım 3: Böylece film sesi daha net duyulur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
