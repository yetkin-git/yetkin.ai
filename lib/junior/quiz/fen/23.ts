import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — büyüme. */
export const JUNIOR_FEN_QUIZ_23 = {
  lessonKey: "jr_06_fen-23",
  title: "Büyüme",
  tellGuides: [
    "Büyüme ile gelişmeyi birer örnekle ayır.",
    "Boy zaman grafiğinde eksenler neyi gösterir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Büyüme hangi değişimi anlatır?",
      options: [
        "Boy ve kütle gibi ölçülebilir artışı",
        "Yalnız saçın kesilmesini",
        "Yer değiştirmenin yönünü",
        "Suyun kaynamasını",
      ],
      correctAnswerIndex: 0,
      hint: "Cetvelle görülen artış.",
      explanation:
        "Adım 1: Büyüme boyutun artmasıdır. Adım 2: Gelişme yapının olgunlaşmasıdır. Adım 3: İkisi aynı cümle değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Boy 140 santimetreden 146 santimetreye çıkarsa fark kaçtır?",
      options: ["6 santimetre", "286 santimetre", "0 santimetre", "14 santimetre"],
      correctAnswerIndex: 0,
      hint: "Büyük sayıdan küçük sayıyı çıkar.",
      explanation:
        "Adım 1: Son boy 146 santimetredir. Adım 2: İlk boy 140 santimetredir. Adım 3: Fark 6 santimetredir.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Sağlık tablosunda Ece'nin boyu 6 santimetre artmış, aynı yıl iki yeni dişi çıkmış. Diş çıkması neden büyüme grafiğinin kendisi değildir?",
      options: [
        "Yeni bir yapının belirmesi gelişmedir; grafik boy artışını gösterir",
        "Diş çıkması alınan yol olduğu için",
        "Grafik yalnız kütleyi sıfır saydığı için",
        "6 santimetre gelişmenin ta kendisi olduğu için",
      ],
      correctAnswerIndex: 0,
      hint: "Grafik ölçülen boyu taşır.",
      explanation:
        "Adım 1: Boy farkı büyümeyi ölçer. Adım 2: Diş çıkması yeni bir yapıdır. Adım 3: Bu olay gelişme diye adlandırılır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
