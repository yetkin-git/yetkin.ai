import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: YETKIN_BRAND,
    title: "İşinizi Büyüten Yapay Zeka Araçları. Tek Hesap, Sıfır Karmaşa.",
    description:
      "Dakikalar içinde profesyonel belgeler üretin, e-ticaret stok ve siparişlerinizi tek yerden yönetin, işletmenize uygun hibeleri bulun ve yetkinliğinizi gerçek testlerle kanıtlayın.",
    /** Kapalı Akademi yüzeyi hâlâ bu anahtarı okur; ana sayfa kullanmaz. */
    academyCta: "YetkinHibe İşletim Sistemi",
    /** Kök iniş — zincir / tezgâh bağlantısı. */
    tezgahCta: "Tezgâhı Aç",
    /** Kök iniş — birincil eylem: kayıtsız tezgâh. */
    primaryCta: "Ücretsiz Hemen Dene (Kayıt Gerekmez)",
    /** Kök iniş — ikincil eylem: fiyatlandırma. */
    secondaryCta: "Paketleri İncele",
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
      "Yetkinlik testleri sunucuda puanlanır; sonuç paylaşılabilir",
    ],
    benchKicker: "Tezgâh araçları",
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
        title: "Web Site Analizi",
        body: "Sitenizin SEO, ikna ve dönüşüm performansını analiz eder; hazır çözümler sunar.",
        href: "/tezgah?tool=tetkik",
      },
      {
        id: "dukkan",
        title: "Sektörel Dijital Dükkan",
        body: "Sektöre göre tek sayfalık site kurar, önizler ve html olarak indirirsin.",
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
    chainKicker: "Nasıl başlarsın",
    chainTitle: "Dört adımda işe koyul",
    chain: [
      {
        step: "1",
        title: "Ücretsiz Tezgâh",
        body: "Kayıt olmadan teklif, ürün kartı veya rapor taslağını dakikalar içinde çıkar.",
        href: "/tezgah",
      },
      {
        step: "2",
        title: "Hibe & teşvik",
        body: "Firma profiline göre uygun destekleri gör; proje özetini dosyaya dök.",
        href: "/hibe",
      },
      {
        step: "3",
        title: "Yetkinliğini kanıtla",
        body: "Uygulamalı testle skorunu al; paylaşılabilir Kariyer Kartına işle.",
      },
      {
        step: "4",
        title: "E-ticareti yönet",
        body: "Sipariş, stok ve kârlılığı tek ekranda takip et.",
        href: "/e-ticaret",
      },
    ],
    tracksKicker: "Çözümler",
    tracksTitle: "İhtiyacına göre bir alan seç",
    tracksCta: "Ücretsiz Seviye Testine Gir",
    tracks: [
      {
        title: "AI Tezgâh",
        body: "Teklif, sözleşme, e-posta ve raporlarınızı dakikalar içinde hazırlayın.",
        href: "/tezgah",
        cta: "Tezgâhı Aç",
      },
      {
        title: "E-Ticaret Yönetimi",
        body: "Tüm pazaryeri siparişlerinizi, stoklarınızı ve kârlılığınızı tek ekranda toplayın.",
        href: "/e-ticaret",
        cta: "E-Ticareti İncele",
      },
      {
        title: "Hibe & Teşvik Bulucu",
        body: "İşletmenize uygun KOSGEB, TÜBİTAK ve devlet desteklerini anında görün.",
        href: "/hibe",
        cta: "Hibeleri Gör",
      },
      {
        title: "YetkinCV & İK Eleme",
        body: "Adayların gerçek becerisini uygulamalı testlerle ölçün, doğru ekibi kurun.",
        href: "/career",
        cta: "Kariyer Merkezine Git",
      },
    ],
    faqHeading: "Sık sorulanlar",
  },
  guide: {
    eyebrow: "Rehber",
    title: "Ofiste yapay zekâyı Excel ve e-postada kullan",
    description:
      "Uygulama rehberleri ücretsizdir. Aynı işi saniyeler içinde üretmek için AI Tezgâh’ı dene.",
    stepsTitle: "Dört adım",
    steps: [
      "AI Tezgâh’ı aç. Excel’de dağınık tabloyu düzenli tabloya çeviren işi kendi cümlenle üret.",
      "Kendi dosyanla dene. Müşteri adı ve telefonu maskelenmeden yapay zekâya yüklenmez.",
      "Çıktıyı kaydet veya doğrudan işinde kullan.",
      "Yetkinliğini kanıtlamak istersen Kariyer’de uygulamalı vaka testini çöz.",
    ],
    cta: "AI Tezgâhını Ücretsiz Dene",
    catalogCta: "YetkinCV'yi İncele",
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
