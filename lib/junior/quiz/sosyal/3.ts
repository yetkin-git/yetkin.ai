import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (3/20). */
export const JUNIOR_SOSYAL_QUIZ_3 = {
  lessonKey: "jr_06_sosyal-3",
  title: "Önyargıları kırıyoruz",
  tellGuides: [
    "Önyargı nedir, bir örnekle anlatır mısın?",
    "Tanımadan karar vermek yerine sormak neden daha doğrudur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Önyargı ne demektir?",
      options: [
      "Bir kişiyi veya grubu tanımadan verilen olumsuz yargı",
      "Bilimsel bir ölçüm sonucu",
      "Haritadaki enlem çizgisi",
      "Mahkemenin kesin kararı",
      ],
      correctAnswerIndex: 0,
      hint: "Tanımadan verilen karar tarafındadır.",
      explanation: "Adım 1: Önyargı, yeterli bilgi olmadan verilen yargıdır. Adım 2: Çoğu zaman olumsuz ve genelleyicidir. Adım 3: Bilimsel ölçüm veya mahkeme kararı değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "«Şu mahalledeki herkes kaba» diyen bir cümle hangi hatayı taşır?",
      options: [
      "Tek örnekten tüm gruba genelleme yapan önyargı",
      "Mutlak konum bilgisi",
      "Vergi sorumluluğu",
      "Demokratik seçim kuralı",
      ],
      correctAnswerIndex: 0,
      hint: "«Herkes» sözü genellemeyi işaret eder.",
      explanation: "Adım 1: Önyargı genelleme ile büyür. Adım 2: Bir mahalleyi bütünüyle suçlamak tanıma olmadan karar vermektir. Adım 3: Bu konum, vergi veya seçim kuralı değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Yeni gelen arkadaşın aksanını duyunca «zayıf öğrenci» diyen biri için hangisi doğru yaklaşımdır?",
      options: [
      "Önce tanımak ve sormak; aksanı başarı ölçüsü saymamak",
      "Aksanı hemen sınıf listesine yazmak",
      "Önyargıyı doğru bilgi saymak",
      "Kişiyi hiç tanımadan not vermek",
      ],
      correctAnswerIndex: 0,
      hint: "Sormak, önyargıyı askıya alır.",
      explanation: "Adım 1: Aksan, başarıyı göstermez. Adım 2: Önyargı tanımadan karar vermektir. Adım 3: Doğru yol tanımak, sormak ve kişiyi yargılamadan dinlemektir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
