import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (3/20). */
export const JUNIOR_TURKCE_QUIZ_3 = {
  lessonKey: "jr_06_turkce-3",
  title: "Sözcükte çok anlamlılık ve söz varlığı",
  tellGuides: [
    "Çok anlamlılık ile sesteşliği kendi sözlerinle ayırır mısın?",
    "Söz varlığının okudukça nasıl büyüdüğünü bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Çok anlamlı sözcükte anlamlar nasıl ilişkilidir?",
      options: [
      "Anlamlar birbiriyle ilişkilidir",
      "Anlamlar tamamen ilişkisizdir",
      "Yalnızca yazım farklıdır",
      "Yalnızca noktalama değişir",
      ],
      correctAnswerIndex: 0,
      hint: "Yüz organı ile yüzey gibi bağlantılı anlamları düşün.",
      explanation: "Adım 1: Çok anlamlılıkta anlamlar ilişkilidir. Adım 2: Sesteşte yazılış aynı, anlamlar ilişkisizdir. Adım 3: Doğru seçenek ilişkililiktir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Yüz» sayısı ile «çay» akarsuyu örnekleri hangi durumu gösterir?",
      options: [
      "Sesteşlik (anlamlar ilişkisiz)",
      "Çok anlamlılık",
      "Zıt anlam",
      "Yapım eki",
      ],
      correctAnswerIndex: 0,
      hint: "Sayı olan yüz ile organ olan yüz farklıdır; akarsu çay ile içecek çay da farklıdır.",
      explanation: "Adım 1: Sesteşte yazılış aynı kalır. Adım 2: Anlamlar birbirinden bağımsızdır. Adım 3: Bu örnekler sesteşliği gösterir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Mert «yüz» sözcüğünü hem organ hem yüzey anlamında kullanıyor. Hangisi doğrudur?",
      options: [
      "Çok anlamlılıktır; anlamlar ilişkilidir",
      "Sesteştir; anlamlar ilişkisizdir",
      "Zıt anlamlıdır",
      "Terim anlam değildir hiçbiri",
      ],
      correctAnswerIndex: 0,
      hint: "Organ yüzü ile yüzey anlamı birbiriyle bağlantılıdır.",
      explanation: "Adım 1: Organ ve yüzey anlamları ilişkilidir. Adım 2: Bu çok anlamlılıktır. Adım 3: Sesteşte anlamlar bağlanmaz; burada bağ vardır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
