/**
 * SEM / Google Ads Kalite Puanı — hedef anahtar kelime SSOT.
 * Görünür H1–H3, meta/OG ve FAQ bu listedeki tam dizgileri taşır.
 * Üçüncü taraf piksel buradan basılmaz (KVKK çerez metni).
 */

export const SEM_LANDING_KEYWORDS = [
  "yapay zeka eğitimi",
  "yapay zeka sertifikası",
  "kariyer vizesi",
  "prompt eğitimi",
  "online kurs",
] as const;

export type SemLandingKeyword = (typeof SEM_LANDING_KEYWORDS)[number];

export type LandingFaqItem = {
  question: string;
  answer: string;
};

const FAQ = {
  aiTraining: {
    question: "yetkin.ai yapay zeka eğitimi ve online kurs sunuyor mu?",
    answer:
      "Evet. yetkin.ai yapay zeka eğitimi ve online kurs sunar. Amiral kurs yayındadır. Kardeş müfredat ve prompt eğitimi Çok Yakında / Hazırlanıyor rozetiyle durur; mühürsüz ders için hayali oynatıcı basılmaz. Dersler ödeme sonrası açılır.",
  },
  certificate: {
    question: "Yapay zeka sertifikası nasıl alınır?",
    answer:
      "Eğitimi bitir, testi 70+ ile geç. Yapay zeka sertifikan sunucuda mühürlenir; sahte rozet eklenmez.",
  },
  visa: {
    question: "Kariyer vizesi nedir?",
    answer:
      "Kariyer vizesi, Akademi sınavından türeyen Pasaport Vize Damgasıdır. Kariyer sayfanda görünür; elle basılmaz.",
  },
  prompt: {
    question: "Prompt eğitimi hangi kursta?",
    answer:
      "Prompt eğitimi (ChatGPT, Claude ve Perplexity) Akademi vitrininde Çok Yakında / Hazırlanıyor kartıdır. Mühürlenince oynatıcı açılır.",
  },
  online: {
    question: "Online kurs mobilde işler mi?",
    answer:
      "Evet. Online kurs mobil tarayıcıda açılır. Kart tahsilatı PayTR iFrame + 3D Secure ile yürür.",
  },
} as const satisfies Record<string, LandingFaqItem>;

export const HOME_LANDING_FAQ: readonly LandingFaqItem[] = [
  FAQ.aiTraining,
  FAQ.certificate,
  FAQ.visa,
  FAQ.prompt,
  FAQ.online,
];

export const ACADEMY_LANDING_FAQ: readonly LandingFaqItem[] = [
  FAQ.aiTraining,
  FAQ.certificate,
  FAQ.prompt,
  FAQ.online,
];

export const CAREER_LANDING_FAQ: readonly LandingFaqItem[] = [
  FAQ.visa,
  FAQ.certificate,
  FAQ.aiTraining,
];

export const VIZE_LANDING_FAQ: readonly LandingFaqItem[] = [FAQ.visa, FAQ.certificate];
