import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: YETKIN_BRAND,
    title: "Beş modüllü birleşik AI işletim sistemi. Tek hesap.",
    description:
      "E-Ticaret OS stok, kanal ve siparişi toplar. YetkinHibe OS firma uygunluğunu ve proje dosyasını hazırlar. AI Tezgâh ücretsiz üretim kotasıyla teslim çıkarır. YetkinCV SHA-256 doğrulaması ve kurumsal ilan elemesi aynı hesapta durur.",
    academyCta: "YetkinHibe İşletim Sistemi",
    /** Kök iniş — zincir bağlantısı. Kahraman birincil düğmesi `primaryCta`. */
    tezgahCta: "AI Tezgâhını Dene",
    /** Kök iniş — birincil eylem: kayıtsız tezgâh. */
    primaryCta: "AI Tezgâhını Ücretsiz Dene (Kayıtsız)",
    /** Kök iniş — ikincil eylem: kayıtsız seviye testi. */
    levelCta: "10 Dakikada Yetkinlik Testine Gir",
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
        href: "/hibe",
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
        title: "YetkinHibe dosyası",
        body: "Firma uygunluğunu ölç. Proje özeti, bütçe ve iş paketini dosyaya dök.",
        href: "/hibe",
      },
      {
        step: "3",
        title: "Doğrulanmış Rozet",
        body: "Sunucu onaylı Doğrulanmış Freelancer Rozetin Kariyer Kartına işlenir.",
      },
      {
        step: "4",
        title: "E-Ticaret ve 30 günlük plan",
        body: "Kariyer planını kur. Açık mağaza canlı vitrinde görünür.",
        href: "/e-ticaret",
      },
    ],
    tracksKicker: "Beş modül",
    tracksTitle: "Tek işletim sistemi",
    tracksCta: "Ücretsiz Seviye Testine Gir",
    tracks: [
      {
        title: "E-Ticaret OS",
        body: "Stok, kanal ve sipariş kokpiti.",
        href: "/e-ticaret",
      },
      {
        title: "YetkinHibe OS",
        body: "Uygunluk analizi ve tam proje dosyası.",
        href: "/hibe",
      },
      {
        title: "AI Tezgâh",
        body: "Ücretsiz üretim kotası ve teslim taslağı.",
        href: "/tezgah",
      },
      {
        title: "YetkinCV & Kariyer",
        body: "SHA-256 doğrulama ve 30 günlük plan.",
        href: "/career",
      },
      {
        title: "Kurumsal İlan & Eleme",
        body: "İlan, ağırlıklı puan ve kısa liste.",
        href: "/kurumsal",
      },
    ],
    faqHeading: "Sık sorulanlar",
  },
  guide: {
    eyebrow: "Rehber",
    title: "Ofiste yapay zekâyı Excel ve e-postada kullan",
    description:
      "Uygulama rehberleri ücretsizdir. Üretim AI Tezgâh’tadır. Rozet, Kariyer kartında doğrulanır.",
    stepsTitle: "Dört adım",
    steps: [
      "AI Tezgâh’ı aç. Excel’de dağınık tabloyu düzenli tabloya çeviren işi kendi cümlenle üret.",
      "Kendi dosyanla dene. Müşteri adı ve telefonu maskelenmeden yapay zekâya yüklenmez.",
      "Çıktıyı Kariyer kartına bağla. Satın alma belge basmaz.",
      "Doğrulama bağı /vize adresindedir ve herkese açıktır; kimlik gösterilmez.",
    ],
    cta: "AI Tezgâhı aç",
    catalogCta: "Kariyer kartını aç",
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
    headline: "Bu sayfa şu an kullanılmıyor.",
    description: "Bu bölüm şu an kapalı. E-Ticaret, YetkinHibe veya Kariyer’den devam edebilirsin.",
    homeCta: "Ana sayfa",
    academyCta: "YetkinHibe",
    careerCta: "Kariyer",
    freelancerCta: "Freelancer",
  },
  notFound: {
    eyebrow: "404",
    title: "Sayfa bulunamadı",
    description: `Bu adres ${YETKIN_BRAND}’de yok. Ana sayfaya dön.`,
    homeCta: "Ana sayfa",
  },
} as const;
