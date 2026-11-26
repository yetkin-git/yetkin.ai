import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — kamu yüzeyi (iniş, hata, 404). Müze sen-voice kopyalanmaz. */
export const PUBLIC_SEN = {
  home: {
    badge: YETKIN_BRAND,
    /**
     * SEO-03 + M-01: H1/meta başlığı.
     *
     * Önce "İşini Büyüten… Tek Hesap, Sıfır Karmaşa." (74 karakterdi) hem "siz"
     * aksında başlıyordu hem SERP'te `%s · yetkin.ai` şablonuyla ~86 karaktere
     * çıkıp kırpılıyordu. Yeni başlık sen aksında ve şablonla birlikte ~45
     * karakter — Google başlık sınırının (≈60) rahatça içinde.
     */
    title: "İşini Büyüten Yapay Zeka Araçları",
    description:
      "Dakikalar içinde profesyonel belgeler üret, e-ticaret stok ve siparişlerini tek yerden yönet, işletmene uygun hibeleri bul ve yetkinliğini gerçek testlerle kanıtla.",
    /** Kapalı Akademi yüzeyi hâlâ bu anahtarı okur; ana sayfa kullanmaz. */
    academyCta: "YetkinHibe İşletim Sistemi",
    /** Kök iniş — zincir / tezgâh bağlantısı. */
    tezgahCta: "Tezgâhı Aç",
    /** Kök iniş — birincil eylem: kayıtsız tezgâh. */
    primaryCta: "Ücretsiz Hemen Dene (Kayıt Gerekmez)",
    /** Kök iniş — ikincil eylem: fiyatlandırma. */
    secondaryCta: "Paketleri İncele",
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
        // CRO: oturumsuz ziyaretçiyi korumalı `/hibe` duvarına değil, ana sayfadaki
        // ücretsiz uygunluk testine (`#home-grant`) indir. Kayıt, dosya aşamasında istenir.
        href: "#home-grant",
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
        // CRO: ücretsiz uygunluk testi — `/hibe` korumalıdır, önce skor gösterilir.
        href: "#home-grant",
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
        // CRO: `/e-ticaret` kamu vitrinidir; kayıt istemez. Kokpit `/panel/e-ticaret`
        // korumalıdır ve kayıt/giriş yoluyla açılır (`buildCitizenRegisterHref`).
        href: "/e-ticaret",
      },
    ],
    tracksKicker: "Çözümler",
    tracksTitle: "İhtiyacına göre bir alan seç",
    tracks: [
      {
        title: "AI Tezgâh",
        body: "Teklif, sözleşme, e-posta ve raporlarını dakikalar içinde hazırla.",
        href: "/tezgah",
        cta: "Tezgâhı Aç",
      },
      {
        title: "E-Ticaret Yönetimi",
        body: "Tüm pazaryeri siparişlerini, stoklarını ve kârlılığını tek ekranda topla.",
        href: "/e-ticaret",
        cta: "E-Ticareti İncele",
      },
      {
        title: "Hibe & Teşvik Bulucu",
        body: "İşletmene uygun KOSGEB, TÜBİTAK ve devlet desteklerini anında gör.",
        // CRO: korumalı `/hibe` yerine ücretsiz uygunluk testi.
        href: "#home-grant",
        cta: "Ücretsiz Uygunluk Testi",
      },
      {
        title: "YetkinCV & İK Eleme",
        body: "Adayların gerçek becerisini uygulamalı testlerle ölç, doğru ekibi kur.",
        href: "/career",
        cta: "Kariyer Merkezine Git",
      },
    ],
    faqHeading: "Sık sorulanlar",
    /**
     * SEO Tedavi (Faz 2): `/sozluk` ve `/tetkik` site haritasında 0.8 öncelikle
     * duruyordu ama siteden **0 iç bağlantı** alıyordu (yetim sayfa). Bu bölüm
     * yasal footer'dan bağımsız, semantik bir keşif şerididir; footer'dan bir
     * satır çıksa da bağlar durur.
     */
    resourcesKicker: "Kaynaklar",
    resourcesTitle: "Kaynaklar ve ücretsiz araçlar",
    resourcesLead: "Kayıt istemeyen keşif yüzeyleri. Hepsi ücretsiz, hepsi tek tıkla açılır.",
    resources: [
      {
        title: "Sözlük",
        body: "Yapay zekâ ve dijital ticaretin 30 terimi, her biri AI Tezgâh uygulama örneğiyle.",
        href: "/sozluk",
        cta: "Sözlüğü aç",
      },
      {
        title: "Web Site Analizi",
        body: "Sitenin SEO, ikna ve dönüşüm karnesini ölç; eksikleri hazır çözümlerle gör.",
        href: "/tetkik",
        cta: "Analizi aç",
      },
      {
        title: "Rehber",
        body: "Adım adım uygulama rehberleri: ürün açıklaması, içerik planı, teklif akışı.",
        href: "/rehber",
        cta: "Rehbere git",
      },
      {
        title: "Yetenek Vitrini",
        body: "YetkinCV mührü kazanmış yeteneklerin kamu doğrulama dizini. Freelancer pazarı değildir.",
        href: "/career/vitrin",
        cta: "Vitrini aç",
      },
    ],
  },
  error: {
    eyebrow: YETKIN_BRAND,
    title: "Bir şeyler ters gitti",
    description: "Sayfa yüklenemedi. Tekrar dene veya ana sayfaya dön.",
    retry: "Tekrar dene",
    panelRetry: "Yeniden Dene",
    panelBack: "Panele Dön",
    homeCta: "Ana sayfa",
    codeLabel: "Kod:",
    rooms: {
      academy: "Akademi odası yüklenemedi. Tekrar dene veya kataloga dön.",
      career: "Kariyer sayfası yüklenemedi. Tekrar dene veya Kariyer'e dön.",
      freelancer: "Freelancer odası yüklenemedi. Tekrar dene veya Freelancer İlan Panosu'na dön.",
      dashboard: "Anasayfa yüklenemedi. Tekrar dene veya anasayfaya dön.",
      fiyatlandirma: "Fiyatlar yüklenemedi. Yeniden dene veya panele dön.",
      kasa: "Ödeme sayfası yüklenemedi. Yeniden dene veya panele dön.",
      cuzdan: "Cüzdan yüklenemedi. Yeniden dene veya panele dön.",
      tezgah: "Tezgâh yüklenemedi. Yeniden dene veya panele dön.",
      junior: "Junior odası yüklenemedi. Yeniden dene veya panele dön.",
      eticaret: "E-Ticaret kokpiti yüklenemedi. Yeniden dene veya panele dön.",
      magazam: "Mağaza sayfası yüklenemedi. Yeniden dene veya panele dön.",
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
