/**
 * Dron hop allowlist — sunucu `@yetkin/kernel` `RAIL_V1_HOPS_META` ile hizalı.
 * Yazma hop'ları (satın alma, kilit, müfredat, sınav, cüzdan yükleme, portföy, profil)
 * Bearer + Idempotency-Key. Müfredat/sınav GET okuma hop'ları T3 halkası.
 * Native IAP yoktur; cüzdan DEBIT ve PayTR top-up hop'u açıktır.
 */

import {
  RAIL_V1_HOPS_META,
  isRailV1HopMetaDronForbidden,
} from "@yetkin/kernel/http/v1-hops-meta";

export const DRON_FAZ2_FROZEN =
  "Faz 2 Tezgâh hop'u donduruldu. Dron Faz 1 kapanışına kadar donuk laboratuvardır.";

/**
 * Closed Testing T3-only yüzey.
 * true: "Açık işler / İşlerim" sekmesi gizlenir; kilit kartı 410 basmaz;
 * loadHome Tezgâh hop'una HTTP atmaz.
 * Split + hop geri yazımından sonra false yapılır.
 */
export const DRON_TEZGAH_STORE_ISOLATED: boolean = true;

/** Yayınlanmış B2C hop'ları — Dron'un çağırabileceği uçlar. */
export const RAIL_IS_DAY0_HOPS = {
  health: { method: "GET", path: "/api/v1/health" },
  academyCertificate: {
    method: "GET",
    pathTemplate: "/api/v1/academy/certificates/{hash}",
  },
  academyPulse: { method: "GET", path: "/api/v1/academy/pulse" },
  academyPurchase: {
    method: "POST",
    pathTemplate: "/api/v1/academy/courses/{id}/purchase",
  },
  academyLock: {
    method: "POST",
    pathTemplate: "/api/v1/academy/courses/{id}/lock",
  },
  academyCurriculum: {
    method: "POST",
    pathTemplate: "/api/v1/academy/courses/{id}/curriculum",
  },
  academyCurriculumRead: {
    method: "GET",
    pathTemplate: "/api/v1/academy/courses/{id}/curriculum",
  },
  academyExam: {
    method: "POST",
    pathTemplate: "/api/v1/academy/courses/{id}/exam",
  },
  academyExamRead: {
    method: "GET",
    pathTemplate: "/api/v1/academy/courses/{id}/exam",
  },
  session: { method: "GET", path: "/api/v1/auth/session" },
  walletStrip: { method: "GET", path: "/api/v1/dashboard/wallet-strip" },
  walletTopUp: { method: "POST", path: "/api/v1/wallet/top-up" },
  careerPulse: { method: "GET", path: "/api/v1/career/pulse" },
  careerVisas: { method: "GET", path: "/api/v1/career/visas" },
  careerPortfolio: { method: "POST", path: "/api/v1/career/portfolio" },
  profilePatch: { method: "PATCH", path: "/api/v1/profile" },
} as const;

/**
 * Faz 2 Tezgâh sicili — canlı allowlist değildir.
 * Kenar 410 / unpublished hop; Dron istemci bu path'lere HTTP atmaz.
 */
export const RAIL_IS_FAZ2_FROZEN_HOPS = {
  jobs: { method: "GET", path: "/api/v1/freelancer/jobs" },
  bid: { method: "POST", pathTemplate: "/api/v1/freelancer/jobs/{id}/bids" },
  ownerBids: { method: "GET", pathTemplate: "/api/v1/client/jobs/{id}/bids" },
  accept: { method: "POST", pathTemplate: "/api/v1/freelancer/jobs/{id}/accept" },
  contracts: { method: "GET", path: "/api/v1/freelancer/contracts" },
  delivery: {
    method: "POST",
    pathTemplate: "/api/v1/freelancer/contracts/{id}/messages",
  },
  release: {
    method: "POST",
    pathTemplate: "/api/v1/freelancer/contracts/{id}/release",
  },
} as const;

/** Tezgâh odak / ön plan anketi. Faz 2 lab; 5 sn altı yasak varsayımı. */
export const RAIL_IS_BENCH_POLL_MS = 30_000;

function compileRailV1PathTemplate(template: string): RegExp {
  const source = template
    .replace(/\{([A-Za-z0-9_]+)\}/g, "\u0000param\u0000")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\u0000param\u0000/g, "[^/]+");
  return new RegExp(`^${source}$`);
}

const DAY0_MATCHERS = RAIL_V1_HOPS_META.filter((hop) => !isRailV1HopMetaDronForbidden(hop)).map(
  (hop) => ({
    method: hop.method,
    re: compileRailV1PathTemplate(hop.v1PathTemplate),
  }),
);

function normalizeMethod(method: string): string {
  return method.trim().toUpperCase();
}

function assertSafeId(value: string, label: string): string {
  const id = value.trim();
  if (!id || id.includes("/") || id.includes("?") || id.includes("#")) {
    throw new Error(`${label} kimliği geçersiz.`);
  }
  return id;
}

export function academyCertificatePath(hash: string): string {
  return `/api/v1/academy/certificates/${assertSafeId(hash, "Mühür")}`;
}

export function academyCourseWritePath(
  courseId: string,
  leaf: "purchase" | "lock" | "curriculum" | "exam",
): string {
  return `/api/v1/academy/courses/${assertSafeId(courseId, "Kurs")}/${leaf}`;
}

/** Faz 2 sicil path üreticisi — canlı allowlist'e girmez. */
export function freelancerBidPath(jobId: string): string {
  return `/api/v1/freelancer/jobs/${assertSafeId(jobId, "İş")}/bids`;
}

export function clientJobBidsPath(jobId: string): string {
  return `/api/v1/client/jobs/${assertSafeId(jobId, "İş")}/bids`;
}

export function freelancerAcceptPath(jobId: string): string {
  return `/api/v1/freelancer/jobs/${assertSafeId(jobId, "İş")}/accept`;
}

export function freelancerDeliveryPath(contractId: string): string {
  return `/api/v1/freelancer/contracts/${assertSafeId(contractId, "Sözleşme")}/messages`;
}

export function freelancerReleasePath(contractId: string): string {
  return `/api/v1/freelancer/contracts/${assertSafeId(contractId, "Sözleşme")}/release`;
}

export function isRailIsDay0Path(path: string, method = "GET"): boolean {
  const pathname = path.split("?")[0] ?? path;
  const verb = normalizeMethod(method);
  return DAY0_MATCHERS.some((row) => row.method === verb && row.re.test(pathname));
}

export function assertRailIsDay0Path(path: string, method = "GET"): string {
  const pathname = (path.split("?")[0] ?? path).trim();
  if (!pathname.startsWith("/api/v1/")) {
    throw new Error("Dron yalnız /api/v1 konuşur.");
  }
  if (!isRailIsDay0Path(pathname, method)) {
    throw new Error(`Gün 0 allowlist dışı hop: ${pathname}`);
  }
  return pathname;
}
