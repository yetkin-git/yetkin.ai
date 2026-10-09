import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf İngilizce — konu sonu soru arşivi (20/20). */
export const JUNIOR_ING_QUIZ_20 = {
  lessonKey: "jr_06_ing_main-20",
  title: "Hak, sorumluluk ve sınıf kuralı",
  tellGuides: [
    "What is the difference between a right and a responsibility in class?",
    "Give one classroom rule and explain why it helps everyone.",
    "Can you say one right and one responsibility you have at school?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Right (hak) ile responsibility (sorumluluk) farkı nedir?",
      options: [
        "Hak yapabildiğin şeydir; sorumluluk üstlendiğin iştir",
        "İkisi de yalnız oyun adıdır",
        "Hak yalnızca ödevdir",
        "Sorumluluk yalnızca tatildir",
      ],
      correctAnswerIndex: 0,
      hint: "Speak freely bir hak; listen carefully bir sorumluluk olabilir.",
      explanation: "Adım 1: Right yetki/olanaktır. Adım 2: Responsibility görevdir. Adım 3: Sınıfta ikisi birlikte yürür.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Hangisi sınıf kuralı örneğidir?",
      options: [
        "We should listen when others speak",
        "We should shout in every lesson",
        "We shouldn't come to school",
        "We should break the chairs",
      ],
      correctAnswerIndex: 0,
      hint: "Kural herkese saygıyı korur.",
      explanation: "Adım 1: Listen when others speak saygı kuralıdır. Adım 2: Bağırmak veya eşya kırmak kural değildir. Adım 3: Doğru seçenek dinlemektir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Metin: «Students have the right to ask questions. They also have the responsibility to respect others.» Hangisi doğru özet?",
      options: [
        "Soru sormak haktır; başkasına saygı sorumluluktur",
        "Soru sormak yasaktır",
        "Saygı yalnızca öğretmenindir",
        "Metinde kural yoktur",
      ],
      correctAnswerIndex: 0,
      hint: "Right to ask / responsibility to respect.",
      explanation: "Adım 1: Right to ask questions = soru sorma hakkı. Adım 2: Responsibility to respect = saygı sorumluluğu. Adım 3: Özet bu ayrımdır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
