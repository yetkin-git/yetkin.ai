import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: YETKIN_BRAND,
    title: "Yetkinliğini kanıtlayan yapay zekâ eğitimleri",
    description:
      "Ofis, e-ticaret, sosyal içerik, chatbot ve prompt kurslarını incele. Dersleri bitir, testi geç; belgen sunucuda mühürlenir. PayTR Merchant onayı sürecindedir; PayTR iFrame altyapısı hazırdır, kart numarası platformda tutulmaz.",
    academyCta: "Eğitimleri İncele",
    loginCta: "Giriş Yap",
    registerCta: "Kayıt Ol",
    cockpitCta: "Panele geç",
    trustEyebrow: `Neden ${YETKIN_BRAND}?`,
    trustTitle: "Güven taahhüdü",
    trust: [
      "Kimliğin güvenli oturumla korunur",
      "PayTR Merchant onayı sürecindedir. PayTR iFrame altyapısı hazırdır; kart numarası platformda tutulmaz",
      "Sınav ve mühür sunucuda doğrulanır; ikna yerine kanıt",
    ],
    roomsKicker: "Bugün satılan ürün",
    hero: {
      kicker: "Akademi",
      title: "Öğren ve sınavı geç",
      body: "Amiral kursta mühürlü dersler sesli anlatımdır; Prompt Box videonun altındadır. Testi geçince belgen hazır.",
      href: "/academy",
    },
  },
  error: {
    eyebrow: YETKIN_BRAND,
    title: "Bir şeyler ters gitti",
    description: "Sayfa yüklenemedi. Tekrar dene veya ana sayfaya dön.",
    retry: "Tekrar dene",
    homeCta: "Ana sayfa",
    codeLabel: "Kod:",
    rooms: {
      academy: "Akademi odası yüklenemedi. Tekrar dene veya kataloga dön.",
      career: "Kariyer sayfası yüklenemedi. Tekrar dene veya Kariyer'e dön.",
      freelancer: "Freelancer odası yüklenemedi. Tekrar dene veya Freelancer İlan Panosu'na dön.",
      dashboard: "Panel yüklenemedi. Tekrar dene veya panele dön.",
    },
  },
  gone: {
    eyebrow: "Kapalı",
    headline: "Bu oda üretimde kapalı.",
    description:
      "Çalışan ürün Akademi’dir. Kariyer belge vitrinidir; Freelancer arka plan odasıdır. Bu yüzey donmuş backlog’tur; yeni iş burada açılmaz. Sahte vitrin basılmaz.",
    homeCta: "Ana sayfa",
    academyCta: "Akademi",
    careerCta: "Kariyer",
    freelancerCta: "Freelancer",
    status: "HTTP 410",
  },
  notFound: {
    eyebrow: "404",
    title: "Sayfa bulunamadı",
    description: `Bu adres ${YETKIN_BRAND}’de yok. Ana sayfaya dön.`,
    homeCta: "Ana sayfa",
  },
} as const;
