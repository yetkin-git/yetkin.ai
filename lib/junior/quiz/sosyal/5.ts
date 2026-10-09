import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (5/20). */
export const JUNIOR_SOSYAL_QUIZ_5 = {
  lessonKey: "jr_06_sosyal-5",
  title: "İlk Türk devletleri ve Orta Asya Türk kültürü",
  tellGuides: [
    "Asya Hun, Göktürk ve Uygur'u kısa kısa tanıtabilir misin?",
    "Töre ve kurultayın ne işe yaradığını anlatır mısın?",
    "Uygurların yerleşik hayata geçmesini neden önemli sayarsın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "İlk Türk devletlerinde «töre» neyi anlatır?",
      options: [
      "Topluluğun ortak düzen ve gelenek kurallarını",
      "Yalnızca bir şehir surunu",
      "Modern vergi sistemini",
      "Deniz ticareti antlaşmasını",
      ],
      correctAnswerIndex: 0,
      hint: "Ortak yaşamı düzenleyen kurallar tarafındadır.",
      explanation: "Adım 1: Töre, boyların ortak düzenidir. Adım 2: Kağan ve kurultay bu düzen içinde yer alır. Adım 3: Modern vergi veya deniz antlaşması değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Tarih seridinde Uygurları Göktürklerden ayıran önemli özellik hangisidir?",
      options: [
      "Uygurların yerleşik hayata geçmesi",
      "Uygurların hiç devlet kurmaması",
      "Uygurların yalnız denizci olması",
      "Uygurların töreyi tamamen reddetmesi",
      ],
      correctAnswerIndex: 0,
      hint: "Konar göçer / yerleşik ayrımını düşün.",
      explanation: "Adım 1: Hun ve Göktürk daha çok konar göçerdir. Adım 2: Uygurlar yerleşik hayata geçer. Adım 3: Bu, kültür ve devlet düzeninde önemli bir farktır.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir metinde «kağan kurultayı topladı» yazıyor. Öğrenci bundan ne çıkarabilir?",
      options: [
      "Önemli kararların ortak görüşmeyle de alındığını",
      "Devletin hiç kuralı olmadığını",
      "Yalnızca vergi alındığını",
      "Deniz aşırı koloni kurulduğunu",
      ],
      correctAnswerIndex: 0,
      hint: "Kurultay, ortak danışma yeridir.",
      explanation: "Adım 1: Kurultay, boy beylerinin toplandığı meclistir. Adım 2: Kağan önemli işlerde danışır. Adım 3: Bu, keyfi ve kuralsız yönetim olmadığını gösterir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
