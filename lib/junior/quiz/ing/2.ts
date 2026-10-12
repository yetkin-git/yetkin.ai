import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — Family Life, aile ve have got. */
export const JUNIOR_ING_QUIZ_2 = {
  lessonKey: "jr_06_ing_main-2",
  title: "Family Life: ailem ve have got",
  tellGuides: [
    "Ailenden iki kişiyi have got veya has got ile tanıt.",
    "Have you got a sister sorusuna kısa cevap ver.",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "He ve she ile hangi kalıp kullanılır?",
      options: ["has got", "have got", "are got", "is got"],
      correctAnswerIndex: 0,
      hint: "Tekil üçüncü kişi has got alır.",
      explanation:
        "Adım 1: He ve she üçüncü tekil öznedir. Adım 2: Bu öznelerden sonra has got gelir. Adım 3: She has got a brother doğru kalıptır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Diyalog: «Have you got a brother?» — «___.»",
      options: ["Yes, I have", "Yes, I has", "Yes, she have", "Yes, they has"],
      correctAnswerIndex: 0,
      hint: "I ile have gelir.",
      explanation:
        "Adım 1: Soru Have you got diye kurulur. Adım 2: Kısa cevap Yes, I have şeklindedir. Adım 3: I has bu cevapta durmaz.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Ece'nin aile tablosunda şu satırlar var: Ece «I have got a sister» diyor, annesi için «She have got two children» yazıyor. Hangi satır düzeltilmelidir ve doğru cümle nedir?",
      options: [
        "Anne satırı: She has got two children",
        "Ece satırı: I has got a sister",
        "İki satır da have got ile kalır",
        "Anne satırı: They has got two children",
      ],
      correctAnswerIndex: 0,
      hint: "She ile has got gelir.",
      explanation:
        "Adım 1: I have got a sister özneye uygundur. Adım 2: She have got yanlıştır. Adım 3: Doğru cümle She has got two children olur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
