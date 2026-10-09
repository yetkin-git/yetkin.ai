import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (14/20). */
export const JUNIOR_SOSYAL_QUIZ_14 = {
  lessonKey: "jr_06_sosyal-14",
  title: "Vergilerimiz ve vatandaşlık sorumluluğu",
  tellGuides: [
    "Verginin ortak gider için neden alındığını anlatır mısın?",
    "Vergi ödemenin vatandaşlık sorumluluğu olduğunu bir örnekle söyler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Vergi temelde ne için alınır?",
      options: [
      "Okul, yol, sağlık gibi ortak kamu giderlerini karşılamak için",
      "Yalnızca bir kişinin tatilini finanse etmek için",
      "Harita çizmek için",
      "Önyargıyı artırmak için",
      ],
      correctAnswerIndex: 0,
      hint: "Ortak hizmetlerin bedeli.",
      explanation: "Adım 1: Vergi kamu geliridir. Adım 2: Ortak hizmetleri finanse eder. Adım 3: Kişisel tatil veya önyargı için değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Firkete (fiş) istemek neden önemlidir?",
      options: [
      "Kayıtlı alışveriş vergiye yansır; kamu payı görünür olur",
      "Fiş istemek yasaktır",
      "Fiş iklimi değiştirir",
      "Fiş mutlak konumdur",
      ],
      correctAnswerIndex: 0,
      hint: "Kayıt, ortak payı korur.",
      explanation: "Adım 1: Fiş alışverişi belgeler. Adım 2: Belge vergi düzenini destekler. Adım 3: Bu, vatandaşlık sorumluluğunun günlük yüzüdür.",
    },
    {
      id: "q3",
      level: "skill",
      question: "«Vergi yalnız zenginlerin işidir, benimle ilgisi yok» diyen biri için hangisi doğrudur?",
      options: [
      "Vergi ortak yaşamın finansmanıdır; vatandaşlık sorumluluğudur",
      "Vergi yalnız spor kulübü aidatıdır",
      "Vergi önyargı örneğidir",
      "Vergi enlem hesabıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Ortak gider — ortak pay.",
      explanation: "Adım 1: Kamu hizmeti herkese açıktır. Adım 2: Vergi bu hizmetin kaynağıdır. Adım 3: Bu yüzden vatandaşlık sorumluluğudur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
