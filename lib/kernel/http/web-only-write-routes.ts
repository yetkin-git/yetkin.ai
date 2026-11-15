/**
 * v1 siciline girmeyen web BFF rotaları.
 * Yayın sözleşmesi `RAIL_V1_HOPS_META`. Bu dosya onun yanıdır; ikinci hop sicili değildir.
 * `WEB_ONLY_WRITE_ROUTES` kasıtlı yazma, operasyon ve kilit satırlarıdır.
 * Hop olmayan okumalar aynı modülde durur; birleşme kapısı ikisini de okur.
 * Yeni app/api route.ts fiili bu modülde veya hop metasında yoksa birleşmez.
 * URL, fiyat ve handler gövdesi burada değişmez.
 */

export const WEB_BFF_HTTP_METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"] as const;

export type WebBffHttpMethod = (typeof WEB_BFF_HTTP_METHODS)[number];

export const WEB_ONLY_WRITE_STATUSES = [
  "admin",
  "hmac",
  "inngest",
  "cookie-auth",
  "product-write",
  "locked-temporary",
  "closed-room",
  "tombstone",
] as const;

export type WebOnlyWriteStatus = (typeof WEB_ONLY_WRITE_STATUSES)[number];

export type WebBffRouteStatus = WebOnlyWriteStatus | "web-read";

export type WebBffRouteRecord = {
  id: string;
  method: WebBffHttpMethod;
  /** Public path. Next dinamik segmenti `[param]` biçimindedir. Grup klasörü URL’de yoktur. */
  path: string;
  status: WebBffRouteStatus;
  /** true ise `WEB_ONLY_WRITE_ROUTES` içindedir. */
  write: boolean;
  note: string;
};

export type WebOnlyWriteRoute = WebBffRouteRecord & { write: true };

const TOMBSTONE_NOTE = "410 mezar taşı. Motor kopyası değildir. v1 sicilinde yoktur.";
const CLOSED_ROOM_NOTE =
  "Freelancer odası kapalıyken kenar 410 basar. v1 metasında yoktur. Bu satır kapıyı açmaz.";
const YETKINHIBE_CLOSED_ROOM_NOTE =
  "YetkinHibe odası kapalıyken kenar 410 basar. v1 metasında yoktur (D-11, web-only). Bu satır kapıyı açmaz.";
const COMMERCE_WRITE_NOTE = "Yetkin Commerce. Cüzdan yazılmaz. v1 hop satırı yoktur.";
const YETKINHIBE_MATCH_NOTE =
  "YetkinHibe ücretsiz eşleştirme (D-12). Oturum zorunlu; veri yazmaz. Oda kapalıyken kenar 410 basar. v1 metasında yoktur (D-11). Bu satır kapıyı açmaz.";

function route(
  id: string,
  method: WebBffHttpMethod,
  path: string,
  status: WebBffRouteStatus,
  write: boolean,
  note: string,
): WebBffRouteRecord {
  return { id, method, path, status, write, note };
}

function verbs(
  id: string,
  methods: readonly WebBffHttpMethod[],
  path: string,
  status: WebBffRouteStatus,
  write: boolean,
  note: string,
): WebBffRouteRecord[] {
  return methods.map((method) => route(`${id}:${method}`, method, path, status, write, note));
}

const TOMBSTONE_PATHS = [
  ["/api/_gone/[...path]", "Donmuş oda yakalayıcısı"],
  ["/api/academy/reviews", "Akademi değerlendirme"],
  ["/api/academy/discussion", "Akademi tartışma"],
  ["/api/academy/generateSpeech", "Akademi konuşma üretimi"],
  ["/api/academy/courses/[id]/listen", "Akademi dinleme"],
  ["/api/academy/courses/[id]/pdf", "Akademi PDF"],
  ["/api/admin/curriculum-revisions", "Müfredat revizyonu"],
  ["/api/freelancer/direct-offers", "Doğrudan teklif"],
  ["/api/freelancer/direct-offers/[id]/accept", "Doğrudan teklif kabul"],
  ["/api/freelancer/direct-offers/[id]/decline", "Doğrudan teklif ret"],
  ["/api/freelancer/squad", "Freelancer ekip"],
] as const;

function tombstones(): WebBffRouteRecord[] {
  const rows: WebBffRouteRecord[] = [];
  for (const [path, label] of TOMBSTONE_PATHS) {
    const note = `${label}. ${TOMBSTONE_NOTE}`;
    rows.push(route(`tombstone:GET:${path}`, "GET", path, "tombstone", false, note));
    for (const method of ["POST", "PUT", "PATCH", "DELETE"] as const) {
      rows.push(route(`tombstone:${method}:${path}`, method, path, "tombstone", true, note));
    }
  }
  return rows;
}

const NAMED_ROUTES: readonly WebBffRouteRecord[] = [
  ...verbs(
    "admin-b2b",
    ["GET", "POST", "PATCH"],
    "/api/admin/b2b",
    "admin",
    true,
    "B2B fırsat motoru. Super Admin. Günlük 15 firma. Native hop değildir.",
  ),
  ...verbs(
    "admin-b2b-send",
    ["POST"],
    "/api/admin/b2b/send",
    "admin",
    true,
    "B2B taslak onayı ve gönderim. Motor kapalıyken ve limit doluyken kilitli. Native hop değildir.",
  ),
  ...verbs(
    "admin-b2b-reply",
    ["POST"],
    "/api/admin/b2b/reply",
    "admin",
    true,
    "B2B yanıt taslağı. Müşteriye kendiliğinden gitmez. Native hop değildir.",
  ),
  ...verbs(
    "admin-catalog",
    ["PATCH"],
    "/api/admin/catalog",
    "admin",
    true,
    "Admin katalog yaması. Native hop değildir.",
  ),
  ...verbs(
    "admin-catalog-publish",
    ["PATCH"],
    "/api/admin/catalog/publish",
    "admin",
    true,
    "Admin yayın anahtarı. Native hop değildir.",
  ),
  ...verbs(
    "admin-funnel",
    ["GET"],
    "/api/admin/funnel",
    "admin",
    true,
    "Admin huni okuması. Native hop değildir.",
  ),
  ...verbs(
    "admin-ops-grant",
    ["POST"],
    "/api/admin/ops/grant",
    "admin",
    true,
    "Super Admin sa_grant. Üretimde sıfır harç kapalıdır. Native hop değildir.",
  ),
  ...verbs(
    "admin-ops-certificate-revoke",
    ["POST"],
    "/api/admin/ops/certificate-revoke",
    "admin",
    true,
    "Super Admin sertifika iptali. Kamuya açık değildir. Native hop değildir.",
  ),
  ...verbs(
    "admin-ops-license-gap-refund",
    ["POST"],
    "/api/admin/ops/license-gap-refund",
    "admin",
    true,
    "Lisans sapmasında sipariş tutarına kilitli kart iadesi. Serbest tutar yok. Native hop değildir.",
  ),
  ...verbs(
    "hmac-paytr",
    ["GET", "HEAD", "POST"],
    "/api/payments/webhooks/paytr",
    "hmac",
    true,
    "PayTR HMAC bildirimi. POST gövdeyi yazar; GET ve HEAD aynı handler yoklamasıdır. v1 sicilinde yoktur.",
  ),
  ...verbs(
    "hmac-paytr-callback",
    ["GET", "HEAD", "POST"],
    "/api/paytr/callback",
    "hmac",
    true,
    "PayTR panel alias’ı. Aynı HMAC handler’a çıkar. v1 sicilinde yoktur.",
  ),
  ...verbs(
    "inngest",
    ["GET", "POST", "PUT"],
    "/api/jobs/inngest",
    "inngest",
    true,
    "Inngest imzası. Native hop değildir.",
  ),
  route(
    "paytr-cron-reconcile",
    "GET",
    "/api/cron/paytr-reconcile",
    "inngest",
    true,
    "Vercel Cron valör yedeği. CRON_SECRET Bearer; Inngest Cloud yokken PENDING tavanını kapatır. Native hop değildir.",
  ),
  route(
    "license-gap-cron",
    "GET",
    "/api/cron/license-gap",
    "inngest",
    true,
    "CLEARED lisans sapma alarmı. Günde bir Vercel yedeği. On beş dakika Inngest license-gap-scan. Native hop değildir.",
  ),
  ...verbs(
    "cookie-auth-register",
    ["POST"],
    "/api/auth/register",
    "cookie-auth",
    true,
    "Çerez kayıt. auth-session hop’u yalnız GET oturum okur.",
  ),
  ...verbs(
    "cookie-auth-logout",
    ["POST"],
    "/api/auth/logout",
    "cookie-auth",
    true,
    "Çerez çıkış. Native hop değildir.",
  ),
  ...verbs(
    "cookie-auth-password",
    ["POST"],
    "/api/auth/password",
    "cookie-auth",
    true,
    "Çerez parola yazması. Native hop değildir.",
  ),
  ...verbs(
    "cookie-auth-resend",
    ["POST"],
    "/api/auth/resend-confirmation",
    "cookie-auth",
    true,
    "Çerez doğrulama postası. Native hop değildir.",
  ),
  ...verbs(
    "cookie-auth-reset",
    ["POST"],
    "/api/auth/reset-password",
    "cookie-auth",
    true,
    "Çerez parola sıfırlama. Native hop değildir.",
  ),
  ...verbs(
    "cookie-auth-send-email",
    ["POST"],
    "/api/auth/hooks/send-email",
    "cookie-auth",
    true,
    "Auth e-posta kancası. Native hop değildir.",
  ),
  ...verbs(
    "product-live-tutor",
    ["POST"],
    "/api/junior/live-tutor",
    "product-write",
    true,
    "Canlı koç. product-write donduruldu. Native istemci tüketmez. auth public. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-lesson-assistant",
    ["POST"],
    "/api/academy/lesson-assistant",
    "product-write",
    true,
    "Ders asistanı. product-write donduruldu. Native istemci tüketmez. Oturum çerezi. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-exemption",
    ["POST"],
    "/api/academy/courses/[id]/exemption",
    "product-write",
    true,
    "Muafiyet yazması. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-audio-grant",
    ["GET"],
    "/api/academy/courses/[id]/audio-grant",
    "product-write",
    true,
    "Ses izni. Fiil GET’tir; kısa ömürlü adres üretir. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-wallet-refund",
    ["POST"],
    "/api/wallet/refund",
    "product-write",
    true,
    "Cüzdan iadesi. v1 sicilinde cüzdan hop’u yüklemedir.",
  ),
  ...verbs(
    "product-ai-chat",
    ["POST"],
    "/api/ai/chat",
    "product-write",
    true,
    "Sohbet yazması. Anonim ziyaretçi günde 5 soru. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-career-coach",
    ["POST"],
    "/api/career/coach",
    "product-write",
    true,
    "AI kariyer koçu. CV, SWOT ve diyalog. Oturum zorunlu. Kazanılmamış rozet doğrulanmış yazılmaz. Cüzdan yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-tezgah-generate",
    ["POST"],
    "/api/tezgah/generate",
    "product-write",
    true,
    "AI Tezgâh üretimi. Misafir günde 1, üye günde 3. Cüzdan yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-tezgah-grant",
    ["POST"],
    "/api/tezgah/grant/generate",
    "product-write",
    true,
    "Hibe proje dosyası. Misafir günde 1, üye günde 3. Katalog kodda eşleşir. Taslak ve cüzdan yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-tezgah-tetkik",
    ["POST"],
    "/api/tezgah/tetkik/generate",
    "product-write",
    true,
    "Web sitesi tetkiki. Misafir günde 1, üye günde 3. Skor kodda. Cüzdan yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-tezgah-dukkan",
    ["POST"],
    "/api/tezgah/dukkan/generate",
    "product-write",
    true,
    "Sektörel dijital dükkan. Misafir günde 1, üye günde 3. Şablon basar, skor kodda. Cüzdan yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-tezgah-reklam",
    ["POST"],
    "/api/tezgah/reklam/generate",
    "product-write",
    true,
    "Otonom reklam paketi. Misafir günde 1, üye günde 3. Metin mühürlenir. Cüzdan yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-tezgah-pazaryeri",
    ["POST"],
    "/api/tezgah/pazaryeri/generate",
    "product-write",
    true,
    "Pazaryeri katalog CSV. Misafir günde 1, üye günde 3. Tablo kodda basılır. Cüzdan yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-commerce-store",
    ["POST"],
    "/api/commerce/stores",
    "product-write",
    true,
    `Mağaza açılışı. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-store-patch",
    ["PATCH"],
    "/api/commerce/stores/[storeId]",
    "product-write",
    true,
    `Mağaza adı, adresi ve durumu. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-product",
    ["POST"],
    "/api/commerce/stores/[storeId]/products",
    "product-write",
    true,
    `Tek manuel kart. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-product-patch",
    ["PATCH"],
    "/api/commerce/stores/[storeId]/products/[productId]",
    "product-write",
    true,
    `Kart metni, özellik ve arşiv. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-variant",
    ["POST"],
    "/api/commerce/stores/[storeId]/products/[productId]/variants",
    "product-write",
    true,
    `İkinci varyant. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-variant-patch",
    ["PATCH"],
    "/api/commerce/stores/[storeId]/variants/[variantId]",
    "product-write",
    true,
    `SKU, barkod, fiyat ve emniyet tamponu. Stok yazılmaz. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-inventory",
    ["POST"],
    "/api/commerce/stores/[storeId]/inventory",
    "product-write",
    true,
    `Tek atomik stok hareketi. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-import-pazaryeri",
    ["POST"],
    "/api/commerce/stores/[storeId]/imports/pazaryeri",
    "product-write",
    true,
    `Tezgâh katalog aktarması. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-import-csv",
    ["POST"],
    "/api/commerce/stores/[storeId]/imports/csv",
    "product-write",
    true,
    `Dolu CSV aktarması. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-credential-hepsiburada",
    ["PUT", "DELETE"],
    "/api/commerce/stores/[storeId]/credentials/hepsiburada",
    "product-write",
    true,
    `Hepsiburada kimlik kasası. Düz anahtar dönmez. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-credential",
    ["PUT", "DELETE"],
    "/api/commerce/stores/[storeId]/credentials/trendyol",
    "product-write",
    true,
    `Trendyol kimlik kasası. Düz anahtar dönmez. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-listing-hepsiburada",
    ["PUT", "DELETE"],
    "/api/commerce/stores/[storeId]/listings/hepsiburada",
    "product-write",
    true,
    `Hepsiburada ilan eşlemesi. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-listing",
    ["PUT", "DELETE"],
    "/api/commerce/stores/[storeId]/listings/trendyol",
    "product-write",
    true,
    `Trendyol ilan eşlemesi. ${COMMERCE_WRITE_NOTE}`,
  ),
  ...verbs(
    "product-commerce-subscription",
    ["POST"],
    "/api/commerce/stores/[storeId]/subscription",
    "product-write",
    true,
    "Commerce aylık lisans. PayTR niyeti commerce-license:monthly. Idempotency-Key zorunlu. Pazaryeri cirosu yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "hmac-hepsiburada",
    ["POST"],
    "/api/commerce/webhooks/hepsiburada",
    "hmac",
    true,
    "Hepsiburada webhook. x-api-key veya Basic sır timingSafeEqual ile tutulmadan stok yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "hmac-trendyol",
    ["POST"],
    "/api/commerce/webhooks/trendyol",
    "hmac",
    true,
    "Trendyol webhook. x-api-key veya Basic sır timingSafeEqual ile tutulmadan stok yazılmaz. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-billing",
    ["PUT"],
    "/api/profile/billing",
    "product-write",
    true,
    "Fatura bilgisi yazması. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-account-close",
    ["POST"],
    "/api/profile/close",
    "product-write",
    true,
    "Hesap kapatma. v1 hop satırı yoktur.",
  ),
  ...verbs(
    "product-career-visa-sync",
    ["POST"],
    "/api/career/visas",
    "product-write",
    true,
    "Vize damgası senkronu. Hop career-visas yalnız GET’tir.",
  ),
  ...verbs(
    "locked-junior-grade",
    ["POST"],
    "/api/junior-pilot/grade",
    "locked-temporary",
    true,
    "Kilitli geçici uç. v1 çağrısı 404 kalır. Env tek başına sicile yazmaz.",
  ),
  ...verbs("closed-freelancer-jobs", ["POST"], "/api/freelancer/jobs", "closed-room", true, CLOSED_ROOM_NOTE),
  ...verbs(
    "closed-freelancer-job",
    ["DELETE"],
    "/api/freelancer/jobs/[id]",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  ...verbs(
    "closed-freelancer-accept",
    ["POST"],
    "/api/freelancer/jobs/[id]/accept",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  ...verbs(
    "closed-freelancer-bids",
    ["POST"],
    "/api/freelancer/jobs/[id]/bids",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  ...verbs(
    "closed-freelancer-messages",
    ["POST"],
    "/api/freelancer/contracts/[id]/messages",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  ...verbs(
    "closed-freelancer-release",
    ["POST"],
    "/api/freelancer/contracts/[id]/release",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  ...verbs(
    "closed-freelancer-contract-refund",
    ["POST"],
    "/api/freelancer/contracts/[id]/refund",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  ...verbs(
    "closed-freelancer-contract-dispute",
    ["POST"],
    "/api/freelancer/contracts/[id]/dispute",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  ...verbs(
    "closed-freelancer-dispute",
    ["POST"],
    "/api/freelancer/dispute",
    "closed-room",
    true,
    CLOSED_ROOM_NOTE,
  ),
  route(
    "read-academy-certificates",
    "GET",
    "/api/academy/certificates",
    "web-read",
    false,
    "Sertifika listesi. Hop academy-certificate yalnız hash okur.",
  ),
  route(
    "read-academy-courses",
    "GET",
    "/api/academy/courses",
    "web-read",
    false,
    "Akademi kurs listesi. v1 hop satırı yoktur.",
  ),
  route(
    "read-academy-course",
    "GET",
    "/api/academy/courses/[id]",
    "web-read",
    false,
    "Akademi kurs okuması. v1 hop satırı yoktur.",
  ),
  route(
    "read-exemption",
    "GET",
    "/api/academy/courses/[id]/exemption",
    "web-read",
    false,
    "Muafiyet okuması. Yazma fiili aynı yolda POST’tur ve web-only yazma listesindedir.",
  ),
  route(
    "read-dashboard-pulse",
    "GET",
    "/api/dashboard/pulse",
    "web-read",
    false,
    "Panel nabzı. v1 hop satırı wallet-strip’tir.",
  ),
  route(
    "read-commerce-stores",
    "GET",
    "/api/commerce/stores",
    "web-read",
    false,
    "Kendi mağazaları. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-store",
    "GET",
    "/api/commerce/stores/[storeId]",
    "web-read",
    false,
    "Tek mağaza. Başkasının kaydı 404. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-products",
    "GET",
    "/api/commerce/stores/[storeId]/products",
    "web-read",
    false,
    "Kartlar ve varyantlar. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-product",
    "GET",
    "/api/commerce/stores/[storeId]/products/[productId]",
    "web-read",
    false,
    "Tek kart. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-inventory",
    "GET",
    "/api/commerce/stores/[storeId]/inventory",
    "web-read",
    false,
    "Stok defteri. variantId süzebilir. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-credential-hepsiburada",
    "GET",
    "/api/commerce/stores/[storeId]/credentials/hepsiburada",
    "web-read",
    false,
    "Maskeli Hepsiburada kimliği. Şifre çözülmez. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-credential",
    "GET",
    "/api/commerce/stores/[storeId]/credentials/trendyol",
    "web-read",
    false,
    "Maskeli Trendyol kimliği. Şifre çözülmez. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-listings-hepsiburada",
    "GET",
    "/api/commerce/stores/[storeId]/listings/hepsiburada",
    "web-read",
    false,
    "Hepsiburada ilan eşlemeleri. v1 hop satırı yoktur.",
  ),
  route(
    "read-commerce-listings",
    "GET",
    "/api/commerce/stores/[storeId]/listings/trendyol",
    "web-read",
    false,
    "Trendyol ilan eşlemeleri. v1 hop satırı yoktur.",
  ),
  route(
    "read-career-portfolio",
    "GET",
    "/api/career/portfolio",
    "web-read",
    false,
    "Portföy okuması. Hop career-portfolio yalnız POST’tur.",
  ),
  route(
    "read-health-live",
    "GET",
    "/api/health/live",
    "web-read",
    false,
    "Canlılık yoklaması. Hop health yalnız /api/health yoludur.",
  ),
  route(
    "read-tezgah-quota",
    "GET",
    "/api/tezgah/quota",
    "web-read",
    false,
    "AI Tezgâh günlük hak okuması. Hak düşmez. v1 hop satırı yoktur.",
  ),
  route(
    "read-billing",
    "GET",
    "/api/profile/billing",
    "web-read",
    false,
    "Fatura okuması. Yazma fiili aynı yolda PUT’tur ve web-only yazma listesindedir.",
  ),
  route("read-freelancer-contracts", "GET", "/api/freelancer/contracts", "closed-room", false, CLOSED_ROOM_NOTE),
  route(
    "read-freelancer-contract",
    "GET",
    "/api/freelancer/contracts/[id]",
    "closed-room",
    false,
    CLOSED_ROOM_NOTE,
  ),
  route(
    "read-freelancer-messages",
    "GET",
    "/api/freelancer/contracts/[id]/messages",
    "closed-room",
    false,
    CLOSED_ROOM_NOTE,
  ),
  route("read-freelancer-jobs", "GET", "/api/freelancer/jobs", "closed-room", false, CLOSED_ROOM_NOTE),
  route("read-freelancer-job", "GET", "/api/freelancer/jobs/[id]", "closed-room", false, CLOSED_ROOM_NOTE),
  route("read-freelancer-dispute", "GET", "/api/freelancer/dispute", "closed-room", false, CLOSED_ROOM_NOTE),
  route(
    "read-client-bids",
    "GET",
    "/api/client/jobs/[id]/bids",
    "closed-room",
    false,
    CLOSED_ROOM_NOTE,
  ),
  route(
    "read-yetkinhibe-grant-catalog",
    "GET",
    "/api/yetkinhibe/grant/catalog",
    "closed-room",
    false,
    YETKINHIBE_CLOSED_ROOM_NOTE,
  ),
  route(
    "closed-yetkinhibe-grant-match",
    "POST",
    "/api/yetkinhibe/grant/match",
    "closed-room",
    true,
    YETKINHIBE_MATCH_NOTE,
  ),
];

/** Hop olmayan her fiil. Birleşme kapısı bunu ve `RAIL_V1_HOPS_META` birlikte okur. */
export const WEB_BFF_NON_HOP_ROUTES: readonly WebBffRouteRecord[] = [...NAMED_ROUTES, ...tombstones()];

/**
 * Canlı koç ve ders asistanı bu statüde donduruldu.
 * Native allowlist bu yolları çağırmaz. Hop satırı, hop Zod şeması ve Idempotency-Key açılmaz.
 */
export const FROZEN_PRODUCT_WRITE_KEYS = [
  "POST /api/junior/live-tutor",
  "POST /api/academy/lesson-assistant",
] as const;

/** v1 siciline girmeyen kasıtlı yazma, operasyon ve kilit satırları. */
export const WEB_ONLY_WRITE_ROUTES: readonly WebOnlyWriteRoute[] = WEB_BFF_NON_HOP_ROUTES.filter(
  (row): row is WebOnlyWriteRoute => row.write,
);

export function webOnlyRouteKey(method: string, path: string): string {
  return `${method.toUpperCase()} ${path}`;
}
