import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — Dashboard kokpiti. Müze sen-voice kopyalanmaz. */

const WELCOME_TITLE = "Hoş Geldin";
const OVERVIEW_TITLE = "Genel Bakış";

function greetingGivenName(displayName: string | null | undefined): string | null {
  const trimmed = displayName?.trim();
  if (!trimmed) {
    return null;
  }
  const [first] = trimmed.split(/\s+/);
  if (!first || first.includes("@")) {
    return null;
  }
  return first;
}

/** Oturum varsa karşılama; isim varsa kişiselleşir. Misafirde genel bakış. */
export function dashboardWelcomeTitle(input: {
  signedIn: boolean;
  displayName?: string | null;
}): string {
  if (!input.signedIn) {
    return OVERVIEW_TITLE;
  }
  const given = greetingGivenName(input.displayName);
  return given ? `${WELCOME_TITLE}, ${given}` : WELCOME_TITLE;
}

export const DASHBOARD_SEN = {
  eyebrow: "Genel Bakış",
  title: WELCOME_TITLE,
  overviewTitle: OVERVIEW_TITLE,
  welcomeTitle: dashboardWelcomeTitle,
  description:
    "Eğitimlerin, kanıtlanmış uzmanlıkların ve çalışma süreçlerin tek bir güvenli panelde.",
  /** Karşılama başlığının yanında — açık odaları tek bakışta toplar. */
  welcomeLead: "E-Ticaret, YetkinHibe, AI Tezgâh, kariyer ve kurumsal İK adımların tek ekranda.",
  featured:
    "Hibe dosyanı YetkinHibe’de açarsın. Kariyer odasından 30 günlük planını kurarsın.",
  /** Oturumsuz Anasayfa — kişisel nabız yok. */
  publicPanel: {
    eyebrow: "Öğrenci paneli",
    title: OVERVIEW_TITLE,
    lead: `${YETKIN_BRAND} YetkinHibe, YetkinCV ve YetkinCV Onaylı Yetenek Rozetini bir arada tutar. Giriş yapmadan bu özeti görürsün. Giriş yapınca kişisel özetin açılır.`,
    featuresTitle: "Öne çıkanlar",
    features: [
      {
        title: "YetkinHibe",
        body: "Firma profiline göre uygun hibeyi bulur, proje dosyasını adım adım hazırlarsın.",
        href: "/panel/hibe",
        cta: "Hibeyi aç",
      },
      {
        title: "Kariyer",
        body: "YetkinCV, vize ve açık ilanlar. Uygulamalı vaka testi ile paylaşılabilir puan alırsın.",
        href: "/career",
        cta: "Kariyeri aç",
      },
      {
        title: "Sertifika doğrulama",
        body: "Paylaşılabilir bağ veya QR ile açık sicilden kontrol edersin. Oturum istenmez.",
        href: "/career",
        cta: "Sertifika doğrula",
      },
    ],
    summaryTitle: "Sistem özeti",
    summary: [
      "Hibe dosyası YetkinHibe’de açılır.",
      "YetkinCV puanı vaka testinden türer; satın alma tek başına puan basmaz.",
      "YetkinCV Onaylı Yetenek Rozeti Kariyer Kartında durur.",
      "Cüzdan, profil ve uzmanlık portföyü giriş ister.",
    ],
    loginCta: "Giriş yap",
    registerCta: "Kayıt ol",
  },
  /** Kişiselleştirilmiş Sıradaki Eylem — nabız sinyallerine göre. */
  nextBestAction: {
    eyebrow: "Sıradaki adımın",
    fallback: {
      cta: "Eğitimleri İncele",
    },
    /** B-03: yeni kullanıcının ilk değer anı. Kilitli odaya değil, üretime indirir. */
    firstValue: {
      body: "Henüz Tezgâh'ta çıktı üretmedin. Tek bir ihtiyaç yaz, 30 saniyede taslağını al — ücretsiz.",
      cta: "İlk çıktını üret",
    },
    freelancerWork: {
      body: "Açık örnek işin var. Tezgâhta devam et.",
      cta: "İşe dön",
    },
    freelancerOpen: {
      body: "Açık ilanın bekleyen teklif topluyor. Freelancer tezgâhını aç.",
      cta: "Teklifleri gör",
    },
    careerVisa: {
      body: "Doğrulanmış rozetin hazır. Kariyer sayfasında açıp yolunu gör.",
      cta: "Kariyer sayfasında gör",
    },
    academyContinue: {
      body: "Satın aldığın eğitimde kaldığın dersten devam et. Bitirince sertifikan burada görünecek.",
      cta: "Eğitime dön",
    },
  },
  /** Girişli Genel Bakış — 2×2 komuta kartı. Misafir paneli bu sözlüğü okumaz. */
  command: {
    tezgahTitle: "AI Tezgâh",
    tezgahQuotaFree: "Bu ayki kredi",
    tezgahQuotaCredit: "Kalan üretim kredisi",
    tezgahQuotaPro: "Tezgâh Pro",
    tezgahQuotaUnlimited: "Sınırsız Erişim",
    tezgahToolsReady: (count: number) => `${count} araç hazır`,
    tezgahCta: "Tezgâhı Aç",
    commerceTitle: "E-Ticaret",
    commerceEyebrow: "Yetkin Commerce",
    commerceCount: "Mağaza",
    commerceActive: "Açık vitrin",
    commerceNone: "Henüz mağaza açılmadı",
    commerceDraft: "Vitrin taslak",
    commerceManageCta: "Kokpiti Aç",
    commerceOpenCta: "Kokpiti Aç",
    careerTitle: "Kariyer & Cüzdan",
    careerWallet: "Bakiye",
    careerPlanReady: "Doğrulanmış rozetin hazır. 30 günlük plan Kariyer'de açılır.",
    careerPlanEmpty: "Doğrulanmış rozet yok. 30 günlük plan Kariyer'de kurulur.",
    careerCta: "Kariyeri Aç",
    kurumsalTitle: "Kurumsal",
    kurumsalEyebrow: "B2B İK",
    kurumsalStat: "Oda",
    kurumsalStatValue: "İlan & eleme",
    kurumsalDetail: "İlan aç, YetkinCV ile ele, kısa listeyi dışa aktar.",
    kurumsalCta: "Kurumsal’ı Aç",
    unknown: "—",
  },
  pulse: {
    academyTitle: "AI Tezgâh",
    academyHrefLabel: "Tezgâhı aç",
    academyPurchase: "Satın alma",
    academyCertificate: "Sertifika",
    unavailable: "Henüz yüklenemedi",
    academyEmpty: "Misafir ve üye günde üç üretim alır. Pro, otuz günlük erişim paketidir.",
    academyEmptyCta: "Tezgâhı aç",
    careerTitle: "Kariyer",
    careerHrefLabel: "Kariyer odası",
    careerVisa: "Rozet",
    careerPortfolio: "Portföy",
    careerEmpty: "İlk etkinliğini yap, rozetini kazan!",
    careerEmptyCta: "Kariyerini aç",
    portfolioEmpty: "İlk işini ekle, portföyün burada görünsün.",
    freelancerTitle: "Freelancer",
    freelancerHrefLabel: "Freelancer odası",
    freelancerLiveHint: "Arka plan",
    freelancerOpen: "Açık ilan",
    freelancerActive: "Aktif iş",
    freelancerEscrow: (amount: string) => `Pasif kilit: ${amount}`,
    freelancerEscrowInactive: "İlan ve teklif modülü pasiftir.",
  },
  walletStrip: {
    eyebrow: "Cüzdan bakiyesi",
    title: "Ana Bakiye",
    live: "Canlı bakiye",
    unbound: "Bakiye henüz yüklenmedi",
    body: "Cüzdan bakiyesi Tezgâh üretim kredileri, tek seferlik dosyalar ve platform içi hizmetler için kullanılır.",
    openCta: "Cüzdanı aç",
    escrowLabel: "Pasif kilit",
    escrowHint: "Freelancer kabulü bu bakiyeyi kullanmaz.",
    escrowEmpty: "Aktif kilit yok",
    escrowCta: "Cüzdanı aç",
  },
} as const;
