import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Türkçe — konu sonu soru arşivi (1/20). */
export const JUNIOR_TURKCE_QUIZ_1 = {
  lessonKey: "jr_06_turkce-1",
  title: "Gerçek, mecaz ve terim anlam",
  tellGuides: [
    "Gerçek, mecaz ve terim anlamı kendi sözlerinle ayırır mısın?",
    "Aynı sözcüğün anlamını cümlenin nasıl seçtiğini bir örnekle anlatır mısın?",
    "Kök sözcüğünü üç farklı cümlede hangi anlamda kullanırsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Gerçek anlam nedir?",
      options: [
      "Sözcüğün somut ilk anlamı",
      "Benzetmeyle kurulan soyut anlam",
      "Bir bilimin özel adı",
      "Sözcüğün yazım kuralı",
      ],
      correctAnswerIndex: 0,
      hint: "İlk akla gelen, somut temel anlamı düşün.",
      explanation: "Adım 1: Gerçek anlam, sözcüğün akla ilk gelen somut anlamıdır. Adım 2: Mecaz benzetmeyle kurulur; terim bilim alanına özgüdür. Adım 3: Bu yüzden doğru seçenek somut ilk anlamdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Sorunun kökü acele etmekmiş.» cümlesinde kök sözcüğü hangi anlamdadır?",
      options: [
      "Mecaz anlam",
      "Gerçek anlam",
      "Terim anlam",
      "Yazım anlamı",
      ],
      correctAnswerIndex: 0,
      hint: "Burada kök, bitkinin parçası değildir; sebep anlatır.",
      explanation: "Adım 1: Cümlede kök toprağa bağlı bir parça değildir. Adım 2: Temel sebep anlamında kullanılmıştır. Adım 3: Benzetmeyle kurulduğu için mecaz anlamdır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Ece üç cümle okudu: «Ağacın kökü toprakta.», «Sorunun kökü acele.», «Dokuzun karekökü üç.» Hangisi doğru eşleştirmedir?",
      options: [
      "Gerçek — mecaz — terim",
      "Mecaz — gerçek — terim",
      "Terim — mecaz — gerçek",
      "Gerçek — terim — mecaz",
      ],
      correctAnswerIndex: 0,
      hint: "Topraktaki kök somuttur; sebep kökü benzetmedir; karekök matematik terimidir.",
      explanation: "Adım 1: Topraktaki kök somut ve gerçek anlamdır. Adım 2: Sorunun kökü sebep anlatır; mecazdır. Adım 3: Karekök matematikte özel bir terimdir. Sıra: gerçek — mecaz — terim.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
