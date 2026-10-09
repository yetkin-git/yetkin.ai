import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (6/20). */
export const JUNIOR_SOSYAL_QUIZ_6 = {
  lessonKey: "jr_06_sosyal-6",
  title: "İslamiyet'in doğuşu ve yayılışı",
  tellGuides: [
    "İslamiyet'in doğuşunu yer ve yıl ile anlatır mısın?",
    "Hicret'in neden takvim başlangıcı sayıldığını söyler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İslamiyet hangi şehirde doğmuştur?",
      options: [
      "Mekke",
      "İstanbul",
      "Roma",
      "Pekin",
      ],
      correctAnswerIndex: 0,
      hint: "Hicaz bölgesindeki kutsal şehir.",
      explanation: "Adım 1: İslamiyet 610 yılında Mekke'de doğar. Adım 2: Hz. Muhammed'e ilk vahiy burada gelir. Adım 3: İstanbul, Roma veya Pekin doğuş yeri değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "622 yılındaki Hicret tarih seridinde neden önemlidir?",
      options: [
      "Medine'ye göçtür ve hicri takvimin başlangıcıdır",
      "İpek Yolu'nun kapanışıdır",
      "İlk Türk devletinin kuruluşudur",
      "Türkiye Cumhuriyeti'nin ilanıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Yer değişimi + takvim bağı.",
      explanation: "Adım 1: Hicret, Mekke'den Medine'ye göçtür. Adım 2: Yıl 622'dir. Adım 3: Hicri takvim bu olayla başlar.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir öğrenci «İslamiyet yalnız bir şehirde kaldı» diyor. Hangisi doğru düzeltmedir?",
      options: [
      "Doğuş Mekke'dedir; zamanla farklı bölgelere yayılmıştır",
      "Hiç yayılmamış, yalnızca bir köyde kalmıştır",
      "Yalnızca Avrupa'da doğmuştur",
      "Hicret hiç yaşanmamıştır",
      ],
      correctAnswerIndex: 0,
      hint: "Doğuş yeri ile yayılış alanını ayır.",
      explanation: "Adım 1: Doğuş Mekke'dedir. Adım 2: Hicret ve sonrasında yayılış hızlanır. Adım 3: Bu yüzden «yalnız bir şehirde kaldı» yanlıştır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
