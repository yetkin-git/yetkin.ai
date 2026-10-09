import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Fen Bilimleri — konu sonu soru arşivi (9/20). */
export const JUNIOR_FEN_QUIZ_9 = {
  lessonKey: "jr_06_fen-9",
  title: "Bileşke kuvvet",
  tellGuides: [
    "Kuvvetin doğrultusu, yönü ve büyüklüğünü örnekle anlatabilir misin?",
    "Bileşke sıfır olduğunda ne olur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Kuvvetin üç özelliği hangileridir?",
      options: [
      "Doğrultu, yön ve büyüklük",
      "Renk, koku ve tat",
      "Yoğunluk, hacim ve ses",
      "Rh, A ve B",
      ],
      correctAnswerIndex: 0,
      hint: "Ok çiziminde üç bilgi vardır.",
      explanation: "Adım 1: Kuvvet bir vektörel büyüklüktür. Adım 2: Doğrultusu çizgi, yönü ok ucu, büyüklüğü ok uzunluğudur. Adım 3: Bu üçü olmadan kuvvet tam anlatılmaz.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Aynı doğrultuda 5 N sağa ve 3 N sola etki ediyor. Bileşke kaç N'dir?",
      options: [
      "2 N sola",
      "8 N sağa",
      "2 N sağa",
      "15 N sağa",
      ],
      correctAnswerIndex: 2,
      hint: "Zıt yönlerde fark alınır; büyük olanın yönü kalır.",
      explanation: "Adım 1: Zıt yönlü kuvvetlerde fark alınır. Adım 2: 5 − 3 = 2 N. Adım 3: Büyük kuvvet sağa olduğu için bileşke 2 N sağadır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Masadaki kitap kıpırdamıyor. Kitaba etki eden kuvvetler için doğru yargı hangisidir?",
      options: [
      "Bileşke sıfırdır; kuvvetler dengelenmiştir",
      "Bileşke sonsuzdur",
      "Kuvvet yoktur",
      "Yalnızca ses kuvveti vardır",
      ],
      correctAnswerIndex: 0,
      hint: "Hareketsizlik = denge.",
      explanation: "Adım 1: Kitaba ağırlık ve masa tepkisi gibi kuvvetler etki eder. Adım 2: Kitap yerinden oynamıyorsa net kuvvet sıfırdır. Adım 3: Bileşke sıfırsa kuvvetler dengelenmiştir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
