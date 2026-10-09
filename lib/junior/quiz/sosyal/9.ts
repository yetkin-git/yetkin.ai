import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (9/20). */
export const JUNIOR_SOSYAL_QUIZ_9 = {
  lessonKey: "jr_06_sosyal-9",
  title: "Mutlak konum ve göreceli konum",
  tellGuides: [
    "Mutlak konum ile göreceli konum arasındaki farkı anlatır mısın?",
    "Paralel ve meridyenin neyi gösterdiğini söyler misin?",
    "Türkiye'nin yaklaşık enlem aralığını hatırlıyor musun?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Mutlak konum ile göreceli konum arasındaki temel fark nedir?",
      options: [
      "Mutlak konum enlem-boylamla sabittir; göreceli konum başka yere göredir",
      "İkisi de yalnız iklim türüdür",
      "Göreceli konum hiç değişmez, mutlak konum her gün değişir",
      "Mutlak konum yalnız şehir ismidir",
      ],
      correctAnswerIndex: 0,
      hint: "Sabit matematiksel adres / çevreye göre tarif.",
      explanation: "Adım 1: Mutlak konum paralel ve meridyenle belirlenir. Adım 2: Göreceli konum «parkın karşısı» gibi tariftir. Adım 3: Biri sabit, diğeri referansa bağlıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Haritada paralel çizgileri neyi gösterir?",
      options: [
      "Enlemi",
      "Yalnızca boylamı",
      "Vergi oranını",
      "Nüfus yoğunluğunu",
      ],
      correctAnswerIndex: 0,
      hint: "Ekvator'a paralel hayali çizgiler.",
      explanation: "Adım 1: Paraleller enlemi gösterir. Adım 2: Meridyenler boylamı gösterir. Adım 3: Türkiye yaklaşık 36–42° kuzey paralellerindedir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Arkadaşına «Okul, marketin iki sokak yukarısında» diyen biri hangi konumu kullanır?",
      options: [
      "Göreceli konum",
      "Mutlak konum",
      "Yalnızca boylam",
      "İklim tipi",
      ],
      correctAnswerIndex: 0,
      hint: "Başka bir yere göre tarif.",
      explanation: "Adım 1: Market referans alınmıştır. Adım 2: Bu göreceli tariftir. Adım 3: Enlem-boylam verilmediği için mutlak konum değildir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
