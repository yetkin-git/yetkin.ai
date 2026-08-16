/**
 * Lansman hukuk metinleri (O13) — tek `/legal` yüzeyi.
 * Unvan, VKN, MERSİS icat edilmez. Canlı mükellefiyet kartı korunur.
 */

export const LEGAL_PAGE_TITLE = "Gizlilik ve yasal çerçeve";

export const LEGAL_HONESTY_BODY =
  "Canlı vergi mükellefiyeti henüz açık değildir. İç dekont kaydı hazırlık aşamasındadır. 18 yaş altı Junior kullanımı ebeveyn onayı ister.";

export const LEGAL_UPDATED_LABEL = "Yürürlük: 15 Ağustos 2026 — lansman metni";

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

export type LegalLaunchSection = {
  id: (typeof LEGAL_SECTION_IDS)[keyof typeof LEGAL_SECTION_IDS];
  title: (typeof LEGAL_SECTION_TITLES)[keyof typeof LEGAL_SECTION_TITLES];
  paragraphs: readonly string[];
};

export const LEGAL_LAUNCH_SECTIONS: readonly LegalLaunchSection[] = [
  {
    id: LEGAL_SECTION_IDS.kvkk,
    title: LEGAL_SECTION_TITLES.kvkk,
    paragraphs: [
      "Bu aydınlatma, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında sunulur. Veri sorumlusu unvanı, VKN ve MERSİS bu metinde yayımlanmaz: canlı vergi mükellefiyeti henüz açık değildir. Sicil açılınca aynı sayfada güncellenir; sahte kimlik yazılmaz.",
      "İşlenen başlıca veriler: hesap e-postası, görünen ad, oturum çerezleri, cüzdan bakiyesi ve append-only defter satırları (kuruluş birimi amountMinor, para birimi TRY), emanet kilitleri, freelancer ilan / teklif / sözleşme metinleri, Junior ebeveyn onayı kaydı. Amaç hesap açmak, emanet işletmek, hizmeti ifa etmek ve güvenliği sağlamaktır. Hukuki sebepler sözleşmenin ifası, meşru menfaat (oturum ve sahtecilik önleme) ve kanuni yükümlülüktür.",
      "Çerezler: oturum için zorunlu kimlik çerezleri (Supabase `sb-*-auth-token` ve parçaları) kullanılır. Bu gövdede reklam, retargeting veya üçüncü taraf analitik pikseli yoktur. Bakiye yüklemede ödeme sağlayıcısı (PayTR) kendi çerçevesini açabilir; o çerezler sağlayıcının politikasına tabidir. Zorunlu oturum çerezi olmadan hesap sığınakları çalışmaz.",
      "6698 m.11 hakları (erişim, düzeltme, silme, itiraz) veri sorumlusu sicili yayımlanınca bu sayfadaki iletişim kanalından kullanılır. Bugün ayrı bir kamu e-posta adresi icat edilmez. Altyapı üçüncü taraf bulut kimlik ve Postgres hizmetlerindedir; yerleşim bölgesi operatör sicilinde tutulur.",
    ],
  },
  {
    id: LEGAL_SECTION_IDS.refund,
    title: LEGAL_SECTION_TITLES.refund,
    paragraphs: [
      "Emanet (EscrowHold): teklif kabulünde (fiyat kilidi) brüt tutar müşteri cüzdanından düşer ve kilit PENDING olur. İş onaylanıp serbest bırakılmadan önce (sözleşme FUNDED) iade, brütü müşteriye döndürür; freelancer ve platform payı yazılmaz. Serbest bırakılmış (RELEASED) kilit aynı yoldan iade edilmez. Anlaşmazlık (DISPUTED) açıkken mutlu yol iadesi kapalıdır ve süre aşımı donar. PENDING kilit, 14 günlük TTL dolunca tarayıcı ile iade edilebilir.",
      "Bakiye yükleme: ₺10–₺20.000 bandındadır. Cüzdan kapalı döngüdür — para girer, banka çekimi kapalıdır. Kullanılmamış bakiye kendiliğinden karta dönmez. Ödeme sağlayıcısı iadesi yalnız henüz harcanmamış yükleme ve sağlayıcı/operatör takası ile yürür; valör bankanıza bağlıdır.",
      "Dijital içerik (akademi kursu, stüdyo üretimi) ifa edildikten veya indirme / üretim başladıktan sonra cayma, mesafeli satış istisnasına tabidir. Platform payı (hold, varsayılan %10, bant %10–%15) yalnız serbest bırakmada hazine cüzdanına geçer; iade edilen emanette platform payı doğmaz.",
    ],
  },
  {
    id: LEGAL_SECTION_IDS.distance,
    title: LEGAL_SECTION_TITLES.distance,
    paragraphs: [
      "Bu metin, 6502 sayılı Kanun ve mesafeli sözleşmeler yönetmeliği çerçevesinde dijital hizmet / dijital içerik ifasını anlatır. Yetkin Rail, freelancer işinde emanet işleticisi ve aracı platformdur; iş ürününün tarafı freelancer ve müşteridir. Akademi ve stüdyoda ifa elektronik teslimdir.",
      "Bedel Türk Lirasıdır; tutarlar kuruluş (amountMinor) olarak deftere yazılır. Fiyat, teklif kabulünde emanet kilidine bağlanır; katalog hold bandı Super Admin sicilindedir. Canlı e-arşiv / e-fatura mükellefiyeti açık değildir; iç dekont kaydı hazırlık aşamasındadır.",
      "Cayma: dijital içeriğin ifasına açık rıza ve ifanın başlaması halinde kanundaki istisna uygulanır. Emanetli hizmette iptal, serbest bırakmadan önceki iade kurallarına tabidir. 14 günlük yasal süre, yukarıdaki emanet TTL ve dijital ifa istisnası ile birlikte okunur — çifte iade yoktur.",
    ],
  },
  {
    id: LEGAL_SECTION_IDS.terms,
    title: LEGAL_SECTION_TITLES.terms,
    paragraphs: [
      "Platform on iki oda, tek cüzdan ve tek append-only defter ile çalışır. İkinci nakit yazıcı, banka çekimi, GİB canlı fatura ve müze (`yetkin.ai`) yolları bu gövdede yoktur. Vatandaş hesap e-posta ve şifre ile açılır; oturum çerezi kimlik ipucudur, para işlemi sunucuda JWT ile bağlanır.",
      "Freelancer mutlu yol ilan → emanet → serbest bırakmadır. Platform, işin niteliğini, süresini veya sonucunu garanti etmez. Azami sorumluluk, ilgili emanet kilidinin net tutarı ve defter kaydı ile sınırlıdır; dolaylı, kâr kaybı veya manevi tazminat talep edilemez. Tahkim (anlaşmazlık) açıkken serbest bırakma ve iade kapanır.",
      "Yasak: yasa dışı iş, reşit olmayanların ebeveynsiz Junior kullanımı, sahte kimlik, ödeme sistemini dolanma. Metin değişirse yürürlük tarihi bu sayfada güncellenir. Çelişki halinde kilitli anayasa (S1–S62) ve `docs/07_OPS_RUNBOOK.md` operasyon cümleleri ürün davranışını bağlar; bu sayfa vatandaş dilidir, yeni oda açmaz.",
    ],
  },
];
