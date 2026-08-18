/**
 * Gün 0 + Tezgâh hop allowlist — sicilde yayınlanmış, dilimde tüketilen uçlar.
 * Unpublished rewrite sızıntısı (GET jobs/{id}, GET messages, top-up, refund) çağrılmaz.
 * POST …/messages yalnız kind=DELIVERY dar hop'udur; GET thread PII'si allowlist dışıdır.
 * POST …/release yalnız işveren hak edişidir; usta çağrısı sunucuda 403'tür.
 * GET …/client/jobs/{id}/bids yalnız ilan sahibidir; bidderId sızmaz.
 * POST …/accept yalnız işveren DEBIT'idir; usta çağrısı sunucuda 403'tür.
 */

export const RAIL_IS_DAY0_HOPS = {
  session: { method: "GET", path: "/api/v1/auth/session" },
  jobs: { method: "GET", path: "/api/v1/freelancer/jobs" },
  bid: { method: "POST", pathTemplate: "/api/v1/freelancer/jobs/{id}/bids" },
  ownerBids: { method: "GET", pathTemplate: "/api/v1/client/jobs/{id}/bids" },
  accept: { method: "POST", pathTemplate: "/api/v1/freelancer/jobs/{id}/accept" },
  walletStrip: { method: "GET", path: "/api/v1/dashboard/wallet-strip" },
  contracts: { method: "GET", path: "/api/v1/freelancer/contracts" },
  delivery: { method: "POST", pathTemplate: "/api/v1/freelancer/contracts/{id}/messages" },
  release: { method: "POST", pathTemplate: "/api/v1/freelancer/contracts/{id}/release" },
} as const;

/** Tezgâh odak / ön plan anketi. 5 sn altı yasak varsayımı. */
export const RAIL_IS_BENCH_POLL_MS = 30_000;

const DAY0_EXACT = new Set<string>([
  RAIL_IS_DAY0_HOPS.session.path,
  RAIL_IS_DAY0_HOPS.jobs.path,
  RAIL_IS_DAY0_HOPS.walletStrip.path,
  RAIL_IS_DAY0_HOPS.contracts.path,
]);

const BID_PATH_RE = /^\/api\/v1\/freelancer\/jobs\/[^/?#]+\/bids$/;
const OWNER_BIDS_PATH_RE = /^\/api\/v1\/client\/jobs\/[^/?#]+\/bids$/;
const ACCEPT_PATH_RE = /^\/api\/v1\/freelancer\/jobs\/[^/?#]+\/accept$/;
const DELIVERY_PATH_RE = /^\/api\/v1\/freelancer\/contracts\/[^/?#]+\/messages$/;
const RELEASE_PATH_RE = /^\/api\/v1\/freelancer\/contracts\/[^/?#]+\/release$/;

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
  if (DAY0_EXACT.has(pathname)) {
    return verb === "GET";
  }
  if (BID_PATH_RE.test(pathname)) {
    return verb === "POST";
  }
  if (OWNER_BIDS_PATH_RE.test(pathname)) {
    return verb === "GET";
  }
  if (ACCEPT_PATH_RE.test(pathname)) {
    return verb === "POST";
  }
  if (DELIVERY_PATH_RE.test(pathname)) {
    return verb === "POST";
  }
  if (RELEASE_PATH_RE.test(pathname)) {
    return verb === "POST";
  }
  return false;
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
