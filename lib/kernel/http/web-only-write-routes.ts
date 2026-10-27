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
    "Sohbet yazması. v1 hop satırı yoktur.",
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
