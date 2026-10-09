import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (15/20). */
export const JUNIOR_SOSYAL_QUIZ_15 = {
  lessonKey: "jr_06_sosyal-15",
  title: "Nitelikli insan gücü ve meslek seçimi",
  tellGuides: [
    "Nitelikli insan gücünün ne demek olduğunu anlatır mısın?",
    "Meslek seçerken ilgi, beceri ve toplum ihtiyacını nasıl dengelersin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Nitelikli insan gücü neyi anlatır?",
      options: [
      "Bilgi, beceri ve özenle iş yapabilen insanı",
      "Yalnızca fiziksel gücü",
      "Haritadaki nüfus noktasını",
      "Vergi oranını",
      ],
      correctAnswerIndex: 0,
      hint: "Öğrenmek ve özen göstermek tarafındadır.",
      explanation: "Adım 1: Nitelik, öğrenme ve beceridir. Adım 2: Özenli çalışma niteliği yükseltir. Adım 3: Yalnız kas gücü veya vergi değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Bir bölgede turizm büyüyorsa hangi nitelikler daha değerli hale gelir?",
      options: [
      "Yabancı dil, iletişim ve hizmet becerileri",
      "Yalnızca kutup araştırması",
      "Hiçbir beceri",
      "Enlem ezberi",
      ],
      correctAnswerIndex: 0,
      hint: "Sektör, ihtiyaç duyulan beceriyi seçer.",
      explanation: "Adım 1: Turizm insanla çalışmayı gerektirir. Adım 2: Dil ve iletişim öne çıkar. Adım 3: Bu, meslek-ihtiyaç bağını gösterir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Meslek seçerken yalnız «çok para» diye karar veren biri hangi noktayı eksik bırakır?",
      options: [
      "İlgi, beceri ve toplum ihtiyacını birlikte düşünmeyi",
      "Mutlak konum hesabını",
      "İpek Yolu kronolojisini",
      "Hicret yılını",
      ],
      correctAnswerIndex: 0,
      hint: "Nitelik + uyum + ihtiyaç.",
      explanation: "Adım 1: Meslek toplumun bir işidir. Adım 2: İlgi ve beceri sürdürülebilir başarı getirir. Adım 3: Yalnız gelir odaklı seçim eksik kalır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
