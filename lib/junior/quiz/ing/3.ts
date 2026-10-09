import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (3/20). */
export const JUNIOR_ING_QUIZ_3 = {
  lessonKey: "jr_06_ing_main-3",
  title: "Yiyecek, içecek ve likes, dislikes",
  tellGuides: [
    "Tell three foods you like and one you don't like.",
    "Can you make a short dialogue about breakfast using I like / I don't like?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Beğeniyi İngilizcede nasıl söyleriz?",
      options: [
        "I like …",
        "I am like …",
        "I liking …",
        "I likes …",
      ],
      correctAnswerIndex: 0,
      hint: "Like fiili I ile yalın kalır.",
      explanation: "Adım 1: Beğeni I like ile kurulur. Adım 2: Beğenmeme I don't like'dır. Adım 3: I likes yanlış özne-fiil uyumudur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Diyalog: «Do you like milk?» — «___.» Hangisi doğru olumsuz cevaptır?",
      options: [
        "No, I don't",
        "Yes, I am",
        "No, I isn't",
        "Yes, I does",
      ],
      correctAnswerIndex: 0,
      hint: "Do you… sorusuna do/don't ile cevap verilir.",
      explanation: "Adım 1: Soru Do you like… şeklindedir. Adım 2: Olumsuz kısa cevap No, I don't'tur. Adım 3: Am/is/does bu soruya uymaz.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Menü: eggs, cheese, tea, soda. Ali: «I like eggs and tea. I don't like soda.» Hangisi doğrudur?",
      options: [
        "Ali gazoz sevmez",
        "Ali yumurta sevmez",
        "Ali çay sevmez",
        "Ali hiçbir şey sevmez",
      ],
      correctAnswerIndex: 0,
      hint: "Don't like satırına bak.",
      explanation: "Adım 1: Like eggs and tea = yumurta ve çay sever. Adım 2: Don't like soda = gazoz sevmez. Adım 3: Doğru çıkarım gazozdur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
