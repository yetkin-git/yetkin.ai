import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — biyoçeşitlilik ve tehditler. */
export const JUNIOR_FEN_QUIZ_37 = {
  lessonKey: "jr_06_fen-37",
  title: "Biyoçeşitlilik ve tehditler",
  tellGuides: [
    "Biyoçeşitliliği bir cümlede tanımla.",
    "Bir tehdit ve bir koruma davranışı eşle.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Biyoçeşitlilik neyi anlatır?",
      options: [
        "Bir bölgedeki canlı çeşitliliğini ve ilişkisini",
        "Yalnız tek bir evcil hayvanı",
        "Işığın yansıma açısını",
        "Suyun kaynama noktasını",
      ],
      correctAnswerIndex: 0,
      hint: "Çok tür, çok ilişki.",
      explanation:
        "Adım 1: Biyoçeşitlilik tür sayısını içerir. Adım 2: Türler birbirine bağlıdır. Adım 3: Tek birey bu tanımın tamamı değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Ormanın yarısı kesilince 4 kuş türü bölgeyi terk ederse bu nedir?",
      options: [
        "Biyoçeşitliliğe yönelik bir tehdidin sonucu",
        "Genleşmenin sonucu",
        "Yansıma açısının artması",
        "Erimenin sabit sıcaklığı",
      ],
      correctAnswerIndex: 0,
      hint: "Yaşam alanı azalınca tür azalır.",
      explanation:
        "Adım 1: Ağaç kesimi yaşam alanını daraltır. Adım 2: Yuva azalınca kuş türü düşer. Adım 3: Bu bir tehdit sonucudur.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Dere tablosunda atık böcek sayısını azaltıyor, böceği yiyen balık da azalıyor. Tartışmada hangi koruma cümlesi tabloya uyar?",
      options: [
        "Atığı suya vermemek böcek ve balık halkasını korur",
        "Daha çok atık biyoçeşitliliği artırır",
        "Balığı yok saymak tehdidi siler",
        "Böcekler aynada yansıdığı için azalır",
      ],
      correctAnswerIndex: 0,
      hint: "Halka atıktan başlar.",
      explanation:
        "Adım 1: Atık böceği azaltır. Adım 2: Böceğe bağlı balık da etkilenir. Adım 3: Atığı kesmek iki türü birden gözetir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
