import { YETKIN_BRAND, YETKIN_RELEASE_LABEL } from "@/lib/copy/brand";

/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: YETKIN_BRAND,
    versionBadge: YETKIN_RELEASE_LABEL,
    title: "Güvenli kariyer ve iş platformu",
    description:
      "Yapay zekâ destekli eğitimlerle yetkinliğini geliştir, kariyer vizenle uzmanlığını belgele. Freelancer tezgâhı ilan ve emaneti taşır; ödeme henüz bağlanmadı / pasif iken sahte kazanç yazılmaz.",
    loginCta: "Giriş Yap",
    registerCta: "Kayıt Ol",
    cockpitCta: "Anasayfaya geç",
    trustEyebrow: `Neden ${YETKIN_BRAND}?`,
    trustTitle: "Güven taahhüdü",
    trust: [
      "Kimliğin güvenli oturumla korunur",
      "Ödeme henüz bağlanmadı / pasif — sahte bakiye yazılmaz",
      "Sınav ve mühür sunucuda doğrulanır; ikna yerine kanıt",
      "Yapay zekâ destekli hızlı doğrulama süreçleri",
    ],
    roomsKicker: "Nasıl başlarsın",
    journey: [
      {
        kicker: "Akademi",
        title: "Öğren ve sınavı geç",
        body: "Yapay zekâ destekli kurslarla yetkinliğini geliştir; sınavı geçince belgen hazır.",
        href: "/academy",
      },
      {
        kicker: "Kanıt",
        title: "Uzmanlığını belgele",
        body: "Kariyer vizen uzmanlığını belgeler ve iş kapısını açar.",
        href: "/career",
      },
      {
        kicker: "İlan / İş",
        title: "İlan ver veya teklif et",
        body: "Teslim onaylanınca kuruluş dağıtır. Split pasifken kabul ve serbest bırakma 503 döner; cüzdana usta ücreti yatmaz.",
        href: "/freelancer",
      },
    ],
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
      freelancer: "Freelancer odası yüklenemedi. Tekrar dene veya tezgâha dön.",
      dashboard: "Anasayfa yüklenemedi. Tekrar dene veya panele dön.",
    },
  },
  gone: {
    eyebrow: "Kapalı",
    headline: "Bu oda üretimde kapalı.",
    description:
      "Çalışan ürün Akademi, Kariyer ve Freelancer’dır. Bu yüzey donmuş backlog’tur; yeni iş burada açılmaz. Sahte vitrin basılmaz.",
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
