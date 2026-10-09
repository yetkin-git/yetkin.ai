import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (16/20). */
export const JUNIOR_SOSYAL_QUIZ_16 = {
  lessonKey: "jr_06_sosyal-16",
  title: "Demokrasinin gelişimi ve yönetim biçimleri",
  tellGuides: [
    "Demokrasinin «katılmak» olduğunu nasıl anlatırsın?",
    "Cumhuriyet ile demokrasinin bağını kendi sözlerinle söyler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Demokrasi temelde neyi ifade eder?",
      options: [
      "Halkın yönetime katılması ve kararlarda söz sahibi olması",
      "Tek kişinin sınırsız yönetimi",
      "Yalnızca vergi oranını",
      "Harita ölçeğini",
      ],
      correctAnswerIndex: 0,
      hint: "Katılım ve söz hakkı.",
      explanation: "Adım 1: Demokrasi halkın yönetime katılmasıdır. Adım 2: Seçim ve temsil bu yolun araçlarıdır. Adım 3: Tek kişi egemenliği demokrasi değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Cumhuriyet yönetiminde yöneticiler nasıl belirlenir?",
      options: [
      "Seçimle",
      "Rastgele çekilişle her gün",
      "Yalnız soyadına göre",
      "Harita rengiyle",
      ],
      correctAnswerIndex: 0,
      hint: "Seçilen yönetim.",
      explanation: "Adım 1: Cumhuriyette yönetim seçimle gelir. Adım 2: Temsil halkın oyuna dayanır. Adım 3: Soyadı veya harita rengi ölçüt değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sınıf başkanı seçiminde herkesin oy kullanması hangi değeri yaşatır?",
      options: [
      "Demokratik katılımı",
      "Önyargıyı",
      "Yenilenemez kaynağı",
      "Mutlak konumu",
      ],
      correctAnswerIndex: 0,
      hint: "Küçük ölçekte demokrasi pratiği.",
      explanation: "Adım 1: Oy kullanmak katılmaktır. Adım 2: Sınıf seçimi demokrasi alıştırmasıdır. Adım 3: Bu, önyargı veya konum bilgisi değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
