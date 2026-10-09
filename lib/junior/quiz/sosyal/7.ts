import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (7/20). */
export const JUNIOR_SOSYAL_QUIZ_7 = {
  lessonKey: "jr_06_sosyal-7",
  title: "Türklerin İslamiyet'i kabulü ve ilk Türk-İslam devletleri",
  tellGuides: [
    "Türklerin İslamiyet'i kabulünde Talas ve Karahanlıları nasıl anlatırsın?",
    "Malazgirt'in Anadolu için neden kapı olduğunu söyler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İlk Müslüman Türk devleti olarak öne çıkan devlet hangisidir?",
      options: [
      "Karahanlılar",
      "Roma İmparatorluğu",
      "Asya Hun Devleti",
      "Osmanlı'dan önceki Bizans",
      ],
      correctAnswerIndex: 0,
      hint: "Türk-İslam devletleri hattının başı.",
      explanation: "Adım 1: Karahanlılar İslamiyet'i kabul eden ilk Türk devletlerindendir. Adım 2: Bu, Türk-İslam tarihi için dönüm noktasıdır. Adım 3: Roma veya Hun bu tanımın karşılığı değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "1071 Malazgirt Zaferi tarih seridinde neyi açar?",
      options: [
      "Anadolu'nun Türkleşmesi sürecinin kapısını",
      "İpek Yolu'nun tamamen kapanmasını",
      "Cumhuriyet'in ilanını",
      "Hicret'in başlangıcını",
      ],
      correctAnswerIndex: 0,
      hint: "Anadolu kapısı ifadesini düşün.",
      explanation: "Adım 1: Malazgirt 1071'dir. Adım 2: Büyük Selçuklu zaferi Anadolu'ya girişi kolaylaştırır. Adım 3: Cumhuriyet veya Hicret bu olay değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Türkler İslamiyet'i bir günde ve zorla kabul etti» iddiasına karşı hangisi daha doğru yaklaşımdır?",
      options: [
      "Kabul uzun bir süreçtir; Talas sonrası ilişkiler ve Karahanlılar bu yolda önemli adımlardır",
      "Hiç kabul olmamıştı",
      "Yalnızca 1923'te kabul edildi",
      "Malazgirt İslamiyet'in doğuşudur",
      ],
      correctAnswerIndex: 0,
      hint: "Süreç ve devlet adlarını düşün.",
      explanation: "Adım 1: Tarihsel kabul bir süreçtir. Adım 2: Talas sonrası ilişkiler ve Karahanlılar öne çıkar. Adım 3: Tek güne veya yanlış yıla bağlamak yanlıştır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
