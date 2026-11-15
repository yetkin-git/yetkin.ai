import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: YETKIN_BRAND,
    title: "Yetkinliğini Mühürle. Yapay Zekâ Tezgâhıyla Üret. Rozet, Plan ve Canlı Vitrin.",
    description:
      "E-ticaret, sosyal medya, otomasyon ve ofis süreçlerinde uzmanlığını kanıtla. Yapay zekâ tezgâhında teslimat üret, sunucu onaylı Doğrulanmış Rozetini kazan, 30 günlük kariyer planını kur ve canlı mağaza vitrinini aç.",
    academyCta: "Uzmanlık Paketlerini İncele",
    /** Kök iniş — ikincil eylem: canlı üretim tezgâhı. */
    tezgahCta: "AI Tezgâhını Dene",
    /** Kök iniş — birincil eylem: ücretsiz seviye testi. */
    primaryCta: "Ücretsiz Yetkinlik Testine Gir",
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
    benchKicker: "Tezgâh vitrini",
    benchTitle: "Yedi araç, bugün teslim",
    bench: [
      {
        id: "ecommerce",
        title: "E-Ticaret Ürün Kartı",
        body: "Başlık, madde işaretli açıklama ve soru yanıtını tek kartta üretirsin.",
        href: "/tezgah?tool=ecommerce",
      },
      {
        id: "proposal",
        title: "Müşteri Teklif Yazıcı",
        body: "İhtiyaç metninden kapsam ve teslim adımlarını teklif taslağına dökersin.",
        href: "/tezgah?tool=proposal",
      },
      {
        id: "tetkik",
        title: "Web Sitesi Tetkik",
        body: "Ana sayfadan dijital sağlık skoru ve yazdırılabilir rapor çıkarırsın.",
        href: "/tezgah?tool=tetkik",
      },
      {
        id: "dukkan",
        title: "Sektörel Dijital Dükkan",
        body: "Sektöre göre tek sayfalık vitrin kurar, önizler ve html olarak indirirsin.",
        href: "/tezgah?tool=dukkan",
      },
      {
        id: "pazaryeri",
        title: "Pazaryeri Katalog Fabrikası",
        body: "Ürün bloklarından tablo ve csv katalog çıkarırsın.",
        href: "/tezgah?tool=pazaryeri",
      },
      {
        id: "reklam",
        title: "Otonom Reklam Paketi",
        body: "Üç kanca, arama metni ve görsel brifini tek pakette alırsın.",
        href: "/tezgah?tool=reklam",
      },
      {
        id: "grant",
        title: "Hibe Proje Dosyası",
        body: "İl ve yatırım odağından yazdırılabilir proje taslağı kurarsın.",
        href: "/tezgah?tool=grant",
      },
    ],
    chainKicker: "Değer zinciri",
    chainTitle: "Dört adımda sistem",
    chain: [
      {
        step: "1",
        title: "Ücretsiz Test & Tezgâh",
        body: "Seviyeni ölç. Hazır şablonlarla teslimat taslağını kur.",
        href: "/tezgah",
      },
      {
        step: "2",
        title: "Uygulamalı Uzmanlık & Sınav",
        body: "Seçtiğin alanda dersi bitir, barajı 70 ve üzeri ile geç.",
      },
      {
        step: "3",
        title: "Doğrulanmış Rozet",
        body: "Sunucu onaylı Doğrulanmış Freelancer Rozetin Kariyer Kartına işlenir.",
      },
      {
        step: "4",
        title: "30 Günlük Plan ve Canlı Vitrin",
        body: "Kariyer planını kur. Açık mağaza canlı vitrinde görünür.",
      },
    ],
    tracksKicker: "Beş uzmanlık",
    tracksTitle: "Hangi işi üretiyorsan, o rozet",
    tracksCta: "Ücretsiz Seviye Testine Gir",
    tracks: [
      {
        title: "Ofis & Veri AI",
        body: "Excel, e-posta ve yönetim özetini kısa talimatla toparlarsın.",
        href: "/academy/01_office_ai",
      },
      {
        title: "E-Ticaret AI",
        body: "Ürün kartı ve mağaza metnini satışa hazır üretirsin.",
        href: "/academy/02_ecommerce_ai",
      },
      {
        title: "Sosyal Medya AI",
        body: "İçerik takvimi ve paylaşım metnini düzene bağlarsın.",
        href: "/academy/03_social_media_ai",
      },
      {
        title: "Kodsuz Chatbot & Otomasyon",
        body: "Sohbet akışı ve otomasyon taslağını kurarsın.",
        href: "/academy/04_chatbot_nocode",
      },
      {
        title: "Prompt Mühendisliği",
        body: "Tekrarlanabilir talimat ve teslim şablonu yazarsın.",
        href: "/academy/05_prompt_practice",
      },
    ],
    faqHeading: "Sık sorulanlar",
  },
  guide: {
    eyebrow: "Rehber",
    title: "Ofiste yapay zekâyı Excel ve e-postada kullan",
    description:
      "İlk ders ücretsizdir ve kayıt istemez. Aşağıdaki sıra, ofis işinde kısa bir talimatın nasıl kurulduğunu gösterir. Sertifika, testi geçince doğar.",
    stepsTitle: "Dört adım",
    steps: [
      "Ücretsiz dersi aç. Excel’de dağınık tabloyu düzenli tabloya çeviren ilk konu kayıt duvarının önündedir.",
      "Kendi dosyanla dene. Müşteri adı ve telefonu maskelenmeden yapay zekâya yüklenmez.",
      "Testi 70 ve üzeri ile geç. Satın alma belge basmaz.",
      "Sertifika Doğrulanmış Freelancer Rozetine işlenir. Doğrulama bağı herkese açıktır; kimlik gösterilmez.",
    ],
    cta: "Ücretsiz dersi aç",
    catalogCta: "Eğitim kataloğu",
    faqHeading: "Rehber soruları",
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
