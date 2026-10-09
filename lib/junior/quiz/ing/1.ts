import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (1/20). */
export const JUNIOR_ING_QUIZ_1 = {
  lessonKey: "jr_06_ing_main-1",
  title: "Daily routines ve saati söylemek",
  tellGuides: [
    "Can you tell your daily routine in 3 sentences using simple present tense?",
    "How do you say half past seven and quarter to ten in English?",
    "Ask and answer: What time is it?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "«It is half past seven.» cümlesi saati nasıl anlatır?",
      options: [
        "Saat yedi buçuk",
        "Saat tam yedi",
        "Saate çeyrek kala",
        "Saat sekizi çeyrek geçe",
      ],
      correctAnswerIndex: 0,
      hint: "Half past, yarım saat geçti demektir.",
      explanation: "Adım 1: Half past, yarım geçe kalıbıdır. Adım 2: Seven, yedi demektir. Adım 3: Bu yüzden cümle saat yedi buçuktur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Diyalog: «What time is it?» — «___.» Hangisi doğru cevaptır?",
      options: [
        "It is eight o'clock",
        "I wake up at school",
        "She brushes teeth",
        "We like breakfast",
      ],
      correctAnswerIndex: 0,
      hint: "Saat sorusuna It is ile cevap verilir.",
      explanation: "Adım 1: What time is it saat sorusudur. Adım 2: Cevap It is ile başlar. Adım 3: It is eight o'clock doğru saati söyler.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ece: «I wake up at seven o'clock. I have breakfast at half past seven. I go to school at eight o'clock.» Hangisi doğrudur?",
      options: [
        "Ece kahvaltıyı yedi buçukta yapar",
        "Ece sekizde uyanır",
        "Ece yedide okula gider",
        "Ece günlük rutin anlatmaz",
      ],
      correctAnswerIndex: 0,
      hint: "Have breakfast satırındaki saate bak.",
      explanation: "Adım 1: Have breakfast at half past seven = yedi buçukta kahvaltı. Adım 2: Uyanma yedide, okul sekizdedir. Adım 3: Doğru çıkarım kahvaltı saatidir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
