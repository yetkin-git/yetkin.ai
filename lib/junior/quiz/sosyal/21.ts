import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi. Toplumsal sorunu müzakere. */
export const JUNIOR_SOSYAL_QUIZ_21 = {
  lessonKey: "jr_06_sosyal-21",
  title: "Toplumsal sorunu müzakere",
  tellGuides: [
    "Toplumsal sorun ile tek kişinin derdini nasıl ayırırsın?",
    "Müzakerede dinleme ile dayatma arasındaki farkı söyler misin?",
    "Bir bahçe tartışmasında ortak karara nasıl varılır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Müzakere ne demektir?",
      options: [
        "Tarafların birbirini dinleyip ortak karar araması",
        "Sesi en yüksek olanın kuralı yazması",
        "Sorunu yalnız bir kişinin çözmesi",
        "Tartışmayı hiç açmadan dağılmak",
      ],
      correctAnswerIndex: 0,
      hint: "Dinlemek ve ortak karar bu taraftadır.",
      explanation:
        "Adım 1: Müzakere, tarafların birbirini kesmeden dinlemesidir. Adım 2: Amaç ortak bir karardır. Adım 3: Sesi yüksek olanın dayatması müzakere değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Bahçede top sırası kalabalıklaşınca sınıf meclisi önce ne yapmalıdır?",
      options: [
        "Sorunu adlandırmak ve her grubu sırayla dinlemek",
        "İlk konuşan grubun kuralını hemen yazmak",
        "Karşı grubu bencil diye adlandırmak",
        "Oyunu o gün tamamen kapatmak",
      ],
      correctAnswerIndex: 0,
      hint: "İlk iş, sürenin yetmediğini söylemektir.",
      explanation:
        "Adım 1: Sorun adlandırılır: herkes aynı anda oynayamıyor. Adım 2: Gruplar sırayla dinlenir. Adım 3: Seçenek bundan sonra gelir; dayatma bu sıra değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Okul bahçesinde top sırası yüzünden iki grup tartışıyor. Ece yalnız kendi kuralını dayatıyor ve karşı grubu dinlemiyor. Müzakerede sıradaki doğru iş hangisidir?",
      options: [
        "Sözü kişiye değil süre sorununa çevirip iki seçeneği birlikte yazmak",
        "Ece'nin kuralını sessizce kabul etmek",
        "Karşı grubu bencil diye sınıfa ilan etmek",
        "Tartışmayı bağırarak bitirmek",
      ],
      correctAnswerIndex: 0,
      hint: "Dinlenmeyen taraf varsa ortak karar henüz yoktur.",
      explanation:
        "Adım 1: Tartışma kişiye değil, sürenin yetmemesine bağlanır. Adım 2: İki seçenek masaya konur. Adım 3: Ortak karar, dayatmanın yerine yazılır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
