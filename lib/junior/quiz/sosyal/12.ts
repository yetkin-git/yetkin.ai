import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi (12/20). */
export const JUNIOR_SOSYAL_QUIZ_12 = {
  lessonKey: "jr_06_sosyal-12",
  title: "Ülkemizin kaynakları ve ekonomik faaliyetler",
  tellGuides: [
    "Ekonomik faaliyetin ne olduğunu kendi sözlerinle anlatır mısın?",
    "Bir bölgedeki ürünün kaynağa nasıl bağlı olduğunu örnekler misin?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Ekonomik faaliyet ne demektir?",
      options: [
      "İnsanların geçim için yaptığı üretim, dağıtım ve tüketim işleri",
      "Yalnızca tatil planı",
      "Haritadaki renk skalası",
      "Önyargı örneği",
      ],
      correctAnswerIndex: 0,
      hint: "Geçim ve iş tarafındadır.",
      explanation: "Adım 1: Ekonomik faaliyet geçim işidir. Adım 2: Tarım, sanayi, turizm örnekleridir. Adım 3: Tatil planı veya harita rengi değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Maden zenginliği olan bir bölgede hangisi daha beklenir?",
      options: [
      "Madencilik ve buna bağlı sanayi faaliyetleri",
      "Yalnızca kutup turizmi",
      "Hiç ekonomik faaliyet olmaması",
      "Enlem çizgisinin silinmesi",
      ],
      correctAnswerIndex: 0,
      hint: "Kaynak, faaliyeti yönlendirir.",
      explanation: "Adım 1: Kaynak ile faaliyet bağlıdır. Adım 2: Maden varsa madencilik öne çıkar. Adım 3: Bu, konum-kaynak-ekonomi ilişkisidir.",
    },
    {
      id: "q3",
      level: "skill",
      question: "Sahil kasabasında balıkçılık ve turizm birlikte yürüyorsa bu neyi gösterir?",
      options: [
      "Aynı coğrafi koşulların birden fazla ekonomik faaliyeti destekleyebileceğini",
      "Turizmin yasak olduğunu",
      "Balıkçılığın vergi olmadığını",
      "Kaynağın hiç işe yaramadığını",
      ],
      correctAnswerIndex: 0,
      hint: "Deniz hem ürün hem ziyaretçi getirir.",
      explanation: "Adım 1: Deniz balıkçılık kaynağıdır. Adım 2: Manzara ve iklim turizmi destekler. Adım 3: Bir yer birden fazla faaliyet taşıyabilir.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
