import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — üreme. */
export const JUNIOR_FEN_QUIZ_22 = {
  lessonKey: "jr_06_fen-22",
  title: "Üreme",
  tellGuides: [
    "Eşeysiz üreme ile eşeyli üremeyi ata sayısıyla ayır.",
    "Çelik ve tohum örneklerinden birer cümle kur.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Eşeysiz üremede ata sayısı nasıldır?",
      options: ["Tek ata vardır", "Her zaman iki ata vardır", "Ata gerekmez ve soy biter", "Yalnız Güneş atadır"],
      correctAnswerIndex: 0,
      hint: "Tek canlıdan yeni birey.",
      explanation:
        "Adım 1: Eşeysiz üreme tek atadan yürür. Adım 2: Eşeyli üremede iki üreme hücresi birleşir. Adım 3: Çelik örneği tek atayı gösterir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Bir nane dalı suda köklenip yeni bitki olursa bu hangi yoldur?",
      options: ["Eşeysiz üreme", "Eşeyli üreme", "Yer değiştirme", "Erime"],
      correctAnswerIndex: 0,
      hint: "Yeni bitki tek daldan gelir.",
      explanation:
        "Adım 1: Yeni bitkinin atası tek daldır. Adım 2: İki üreme hücresi birleşmez. Adım 3: Yol eşeysiz üremedir.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Bahçe tablosunda 1 nane çeliği tek başına yeni bitki veriyor, 2 çiçek ise tohum oluşturuyor. Tohum satırı hangi üreme yoludur ve neden?",
      options: [
        "Eşeyli, çünkü tohum iki üreme hücresinin birleşmesiyle oluşur",
        "Eşeysiz, çünkü tohum tek yapraktır",
        "Eşeysiz, çünkü çiçek sayısı 2'dir",
        "Yer değiştirme, çünkü tohum yere düşer",
      ],
      correctAnswerIndex: 0,
      hint: "Tohum eşeyli yolun ürünüdür.",
      explanation:
        "Adım 1: Çelik tek atadan gelir ve eşeysizdir. Adım 2: Tohum, üreme hücrelerinin birleşmesiyle oluşur. Adım 3: Tohum satırı eşeyli üremedir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
