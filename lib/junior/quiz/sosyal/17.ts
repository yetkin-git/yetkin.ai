import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (17/20). */
export const JUNIOR_SOSYAL_QUIZ_17 = {
  lessonKey: "jr_06_sosyal-17",
  title: "Haklarımızın güvencesi: anayasa ve demokrasi",
  tellGuides: [
    "Anayasanın neden üst kanun olduğunu anlatır mısın?",
    "Hakların anayasa ile güvence altına alınmasını bir örnekle söyler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Anayasa neden «üst kanun» sayılır?",
      options: [
      "Diğer kanunların ona uygun olması gerekir",
      "Yalnız spor kurallarını yazar",
      "Harita çizimidir",
      "Vergi makbuzudur",
      ],
      correctAnswerIndex: 0,
      hint: "Hukuk düzeninin en üst çerçevesi.",
      explanation: "Adım 1: Anayasa devletin temel kanunudur. Adım 2: Diğer kurallar ona aykırı olamaz. Adım 3: Bu yüzden üst kanundur.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Eğitim ve sağlık gibi hakların güvencesi nerede yazılıdır?",
      options: [
      "Anayasada",
      "Yalnızca bir reklam afişinde",
      "İpek Yolu haritasında",
      "İklim tablosunda",
      ],
      correctAnswerIndex: 0,
      hint: "Temel hakların yazılı güvencesi.",
      explanation: "Adım 1: Temel haklar anayasada yer alır. Adım 2: Bu güvence keyfi değildir. Adım 3: Reklam veya harita güvence kaynağı değildir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir yönetici «Bu hakkı ben tek başıma silebilirim» derse hangisi doğrudur?",
      options: [
      "Anayasal haklar keyfi silinemez; demokrasi ve hukuk bunu engeller",
      "Haklar her gün rastgele silinir",
      "Anayasa yalnız hava durumudur",
      "Haklar yalnızca vergiye bağlıdır",
      ],
      correctAnswerIndex: 0,
      hint: "Üst kanun + güvence.",
      explanation: "Adım 1: Haklar anayasa ile korunur. Adım 2: Tek kişinin keyfi silmesi hukuk devletine aykırıdır. Adım 3: Demokrasi bu güvenceyi yaşatır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
