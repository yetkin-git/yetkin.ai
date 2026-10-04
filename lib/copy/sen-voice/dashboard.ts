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
  eyebrow: "Anasayfa",
  title: WELCOME_TITLE,
  overviewTitle: OVERVIEW_TITLE,
  welcomeTitle: dashboardWelcomeTitle,
  description:
    "Eğitimlerin, kanıtlanmış uzmanlıkların ve çalışma süreçlerin tek bir güvenli panelde.",
  featured:
    "Kariyer yolculuğuna başlamak için Akademi'den sana uygun eğitimi seçebilir veya Kariyer odasından hedefini belirleyebilirsin.",
  /** Oturumsuz Anasayfa — kişisel nabız yok. */
  publicPanel: {
    eyebrow: "Anasayfa",
    title: OVERVIEW_TITLE,
    lead: `${YETKIN_BRAND} eğitim, sınav ve kariyer vizesini bir arada tutar. Giriş yapmadan bu özeti görürsün. Giriş yapınca kişisel özetin açılır.`,
    featuresTitle: "Öne çıkanlar",
    features: [
      {
        title: "Akademi",
        body: "Dersi bitirirsin. Testi geçince sertifikan sunucuda mühürlenir.",
        href: "/academy",
        cta: "Eğitimleri incele",
      },
      {
        title: "Kariyer vizesi",
        body: "Mühürlü sertifika kariyer vizesine dönüşür. Sahte rozet eklenmez.",
        href: "/career",
        cta: "Kariyer sayfasını aç",
      },
      {
        title: "Sertifika doğrulama",
        body: "Sertifika özetini açık sicilden kontrol edersin. Oturum istenmez.",
        href: "/academy/dogrula",
        cta: "Sertifika doğrula",
      },
    ],
    summaryTitle: "Sistem özeti",
    summary: [
      "Eğitim Akademi kataloğundadır.",
      "Sınav barajı 70'tir. Satın alma tek başına belge basmaz.",
      "Mühür Kariyer sayfasında vize olarak durur.",
      "Cüzdan, profil ve pasaport giriş ister.",
    ],
    loginCta: "Giriş yap",
    registerCta: "Kayıt ol",
  },
  /** Kişiselleştirilmiş Sıradaki Eylem — nabız sinyallerine göre. */
  nextBestAction: {
    eyebrow: "Sıradaki Eylem",
    fallback: {
      cta: "Akademiye git",
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
      body: "Doğrulanmış rozetin Kariyer sayfasında Pasaport Vize Damgası olarak durur.",
      cta: "Kariyer sayfasında gör",
    },
    academyContinue: {
      body: "Satın aldığın eğitimde kaldığın dersten devam et. Öğren, sınav ol, sertifikanı al.",
      cta: "Eğitime dön",
    },
  },
  pulse: {
    academyTitle: "Akademi",
    academyHrefLabel: "Akademi odası",
    academyPurchase: "Satın alma",
    academyCertificate: "Sertifika",
    unavailable: "Henüz yüklenemedi",
    academyEmpty: "Henüz sertifika yok",
    careerTitle: "Kariyer",
    careerHrefLabel: "Kariyer odası",
    careerVisa: "Rozet",
    careerPortfolio: "Portföy",
    careerEmpty: "Henüz doğrulanmış rozet yok",
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
    body: "Bakiye Akademi tahsilatı içindir. Eğitim satın alımı bu bakiyeden düşer.",
    openCta: "Cüzdanı aç",
    escrowLabel: "Pasif kilit",
    escrowHint: "Freelancer kabulü bu bakiyeyi kullanmaz.",
    escrowEmpty: "Aktif kilit yok",
    escrowCta: "Cüzdanı aç",
  },
} as const;
