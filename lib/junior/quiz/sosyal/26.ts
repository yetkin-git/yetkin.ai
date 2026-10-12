import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** 6. Sınıf Sosyal Bilgiler — konu sonu soru arşivi. Telif ve patent. */
export const JUNIOR_SOSYAL_QUIZ_26 = {
  lessonKey: "jr_06_sosyal-26",
  title: "Telif ve patent",
  tellGuides: [
    "Telif ile patenti nasıl ayırırsın?",
    "Bir hikâyeyi adını değiştirerek kopyalamak neden sorun olur?",
    "Yeni bir araç fikri hangi kapıda araştırılır?",
  ],
  questions: [
    {
      id: "q1",
      level: "concept",
      question: "Telif neyi korur?",
      options: [
        "Hikâye, çizim ve kitap sayfası gibi eseri",
        "Yalnızca yeni bir makinenin fabrika ruhsatını",
        "Her çizimi otomatik olarak patenti",
        "Başkasının adını silince serbest kalan kopyayı",
      ],
      correctAnswerIndex: 0,
      hint: "Sayfadaki anlatı bu taraftadır.",
      explanation:
        "Adım 1: Telif, üretilen eseri korur. Adım 2: Hikâye ve çizim eserdir. Adım 3: Patent ise yeni buluş fikrinin ayrı kapısıdır.",
    },
    {
      id: "q2",
      level: "apply",
      question: "Ece'nin hikâyesi başka bir kitaba geçirilip adı değişince ne olur?",
      options: [
        "Telif etkilenir; ad değiştirmek kopyayı haklı çıkarmaz",
        "Ad değişince eser herkese açık olur",
        "Bu iş doğrudan patenttir",
        "Hikâye çizim olmadığı için korumasızdır",
      ],
      correctAnswerIndex: 0,
      hint: "Eser, adın değişmesiyle başkasının olmaz.",
      explanation:
        "Adım 1: Hikâye Ece'nin eseridir. Adım 2: Kopya başka kitaba geçmiştir. Adım 3: Ad değişimi telif hakkını silmez.",
    },
    {
      id: "q3",
      level: "skill",
      question:
        "Okul sergisinde bir arkadaşının çizimi kendi kâğıdına geçirilmiş. Yanında da kalemleri tutan yeni bir kutu fikri duruyor. Kitap sahnesinde doğru ayrım hangisidir?",
      options: [
        "Çizimin kopyası teliftir; yeni kutu fikri patent kapısında araştırılır",
        "İkisi de aynı hak olduğu için tek cümle yeter",
        "Ad yazılınca kopya sorun olmaktan çıkar",
        "Her çizim araştırmadan patent sayılır",
      ],
      correctAnswerIndex: 0,
      hint: "Eser ile yeni araç fikri ayrı kapıdır.",
      explanation:
        "Adım 1: Çizimi kendi adına geçirmek telifi etkiler. Adım 2: Yeni kutu fikri eserden ayrı sorulur. Adım 3: Bu fikir patent kapısında araştırılır.",
    },
  ],
} as const satisfies JuniorLessonQuizPack;
