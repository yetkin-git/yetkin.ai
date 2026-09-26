import { ACADEMY_KVKK_DELETE_BUTTON_SUMMARY } from "@/lib/academy/kvkk-workspace";
import { ACADEMY_CHAT_MODEL_LIST } from "@/lib/academy/model-tendency-card";

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
  // T-01 — vatandaş lisanı kuyruk; Gemini yalnız Gmail yerleşik paneli olarak durur.
  "iş hayatında yapay zekâ",
  "excel'de temiz veri",
  "gmail'de yerleşik gemini",
  "word ataş ile belge analizi",
  "kvkk maskeleme",
  "haftalık cuma rutini",
] as const;

/**
 * T-02 — 01_office_ai mührünün kamuya açık tanımı (Vatandaş Lisanı).
 * Kanıt: 8 ders izleme + 10 soruluk baraj (≥70). Compact SKU sunucuda Excel/Word doğrulamaz.
 */
export const OFFICE_AI_SEAL_PROOF =
  "Bu eğitimdeki sertifika mührü; 8 dersin eksiksiz izlenmesi ve kurs sonu baraj sınavında %70 başarı sağlanması ile verilir. Saha uygulamaları kullanıcı ortamında gerçekleşir, sunucuda dosya kontrolü yapılmaz." as const;

/** SERP ve katalog kartı tavanı — aynı iddia, kısa. */
export const OFFICE_AI_SEAL_PROOF_SHORT =
  "Sertifika: 8 ders + 10 soru / 70. Sunucuda dosya kontrolü yok." as const;

export type SemLandingKeyword = (typeof SEM_LANDING_KEYWORDS)[number];

export type LandingFaqItem = {
  question: string;
  answer: string;
};

const FAQ = {
  aiTraining: {
    question: "yetkin.ai yapay zeka eğitimi ve online kurs sunuyor mu?",
    answer:
      "Evet. yetkin.ai yapay zeka eğitimi ve online kurs sunar. Amiral kurs yayındadır. Kardeş müfredat ve prompt eğitimi Çok Yakında / Hazırlanıyor rozetiyle durur; sesi bitmemiş ders için boş oynatıcı basılmaz. Dersler ödeme sonrası açılır.",
  },
  certificate: {
    question: "Yapay zeka sertifikası nasıl alınır?",
    answer:
      "Eğitimi bitir, testi 70+ ile geç. Yapay zeka sertifikan sunucuda basılır; sahte rozet eklenmez.",
  },
  visa: {
    question: "Kariyer vizesi nedir?",
    answer:
      "Kariyer vizesi, Akademi sınavından türeyen Pasaport Vize Damgasıdır. Kariyer sayfanda görünür; elle basılmaz.",
  },
  prompt: {
    question: "Prompt eğitimi hangi kursta?",
    answer:
      "Prompt eğitimi (ChatGPT, Claude ve Perplexity) Akademi vitrininde Çok Yakında / Hazırlanıyor kartıdır. Sesi bitince oynatıcı açılır.",
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
 * word yapay zeka / yapay zeka sertifikasi) soru+yanıtta taşır; 5. madde
 * kurumsal BT / harici eklenti (Add-in) dürüstlük notudur.
 *
 * T-02 — birinci madde mührün neyi kanıtladığını (izleme + baraj; sunucu dosya yok)
 * vatandaş lisanıyla yazar. Manifesto «iş kanıtı» cümlesi bu SSS'ye girmez.
 */
export const OFFICE_AI_COURSE_FAQ: readonly LandingFaqItem[] = [
  {
    question: "Excel yapay zeka eğitimi sertifika veriyor mu?",
    answer:
      `Evet. Bu excel yapay zeka eğitimi mühürlü yapay zeka sertifikası basar; satın alma tek başına belge üretmez. ${OFFICE_AI_SEAL_PROOF} Sertifikan Kariyer sayfana işlenir ve /academy/dogrula sicilinden herkese açık doğrulanır. Arama dilindeki karşılığıyla: yapay zeka sertifikasi bu sınav barajından sonra mühürlenir.`,
  },
  {
    question: "ChatGPT ofis kullanımı için ön koşul var mı?",
    answer:
      `Hayır, ön koşul yok. Temel Excel ve e-posta kullanımı yeter; kodlama gerekmez. Ofiste chatgpt kullanımı tek bir markaya kilitli değildir: ${ACADEMY_CHAT_MODEL_LIST} büyük dil modelleridir (sohbet yapay zekâları). Excel Copilot ve Ataş Yöntemi, A1 Düzeni ve Temiz Veri, Word yapay zeka, Word ataş ile belge analizi, Gmail'de yerleşik Gemini, KVKK maskeleme ve slayt hazırlama sıfırdan adım adım anlatılır. Copilot lisansın yoksa dosya ataş yöntemiyle aynı sonuca ulaşırsın; lisans zorunlu değildir.`,
  },
  {
    question: "KVKK'ya uygun mu? Verilerim güvende mi?",
    answer:
      `Eğitimde anlatılan KVKK kuralları, veri yüklerken uyulan adımlardır; hukuki danışmanlık yerine geçmez. Müşteri listesi, IBAN, T.C. Kimlik No, maaş tablosu ve şirket sırrı ham haliyle açık yapay zekâ ekranına yüklenmez; 2. derste maskeleme kilitlenir (Müşteri A, MASKELİ_IBAN). Aboneliğin ücretli (Plus/Pro/Team) olsa bile açık sohbete ham kişisel veri ve şirket sırrı atılamaz. Ücretli üyelik modeli eğitmese de veri sunucuya gider. Yüklemeden önce her zaman maskeliyoruz. ${ACADEMY_KVKK_DELETE_BUTTON_SUMMARY} Maskeleme kimliği takma değerle değiştirir. Uydurma üç satır yalnız tablo şeklini gösterir; bin satırın toplamını vermez. Ödeme PayTR iFrame + 3D Secure ile yürür; kart numarası platformda tutulmaz.`,
  },
  {
    question: "Sınav barajı ve süresi nedir?",
    answer:
      "Baraj 70 puandır; 8 dersin tamamı bitmeden sınav açılmaz. Sınav 30 dakika ve 10 sorudur; süre dolduğunda son gönderim alınır. Satın alma tek başına belge basmaz; 70+ altı sonuçta sertifika mühürlenmez, yeniden deneyebilirsin. Bu baraj, yüklediğin Excel veya Word dosyasını sunucuda kontrol etmez; saha uygulaması senin ortamında kalır. Kapanış dersi haftalık Cuma rutini ile otuz dakikayı takvime bağlar.",
  },
  {
    question: "Excel veya Word'e harici yapay zekâ eklentisi (Add-in) kurmayı öğretiyor musunuz?",
    answer:
      "Harici eklentiler şirket güvenlik (BT) duvarına takılır ve lisans ister. Bu eğitim Excel veya Word'e eklenti kurmayı öğretmez. Copilot lisansın varsa Excel şeridinden okutmayı, yoksa dosyayı ataş ile yüklemeyi; Gmail'de yerleşik Gemini panelini; ikisi de durmuyorsa maskeli kısa özeti öğretir.",
  },
] as const;

/** Antre SSS başlığı — niyet dizgisini H2'de taşır. */
export const OFFICE_AI_FAQ_HEADING = "Excel yapay zeka eğitimi hakkında sık sorulanlar" as const;
