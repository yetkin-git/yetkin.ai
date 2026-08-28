/**
 * Kenar + sözleşme hop kimliği — tek sicil.
 * Zod / OpenAPI / DTO bu dosyaya girmez. `v1-hop-gate` meta türetir;
 * `v1-contract` aynı meta üzerine Zod şeması bindirir.
 */

export type RailV1HopMethod = "GET" | "POST";
export type RailV1WireAuth = "none" | "bearer";

export type RailV1HopMeta = {
  id: string;
  method: RailV1HopMethod;
  v1PathTemplate: string;
  v1Auth: RailV1WireAuth;
  cookieAuth: false;
  /** Dron / native mağaza bu hop'u çağırmaz (IAP). */
  dronForbidden?: true;
};

export const RAIL_V1_HOPS_META = [
  {
    id: "health",
    method: "GET",
    v1PathTemplate: "/api/v1/health",
    v1Auth: "none",
    cookieAuth: false,
  },
  {
    id: "academy-certificate",
    method: "GET",
    v1PathTemplate: "/api/v1/academy/certificates/{hash}",
    v1Auth: "none",
    cookieAuth: false,
  },
  {
    id: "academy-pulse",
    method: "GET",
    v1PathTemplate: "/api/v1/academy/pulse",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "academy-purchase",
    method: "POST",
    v1PathTemplate: "/api/v1/academy/courses/{id}/purchase",
    v1Auth: "bearer",
    cookieAuth: false,
    dronForbidden: true,
  },
  {
    id: "auth-session",
    method: "GET",
    v1PathTemplate: "/api/v1/auth/session",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "wallet-strip",
    method: "GET",
    v1PathTemplate: "/api/v1/dashboard/wallet-strip",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "freelancer-jobs",
    method: "GET",
    v1PathTemplate: "/api/v1/freelancer/jobs",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "client-job-bids",
    method: "GET",
    v1PathTemplate: "/api/v1/client/jobs/{id}/bids",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "freelancer-bid",
    method: "POST",
    v1PathTemplate: "/api/v1/freelancer/jobs/{id}/bids",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "freelancer-accept",
    method: "POST",
    v1PathTemplate: "/api/v1/freelancer/jobs/{id}/accept",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "freelancer-contracts",
    method: "GET",
    v1PathTemplate: "/api/v1/freelancer/contracts",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "freelancer-delivery",
    method: "POST",
    v1PathTemplate: "/api/v1/freelancer/contracts/{id}/messages",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "freelancer-release",
    method: "POST",
    v1PathTemplate: "/api/v1/freelancer/contracts/{id}/release",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "freelancer-refund",
    method: "POST",
    v1PathTemplate: "/api/v1/freelancer/contracts/{id}/refund",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "career-pulse",
    method: "GET",
    v1PathTemplate: "/api/v1/career/pulse",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "career-visas",
    method: "GET",
    v1PathTemplate: "/api/v1/career/visas",
    v1Auth: "bearer",
    cookieAuth: false,
  },
] as const satisfies readonly RailV1HopMeta[];

export type RailV1HopId = (typeof RAIL_V1_HOPS_META)[number]["id"];

export function isRailV1HopMetaDronForbidden(
  hop: (typeof RAIL_V1_HOPS_META)[number] | string,
): boolean {
  if (typeof hop === "string") {
    return RAIL_V1_HOPS_META.some((row) => row.id === hop && "dronForbidden" in row);
  }
  return "dronForbidden" in hop;
}

export const RAIL_V1_DRON_FORBIDDEN_HOP_IDS = RAIL_V1_HOPS_META.filter(
  (hop) => isRailV1HopMetaDronForbidden(hop),
).map((hop) => hop.id);
