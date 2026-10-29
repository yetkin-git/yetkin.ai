import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: YETKIN_BRAND,
    title: "Yapay Zekâyı Öğren. Gerçek İşlerinde Kullan.",
    description:
      "E-ticaret, sosyal medya ve ofis işlerinde yapay zekâ araçlarını uygulamalı eğitimlerle öğren. Her eğitimin ilk dersini ücretsiz izle, içeriği gör ve sana uygun olanı seç.",
    academyCta: "Eğitimleri İncele",
    /** Kök iniş — birincil eylem: kayıtsız ücretsiz ders (AI asistanı da açık). */
    freeLessonCta: "Ücretsiz Dersi İzle",
    loginCta: "Giriş Yap",
    registerCta: "Kayıt Ol",
    cockpitCta: "Panele geç",
    trustEyebrow: `Neden ${YETKIN_BRAND}?`,
    trustTitle: "Güven taahhüdü",
    trust: [
      "Kimliğin güvenli oturumla korunur",
      "PayTR iFrame + 3D Secure. Kart numarası platformda tutulmaz",
      "Sınav ve mühür sunucuda doğrulanır; ikna yerine kanıt",
    ],
    cinemaKicker: "Yapay zeka eğitimi · online kurs",
    cinemaTitle: "İlk dersi ücretsiz izle",
    cinemaHint:
      "E-ticaret, sosyal medya ve ofis işinde yapay zekâ araçlarını uygulamalı eğitimle öğrenirsin. İçeriği gör, sana uygun olanı seç.",
    roomsKicker: "İş sonucu",
    hero: {
      kicker: "Akademi",
      title: "İlk dersi ücretsiz izle, sonra işine uygun olanı seç",
      body: "E-ticaret, sosyal medya ve ofis işlerinde yapay zekâ araçlarını uygulamalı eğitimle öğrenirsin. İçeriği gör, sana uygun olanı seç.",
      href: "/academy",
    },
    faqHeading: "Sık sorulanlar",
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
      dashboard: "Anasayfa yüklenemedi. Tekrar dene veya anasayfaya dön.",
    },
  },
  gone: {
    eyebrow: "Kapalı",
    headline: "Bu oda üretimde kapalı.",
    description:
      "Çalışan ürün Akademi’dir. Kariyer belge vitrinidir. Bu yüzey donmuş backlog’tur; yeni iş burada açılmaz. Sahte vitrin basılmaz.",
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
