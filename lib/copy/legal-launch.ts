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
  whatsappDisplay: "0551 675 16 74",
  whatsappE164: "905516751674",
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
export const LEGAL_HOME_CTA = "Ana Sayfaya Dön" as const;

/**
 * Yetişkin hesap 18+ beyanıdır. Junior, ayrı çocuk üyeliği değildir:
 * veli hesabının altındaki profil, veli aydınlatması onaylanmadan açılmaz.
 */
export const LEGAL_AGE_POLICY_BODY =
  "Yetişkin hesap, kayıt sırasında 18 yaşından büyük olma beyanı ile açılır. Çocuk ayrı üye olmaz ve ayrı giriş almaz. Junior bölümü, veli hesabının altında bir çocuk profili olarak ve velinin açık aydınlatma onayıyla kullanılabilir. Bu istisna dışında platform hizmetleri 18 yaş ve üzerindeki kullanıcılar içindir.";

export const LEGAL_HONESTY_BODY =
  `İşbu platform hizmetleri ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}) tarafından sunulmaktadır. ${LEGAL_AGE_POLICY_BODY}`;

/**
 * Faaliyet konusu şeffaflığı — sicil unvanı «gayrimenkul ve e-ticaret» taşır;
 * platform ise AI tabanlı iş ve operasyon işletim hizmeti sunar. NACE / unvan-faaliyet
 * uyumsuzluğu riski, uydurma unvan icat etmek yerine dürüst anlatımla bertaraf
 * edilir. /iletisim kartı ve yasal metinler tek kaynaktan okur.
 */
export const LEGAL_ACTIVITY_SCOPE_BODY =
  `${LEGAL_ENTITY.brandName}, ${LEGAL_ENTITY.tradeName} bünyesinde KOBİ'ler, girişimciler, danışmanlar ve kurumsal şirketler için yürütülen AI tabanlı iş ve operasyon işletim platformudur. Sunulan hizmetler E-Ticaret OS, YetkinHibe OS, AI Tezgâh, YetkinCV ve kurumsal ilan ile eleme modülleridir.`;

/**
 * Cüzdan iadesi. Kullanılmamış yükleme self-servistir.
 * Aktif abonelik ve kullanılan üretim kredisi bu yolun dışındadır.
 */
export const LEGAL_WALLET_UNUSED_BALANCE_PARAGRAPH =
  "Platform cüzdanına yüklenen bakiyeler yalnızca platform içi hizmetlerde kullanılabilir; farklı bir banka hesabına nakit transferi veya çekim yapılamaz. Kullanılmamış cüzdan yükleme (top-up) bakiyeleri Cüzdan sayfasından self-servis kart iadesiyle talep edilebilir. Aktif edilmiş dijital abonelikler ve kullanılan üretim kredileri iade kapsamı dışındadır. İade, Yetkili Ödeme Kuruluşu takası ile yürür; valör bankaya bağlıdır.";

/**
 * İade ve mesafeli satış aynı cümleyi taşır.
 * Tahsilat, satılan dijital erişim, lisans veya tek seferlik çıktıyı açar.
 */
export const LEGAL_DIRECT_PACKAGE_ACCESS =
  "Ödeme, doğrudan ilgili dijital erişim paketine, aylık işletme lisansına veya tek seferlik dijital çıktıya erişimi açar.";

/** Gizlilik ve /iletisim — veri sorumlusu künyesi. Sicil numarası uydurulmaz. */
export const LEGAL_DATA_CONTROLLER_SUMMARY =
  `Veri sorumlusu: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). Tebligat adresi: ${LEGAL_ENTITY.address}. KVKK m.11 talepleri ve destek: ${LEGAL_ENTITY.supportEmail}. WhatsApp: ${LEGAL_ENTITY.whatsappDisplay}.`;

/**
 * Saklama ve imha özeti. Yıl sayısı uydurulmaz; mali defter kanuni süreye bağlanır.
 * Analitik ölçüm rıza kapısına bağlıdır.
 */
export const LEGAL_RETENTION_SUMMARY =
  "Hesap ve hizmet verisi, ilgili hizmetin ifası sürdükçe saklanır. Hesap kapatılınca kişisel veriler anonimleştirilir. Cüzdan ve tahsilat kayıtları değiştirilemez defter olarak, vergi ve ticaret mevzuatının zorunlu kıldığı süre boyunca tutulur; süre dolunca veya kanuni istisna kalkınca silinir ya da anonimleştirilir. Zorunlu oturum çerezi hesabın açık kalması için kullanılır. Analitik çerez ancak «Analitik Çerezleri Kabul Et» tercihinden sonra yüklenir; «Sadece Zorunlu» seçilince Google Analytics yüklenmez ve yeni ölçüm başlamaz.";

/** Çerez tercihi bandı — politika metni ile aynı tercih adları. */
export const COOKIE_CONSENT_COPY = {
  title: "Çerez tercihi",
  body: "Zorunlu çerezler oturumu açık tutar. Analitik çerezler (Google Analytics) yalnız onay verirsen yüklenir.",
  necessaryLegend: "Zorunlu çerezler",
  accept: "Analitik Çerezleri Kabul Et",
  necessaryOnly: "Sadece Zorunlu",
  policyHref: "/legal/cerez",
  policyLabel: "Çerez politikası",
} as const;

/** Satılan ürünler. Kapalı Akademi bu listede yoktur. */
export const LEGAL_SOLD_PRODUCTS_BODY =
  "Hizmetin niteliği: (1) AI Tezgâh Pro — 30 günlük erişim paketi; üretim kotası ve müşteri teslim paketi. Otomatik yenileme yoktur. (2) Tezgâh Üretim Kredisi — katalogdaki kredi paketi; kullanılan kredi iade kapsamı dışındadır. (3) E-Ticaret İşletme Lisansı — 30 gün ücretsiz deneme; deneme açılışında 1,00 TL sembolik kart doğrulama bedeli tahsil edilir ve bu bedel bakiyeye yazılmaz, iadesi taahhüt edilmez. Ardından otomatik yenilenen aylık abonelik başlar; mağaza panelinden tek tıkla dönem sonu iptal edilebilir. Stok, kanal ve sipariş kokpiti bu lisansla açılır. (4) YetkinHibe Dosyası — tek seferlik dijital proje dosyası; elektronik teslimdir, kargo yoktur. YetkinCV ücretsiz vaka testidir; satın alma tek başına puan basmaz. Kurumsal ilan, başvuru bilgisini yalnız ilanı açan yetkili şirketle paylaşır; ücretli ilan tahtası değildir.";

export const LEGAL_COMMERCE_SUBSCRIPTION_BODY =
  "E-Ticaret İşletme Lisansı, 30 gün ücretsiz deneme ardından otomatik yenilenen aylık aboneliktir. Deneme açılışında 1,00 TL sembolik kart doğrulama bedeli tahsil edilir; bu bedel bakiyeye yazılmaz, doğrulama işleminin karşılığıdır ve iadesi taahhüt edilmez. Deneme vergi kimliği (VKN veya TCKN) başına bir kez açılır. Deneme bitiminde lisans katalogdaki aylık tutardan yenilenir; mağaza panelinden tek tıkla dönem sonu iptal edilebilir. Deneme ve iptal işaretinden sonra erişim dönem sonuna kadar sürer. Deneme sürerken yapılan erken dönem satın alımında kalan deneme günleri yanmaz; yeni dönem deneme bitiminin üzerine eklenir.";

export const LEGAL_TEZGAH_PRO_ACCESS_BODY =
  "AI Tezgâh Pro, 30 günlük erişim paketidir. Aylık otomatik yenileme yoktur. Tahsilat tamamlanınca erişim açılır ve süre, tahsilat anından itibaren 30 gündür.";

const LEGAL_TR_MONTHS = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

/** Kasa `consentVersion` gününü sözleşme etiketine çevirir. İki kaynak ayrı tutulmaz. */
export function legalEffectiveLabel(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  const month = match ? LEGAL_TR_MONTHS[Number(match[2]) - 1] : undefined;
  const day = match ? Number(match[3]) : 0;
  if (!match || !month || day < 1 || day > 31) {
    throw new Error("Yürürlük tarihi bozuk.");
  }
  return `Yürürlük: ${day} ${month} ${match[1]}`;
}

export const LEGAL_UPDATED_LABEL = legalEffectiveLabel(CHECKOUT_LEGAL_CONSENT_VERSION);

export const LEGAL_SUPPORT_EMAIL = LEGAL_ENTITY.supportEmail;
export const LEGAL_SUPPORT_MAILTO = `mailto:${LEGAL_SUPPORT_EMAIL}` as const;
export const LEGAL_SUPPORT_LINE_LABEL = "Destek e-posta:" as const;
export const LEGAL_SUPPORT_LINE = `${LEGAL_SUPPORT_LINE_LABEL} ${LEGAL_SUPPORT_EMAIL}` as const;
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
          LEGAL_ACTIVITY_SCOPE_BODY,
          `Marka adı ${LEGAL_ENTITY.brandName}’dir. KVKK m.11 talepleri ve destek, kayıtlı hesap e-postası ile ${LEGAL_SUPPORT_EMAIL} üzerinden yürür. WhatsApp destek: ${LEGAL_ENTITY.whatsappDisplay}.`,
        ],
      },
      {
        id: "gizlilik-politikasi",
        heading: "2. Gizlilik politikası — Ne toplanır, ne toplanmaz?",
        paragraphs: [
          "İşlenen başlıca veriler: Hesap e-postası, görünen ad, oturum çerezleri, bakiye bilgisi, değiştirilemez hesap hareketleri (işlem tutarları ve para birimi), YetkinCV vaka oturumu ve puanı ile kamu kanıt sayfasındaki doğrulama kodlarıdır.",
          "Modül bazında işlenen veriler: (1) E-Ticaret OS — mağaza ürün, stok ve pazaryeri entegrasyon verileri. (2) YetkinHibe OS — firma profil bilgileri ve proje taslak verileri. (3) AI Tezgâh — kullanıcının üretim için girdiği metin ve ürün girdileri ile oluşturulan çıktılar. (4) YetkinCV ve kurumsal ilan — adayların sınav puanları, SHA-256 doğrulama özetleri ve yalnızca ilanı açan yetkili şirketle paylaşılan başvuru bilgileri.",
          "Kişiselleştirilmiş reklam takibi ve çerezle yeniden hedefleme yoktur. Google Analytics (GA4) yalnız «Analitik Çerezleri Kabul Et» tercihi verildiğinde yüklenir. «Sadece Zorunlu» seçilince analitik çerez yazılmaz. Bu ölçüm birinci taraf dönüşüm ve performans ölçümüdür; reklam profili kurulmaz. Kredi kartı numaranız platform sunucularımızda asla tutulmaz; kart tahsilatları Yetkili Ödeme Kuruluşu altyapısı üzerinden güvenle yürütülür.",
        ],
      },
      {
        id: "amac-hukuki-sebep",
        heading: "3. Veriler neden işlenir?",
        paragraphs: [
          "Verilerinizi şu amaçlarla işleriz: hesap açmak, satın alınan dijital erişim paketini, aylık işletme lisansını ve tek seferlik dijital çıktıyı sunmak, E-Ticaret OS, YetkinHibe OS, AI Tezgâh, YetkinCV ve kurumsal ilan modüllerini işletmek, YetkinCV puanı ve SHA-256 doğrulamasını sağlamak ve güvenliği (sahtecilik, mükerrer ödeme, oturum) korumak.",
          "Hukuki sebepler: sözleşmenin yerine getirilmesi (satın alma ve YetkinCV doğrulaması), meşru menfaat (oturum ve sahtecilik önleme), analitik çerez için açık rıza ve kanuni yükümlülüktür. Pazarlama izni alınmaz; pazarlama e-postası gönderilmez.",
        ],
      },
      {
        id: "aktarim",
        heading: "4. Veriler kimlerle paylaşılır?",
        paragraphs: [
          "Hesap ve verileriniz, kimlik doğrulama ve veritabanı hizmetleri sağlayan bulut altyapısında tutulur. Sunucuların bulunduğu ülke, ilgili hizmet sağlayıcısının kayıtlarında yer alır.",
          "Kart ödemesinde Yetkili Ödeme Kuruluşuna e-posta adresiniz, bağlantı IP’niz, sipariş numarası ve sepet tutarı iletilir.",
          "Kurumsal ilan başvurusu, sınav puanı ve SHA-256 doğrulama özeti yalnızca ilanı açan yetkili şirketle paylaşılır. Başvuru kamu dizinine basılmaz.",
          "Hesap bildirimleri e-posta ile gönderilebilir. E-posta altyapısı yoksa bildirim atlanır; ödeme işleminiz durmaz. Üçüncü taraf pazarlama e-posta hizmeti kullanılmaz.",
        ],
      },
      {
        id: "cerez",
        heading: "5. Çerez politikası",
        paragraphs: [
          "Oturumunuzu açık tutmak için zorunlu kimlik çerezleri kullanılır. Reklam ve yeniden hedefleme çerezi yoktur. Google Analytics (GA4) yalnız «Analitik Çerezleri Kabul Et» denilince yüklenir. «Sadece Zorunlu» analitik çerezi kapalı tutar. Tercih cihazında saklanır. Bu ölçüm birinci taraftır; reklam profili oluşturmaz.",
          "Kart ödemesinde Yetkili Ödeme Kuruluşu kendi sayfasını açabilir; o çerezler sağlayıcının politikasına tabidir. Zorunlu oturum çerezi olmadan hesabına giriş yapılamaz. Analitik çerez için ayrı tercih sorulur; pazarlama çerezi yoktur.",
          `Çerez ve gizlilik talepleriniz ${LEGAL_SUPPORT_EMAIL} üzerinden alınır.`,
        ],
      },
      {
        id: "saklama-haklar",
        heading: "6. Saklama ve haklarınız",
        paragraphs: [
          "Hesap hareketleri sonradan değiştirilemez; bakiyeniz bu kayıtlardan hesaplanır. YetkinCV puanı sunucuda hesaplanır. Herkese açık kanıt sayfası (/vize) kişisel bilgi (ad, e-posta) göstermez. E-Ticaret, YetkinHibe, AI Tezgâh ve YetkinCV verisi ilgili hizmetin ifası ve doğrulama için saklanır.",
          LEGAL_DATA_CONTROLLER_SUMMARY,
          LEGAL_RETENTION_SUMMARY,
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
          "Oturumunuzu açık tutmak için zorunlu kimlik çerezleri kullanılır. Reklam ve yeniden hedefleme çerezi yoktur. Google Analytics (GA4) yalnız «Analitik Çerezleri Kabul Et» denilince yüklenir. «Sadece Zorunlu» analitik çerezi kapalı tutar. Tercih cihazında saklanır. Bu ölçüm birinci taraftır; reklam profili oluşturmaz.",
        ],
      },
      {
        id: "odeme-cerez",
        heading: "2. Ödeme sayfası çerezleri",
        paragraphs: [
          "Kart ödemesinde Yetkili Ödeme Kuruluşu kendi sayfasını açabilir; o çerezler sağlayıcının politikasına tabidir. Zorunlu oturum çerezi olmadan hesabına giriş yapılamaz. Analitik çerez için sayfa altındaki çerez tercihi sorulur. Pazarlama çerezi yoktur.",
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
        id: "dijital-erisim-cayma",
        heading: "1. Dijital erişim, abonelik ve cayma",
        paragraphs: [
          `${LEGAL_DIRECT_PACKAGE_ACCESS} ${LEGAL_TEZGAH_PRO_ACCESS_BODY} ${LEGAL_COMMERCE_SUBSCRIPTION_BODY}`,
          "6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği m.15 uyarınca, elektronik ortamda anında ifa edilen hizmetler ile maddi ortamda sunulmayan dijital içeriğe ilişkin sözleşmelerde, ifanın tüketicinin açık rızası ile başlaması halinde cayma hakkı istisna kapsamındadır. Kasa tikleri bu rızadır. Erişim açıldıktan veya üretim kredisi kullanıldıktan sonra ilgili bedel iade edilmez; çifte iade yoktur.",
        ],
      },
      {
        id: "cuzdan-yukleme",
        heading: "2. Tahsilat ve kullanılmamış bakiye",
        paragraphs: [
          LEGAL_WALLET_UNUSED_BALANCE_PARAGRAPH,
          "Tezgâh Üretim Kredisi ve YetkinHibe Dosyası ayrı ürünlerdir. Kullanılmamış cüzdan yükleme (top-up) bakiyesi Cüzdan sayfasından self-servis kart iadesiyle talep edilir. Aktif edilmiş Tezgâh Pro erişimi, aktif edilmiş E-Ticaret İşletme Lisansı ve kullanılan üretim kredileri bu iadenin dışındadır. Havale veya EFT ile tahsilat yapılmaz. Tahsilatın tek kanalı Yetkili Ödeme Kuruluşudur.",
        ],
      },
      {
        id: "iade-iletisim",
        heading: "3. İletişim",
        paragraphs: [
          `Sağlayıcı künye: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). İptal, iade ve ödeme itirazları ${LEGAL_SUPPORT_EMAIL}, WhatsApp (${LEGAL_ENTITY.whatsappDisplay}) ve /iletisim üzerinden yürür. Kart tahsilatı itirazı Yetkili Ödeme Kuruluşunun kendi kanalı ile birlikte okunur. Tebligat adresi: ${LEGAL_ENTITY.address}.`,
        ],
      },
      {
        id: "dijital-abonelik-cikti",
        heading: "4. Dijital abonelik ve tek seferlik çıktı",
        paragraphs: [
          `${LEGAL_TEZGAH_PRO_ACCESS_BODY} ${LEGAL_COMMERCE_SUBSCRIPTION_BODY} Erişim açıldıktan sonra dönem bedeli iade edilmez; çifte iade yoktur.`,
          "YetkinHibe Dosyası ve AI Tezgâh üretim çıktısı tek seferlik dijital içeriktir. Çıktı elektronik ortamda teslim edilince ifa tamamlanır. Kargo veya fiziki teslim yoktur. İfa başladıktan sonra bedel iade edilmez. Tezgâh Üretim Kredisi katalogdaki pakettir; kullanılan üretim kredisi iade kapsamı dışındadır.",
          "Ücretsiz AI Tezgâh kotası satın alma değildir. Kota dolunca ücretli hat katalogda ilan edilen fiyattan açılır; tutar bu metinde yazılmaz.",
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
          `Satıcı / sağlayıcı: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}), marka: ${LEGAL_ENTITY.brandName}. Adres: ${LEGAL_ENTITY.address}. Destek: ${LEGAL_SUPPORT_EMAIL}, WhatsApp ${LEGAL_ENTITY.whatsappDisplay} ve /iletisim. ${LEGAL_AGE_POLICY_BODY} ${LEGAL_ACTIVITY_SCOPE_BODY}`,
          LEGAL_SOLD_PRODUCTS_BODY,
          "Ödeme işlemleri Yetkili Ödeme Kuruluşu altyapısı üzerinden güvenle gerçekleştirilir. Kart tahsilatları ve cüzdan bakiyeleri Türk Lirası (TL) cinsinden işlenir. Tezgâh Pro, Tezgâh Üretim Kredisi, E-Ticaret İşletme Lisansı ve YetkinHibe Dosyası bedelleri kataloğumuzda ilan edilen güncel fiyatlar üzerinden tahsil edilir. Havale veya EFT ile tahsilat yapılmaz.",
          "Tezgâh Pro 30 günlük erişim paketidir. E-Ticaret İşletme Lisansı aylık yenilenen aboneliktir. Tek seferlik teslim kasa ekranında bunlardan ayrı durur.",
          `${LEGAL_DIRECT_PACKAGE_ACCESS} İfa: kart tahsilatı tamamlandığında ilgili dijital erişim, lisans veya tek seferlik çıktı aynı işlemde açılır. Bu, 6502 sayılı Kanun uyarınca elektronik ortamda anında ifa edilen hizmet / maddi ortamda sunulmayan dijital içeriktir. Teslimat adresi veya kargo yoktur.`,
          "Cayma: Ön bilgi ve mesafeli sözleşme kasa tikleriyle kabul edilir. Tezgâh Pro erişimi, E-Ticaret İşletme Lisansı ve tek seferlik dijital çıktı açılınca cayma hakkı istisna kapsamındadır (aşağıda B.5). Kullanılmamış cüzdan yükleme (top-up) bakiyeleri Cüzdan sayfasından self-servis kart iadesiyle talep edilebilir. Aktif edilmiş dijital abonelikler ve kullanılan üretim kredileri iade kapsamı dışındadır.",
        ],
      },
      {
        id: "mesafeli-sozlesme",
        heading: "B. Mesafeli Satış Sözleşmesi",
        paragraphs: [
          `Satıcı künye: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}). Adres: ${LEGAL_ENTITY.address}. Bu sözleşme, 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği çerçevesinde dijital hizmet / dijital içerik ifasını anlatır. ${YETKIN_BRAND} AI tabanlı iş ve operasyon işletim hizmeti sunar; ödeme veya finans kuruluşu değildir. Tezgâh Pro, E-Ticaret İşletme Lisansı, Tezgâh Üretim Kredisi ve YetkinHibe Dosyasında ifa elektronik teslimdir.`,
          `Sözleşme, tüketicinin kasa ekranında Mesafeli Satış Sözleşmesi ile Ön Bilgilendirme Formunu kabul etmesi ve dijital içeriğin anında ifa edileceğine açık rıza vermesiyle kurulur. Rıza, ödeme isteğinde ${CHECKOUT_LEGAL_CONSENT_VERSION} sürümü ile doğrulanır. Tik yoksa kart tahsilatı durur.`,
        ],
      },
      {
        id: "dijital-ifa-istisnasi",
        heading: "B.5 Dijital içerik — anında ifa ve cayma istisnası",
        paragraphs: [
          `${LEGAL_DIRECT_PACKAGE_ACCESS} Tezgâh Pro, E-Ticaret İşletme Lisansı, Tezgâh Üretim Kredisi veya YetkinHibe Dosyasında kart tahsilatı tamamlanıp erişim ya da çıktı açıldığı anda ifa başlamış olur. 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği’nin «elektronik ortamda anında ifa edilen hizmetler» ile maddi ortamda sunulmayan dijital içeriğe ilişkin istisnası bu anda işler.`,
          "Tüketici, kasa tikinde «Dijital içeriğin anında ifa edileceğini kabul ediyorum» ifadesiyle ifanın derhal başlayacağını ve bu durumda cayma hakkının istisna kapsamında sona ereceğini kabul eder. İfa başlamadan önce tik verilmezse satın alma ve kart tahsilatı reddedilir.",
          `${LEGAL_TEZGAH_PRO_ACCESS_BODY} ${LEGAL_COMMERCE_SUBSCRIPTION_BODY} Erişim açılınca istisna işler. 14 günlük yasal cayma süresi dijital ifa istisnası ile birlikte okunur — çifte iade yoktur. Kullanılmamış cüzdan yükleme bakiyesi bu istisnanın dışında, Cüzdan sayfasından self-servis kart iadesiyle talep edilebilir.`,
        ],
      },
      {
        id: "bedel-fatura",
        heading: "B.6 Bedel, fatura, süre",
        paragraphs: [
          "İlan edilen fiyatlar KDV dahildir; kasada «+KDV» eklenmez. Fiyat kilidi 15 dakikadır. Tezgâh Pro erişimi, kart tahsilatının tamamlandığı andan itibaren 30 gündür ve kendiliğinden yenilenmez. E-Ticaret İşletme Lisansı, deneme bitince aylık dönemlerle yenilenir; mağaza panelinden tek tıkla dönem sonu iptal edilebilir.",
          "Satın alınan hizmetlere ait faturalar yasal süreçlere uygun düzenlenir. Fatura, kayıtlı e-posta adresine iletilir; bu iletim otomatik e-Arşiv paneli veya anında GİB gönderimi anlamına gelmez. İlan edilen tüm fiyatlara KDV dahildir.",
        ],
      },
      {
        id: "uyusmazlik-cozumu",
        heading: "B.7 Uyuşmazlık çözümü — Tüketici Hakem Heyetleri ve yetkili mahkeme",
        paragraphs: [
          "İşbu sözleşmeden doğan uyuşmazlıklarda tüketici; 6502 sayılı Kanun’un 68. ve 73. maddeleri uyarınca, Ticaret Bakanlığınca her yıl ilan edilen parasal sınırlar dahilinde kalan başvurular için yerleşim yerindeki veya işlemin yapıldığı yerdeki Tüketici Hakem Heyetine, bu sınırları aşan uyuşmazlıklarda ise yerleşim yeri veya işlemin yapıldığı yerdeki Tüketici Mahkemesine başvurabilir.",
          `Satıcı / sağlayıcı künyesi ve tebligat adresi: ${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}), ${LEGAL_ENTITY.address}. Uyuşmazlık öncesi ${LEGAL_SUPPORT_EMAIL} üzerinden çözüm talebi iletilebilir; bu kanal yasal başvuru hakkını ortadan kaldırmaz.`,
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
          `${LEGAL_ACTIVITY_SCOPE_BODY} Çalışan modüller E-Ticaret OS, YetkinHibe OS, AI Tezgâh, YetkinCV ve kurumsal ilandır. Kapalı bölümler vitrinde yer almaz ve satışa sunulmaz. Tahsilatın tek kanalı Yetkili Ödeme Kuruluşudur. Platform bakiyesi banka hesabına çekilmez.`,
          "Vatandaş hesap e-posta ve şifre ile açılır; oturum çerezi kimlik ipucudur, para işlemi sunucuda JWT ile bağlanır. Native mağaza (IAP) tahsilat kanalı değildir. Havale veya EFT ile tahsilat yapılmaz.",
        ],
      },
      {
        id: "hizmet-sorumluluk",
        heading: "2. Hizmet niteliği ve sorumluluk",
        paragraphs: [
          `Platform E-Ticaret OS, YetkinHibe OS, AI Tezgâh, YetkinCV ve kurumsal ilan ile eleme hizmeti sunar. ${LEGAL_TEZGAH_PRO_ACCESS_BODY} ${LEGAL_COMMERCE_SUBSCRIPTION_BODY} Tek seferlik dijital çıktı, YetkinHibe Dosyası ve AI Tezgâh üretimleridir. Tezgâh Üretim Kredisi katalogdaki pakettir. ${YETKIN_BRAND} bir ödeme veya finans kuruluşu değildir. Kurumsal ilan ücretli kamu ilan tahtası değildir. Platform, hibe alınmasını, işe yerleşmeyi veya ticari geliri garanti etmez.`,
          "Azami sorumluluk, ilgili dijital hizmet bedelinin net tutarı ve defter kaydı ile sınırlıdır; dolaylı, kâr kaybı veya manevi tazminat talep edilemez.",
        ],
      },
      {
        id: "yasak-yas",
        heading: "3. Yasaklar ve yaş",
        paragraphs: [
          `Yasak: yasa dışı iş, sahte kimlik, ödeme sistemini dolanma ve veli aydınlatması olmadan çocuk profili açmak. ${LEGAL_AGE_POLICY_BODY}`,
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
export const LEGAL_ABOUT_HREF = "/hakkimizda" as const;
export const LEGAL_ABOUT_TITLE = "Hakkımızda" as const;

export const LEGAL_ABOUT_LEAD =
  `${LEGAL_ENTITY.tradeName} (${LEGAL_ENTITY_IDS}) bünyesinde yürütülen ${LEGAL_ENTITY.brandName}, KOBİ'ler, girişimciler, danışmanlar ve kurumsal şirketler için geliştirilmiş AI tabanlı iş ve operasyon işletim platformudur.`;

export const LEGAL_ABOUT_STORY = [
  "Şirket sicil unvanı gayrimenkul ve e-ticaret faaliyetlerini taşır. yetkin.ai üzerindeki faaliyet, KOBİ'ler, girişimciler, danışmanlar ve kurumsal şirketler için AI tabanlı iş ve operasyon işletimidir: E-Ticaret OS, YetkinHibe OS, AI Tezgâh, YetkinCV ve kurumsal ilan ile eleme. Sicildeki unvan ile platformdaki faaliyet bu sayfada açıkça yazılır.",
  "Kayıt olan kişi tek hesapla modülleri kullanır. E-Ticaret OS stok, kanal ve siparişi toplar. YetkinHibe OS firma uygunluğunu ve proje dosyasını hazırlar. AI Tezgâh üretim kotasıyla dijital çıktı üretir. YetkinCV SHA-256 doğrulama özeti sunar. Kurumsal ilan, başvuru bilgisini yalnız ilanı açan yetkili şirketle paylaşır. Platform, işe yerleşmeyi, hibe alınmasını veya ticari geliri garanti etmez.",
  `Platform bir ödeme veya finans kuruluşu değildir. Kart tahsilatı Yetkili Ödeme Kuruluşu altyapısı üzerinden yürür; kart numarası platform sunucularında tutulmaz. Platform bakiyesi banka hesabına çekilmez. ${LEGAL_AGE_POLICY_BODY}`,
] as const;

/** Vitrin şeridi — tam hukuki başlık `title`, tek satır etiket `label`. */
export const LEGAL_FOOTER_LABELS = {
  gizlilik: "Gizlilik",
  cerez: "Çerez",
  iade: "İade",
  "mesafeli-satis": "Mesafeli satış",
  kullanim: "Kullanım şartları",
  hakkimizda: LEGAL_ABOUT_TITLE,
  iletisim: "İletişim",
  destek: LEGAL_SUPPORT_EMAIL,
} as const;

export const LEGAL_FOOTER_LINKS = [
  ...LEGAL_LAUNCH_SECTIONS.map((section) => ({
    href: section.href,
    title: section.title,
    label: LEGAL_FOOTER_LABELS[section.slug],
  })),
  { href: LEGAL_ABOUT_HREF, title: LEGAL_ABOUT_TITLE, label: LEGAL_FOOTER_LABELS.hakkimizda },
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
    "Kullanılmamış cüzdan yükleme bakiyesi Cüzdan sayfasından self-servis kart iadesiyle talep edilebilir. Aktif edilmiş dijital abonelik ve kullanılan üretim kredisi iade kapsamı dışındadır. Erişim açılınca cayma hakkı 6502 istisnasına tabidir.",
} as const;
