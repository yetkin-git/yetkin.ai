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
  /** Kişiselleştirilmiş Sıradaki Eylem — nabız sinyallerine göre. */
  nextBestAction: {
    eyebrow: "Sıradaki Eylem",
    fallback: {
      cta: "Akademiye git",
    },
    freelancerWork: {
      body: "Fonlanmış veya kilitli emanetli işin var. Tezgâhta devam et.",
      cta: "İşe dön",
    },
    freelancerOpen: {
      body: "Açık ilanın bekleyen teklif topluyor. Freelancer tezgâhını aç.",
      cta: "Teklifleri gör",
    },
    careerVisa: {
      body: "Mühürlü yetkinliğin vitrinde. Pusuladan sıradaki halkayı seç.",
      cta: "Vitrini aç",
    },
    academyContinue: {
      body: "Satın aldığın eğitim yolunda öğren, sınav ol, mühürlen.",
      cta: "Eğitime dön",
    },
  },
  pulse: {
    academyTitle: "Akademi nabzı",
    academyHrefLabel: "Akademi odası",
    academyPurchase: "Satın alma",
    academyCertificate: "Sertifika",
    academyEmpty: "Henüz mühür yok",
    careerTitle: "Kariyer nabzı",
    careerHrefLabel: "Kariyer odası",
    careerVisa: "Rozet",
    careerPortfolio: "Portföy",
    careerEmpty: "Henüz mühür yok",
    freelancerTitle: "Freelancer nabzı",
    freelancerHrefLabel: "Freelancer odası",
    freelancerOpen: "Açık ilan",
    freelancerActive: "Aktif iş",
    freelancerEscrow: (amount: string) => `Kilitli emanet: ${amount}`,
  },
  walletStrip: {
    eyebrow: "Cüzdan bakiyesi",
    title: "Ana Bakiye",
    live: "Canlı bakiye",
    unbound: "Bakiye henüz yüklenmedi",
    body: "Bakiye Akademi tahsilatı içindir. Usta iş bedeli bu bakiyeye yazılmaz; ödeme kuruluşu dağıtır. Freelancer kabulü cüzdan yüklemesi ile fonlanmaz — split bağlı değilse accept 503.",
    openCta: "Cüzdanı aç",
    escrowLabel: "Kilitli emanet",
    escrowHint: "Freelancer FUNDED sözleşmelerinde tutulan brüt; cüzdan satırına yazılmaz.",
    escrowEmpty: "Kilitli emanet yok",
    escrowCta: "Emanet özetini aç",
  },
} as const;
