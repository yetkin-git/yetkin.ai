/**
 * PayTR vitrin hukuk metinleri — `/legal` dizin + bağımsız URL'ler.
 * Unvan, VKN, MERSİS icat edilmez. Canlı mükellefiyet kartı korunur.
 */

import { YETKIN_BRAND } from "@/lib/copy/brand";

export const LEGAL_PAGE_TITLE = "Gizlilik ve yasal çerçeve";

export const LEGAL_HONESTY_BODY =
  "Canlı vergi mükellefiyeti henüz açık değildir. İç dekont kaydı hazırlık aşamasındadır. 18 yaş altı Junior kullanımı ebeveyn onayı ister.";

export const LEGAL_UPDATED_LABEL = "Yürürlük: 20 Ağustos 2026 — PayTR başvuru metni";

export const LEGAL_SECTION_TITLES = {
  kvkk: "KVKK Aydınlatma Metni & Çerez Politikası",
  refund: "İade ve İptal Koşulları (Emanet / Bakiye Yükleme)",
  distance: "Mesafeli Hizmet ve Dijital İçerik Sözleşmesi",
  terms: "Platform Kullanım Şartları & Sorumluluk Sınırları",
} as const;

export const LEGAL_SECTION_IDS = {
  kvkk: "kvkk-cerez",
  refund: "iade-iptal",
  distance: "mesafeli-hizmet",
  terms: "kullanim-sartlari",
} as const;

export const LEGAL_PAGE_SLUGS = {
  gizlilik: "gizlilik",
  mesafeli: "mesafeli-satis",
  iade: "iade",
  terms: "kullanim-sartlari",
} as const;

export type LegalLaunchSection = {
  id: (typeof LEGAL_SECTION_IDS)[keyof typeof LEGAL_SECTION_IDS];
  slug: (typeof LEGAL_PAGE_SLUGS)[keyof typeof LEGAL_PAGE_SLUGS];
  href: `/legal/${string}`;
  title: (typeof LEGAL_SECTION_TITLES)[keyof typeof LEGAL_SECTION_TITLES];
  paragraphs: readonly string[];
};

export const LEGAL_LAUNCH_SECTIONS: readonly LegalLaunchSection[] = [
  {
    id: LEGAL_SECTION_IDS.kvkk,
    slug: LEGAL_PAGE_SLUGS.gizlilik,
    href: "/legal/gizlilik",
    title: LEGAL_SECTION_TITLES.kvkk,
    paragraphs: [
      "Bu aydınlatma, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında sunulur. Veri sorumlusu unvanı, VKN ve MERSİS bu metinde yayımlanmaz: canlı vergi mükellefiyeti henüz açık değildir. Sicil açılınca aynı sayfada güncellenir; sahte kimlik yazılmaz.",
      "İşlenen başlıca veriler: hesap e-postası, görünen ad, oturum çerezleri, akademi tahsilatına ilişkin cüzdan bakiyesi ve append-only defter satırları (kuruluş birimi amountMinor, para birimi TRY), emanet kilit kayıtları, freelancer ilan / teklif / sözleşme metinleri. Amaç hesap açmak, dijital içeriği ifa etmek, hizmet aracılığını yürütmek ve güvenliği sağlamaktır. Hukuki sebepler sözleşmenin ifası, meşru menfaat (oturum ve sahtecilik önleme) ve kanuni yükümlülüktür.",
      "Çerezler: oturum için zorunlu kimlik çerezleri (Supabase `sb-*-auth-token` ve parçaları) kullanılır. Bu gövdede reklam, retargeting veya üçüncü taraf analitik pikseli yoktur. Kart tahsilatında ödeme sağlayıcısı (PayTR) kendi çerçevesini açabilir; o çerezler sağlayıcının politikasına tabidir. Zorunlu oturum çerezi olmadan hesap sığınakları çalışmaz.",
      "6698 m.11 hakları (erişim, düzeltme, silme, itiraz) veri sorumlusu sicili yayımlanınca bu sayfadaki iletişim kanalından kullanılır. Bugün ayrı bir kamu e-posta adresi icat edilmez. Altyapı üçüncü taraf bulut kimlik ve Postgres hizmetlerindedir; yerleşim bölgesi operatör sicilinde tutulur.",
    ],
  },
  {
    id: LEGAL_SECTION_IDS.refund,
    slug: LEGAL_PAGE_SLUGS.iade,
    href: "/legal/iade",
    title: LEGAL_SECTION_TITLES.refund,
    paragraphs: [
      "Emanet (EscrowHold): teklif kabulünde brüt tutar lisanslı ödeme kuruluşunda kilit kaydına bağlanır; platform cüzdanına DEBIT yazılmaz. Pazaryeri altyapısı bağlı değilse kabul 503 döner. İş onaylanıp serbest bırakılmadan önce iade, kuruluş üzerinden alıcıya döner; freelancer ve platform payı yazılmaz. Serbest bırakılmış (RELEASED) kilit aynı yoldan iade edilmez. Anlaşmazlık (DISPUTED) açıkken mutlu yol iadesi kapalıdır. PENDING kilit, 14 günlük TTL dolunca tarayıcı ile iade edilebilir.",
      "Akademi / bakiye yükleme: ₺10–₺20.000 bandındadır ve platformun kendi dijital içeriğine yöneliktir. Platform cüzdanından bankaya çekim yoktur. Kullanılmamış bakiye kendiliğinden karta dönmez. Ödeme sağlayıcısı iadesi yalnız henüz harcanmamış yükleme ve sağlayıcı/operatör takası ile yürür; valör bankanıza bağlıdır.",
      "Freelancer iş bedeli lisanslı ödeme kuruluşunun Pazaryeri (split payment) modeline tabidir. Ana para usta IBAN’ına, komisyon platforma kuruluş tarafından dağıtılır. Dijital içerik (akademi kursu) ifa edildikten sonra cayma, mesafeli satış istisnasına tabidir. Platform payı yalnız serbest bırakmada doğar; iade edilen emanette platform payı doğmaz.",
    ],
  },
  {
    id: LEGAL_SECTION_IDS.distance,
    slug: LEGAL_PAGE_SLUGS.mesafeli,
    href: "/legal/mesafeli-satis",
    title: LEGAL_SECTION_TITLES.distance,
    paragraphs: [
      `Bu metin, 6502 sayılı Kanun ve mesafeli sözleşmeler yönetmeliği çerçevesinde dijital hizmet / dijital içerik ifasını anlatır. ${YETKIN_BRAND}, freelancer işinde aracı platformdur; iş ürününün tarafı freelancer ve müşteridir. Akademide ifa elektronik teslimdir.`,
      "Bedel Türk Lirasıdır; tutarlar kuruluş (amountMinor) olarak deftere yazılır. Akademi fiyatı Super Admin katalogdadır. Freelancer bedeli teklif kabulünde ödeme kuruluşunda kilitlenir; platform bakiyesi şart değildir. Canlı e-arşiv / e-fatura mükellefiyeti açık değildir; iç dekont kaydı hazırlık aşamasındadır.",
      "Cayma: dijital içeriğin ifasına açık rıza ve ifanın başlaması halinde kanundaki istisna uygulanır. Emanetli hizmette iptal, serbest bırakmadan önceki iade kurallarına tabidir. 14 günlük yasal süre, emanet TTL ve dijital ifa istisnası ile birlikte okunur — çifte iade yoktur.",
    ],
  },
  {
    id: LEGAL_SECTION_IDS.terms,
    slug: LEGAL_PAGE_SLUGS.terms,
    href: "/legal/kullanim-sartlari",
    title: LEGAL_SECTION_TITLES.terms,
    paragraphs: [
      "Platform dört çalışan oda (Anasayfa, Akademi, Kariyer, Freelancer) ile çalışır. Diskte duran diğer odalar pazarlanmaz. İkinci nakit yazıcı, platform cüzdanından banka çekimi, GİB canlı fatura ve müze yolları bu gövdede yoktur. Vatandaş hesap e-posta ve şifre ile açılır; oturum çerezi kimlik ipucudur, para işlemi sunucuda JWT ile bağlanır.",
      `Freelancer mutlu yol ilan → emanet kaydı → teslim onayıdır. İş bedeli lisanslı ödeme kuruluşunda split ile dağılır; ${YETKIN_BRAND} ödeme kuruluşu değildir. Kabul anında platform cüzdanına DEBIT yazılmaz. Platform, işin niteliğini, süresini veya sonucunu garanti etmez. Azami sorumluluk, ilgili iş bedelinin net tutarı ve defter kaydı ile sınırlıdır; dolaylı, kâr kaybı veya manevi tazminat talep edilemez. Tahkim açıkken serbest bırakma ve iade kapanır.`,
      "Yasak: yasa dışı iş, reşit olmayanların ebeveynsiz Junior kullanımı, sahte kimlik, ödeme sistemini dolanma. Metin değişirse yürürlük tarihi bu sayfada güncellenir. Bu sayfa vatandaş dilidir, yeni oda açmaz.",
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
  iade: "İade",
  "mesafeli-satis": "Mesafeli satış",
  "kullanim-sartlari": "Kullanım şartları",
  iletisim: "İletişim",
} as const;

export const LEGAL_FOOTER_LINKS = [
  ...LEGAL_LAUNCH_SECTIONS.map((section) => ({
    href: section.href,
    title: section.title,
    label: LEGAL_FOOTER_LABELS[section.slug],
  })),
  { href: LEGAL_CONTACT_HREF, title: LEGAL_FOOTER_LABELS.iletisim, label: LEGAL_FOOTER_LABELS.iletisim },
] as const;
