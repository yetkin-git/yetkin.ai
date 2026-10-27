import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/**
 * 6. Sınıf Matematik — konu sonu (Görev Paketi #02 ile genişletildi).
 * Anlatılan yedi kuralın (2, 3, 4, 5, 6, 9, 10) her biri en az bir soruyla ölçülür;
 * q1 çarpan/kat kavramını, q8 yedi kuralı birlikte kullanan sentezi sorar.
 * Kaynakta doğru şık konumu bilinçli olarak dağıtılır (hep A değil);
 * yayın katmanı ayrıca deterministik karıştırır (`juniorServedQuestions`).
 */
export const JUNIOR_MAT_QUIZ_5 = {
  lessonKey: "jr_06_mat-1",
  title: "Çarpanlar, Katlar ve Bölünebilme",
  tellGuides: [
    "Çarpan ile kat arasındaki farkı bir örnekle anlatabilir misin?",
    "4 kuralında neden son iki basamak yeter?",
    "Bir sayı 6'ya bölünüyorsa hem 2 hem 3 neden birlikte aranır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Bir sayının çarpanı için hangisi doğrudur?",
      options: [
        "Her zaman sayıdan küçüktür",
        "Sayıya eşit ya da küçük, onu kalansız bölen sayıdır",
        "Yalnızca 1'dir",
        "Sayıdan büyük her sayıdır",
      ],
      correctAnswerIndex: 1,
      hint: "Sayının kendisi de çarpandır. Kat, sayıya eşit ya da büyüktür.",
      explanation:
        "Çarpan, sayıya eşit ya da küçük olan kalansız bölendir. 6'nın çarpanları 1, 2, 3 ve 6'dır; 6 hem çarpandır hem kattır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "348 sayısı 2'ye kalansız bölünür. Bunu nasıl anlarız?",
      options: [
        "Rakamları toplamı 15 olduğu için",
        "Son iki basamağı 48 olduğu için",
        "Son rakamı 8, yani çift olduğu için",
        "Son rakamı 0 olduğu için",
      ],
      correctAnswerIndex: 2,
      hint: "2 kuralı son basamak dedektifidir: birler basamağına bak.",
      explanation:
        "2'ye bölünmede karar son rakamdır. 348'in son rakamı 8 çifttir, bu yüzden 348 2'ye kalansız bölünür.",
    },
    {
      id: "q3",
      level: "concept",
      question: "123 sayısı 3'e kalansız bölünür. Doğru gerekçe hangisidir?",
      options: [
        "Rakamları toplamı 6'dır ve 6, 3'ün katıdır",
        "Son rakamı 3 olduğu için her sayı 3'e bölünür",
        "Son iki basamağı 23 olduğu için",
        "Sayı tek olduğu için",
      ],
      correctAnswerIndex: 0,
      hint: "3 kuralı rakam toplamı dedektifidir: rakamları topla, 3'ün katı mı bak.",
      explanation:
        "1 + 2 + 3 = 6 eder ve 6, 3'ün katıdır. Bu yüzden 123, 3'e kalansız bölünür.",
    },
    {
      id: "q4",
      level: "apply",
      question: "116 sayısı 4'e kalansız bölünür. Uzun bölme yapmadan bunu nasıl anlarız?",
      options: [
        "Son rakam 6 çift olduğu için yalnız 2 kuralı yeter",
        "Rakamları toplamı 8 olduğu için",
        "Son rakam 0 veya 5 olduğu için",
        "Son iki basamak 16'dır; 16, 4'e bölünür ve 100 zaten 4'e tam bölünür",
      ],
      correctAnswerIndex: 3,
      hint: "100, 4'e tam bölünür. Bu yüzden karar son iki basamaktadır.",
      explanation:
        "100 bölü 4, 25 eder; yüz ve katları 4'e kalansız bölünür. 116'nın son iki basamağı 16'dır ve 16 da 4'e bölünür, öyleyse 116 da bölünür.",
    },
    {
      id: "q5",
      level: "apply",
      question: "245 sayısı 5'e kalansız bölünür. Neden?",
      options: [
        "Rakamları toplamı 11 olduğu için",
        "Son rakamı 5 olduğu için",
        "Son iki basamağı 45 olduğu için",
        "Sayı tek olduğu için",
      ],
      correctAnswerIndex: 1,
      hint: "5 kuralı da son basamağa bakar: 0 ya da 5 mi?",
      explanation:
        "Son rakamı 0 veya 5 olan sayılar 5'e kalansız bölünür. 245'in son rakamı 5'tir, bu yüzden bölünür.",
    },
    {
      id: "q6",
      level: "skill",
      question: "24 sayısı 6'ya kalansız bölünür. Hangi gerekçe doğrudur?",
      options: [
        "Yalnızca son rakamı çift olduğu için",
        "Rakamları toplamı 9 olduğu için",
        "Hem 2'ye hem 3'e aynı anda bölündüğü için",
        "Son iki basamağı 4'e bölündüğü için bu otomatik olarak 6 kuralıdır",
      ],
      correctAnswerIndex: 2,
      hint: "6 kuralı çifte koşuldur. 2'ye bölünmek tek başına yetmez; 3'e de bölünmelidir.",
      explanation:
        "24'ün son rakamı 4'tür, yani 2'ye bölünür. 2 + 4 = 6 eder, yani 3'e de bölünür. İki koşul birden tuttuğu için 24, 6'ya bölünür. 15 ise 3'e bölünür ama 2'ye bölünmez; 6'ya bölünmez.",
    },
    {
      id: "q7",
      level: "apply",
      question: "729 sayısı 9'a kalansız bölünür. Bunu hangi hesap gösterir?",
      options: [
        "7 + 2 + 9 = 18 ve 18, 9'un katıdır",
        "Son rakamı 9 olduğu için her sayı 9'a bölünür",
        "Son iki basamağı 29 olduğu için",
        "Sayı tek olduğu için",
      ],
      correctAnswerIndex: 0,
      hint: "9 kuralı da rakam toplamına bakar ama kat 9 olmalıdır.",
      explanation:
        "9'a bölünmede rakamlar toplamı 9'un katı olmalıdır. 7 + 2 + 9 = 18 eder ve 18, 9'un katıdır; 729 bu yüzden 9'a bölünür.",
    },
    {
      id: "q8",
      level: "skill",
      question: "30 sayısı; 2, 3, 5, 6 ve 10 kurallarının hangilerini birlikte sağlar?",
      options: [
        "Yalnızca 5 ve 10'u",
        "Yalnızca 2 ve 3'ü",
        "2, 3 ve 5'i; 6 ve 10'u sağlamaz",
        "Hepsini: sonu 0 olduğu için 2, 5 ve 10'a; toplamı 3 olduğu için 3'e ve hem 2 hem 3 tuttuğu için 6'ya bölünür",
      ],
      correctAnswerIndex: 3,
      hint: "Önce son rakama (0), sonra rakam toplamına (3) bak; 6 için ikisini birleştir.",
      explanation:
        "30'un son rakamı 0'dır: 2, 5 ve 10'a bölünür. Rakam toplamı 3'tür: 3'e bölünür. Hem 2 hem 3 tuttuğu için 6'ya da bölünür. Yani beş kuralı birden sağlar.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
