import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (19/20). */
export const JUNIOR_SOSYAL_QUIZ_19 = {
  lessonKey: "jr_06_sosyal-19",
  title: "Komşularımız ve uluslararası ilişkiler",
  tellGuides: [
    "Kara komşusu ne demektir, bir örnekle anlatır mısın?",
    "Uluslararası ilişkilerin barış ve iş birliği için olduğunu nasıl açıklarsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Kara komşusu ne demektir?",
      options: [
      "Sınırı karadan değen devlet",
      "Yalnızca denizde sınırlı ülke",
      "Hiç sınırı olmayan ülke",
      "Bir şehrin mahallesi",
      ],
      correctAnswerIndex: 0,
      hint: "Kara sınırı ortak olan ülke.",
      explanation: "Adım 1: Kara komşusu karadan sınırdaş demektir. Adım 2: Türkiye'nin birden fazla kara komşusu vardır. Adım 3: Mahalle veya sınırsız ülke değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Haritada Türkiye'nin güneyindeki kara komşularından biri hangisidir?",
      options: [
      "Suriye",
      "Norveç",
      "Japonya",
      "Brezilya",
      ],
      correctAnswerIndex: 0,
      hint: "Güney sınırına bak.",
      explanation: "Adım 1: Suriye Türkiye'nin güneyinde kara komşusudur. Adım 2: Norveç, Japonya, Brezilya bu konumda değildir. Adım 3: Harita okuryazarlığı komşuyu gösterir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "İki ülke arasında kültür ve eğitim iş birliği yapılması neyi güçlendirir?",
      options: [
      "Barışçıl uluslararası ilişkileri",
      "Önyargıyı zorunlu kılar",
      "Anayasayı kaldırır",
      "İklimi yok eder",
      ],
      correctAnswerIndex: 0,
      hint: "İş birliği = ilişkiyi güçlendirir.",
      explanation: "Adım 1: Uluslararası ilişki yalnız savaş değildir. Adım 2: Eğitim ve kültür bağları barışı destekler. Adım 3: Bu, vatandaşlık bilincinin dünya ölçeğidir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
