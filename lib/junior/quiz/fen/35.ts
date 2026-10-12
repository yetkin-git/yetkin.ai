import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — tümdengelim ve buzun yoğunluğu. */
export const JUNIOR_FEN_QUIZ_35 = {
  lessonKey: "jr_06_fen-35",
  title: "Tümdengelim ve buzun yoğunluğu",
  tellGuides: [
    "Tümdengelimi bir cümlede tanımla.",
    "Buz neden suda yüzer?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Tümdengelim hangi yönde ilerler?",
      options: [
        "Genel kuraldan özel sonuca",
        "Yalnız rastgele tahminden",
        "Sesten ısıya",
        "Aynadan gezegene",
      ],
      correctAnswerIndex: 0,
      hint: "Kural önce, olay sonra.",
      explanation:
        "Adım 1: Genel önerme yazılır. Adım 2: Tek olay bu önermeye bağlanır. Adım 3: Bu inişe tümdengelim denir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Buzun yoğunluğu 0,92 ve suyun yoğunluğu 1 ise buz ne yapar?",
      options: ["Yüzer", "Dibe batar", "Kaynar", "Genleşip yok olur"],
      correctAnswerIndex: 0,
      hint: "Küçük yoğunluk yüzer.",
      explanation:
        "Adım 1: 0,92 değeri 1'den küçüktür. Adım 2: Küçük yoğunluklu cisim yüzer. Adım 3: Buz yüzeyde kalır.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Deney notunda hipotez «Buz yüzer» diyor. 200 mililitrelik bardakta buz yüzeyde kalıyor. Bu gözlem hipotezi neden destekler?",
      options: [
        "Sonuç, yoğunluğu küçük olanın yüzeceği kuralıyla aynıdır",
        "Buz battığı için hipotez bozulur",
        "200 mililitre kaynama noktasıdır",
        "Yüzeyde kalmak yer değiştirmeyi sıfırlamaz diye hipotez düşer",
      ],
      correctAnswerIndex: 0,
      hint: "Gözlem hipotezle aynı yöndedir.",
      explanation:
        "Adım 1: Hipotez yüzmeyi söyler. Adım 2: Gözlem yüzmeyi gösterir. Adım 3: Kural ve sonuç örtüşür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
