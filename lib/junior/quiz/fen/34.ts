import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — erime, donma ve kaynama. */
export const JUNIOR_FEN_QUIZ_34 = {
  lessonKey: "jr_06_fen-34",
  title: "Erime, donma ve kaynama",
  tellGuides: [
    "Erime ile kaynamayı sıcaklık eşikleriyle ayır.",
    "Hâl değişirken sıcaklık neden bir süre sabit kalabilir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Saf su deniz seviyesinde kaç derecede kaynar?",
      options: ["100", "0", "37", "20"],
      correctAnswerIndex: 0,
      hint: "Erime eşiği 0'dır.",
      explanation:
        "Adım 1: Saf su 0 derecede erir ve donar. Adım 2: Kaynama daha yüksek eşiktir. Adım 3: Deniz seviyesinde bu eşik 100 derecedir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Buz erirken termometre 0 derecede kalıyorsa ısı neye harcanır?",
      options: [
        "Hâl değişimine",
        "Sıcaklığı hemen 100 dereceye çıkarmaya",
        "Yer değiştirmeyi artırmaya",
        "Işığı yansıtmaya",
      ],
      correctAnswerIndex: 0,
      hint: "Sıcaklık yatay kalır.",
      explanation:
        "Adım 1: Isı gelmeye devam eder. Adım 2: Sıcaklık 0 derecede bekler. Adım 3: Isı erimeye harcanır.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Sıcaklık zaman grafiğinde su 20 derecede tepsiden azalıyor, 100 derecede ise her yerinden kabarcık çıkarıyor. 20 derecelik azalma hangisidir?",
      options: [
        "Yüzeyden buharlaşma, kaynama değil",
        "Kaynama, çünkü her sıcaklık kaynamadır",
        "Donma, çünkü su eksilir",
        "Erime, çünkü sıcaklık 20'dir",
      ],
      correctAnswerIndex: 0,
      hint: "Kaynama belirli eşikte ve içten olur.",
      explanation:
        "Adım 1: 20 derece kaynama eşiği değildir. Adım 2: Yüzeyden azalma buharlaşmadır. Adım 3: 100 derecedeki kabarcık kaynamadır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
