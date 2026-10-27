import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Matematik — konu sonu soru arşivi (31). */
export const JUNIOR_MAT_QUIZ_31 = {
  lessonKey: "jr_06_mat-15",
  title: "İki kesenin oluşturduğu dörtgenler",
  tellGuides: [
    "Yamuk ile paralelkenarı kenar çiftleriyle nasıl ayırırsın?",
    "İki kesen neden üçgen değil dörtgen üretir?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İki paralel doğru ile iki kesenin arasında hangi çokgen durur?",
      options: [
        "Dörtgen",
        "Üçgen",
        "Çember",
        "Açık ışın",
      ],
      correctAnswerIndex: 0,
      hint: "Dört kesişim noktası dört köşe verir.",
      explanation: "Adım 1: İki doğru ve iki kesen dört nokta üretir. Adım 2: Dört köşe bir dörtgendir. Adım 3: Üç köşe olsaydı üçgen olurdu.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Yalnızca bir kenar çifti paralel olan dörtgenin adı nedir?",
      options: [
        "Kare",
        "Yamuk",
        "Eşkenar üçgen",
        "Çember",
      ],
      correctAnswerIndex: 1,
      hint: "Bir paralel çift yamuk için yeter.",
      explanation: "Adım 1: Yamukta en az bir kenar çifti paraleldir. Adım 2: İkinci çift paralel değilse model yamuktur. Adım 3: Karede iki çift birden paraleldir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "İki kesen de birbirine paralel olursa dörtgen neden paralelkenar olur?",
      options: [
        "Çünkü karşılıklı iki kenar çifti de paralel olur",
        "Çünkü bir açı 90 derece olur",
        "Çünkü kenarlar silinir",
        "Çünkü şekil üçgene döner",
      ],
      correctAnswerIndex: 0,
      hint: "İki çift paralellik, paralelkenarın modelidir.",
      explanation: "Adım 1: İlk çift zaten paraleldir. Adım 2: Kesenler de paralel olunca ikinci çift oluşur. Adım 3: İki paralel çift paralelkenardır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
