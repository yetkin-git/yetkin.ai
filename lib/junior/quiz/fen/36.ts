import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — ampul parlaklığının değişkenleri. */
export const JUNIOR_FEN_QUIZ_36 = {
  lessonKey: "jr_06_fen-36",
  title: "Ampul parlaklığının değişkenleri",
  tellGuides: [
    "Kontrollü deneyde neden tek değişken değiştirilir?",
    "Seri ampul sayısı artınca parlaklık ne olur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Bağımlı değişken bu deneyde nedir?",
      options: ["Ampulün parlaklığı", "Sınıfın kapı numarası", "Gezegen sırası", "Suyun kaynama sesi"],
      correctAnswerIndex: 0,
      hint: "Gözlenen sonuç parlaklıktır.",
      explanation:
        "Adım 1: Bağımsız değişken bizim değiştirdiğimiz etkendir. Adım 2: Sonuç olarak parlaklığa bakarız. Adım 3: Bağımlı değişken parlaklıktır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "1 pil ve seri 2 ampul, 1 pil ve 1 ampule göre nasıl yanar?",
      options: ["Daha sönük", "Daha parlak", "Hiç kurulamaz", "Sese dönüşür"],
      correctAnswerIndex: 0,
      hint: "Seri ampul akımı paylaşır.",
      explanation:
        "Adım 1: Pil sayısı sabittir. Adım 2: Seri ampul sayısı artar. Adım 3: Her ampul daha sönük yanar.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Deney tablosunda önce pil 1'den 2'ye çıkıyor ve ölçek 2'den 3'e geliyor. Sonra hem pil hem ampul aynı anda değişince ölçek karışıyor. Hangi düzenek kontrollü sayılır?",
      options: [
        "Yalnız pil sayısının değiştiği birinci düzenek",
        "Pil ve ampulün birlikte değiştiği düzenek",
        "Hiç ölçülmeyen düzenek",
        "Parlaklığın sabit sayılıp değişkenin silindiği düzenek",
      ],
      correctAnswerIndex: 0,
      hint: "Tek değişken değişmelidir.",
      explanation:
        "Adım 1: Kontrollü deneyde bir etken değişir. Adım 2: Birinci düzenekte yalnız pil değişmiştir. Adım 3: İki etkeni birlikte değiştirmek sonucu karıştırır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
