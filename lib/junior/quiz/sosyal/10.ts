import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (10/20). */
export const JUNIOR_SOSYAL_QUIZ_10 = {
  lessonKey: "jr_06_sosyal-10",
  title: "Türkiye'nin coğrafi konumu ve iklim çeşitliliği",
  tellGuides: [
    "Türkiye'nin coğrafi konumunu neden «köprü» diye anlatırız?",
    "İklim çeşitliliğinin ekonomik faaliyetlere etkisini bir örnekle söyler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Türkiye'nin coğrafi konumu neden özeldir?",
      options: [
      "Asya ile Avrupa arasında köprü konumundadır",
      "Yalnızca bir okyanus adasıdır",
      "Ekvator üzerindedir",
      "Kutup dairesindedir",
      ],
      correctAnswerIndex: 0,
      hint: "İki kıta arasındaki geçiş konumunu düşün.",
      explanation: "Adım 1: Türkiye kıtalararası geçiş yerindedir. Adım 2: Bu konum ticareti ve kültürü etkiler. Adım 3: Ada, ekvator veya kutup ülkesi değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Karadeniz kıyısında çay, iç bölgelerde ise tahıl öne çıkıyorsa bu neyi gösterir?",
      options: [
      "İklim ve konumun ekonomik faaliyeti etkilediğini",
      "İklimin hiç önemli olmadığını",
      "Yalnızca vergi oranını",
      "Mutlak konumun değiştiğini",
      ],
      correctAnswerIndex: 0,
      hint: "Farklı iklim → farklı ürün.",
      explanation: "Adım 1: Nemli kıyı ile iç bölge iklimi farklıdır. Adım 2: Ürün buna göre değişir. Adım 3: Bu, konum-iklim-ekonomi bağını gösterir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Bir öğrenci «Türkiye'de tek bir iklim vardır» diyor. Hangisi doğru düzeltmedir?",
      options: [
      "Konum ve yeryüzü şekilleri nedeniyle birden fazla iklim tipi görülür",
      "Hiç iklim yoktur",
      "Yalnızca kutup iklimi vardır",
      "İklim yalnız yazın vardır",
      ],
      correctAnswerIndex: 0,
      hint: "Denize göre konum ve yükselti çeşitliliği.",
      explanation: "Adım 1: Türkiye'nin konumu çeşitlidir. Adım 2: Dağlar ve denizler iklimi böler. Adım 3: Bu yüzden tek iklim iddiası yanlıştır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
