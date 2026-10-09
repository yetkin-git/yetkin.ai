import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (14/20). */
export const JUNIOR_FEN_QUIZ_14 = {
  lessonKey: "jr_06_fen-14",
  title: "Sesin yayılması",
  tellGuides: [
    "Ses neden boşlukta yayılmaz?",
    "Sesin katı, sıvı ve gazdaki hız sırasını anlatabilir misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Sesin yayılması için ne gerekir?",
      options: [
      "Maddesel ortam",
      "Tam boşluk",
      "Yalnızca ışık",
      "Yalnızca manyetik alan",
      ],
      correctAnswerIndex: 0,
      hint: "Titreşim bir maddeye ihtiyaç duyar.",
      explanation: "Adım 1: Ses titreşimle oluşur. Adım 2: Titreşim tanecikten taneciğe aktarılır. Adım 3: Bu yüzden ses maddesel ortamda yayılır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Ses boşlukta nasıl davranır?",
      options: [
      "Yayılmaz",
      "En hızlı yayılır",
      "Yalnızca gündüz yayılır",
      "Yalnızca gece yayılır",
      ],
      correctAnswerIndex: 0,
      hint: "Uzayda ses duyulmaz.",
      explanation: "Adım 1: Boşlukta tanecik yoktur. Adım 2: Titreşim aktarılamaz. Adım 3: Bu yüzden ses boşlukta yayılmaz.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Raylara kulak dayayınca tren sesi erken duyulur. Neden?",
      options: [
      "Ses katıda gazdan daha hızlı yayılır",
      "Ses boşlukta daha hızlıdır",
      "Ses yalnız suda yayılır",
      "Ses yoğunluk formülüdür",
      ],
      correctAnswerIndex: 0,
      hint: "Katı > sıvı > gaz hız sırası.",
      explanation: "Adım 1: Ses farklı ortamlarda farklı hızla gider. Adım 2: Katıda tanecikler yakındır; iletim hızlıdır. Adım 3: Ray (katı) havadan hızlı ilettiği için ses erken duyulur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
