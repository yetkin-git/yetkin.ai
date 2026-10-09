import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (18/25). */
export const JUNIOR_MAT_QUIZ_18 = {
  lessonKey: "jr_06_mat-18",
  title: "Veri toplama ve değerlendirme",
  tellGuides: [
    "Sıklığın ne anlama geldiğini bir örnekle anlatabilir misin?",
    "En çok seçilen seçeneği tablodan nasıl bulursun?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Sıklık neyi söyler?",
      options: [
      "Bir seçeneğin kaç kez çıktığını",
      "En küçük sayıyı",
      "Ortalamayı",
      "Açıklığı",
      ],
      correctAnswerIndex: 0,
      hint: "Sıklık, tekrar sayısını gösterir.",
      explanation: "Adım 1: Her seçenek sayılır. Adım 2: Kaç kez göründüğü sıklıktır. Adım 3: En büyük sıklık en çok seçilendir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Elma 5, armut 4, üzüm 3 kez seçilmiş. Toplam kaç kişi vardır?",
      options: [
      "12",
      "5",
      "9",
      "3",
      ],
      correctAnswerIndex: 0,
      hint: "Sıklıkları topla.",
      explanation: "Adım 1: 5 artı 4, 9 eder. Adım 2: 9 artı 3, 12 eder. Adım 3: Toplam 12 kişidir. En çok seçilen elmadır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sınıf anketinde en çok oy alan meyve elmadır (5 oy). Armut 4, üzüm 3 oy almıştır. Hangi sonuç doğrudur?",
      options: [
      "En çok tercih edilen elmadır",
      "En çok tercih edilen üzümdür",
      "Toplam 5 kişidir",
      "Armut hiç seçilmemiştir",
      ],
      correctAnswerIndex: 0,
      hint: "En büyük sıklığa bak.",
      explanation: "Adım 1: Sıklıklar 5, 4 ve 3'tür. Adım 2: En büyüğü 5'tir. Adım 3: En çok tercih edilen elmadır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
