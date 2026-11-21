import { ACADEMY_KVKK_DELETE_BUTTON_SUMMARY } from "@/lib/academy/kvkk-workspace";
import { ACADEMY_CHAT_MODEL_LIST } from "@/lib/academy/model-tendency-card";

/**
 * SEM / Google Ads Kalite Puanı — hedef anahtar kelime SSOT.
 * Görünür H1–H3, meta/OG ve FAQ bu listedeki tam dizgileri taşır.
 * Üçüncü taraf piksel buradan basılmaz (KVKK çerez metni).
 */

/**
 * Kök layout / Ads kalite puanı — aktif ticari ürün niyetleri.
 * Kapalı Akademi kurs niyetleri `OFFICE_AI_SEM_KEYWORDS` içindedir.
 */
export const SEM_LANDING_KEYWORDS = [
  "yapay zeka iş araçları",
  "kobi yapay zeka",
  "e-ticaret yönetim paneli",
  "kosgeb hibe bulucu",
  "yapay zeka belge oluşturucu",
  "aday değerlendirme testi",
] as const;

/**
 * Kapalı Akademi 01_office_ai antre SEM — kurs yüzeyi Ads/FAQ SSOT.
 * Kök `app/layout.tsx` keywords bu listeyi basmaz.
 */
export const OFFICE_AI_SEM_KEYWORDS = [
  "excel yapay zeka eğitimi",
  "ofiste chatgpt",
  "word yapay zeka",
  "yapay zeka sertifikasi",
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
      "Evet. yetkin.ai yapay zeka eğitimi ve online kurs sunar. Ofiste Yapay Zekâ, İleri Ofis, E-Ticaret, Sosyal Medya, Chatbot ve Prompt eğitimi yayındadır. İlk ders ücretsiz izlenir. Dersler ödeme sonrası açılır.",
  },
  certificate: {
    question: "Yapay zeka sertifikası nasıl alınır?",
    answer:
      "Eğitimi bitir, testi 70+ ile geç. Yapay zeka sertifikan sunucuda basılır; sahte rozet eklenmez.",
  },
  visa: {
    question: "YetkinCV Onaylı Yetenek Rozeti nedir?",
    answer:
      "YetkinCV Onaylı Yetenek Rozeti, Kariyer (/career) vaka testinden türer ve kamu kanıt sayfasına (/vize) işlenir. Elle basılmaz.",
  },
  prompt: {
    question: "Prompt eğitimi hangi kursta?",
    answer:
      "Prompt rehberi Akademi vitrininde yayındadır. İlk ders ücretsiz izlenir. Diğer dersler ücretsiz kayıtla açılır.",
  },
  online: {
    question: "Online kurs mobilde işler mi?",
    answer:
      "Evet. Online kurs mobil tarayıcıda açılır. Kart tahsilatı PayTR iFrame + 3D Secure ile yürür.",
  },
} as const satisfies Record<string, LandingFaqItem>;

/** Kök iniş SSS — dört çözüm alanı. Akademi kataloğu `ACADEMY_LANDING_FAQ` ile ayrı kalır. */
export const HOME_LANDING_FAQ: readonly LandingFaqItem[] = [
  {
    question: "AI Tezgâh ile ne üretebilirim?",
    answer:
      "Misafir ve üye günde 3 üretim alır: teklif, ürün kartı, e-posta, rapor ve benzeri iş çıktıları. Kota İstanbul gününde sıfırlanır. AI Tezgâh Pro ile ek kota katalogdan açılır.",
  },
  {
    question: "E-ticaret yönetimi neyi tek ekranda toplar?",
    answer:
      "Pazaryeri siparişleri, stok ve kârlılık aynı hesapta izlenir. Mağaza ürünü ve kanal entegrasyonu lisansla açılır; tutar fiyatlandırma sayfasındadır.",
  },
  {
    question: "Hibe ve teşvik bulucu nasıl çalışır?",
    answer:
      "Firma profilini girersin. Uygun KOSGEB, TÜBİTAK ve devlet desteklerini görürsün; proje özeti, bütçe ve iş paketini dosyaya dökersin.",
  },
  {
    question: "YetkinCV ve İK eleme işverene ne gösterir?",
    answer:
      "Aday uygulamalı vaka testini sunucuda çözer. Paylaşılabilir skor ve beceri kırılımı oluşur; CV metni kamu sayfasında görünmez. İşe yerleşmeyi garanti etmez.",
  },
];

export const ACADEMY_LANDING_FAQ: readonly LandingFaqItem[] = [
  FAQ.aiTraining,
  FAQ.certificate,
  FAQ.prompt,
  FAQ.online,
];

const YETKINCV_FAQ = {
  score: {
    question: "YetkinCV puanı nasıl oluşur?",
    answer:
      "CV özetini yapıştırır, seçtiğin uzmanlıkta uygulamalı vaka testini çözersin. Puan 0–100 sunucuda hesaplanır. Satın alma tek başına puan basmaz. İşe yerleşmeyi garanti etmez.",
  },
  verify: {
    question: "İşveren YetkinCV puanını nasıl doğrular?",
    answer:
      "Paylaştığın /vize bağını açar. Kayıt varsa skor ve beceri kırılımı görünür. Sahte ilan veya sahte şirket logosu bu kartta yoktur.",
  },
  practice: {
    question: "YetkinCV puanını nasıl yükseltirim?",
    answer:
      "30/60/90 planı pratik vakayı AI Tezgâh, e-ticaret paneli ve YetkinHibe üzerine yazar.",
  },
} as const satisfies Record<string, LandingFaqItem>;

export const CAREER_LANDING_FAQ: readonly LandingFaqItem[] = [
  YETKINCV_FAQ.score,
  YETKINCV_FAQ.verify,
  YETKINCV_FAQ.practice,
];

export const VIZE_LANDING_FAQ: readonly LandingFaqItem[] = [FAQ.visa, YETKINCV_FAQ.verify];

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
      `Evet. Bu excel yapay zeka eğitimi mühürlü yapay zeka sertifikası basar; satın alma tek başına belge üretmez. ${OFFICE_AI_SEAL_PROOF} Sertifikan Kariyer sayfana işlenir ve /career ile kamu kanıt sayfası /vize üzerinden doğrulanır. Arama dilindeki karşılığıyla: yapay zeka sertifikasi bu sınav barajından sonra mühürlenir.`,
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
