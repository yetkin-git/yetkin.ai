/**
 * Vitrin hukuk metinleri — `/legal` dizin + bağımsız URL'ler.
 * Şirket kimliği SSOT: `LEGAL_ENTITY`. KEP icat edilmez.
 */

import { YETKIN_BRAND } from "@/lib/copy/brand";
import { CHECKOUT_LEGAL_CONSENT_VERSION } from "@/lib/kernel/legal/checkout-consent";

/** Resmi şirket ve iletişim — yasal sayfalar ve /iletisim tek kaynaktan okur. */
export const LEGAL_ENTITY = {
  brandName: "Yetkin AI / yetkin.ai",
  tradeName: "Yapınet Gayrimenkul ve E-Ticaret Limited Şirketi",
  taxOffice: "Akhisar V.D.",
  vkn: "9370683361",
  mersis: "937068336100017",
  address: "İnönü Mah. 157 Sk. No:3/C Akhisar/Manisa",
  supportEmail: "destek@yetkin.ai",
  adminEmail: "yapinet360@gmail.com",
  whatsappDisplay: "0551 675 16 74",
  whatsappE164: "905516751674",
  iban: "TR82 0020 5000 0100 8852 4000 01",
} as const;

/** Kart / künye: «Akhisar V.D. - 9370683361» */
export const LEGAL_ENTITY_VKN =
  `${LEGAL_ENTITY.taxOffice} - ${LEGAL_ENTITY.vkn}` as const;

/** VKN + vergi dairesi + MERSİS — künye ve sözleşme kimliği tek satır. */
export const LEGAL_ENTITY_IDS =
  `VKN: ${LEGAL_ENTITY.vkn} / ${LEGAL_ENTITY.taxOffice}, MERSİS No: ${LEGAL_ENTITY.mersis}` as const;

export const LEGAL_ENTITY_COLOPHON =
  `${LEGAL_ENTITY.tradeName} · ${LEGAL_ENTITY_IDS} · Adres: ${LEGAL_ENTITY.address}` as const;

export const LEGAL_PAGE_TITLE = "Gizlilik ve yasal çerçeve";

/** Yasal sayfa üst çıkışı — doğrudan inişte site dışına back yapılmaz. */
export const LEGAL_HOME_HREF = "/" as const;
export const LEGAL_HOME_CTA = "Anasayfaya Dön" as const;

export const LEGAL_HONESTY_BODY =
  `İşbu platform hizmetleri ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}) tarafından sunulmaktadır. Platform kullanımı 18 yaş ve üzerindeki kullanıcılar içindir.`;

export const LEGAL_UPDATED_LABEL = "Yürürlük: 31 Ağustos 2026";

export const LEGAL_SUPPORT_EMAIL = LEGAL_ENTITY.supportEmail;
export const LEGAL_SUPPORT_MAILTO = `mailto:${LEGAL_SUPPORT_EMAIL}` as const;
export const LEGAL_SUPPORT_LINE_LABEL = "Destek e-posta:" as const;
export const LEGAL_SUPPORT_LINE = `${LEGAL_SUPPORT_LINE_LABEL} ${LEGAL_SUPPORT_EMAIL}` as const;
export const LEGAL_ADMIN_EMAIL = LEGAL_ENTITY.adminEmail;
export const LEGAL_ADMIN_MAILTO = `mailto:${LEGAL_ADMIN_EMAIL}` as const;
export const LEGAL_WHATSAPP_HREF = `https://wa.me/${LEGAL_ENTITY.whatsappE164}` as const;

export const LEGAL_SECTION_TITLES = {
  kvkk: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
  cookies: "Çerez Politikası",
  refund: "İptal ve İade Koşulları",
  distance: "Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi",
  terms: "Platform Kullanım Şartları & Sorumluluk Sınırları",
} as const;

export const LEGAL_SECTION_IDS = {
  kvkk: "kvkk-cerez",
  cookies: "cerez-politikasi",
  refund: "iade-iptal",
  distance: "mesafeli-hizmet",
  terms: "kullanim-sartlari",
} as const;

export const LEGAL_PAGE_SLUGS = {
  gizlilik: "gizlilik",
  cerez: "cerez",
  mesafeli: "mesafeli-satis",
  iade: "iade",
  terms: "kullanim",
} as const;

export type LegalLaunchArticle = {
  id: string;
  heading: string;
  paragraphs: readonly string[];
};

export type LegalLaunchSection = {
  id: (typeof LEGAL_SECTION_IDS)[keyof typeof LEGAL_SECTION_IDS];
  slug: (typeof LEGAL_PAGE_SLUGS)[keyof typeof LEGAL_PAGE_SLUGS];
  href: `/legal/${string}`;
  title: (typeof LEGAL_SECTION_TITLES)[keyof typeof LEGAL_SECTION_TITLES];
  articles: readonly LegalLaunchArticle[];
};

export function legalSectionLead(section: LegalLaunchSection): string {
  return section.articles[0]?.paragraphs[0] ?? section.title;
}

export const LEGAL_LAUNCH_SECTIONS: readonly LegalLaunchSection[] = [
  {
    id: LEGAL_SECTION_IDS.kvkk,
    slug: LEGAL_PAGE_SLUGS.gizlilik,
    href: "/legal/gizlilik",
    title: LEGAL_SECTION_TITLES.kvkk,
    articles: [
      {
        id: "veri-sorumlusu",
        heading: "1. Veri sorumlusu ve kimlik şeffaflığı",
        paragraphs: [
          `Bu aydınlatma, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında sunulur. Veri sorumlusu: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). Tebligat adresi: ${LEGAL_ENTITY.address}.`,
          `Marka adı ${LEGAL_ENTITY.brandName}’dir. KVKK m.11 talepleri ve destek, kayıtlı hesap e-postası ile ${LEGAL_SUPPORT_EMAIL} üzerinden yürür. WhatsApp destek: ${LEGAL_ENTITY.whatsappDisplay}.`,
        ],
      },
      {
        id: "gizlilik-politikasi",
        heading: "2. Gizlilik politikası — Ne toplanır, ne toplanmaz?",
        paragraphs: [
          "İşlenen başlıca veriler: Hesap e-postası, görünen ad, oturum çerezleri, bakiye bilgisi, değiştirilemez hesap hareketleri (işlem tutarları ve para birimi), emanet kilit kayıtları, freelancer ilan/teklif/sözleşme metinleri, akademi sınav oturumu/cevapları ve dijital olarak doğrulanabilir sertifika kodlarıdır.",
          "Sitemizde kişiselleştirilmiş reklam takibi, çerez tabanlı yeniden hedefleme (retargeting) veya üçüncü taraf analitik izleme kodları bulunmamaktadır. Kredi kartı numaranız platform sunucularımızda asla tutulmaz; kart tahsilatları Yetkili Ödeme Kuruluşu altyapısı üzerinden güvenle yürütülür.",
        ],
      },
      {
        id: "amac-hukuki-sebep",
        heading: "3. Veriler neden işlenir?",
        paragraphs: [
          "Verilerinizi şu amaçlarla işleriz: hesap açmak, satın aldığınız dijital içeriği sunmak, freelancer aracılığını yürütmek, akademi sınavını değerlendirmek, sertifika doğrulamasını sağlamak ve güvenliği (sahtecilik, mükerrer ödeme, oturum) korumak.",
          "Hukuki sebepler: sözleşmenin yerine getirilmesi (satın alma, emanet, sınav), meşru menfaat (oturum ve sahtecilik önleme) ve kanuni yükümlülüktür. Pazarlama izni alınmaz; pazarlama e-postası gönderilmez.",
        ],
      },
      {
        id: "aktarim",
        heading: "4. Veriler kimlerle paylaşılır?",
        paragraphs: [
          "Hesap ve verileriniz, kimlik doğrulama ve veritabanı hizmetleri sağlayan bulut altyapısında tutulur. Sunucuların bulunduğu ülke, ilgili hizmet sağlayıcısının kayıtlarında yer alır; bu metinde uydurma bir konum yazılmaz.",
          "Kart ödemesinde Yetkili Ödeme Kuruluşuna e-posta adresiniz, bağlantı IP’niz, sipariş numarası ve sepet tutarı iletilir. Freelancer iş bedeli, pazaryeri altyapısı bağlıysa Lisanslı Ödeme Hizmet Sağlayıcısında kilitlenir; bağlı değilse işlem kabul edilmez, para ve veri kaydı oluşmaz.",
          "Hesap bildirimleri e-posta ile gönderilebilir. E-posta altyapısı yoksa bildirim atlanır; ödeme işleminiz durmaz. Üçüncü taraf pazarlama e-posta hizmeti kullanılmaz.",
        ],
      },
      {
        id: "cerez",
        heading: "5. Çerez politikası",
        paragraphs: [
          "Oturumunuzu açık tutmak için zorunlu kimlik çerezleri kullanılır. Sitemizde reklam, yeniden hedefleme veya üçüncü taraf analitik izleme kodu bulunmamaktadır.",
          "Kart ödemesinde Yetkili Ödeme Kuruluşu kendi sayfasını açabilir; o çerezler sağlayıcının politikasına tabidir. Zorunlu oturum çerezi olmadan hesabınıza giriş yapılamaz. Pazarlama çerezi kullanılmadığı için bu konuda ayrı bir izin istenmez.",
          `Çerez ve gizlilik talepleriniz ${LEGAL_SUPPORT_EMAIL} üzerinden alınır.`,
        ],
      },
      {
        id: "saklama-haklar",
        heading: "6. Saklama ve haklarınız",
        paragraphs: [
          "Hesap hareketleri sonradan değiştirilemez; bakiyeniz bu kayıtlardan hesaplanır. Akademi sınavı sunucuda değerlendirilir. Herkese açık sertifika doğrulama sayfası kişisel bilgi (ad, e-posta) göstermez; yalnız dijital olarak doğrulanabilir sertifika kodu kontrol edilir.",
          `6698 sayılı Kanun’un 11. maddesindeki haklarınız (erişim, düzeltme, silme, itiraz) ${LEGAL_SUPPORT_EMAIL} ve hesap içi bildirim kanalından kullanılır.`,
        ],
      },
    ],
  },
  {
    id: LEGAL_SECTION_IDS.cookies,
    slug: LEGAL_PAGE_SLUGS.cerez,
    href: "/legal/cerez",
    title: LEGAL_SECTION_TITLES.cookies,
    articles: [
      {
        id: "zorunlu-cerez",
        heading: "1. Hangi çerezler kullanılır?",
        paragraphs: [
          `Bu çerez politikası ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}) tarafından sunulan ${LEGAL_ENTITY.brandName} platformu içindir. Tebligat adresi: ${LEGAL_ENTITY.address}.`,
          "Oturumunuzu açık tutmak için zorunlu kimlik çerezleri kullanılır. Sitemizde reklam, yeniden hedefleme veya üçüncü taraf analitik izleme kodu bulunmamaktadır.",
        ],
      },
      {
        id: "odeme-cerez",
        heading: "2. Ödeme sayfası çerezleri",
        paragraphs: [
          "Kart ödemesinde Yetkili Ödeme Kuruluşu kendi sayfasını açabilir; o çerezler sağlayıcının politikasına tabidir. Zorunlu oturum çerezi olmadan hesabınıza giriş yapılamaz. Pazarlama çerezi kullanılmadığı için bu konuda ayrı bir izin istenmez.",
        ],
      },
      {
        id: "cerez-talep",
        heading: "3. Talepler",
        paragraphs: [
          `Çerez ve gizlilik talepleriniz ${LEGAL_SUPPORT_EMAIL} üzerinden alınır.`,
        ],
      },
    ],
  },
  {
    id: LEGAL_SECTION_IDS.refund,
    slug: LEGAL_PAGE_SLUGS.iade,
    href: "/legal/iade",
    title: LEGAL_SECTION_TITLES.refund,
    articles: [
      {
        id: "akademi-cayma",
        heading: "1. Akademi dijital içerik — cayma istisnası",
        paragraphs: [
          "Akademi kursu, elektronik ortamda ifa edilen dijital içerik / dijital hizmettir. Cüzdandan ödeme tahsil edilip derse erişim açıldığı anda hizmet ifası başlamış sayılır. Lisans 365 gündür. Sertifika satın alma ile basılmaz; 30 dakikalık sunucu sınavı ve baraj 70 şarttır.",
          "6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca, elektronik ortamda anında ifa edilen hizmetler ile maddi ortamda sunulmayan dijital içeriğe ilişkin sözleşmelerde, ifanın tüketicinin açık rızası ile başlaması halinde cayma hakkı istisna kapsamındadır. Kasa tikleri bu rızadır. Erişim açıldıktan sonra bedel iade edilmez; çifte iade yoktur.",
        ],
      },
      {
        id: "cuzdan-yukleme",
        heading: "2. Cüzdan / bakiye yükleme",
        paragraphs: [
          "Platform cüzdanına yüklenen bakiyeler yalnızca platform içi hizmetlerde kullanılabilir; farklı bir banka hesabına nakit transferi yapılamaz. Kullanılmamış bakiye otomatik olarak karta dönmez; nakit çekim bu gövdede yoktur. İade talepleri destek kanalından alınır ve henüz harcanmamış yükleme, ödeme kuruluşu takası ile operatör tarafından değerlendirilir.",
          "Kart ile yapılan yüklemeler platform cüzdanına ön ödeme mahiyetindedir. Ödeme dökümünde işlem 'Cüzdan Yükleme' olarak yer alır. Bakiye yükleme işlemi ders erişimini doğrudan açmaz; eğitimin cüzdan bakiyesiyle ayrıca satın alınması gerekir.",
          "Kullanılmamış bakiye kendiliğinden karta dönmez. Ödeme sağlayıcısı iadesi yalnız henüz harcanmamış yükleme ve sağlayıcı/operatör takası ile yürür; valör bankaya bağlıdır.",
        ],
      },
      {
        id: "emanet",
        heading: "3. Freelancer emanet",
        paragraphs: [
          "Emanet: teklif kabulünde brüt tutar Yetkili Ödeme Kuruluşunda kilit kaydına bağlanır; platform cüzdanına bakiye yükleme / tahsilat işlemi yazılmaz. Pazaryeri altyapısı bağlı değilse işlem kabul edilmez. İş onaylanıp serbest bırakılmadan önce iade, kuruluş üzerinden alıcıya döner; freelancer ve platform payı yazılmaz.",
          "Serbest bırakılmış kilit aynı yoldan iade edilmez. Anlaşmazlık açıkken iade kapalıdır. Bekleyen kilit, 14 günlük süre dolunca iade edilebilir. Bu 14 gün, dijital içerik cayma süresi değildir; emanet zaman aşımıdır.",
        ],
      },
      {
        id: "split-ve-pay",
        heading: "4. Platform payı ve paylaştırmalı tahsilat",
        paragraphs: [
          "Freelancer iş bedeli Yetkili Ödeme Kuruluşunun paylaştırmalı tahsilat modeline tabidir. Ana para usta IBAN’ına, komisyon platforma kuruluş tarafından dağıtılır. Platform payı yalnız serbest bırakmada doğar; iade edilen emanette platform payı doğmaz.",
          `${YETKIN_BRAND} bir ödeme veya finans kuruluşu değildir. Freelancer hakedişleri platform bünyesinde bakiye olarak tutulmaz; iş teslimi onaylandığında ödeme, Lisanslı Ödeme Hizmet Sağlayıcısı altyapısı üzerinden doğrudan freelancer'ın banka hesabına (IBAN) aktarılır.`,
        ],
      },
      {
        id: "iade-iletisim",
        heading: "5. İletişim",
        paragraphs: [
          `Sağlayıcı künye: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). İptal, iade ve ödeme itirazları ${LEGAL_SUPPORT_EMAIL}, WhatsApp (${LEGAL_ENTITY.whatsappDisplay}) ve /iletisim üzerinden yürür. Kart tahsilatı itirazı Yetkili Ödeme Kuruluşunun kendi kanalı ile birlikte okunur. Tebligat adresi: ${LEGAL_ENTITY.address}.`,
        ],
      },
    ],
  },
  {
    id: LEGAL_SECTION_IDS.distance,
    slug: LEGAL_PAGE_SLUGS.mesafeli,
    href: "/legal/mesafeli-satis",
    title: LEGAL_SECTION_TITLES.distance,
    articles: [
      {
        id: "on-bilgilendirme",
        heading: "A. Ön Bilgilendirme Formu",
        paragraphs: [
          `Satıcı / sağlayıcı: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}), marka: ${LEGAL_ENTITY.brandName}. Adres: ${LEGAL_ENTITY.address}. Destek: ${LEGAL_SUPPORT_EMAIL}, WhatsApp ${LEGAL_ENTITY.whatsappDisplay} ve /iletisim. Platform kullanımı 18 yaş ve üzeri içindir.`,
          "Hizmetin niteliği: (1) Akademi — dijital eğitim içeriği (metin, diyagram, varsa ses/video), 365 gün lisans, sunucu sınavı, baraj 70, dijital sertifika kodu. Satın alma belge basmaz. (2) Freelancer — işveren ile usta arasında aracılık; iş ürününün tarafı platform değildir. (3) Kariyer — mühürden türetilen vize projeksiyonu; ücretli ilan tahtası değildir.",
          "Ödeme işlemleri Yetkili Ödeme Kuruluşu altyapısı üzerinden güvenle gerçekleştirilir. Kart tahsilatları ve cüzdan bakiyeleri Türk Lirası (TL) cinsinden işlenir. Kurs bedelleri kataloğumuzda ilan edilen güncel fiyatlar üzerinden tahsil edilir.",
          "İfa: Akademide bakiye yükleme / tahsilat işlemi tamamlandığında ders gövdesi açılır. Bu, 6502 sayılı Kanun uyarınca elektronik ortamda anında ifa edilen hizmet / maddi ortamda sunulmayan dijital içeriktir. Teslimat adresi veya kargo yoktur. Freelancer’da ifa, tarafların teslim ve onayına bağlıdır; emanet Yetkili Ödeme Kuruluşundadır.",
          "Cayma: Ön bilgi ve mesafeli sözleşme kasa tikleriyle kabul edilir. Akademi erişimi açılınca cayma hakkı istisna kapsamındadır (aşağıda B.5). Kullanılmamış cüzdan bakiyesi otomatik karta dönmez. Emanet iadesi serbest bırakmadan önceki emanet kurallarına tabidir.",
        ],
      },
      {
        id: "mesafeli-sozlesme",
        heading: "B. Mesafeli Satış Sözleşmesi",
        paragraphs: [
          `Satıcı künye: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). Adres: ${LEGAL_ENTITY.address}. Bu sözleşme, 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği çerçevesinde dijital hizmet / dijital içerik ifasını anlatır. ${YETKIN_BRAND}, freelancer işinde aracı platformdur; iş ürününün tarafı freelancer ve müşteridir. Akademide ifa elektronik teslimdir.`,
          `Sözleşme, tüketicinin kasa veya cüzdan yükleme ekranında Mesafeli Satış Sözleşmesi ile Ön Bilgilendirme Formunu kabul etmesi ve dijital içeriğin anında ifa edileceğine açık rıza vermesiyle kurulur. Rıza, ödeme isteğinde ${CHECKOUT_LEGAL_CONSENT_VERSION} sürümü ile doğrulanır. Tik yoksa tahsilat ve bakiye yükleme / tahsilat işlemi durur.`,
        ],
      },
      {
        id: "dijital-ifa-istisnasi",
        heading: "B.5 Dijital içerik — anında ifa ve cayma istisnası",
        paragraphs: [
          "Akademi kurslarında ödeme (bakiye yükleme / tahsilat işlemi) yapılıp ders içeriklerine erişim açıldığı anda ifa başlamış olur. 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği’nin «elektronik ortamda anında ifa edilen hizmetler» ile maddi ortamda sunulmayan dijital içeriğe ilişkin istisnası bu anda işler.",
          "Tüketici, kasa tikinde «Dijital içeriğin anında ifa edileceğini kabul ediyorum» ifadesiyle ifanın derhal başlayacağını ve bu durumda cayma hakkının istisna kapsamında sona ereceğini kabul eder. İfa başlamadan önce tik verilmezse satın alma ve kart yükleme isteği reddedilir.",
          "Cüzdan yükleme tek başına ders açmaz; yüklenen bakiye platformun dijital hizmetleri içindir. Akademi tahsilat işlemi ile erişim açılınca istisna işler. 14 günlük yasal cayma süresi, emanet süresi ve dijital ifa istisnası ile birlikte okunur — çifte iade yoktur.",
        ],
      },
      {
        id: "bedel-fatura",
        heading: "B.6 Bedel, fatura, süre",
        paragraphs: [
          "Akademi listesi KDV dahildir; kasada «+KDV» eklenmez. Fiyat kilidi 15 dakikadır. Lisans, bakiye yükleme / tahsilat işleminin tamamlandığı andan itibaren 365 gündür. Süresi biten lisans ders gövdesini kapatır; satın alma kaydı durur.",
          "Satın alınan hizmet ve eğitimlere ait faturalar yasal süreçlere uygun düzenlenir. Fatura, kayıtlı e-posta adresine iletilir; bu iletim otomatik e-Arşiv paneli veya anında GİB gönderimi anlamına gelmez. İlan edilen tüm fiyatlara KDV dahildir.",
        ],
      },
    ],
  },
  {
    id: LEGAL_SECTION_IDS.terms,
    slug: LEGAL_PAGE_SLUGS.terms,
    href: "/legal/kullanim",
    title: LEGAL_SECTION_TITLES.terms,
    articles: [
      {
        id: "kapsam",
        heading: "1. Kapsam ve odalar",
        paragraphs: [
          "Platform dört çalışan oda (Anasayfa, Akademi, Kariyer, Freelancer) ile çalışır. Diskte duran diğer odalar pazarlanmaz. İkinci nakit yazıcı, platform cüzdanından banka çekimi, GİB canlı fatura ve müze yolları bu gövdede yoktur.",
          "Vatandaş hesap e-posta ve şifre ile açılır; oturum çerezi kimlik ipucudur, para işlemi sunucuda JWT ile bağlanır. Native mağaza (IAP) akademi satmaz.",
        ],
      },
      {
        id: "freelancer-sorumluluk",
        heading: "2. Freelancer aracılığı ve sorumluluk",
        paragraphs: [
          `Freelancer mutlu yol ilan → emanet kaydı → teslim onayıdır. İş bedeli Yetkili Ödeme Kuruluşunda paylaştırmalı tahsilat ile dağılır; ${YETKIN_BRAND} ödeme kuruluşu değildir. Kabul anında platform cüzdanına bakiye yükleme / tahsilat işlemi yazılmaz. Platform, işin niteliğini, süresini veya sonucunu garanti etmez.`,
          "Azami sorumluluk, ilgili iş bedelinin net tutarı ve defter kaydı ile sınırlıdır; dolaylı, kâr kaybı veya manevi tazminat talep edilemez. Tahkim açıkken serbest bırakma ve iade kapanır. Paylaştırmalı tahsilat bağlı değilken işlem kabul edilmez; sahte kazanç yazılmaz.",
        ],
      },
      {
        id: "yasak-yas",
        heading: "3. Yasaklar ve yaş",
        paragraphs: [
          "Yasak: yasa dışı iş, reşit olmayanların kullanımı, sahte kimlik, ödeme sistemini dolanma. Platform hizmetleri 18 yaş ve üzeri içindir.",
          "Metin değişiklikleri durumunda yürürlük tarihi bu sayfada güncellenir. İşbu şartlar platform kullanımına ilişkin genel kuralları kapsar.",
        ],
      },
      {
        id: "sart-iletisim",
        heading: "4. İletişim",
        paragraphs: [
          `Platform destek ve şikayet kanalı ${LEGAL_SUPPORT_EMAIL}, WhatsApp ${LEGAL_ENTITY.whatsappDisplay} ve /iletisim’dir. Ticari unvan: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). Adres: ${LEGAL_ENTITY.address}.`,
        ],
      },
    ],
  },
];

export function legalSectionBySlug(slug: string): LegalLaunchSection | undefined {
  return LEGAL_LAUNCH_SECTIONS.find((section) => section.slug === slug);
}

export const LEGAL_CONTACT_HREF = "/iletisim" as const;

/** Vitrin şeridi — tam hukuki başlık `title`, tek satır etiket `label`. */
export const LEGAL_FOOTER_LABELS = {
  gizlilik: "Gizlilik",
  cerez: "Çerez",
  iade: "İade",
  "mesafeli-satis": "Mesafeli satış",
  kullanim: "Kullanım şartları",
  iletisim: "İletişim",
  destek: LEGAL_SUPPORT_EMAIL,
} as const;

export const LEGAL_FOOTER_LINKS = [
  ...LEGAL_LAUNCH_SECTIONS.map((section) => ({
    href: section.href,
    title: section.title,
    label: LEGAL_FOOTER_LABELS[section.slug],
  })),
  { href: LEGAL_CONTACT_HREF, title: LEGAL_FOOTER_LABELS.iletisim, label: LEGAL_FOOTER_LABELS.iletisim },
  {
    href: LEGAL_SUPPORT_MAILTO,
    title: LEGAL_SUPPORT_LINE,
    label: LEGAL_FOOTER_LABELS.destek,
  },
] as const;

export const LEGAL_SITE_PATHS = LEGAL_FOOTER_LINKS.map((link) => link.href).filter((href) =>
  href.startsWith("/"),
);

export const LEGAL_CHECKOUT_CONSENT_COPY = {
  distanceLabel: "Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formunu okudum, kabul ediyorum.",
  digitalLabel: "Dijital içeriğin anında ifa edileceğini kabul ediyorum.",
  distanceHref: "/legal/mesafeli-satis",
  preInfoHref: "/legal/mesafeli-satis#on-bilgilendirme",
  digitalHref: "/legal/mesafeli-satis#dijital-ifa-istisnasi",
  required: "Mesafeli Satış Sözleşmesi, Ön Bilgilendirme Formu ve dijital içeriğin anında ifası için açık rıza zorunludur.",
  walletHint:
    "Yüklenen bakiye platformun dijital hizmetleri içindir. Akademi kursu alınır ve ders erişimi açılır açılmaz ifa başlar; cayma hakkı 6502 istisnasına tabidir.",
} as const;
