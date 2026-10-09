import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (13/20). */
export const JUNIOR_TURKCE_QUIZ_13 = {
  lessonKey: "jr_06_turkce-13",
  title: "Deyimler ve atasözleri",
  tellGuides: [
    "Deyim ile atasözünü kendi sözlerinle ayırır mısın?",
    "«Burnu havada» deyiminin gerçek anlamından uzaklığını anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Deyim nasıl tanımlanır?",
      options: [
      "Kalıptır ve çoğu zaman gerçek anlamından uzaktır",
      "Her zaman tam cümle öğüt verir",
      "Yalnızca noktalama kuralıdır",
      "Yalnızca yapım ekidir",
      ],
      correctAnswerIndex: 0,
      hint: "Burnu havada = kibirli örneğini düşün.",
      explanation: "Adım 1: Deyim kalıptır. Adım 2: Gerçek anlamından uzaklaşır. Adım 3: Atasözü öğüt veren genel yargıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Burnu havada» deyimi ne anlatır?",
      options: [
      "Kibirli / burnu büyük olmak",
      "Uçak yolculuğu",
      "Soğuk hava",
      "Burun ameliyatı",
      ],
      correctAnswerIndex: 0,
      hint: "Gerçekten burnu gökyüzünde midir?",
      explanation: "Adım 1: Deyim gerçek anlamından uzaktır. Adım 2: Burnu havada kibirli demektir. Adım 3: Uçak veya hava ile ilgili değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Damlaya damlaya göl olur.» ifadesi hangisine örnektir?",
      options: [
      "Atasözü; öğüt veren genel yargı",
      "Yalnızca deyim",
      "Nesnel ölçü cümlesi",
      "İsim çekim eki",
      ],
      correctAnswerIndex: 0,
      hint: "Tam cümle ve genel öğüt mü?",
      explanation: "Adım 1: Atasözü çoğu zaman tam cümledir. Adım 2: Genel bir öğüt / yargı taşır. Adım 3: Bu örnek atasözüdür.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
