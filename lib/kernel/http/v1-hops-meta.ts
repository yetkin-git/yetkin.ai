/**
 * Kenar + sözleşme hop kimliği — tek sicil.
 * Zod / OpenAPI / DTO bu dosyaya girmez. `v1-hop-gate` meta türetir;
 * `v1-contract` aynı meta üzerine Zod şeması bindirir.
 *
 * PayTR B2C (Eylül 2026): 8 freelancer hop sözleşmeden düşürüldü —
 * freelancer-jobs, client-job-bids, freelancer-bid, freelancer-accept,
 * freelancer-contracts, freelancer-delivery, freelancer-release,
 * freelancer-refund. Kalan 8 hop: health, academy-*, auth-session,
 * wallet-strip, career-*. Freelancer Zod DTO'ları + hata metinleri
 * `v1-contract.ts` içinde durur (handler doğrulaması + Faz 2 geri dönüş).
 * Kenar 410 (`isFrozenRoomApi`) hop sicilinden ÖNCE çalışır; kamu davranışı
 * değişmez. Faz 2 (Split): hop'ları buraya + `RAIL_V1_HOP_CONTRACTS` içine
 * geri yaz, `generate:openapi-v1` + `generate:v1-client` çalıştır.
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
