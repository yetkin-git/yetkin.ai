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
  // SEO Tedavi (P0) — 01_office_ai amiral niyet kümesi. Antre H1/meta/FAQ/rehber bloğu bu dizgileri taşır.
  "excel yapay zeka eğitimi",
  "ofiste chatgpt",
  "word yapay zeka",
  "yapay zeka sertifikasi",
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

/**
 * SEO Tedavi (P0) — 01_office_ai kursa özel SSS.
 * Antrede görünür `<LandingFaq>` ile `FAQPage` JSON-LD AYNI sabitten beslenir;
 * metinler %100 birebir eşleşir (gizli markup cezası yenmez).
 * 4 amiral niyet dizgisini (excel yapay zeka eğitimi / ofiste chatgpt /
 * word yapay zeka / yapay zeka sertifikasi) soru+yanıtta taşır.
 */
export const OFFICE_AI_COURSE_FAQ: readonly LandingFaqItem[] = [
  {
    question: "Excel yapay zeka eğitimi sertifika veriyor mu?",
    answer:
      "Evet. Bu excel yapay zeka eğitimi, 9 dersi bitirip testi 70+ ile geçtiğinde mühürlü yapay zeka sertifikası basar; satın alma tek başına belge üretmez. Sertifikan Kariyer sayfana işlenir ve /academy/dogrula sicilinden herkese açık doğrulanır. Arama dilindeki karşılığıyla: yapay zeka sertifikasi bu sınav barajından sonra mühürlenir.",
  },
  {
    question: "ChatGPT ofis kullanımı için ön koşul var mı?",
    answer:
      "Hayır, ön koşul yok. Temel Excel ve e-posta kullanımı yeter; kodlama gerekmez. Ofiste chatgpt kullanımı, Word yapay zeka, Gmail aksiyon listesi ve slayt hazırlama sıfırdan adım adım anlatılır. Copilot lisansın yoksa dosya ataş yöntemiyle aynı sonuca ulaşırsın; lisans zorunlu değildir.",
  },
  {
    question: "KVKK'ya uygun mu? Verilerim güvende mi?",
    answer:
      "Evet, KVKK-safe kurguludur. Müşteri listesi, IBAN, T.C. Kimlik No, maaş tablosu ve şirket sırrı ham haliyle açık yapay zekâ ekranına yüklenmez; 2. derste maskeleme kilitlenir (Müşteri A, MASKELİ_IBAN). Modele tablonun mantığını öğretmek için üç maskeli örnek satır yeter; bin gerçek satır gerekmez. Ödeme PayTR iFrame + 3D Secure ile yürür; kart numarası platformda tutulmaz.",
  },
  {
    question: "Sınav barajı ve süresi nedir?",
    answer:
      "Baraj 70 puandır; 9 dersin tamamı bitmeden sınav açılmaz. Sınav 30 dakika ve 10 sorudur; süre dolduğunda son gönderim alınır. Satın alma tek başına belge basmaz; 70+ altı sonuçta sertifika mühürlenmez, yeniden deneyebilirsin.",
  },
] as const;

/** Antre SSS başlığı — niyet dizgisini H2'de taşır. */
export const OFFICE_AI_FAQ_HEADING = "Excel yapay zeka eğitimi hakkında sık sorulanlar" as const;
