import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (6/20). */
export const JUNIOR_FEN_QUIZ_6 = {
  lessonKey: "jr_06_fen-6",
  title: "Kan grupları ve kan bağışı",
  tellGuides: [
    "Dört ana kan grubunu ve Rh faktörünü anlatabilir misin?",
    "Kan bağışı neden sağlık kontrolünden sonra yapılır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ana kan grupları hangileridir?",
      options: [
      "A, B, AB ve 0",
      "Katı, sıvı ve gaz",
      "İç ve dış gezegen",
      "İletken ve yalıtkan",
      ],
      correctAnswerIndex: 0,
      hint: "Dört harfli gruplama vardır.",
      explanation: "Adım 1: İnsanlarda dört ana kan grubu vardır. Adım 2: Bunlar A, B, AB ve 0'dır. Adım 3: Ayrıca Rh pozitif veya negatif olabilir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Rh faktörü neyi etkiler?",
      options: [
      "Kan uyumunu",
      "Sesin hızını",
      "Gezegen sırasını",
      "Yoğunluk formülünü",
      ],
      correctAnswerIndex: 0,
      hint: "Rh+ ve Rh− uyumda önemlidir.",
      explanation: "Adım 1: Rh, kanda bir proteindir. Adım 2: Pozitif veya negatif olabilir. Adım 3: Kan naklinde grupla birlikte Rh uyumu da bakılır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Okulda kan bağışı afişi asılı. Doğru mesaj hangisidir?",
      options: [
      "Bağış gönüllüdür ve sağlık kontrolünden sonra yapılır",
      "Herkes hiçbir kontrol olmadan bağış yapmalıdır",
      "Kan grubu bilinmeden bağış zorunludur",
      "Bağış yalnız gece yapılabilir",
      ],
      correctAnswerIndex: 0,
      hint: "Gönüllülük ve güvenlik birlikte gelir.",
      explanation: "Adım 1: Kan bağışı gönüllü bir yardımlardır. Adım 2: Önce sağlık kontrolü yapılır. Adım 3: Böylece hem verici hem alıcı korunur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
