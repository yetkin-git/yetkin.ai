import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (4/20). */
export const JUNIOR_SOSYAL_QUIZ_4 = {
  lessonKey: "jr_06_sosyal-4",
  title: "Hak, sorumluluk ve özgürlük",
  tellGuides: [
    "Hak, sorumluluk ve özgürlüğü kendi sözlerinle ayırır mısın?",
    "Özgürlüğün başkasının hakkı ile sınırlandığını bir örnekle anlatır mısın?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Hak ile sorumluluk arasındaki temel fark nedir?",
      options: [
      "Hak yetki ve güvencedir; sorumluluk yerine getirilen görevdir",
      "İkisi de yalnız vergi ödemektir",
      "Hak görev, sorumluluk ise özgürlüktür",
      "Sorumluluk yalnızca mahkemeye aittir",
      ],
      correctAnswerIndex: 0,
      hint: "Biri güvence, diğeri görev tarafındadır.",
      explanation: "Adım 1: Hak, kişinin güvence altına alınmış yetkisidir. Adım 2: Sorumluluk, yerine getirilmesi beklenen görevdir. Adım 3: İkisi birlikte vatandaşlığı dengeler.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Eğitim hakkı olan bir öğrencinin ders çalışması neyi gösterir?",
      options: [
      "Hak ile sorumluluğun birlikte işlemesini",
      "Yalnızca vergi ödemeyi",
      "Önyargıyı",
      "Mutlak konumu",
      ],
      correctAnswerIndex: 0,
      hint: "Okula gitmek hak; öğrenmeye özen göstermek sorumluluktur.",
      explanation: "Adım 1: Eğitim bir haktır. Adım 2: Dersi takip etmek sorumluluktur. Adım 3: Böylece hak ile sorumluluk aynı süreçte yürür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Müzik dinlerken komşuyu rahatsız edecek kadar ses açmak hangisini bozar?",
      options: [
      "Özgürlüğün başkasının hakkı ile sınırlı olduğu ilkesini",
      "Mutlak konum bilgisini",
      "İpek Yolu ticaretini",
      "Enlem çizgilerini",
      ],
      correctAnswerIndex: 0,
      hint: "Özgürlük, başkasının rahatını yok saymak değildir.",
      explanation: "Adım 1: Özgürlük sınırsız değildir. Adım 2: Başkasının dinlenme hakkı vardır. Adım 3: Aşırı ses, özgürlüğü kötü kullanmaktır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
