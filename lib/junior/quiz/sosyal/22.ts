import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi. Türk dünyasıyla kültürel iş birliği. */
export const JUNIOR_SOSYAL_QUIZ_22 = {
  lessonKey: "jr_06_sosyal-22",
  title: "Türk dünyasıyla kültürel iş birliği",
  tellGuides: [
    "Kültürel iş birliği ne demektir?",
    "Bir geleneği iki ülkede nasıl karşılaştırırsın?",
    "Fark ile ortak parça neden birlikte durur?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Kültürel iş birliği ne demektir?",
      options: [
        "Ortak bir geleneği iki yerde birlikte tanımak",
        "Bir ülkenin bütün adetlerini silmek",
        "Haritadaki her ülkenin aynı yemeği pişirmesi",
        "Yalnızca sınır çizgisini ezberlemek",
      ],
      correctAnswerIndex: 0,
      hint: "Ortak iz birlikte tanınır; fark silinmez.",
      explanation:
        "Adım 1: İş birliği, bir geleneği iki yerde tanımaktır. Adım 2: Ortak parça birlikte yaşatılır. Adım 3: Yere göre değişen parça silinmek zorunda değildir.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Sınıf iki ülkede Nevruz gününü araştırınca hangi sonuç doğrudur?",
      options: [
        "Baharın gelişi ortaktır; kutlama biçimi yere göre değişebilir",
        "Gelenek yalnız bir ülkenin icadıdır",
        "Farklı bir hareket varsa iş birliği bozulur",
        "Araştırma yapmadan hepsi aynı denir",
      ],
      correctAnswerIndex: 0,
      hint: "Buğday ve ateş farklı olabilir; bahar ortaktır.",
      explanation:
        "Adım 1: İki ülkede de baharın gelişi kutlanır. Adım 2: Biçim yere göre değişebilir. Adım 3: Ortak parça iş birliğinin konusu olur.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Okulda bir arkadaşın başka şehirden bir masal getiriyor. Haritada aynı masalın izi ikinci bir ülkede de çıkıyor. Kültürel iş birliği için doğru iş hangisidir?",
      options: [
        "Ortak masalı iki yerde araştırıp farkı silmeden söylemek",
        "Masalı tek ülkenin malı diye kapatmak",
        "Haritaya bakmadan hepsi aynı demek",
        "İkinci ülkenin anlatısını hiç okumamak",
      ],
      correctAnswerIndex: 0,
      hint: "Önce iki yer, sonra ortak parça.",
      explanation:
        "Adım 1: Masal iki yerde araştırılır. Adım 2: Ortak parça söylenir. Adım 3: Yere göre fark silinmeden durur.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
