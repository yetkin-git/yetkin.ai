import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — canlılarda üreme ve büyüme. */
export const JUNIOR_FEN_QUIZ_26 = {
  lessonKey: "jr_06_fen-26",
  title: "Canlılarda üreme ve büyüme",
  tellGuides: [
    "Üreme ile büyümeyi bir kuş örneğinde ayır.",
    "Kedi ile kuşun başlangıç yolunu karşılaştır.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Büyüme üremeden hangi yönüyle ayrılır?",
      options: [
        "Oluşan bireyin ölçülen artışıdır",
        "Yeni bireyin hiç başlamamasıdır",
        "Yalnız yer değiştirmedir",
        "Yalnız ışığın yansımasıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Başlangıç ayrı, artış ayrı.",
      explanation:
        "Adım 1: Üreme yeni bireyi başlatır. Adım 2: Büyüme boy ve kütle artışıdır. Adım 3: İkisi aynı olay değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Kuşun 4 yumurta bırakması hangi olaya örnektir?",
      options: ["Üreme", "Yer değiştirme", "Erime", "Yansıma"],
      correctAnswerIndex: 0,
      hint: "Yumurta yeni bireyin başlangıcıdır.",
      explanation:
        "Adım 1: Yumurta üreme ile oluşur. Adım 2: Tüylenme sonraki büyümedir. Adım 3: Yumurta sayısı üreme satırına yazılır.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Karşılaştırma tablosunda kuş yumurtadan, kedi doğumla başlıyor. Fasulye 3 haftada 12 santimetre oluyor. 12 santimetre hangi satıra yazılır?",
      options: [
        "Büyüme satırına, çünkü ölçülen artıştır",
        "Üreme satırına, çünkü santimetre yumurtadır",
        "Yansıma satırına, çünkü boy ışıktır",
        "Yer değiştirme satırına, çünkü fide yürür",
      ],
      correctAnswerIndex: 0,
      hint: "Santimetre artışı büyümeyi ölçer.",
      explanation:
        "Adım 1: Yumurta ve doğum üreme yoludur. Adım 2: 12 santimetre boy artışıdır. Adım 3: Bu sayı büyüme satırına yazılır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
