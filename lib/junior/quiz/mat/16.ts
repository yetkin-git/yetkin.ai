import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (16/25). */
export const JUNIOR_MAT_QUIZ_16 = {
  lessonKey: "jr_06_mat-16",
  title: "Oran",
  tellGuides: [
    "Oranın sırayı koruduğunu bir örnekle anlatabilir misin?",
    "4'e 6 oranını sadeleştirince neden 2'ye 3 olur, 3'e 2 olmaz?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Oran için doğru olan hangisidir?",
      options: [
      "Sırayı korur",
      "Sayıları her zaman toplar",
      "Paydayı siler",
      "Yalnızca çarpma yapar",
      ],
      correctAnswerIndex: 0,
      hint: "4'e 6 ile 3'e 2 aynı oran değildir.",
      explanation: "Adım 1: Oran iki niceliğin sırasını korur. Adım 2: Sadeleştirme ortak çarpanla yapılır. Adım 3: Yer değiştirmek ters oran verir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "4'e 6 oranı sadeleşince ne olur?",
      options: [
      "2'ye 3",
      "3'e 2",
      "4'e 3",
      "6'ya 4",
      ],
      correctAnswerIndex: 0,
      hint: "İkisini de 2'ye böl.",
      explanation: "Adım 1: 4 ve 6'nın ortak çarpanı 2'dir. Adım 2: 4 bölü 2, 2; 6 bölü 2, 3 eder. Adım 3: Oran 2'ye 3 olur.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Tarifte 4 ölçek un ve 6 ölçek süt var. Aynı tadı koruyarak 2 ölçek un kullanırsan kaç ölçek süt gerekir?",
      options: [
      "3",
      "2",
      "6",
      "8",
      ],
      correctAnswerIndex: 0,
      hint: "Oran 2'ye 3'tür; un 2 ise süt 3'tür.",
      explanation: "Adım 1: 4'e 6, 2'ye 3 olur. Adım 2: Un 2 ölçek olunca süt 3 ölçek olmalıdır. Adım 3: Ters yazmak oranı bozar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
