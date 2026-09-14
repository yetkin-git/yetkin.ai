/**
 * Kenar + sözleşme hop kimliği — tek sicil.
 * Zod / OpenAPI / DTO bu dosyaya girmez. `v1-hop-gate` meta türetir;
 * `v1-contract` aynı meta üzerine Zod şeması bindirir.
 *
 * Tedavi + Faz 2 hazırlık (Eylül 2026): yazma hop'ları ve cüzdan yükleme
 * API-First yayınlanır. Müfredat/sınav GET okuma hop'ları T3 halkası içindir.
 * Freelancer hop'ları Split + kamu kilidi kalkınca geri yazılır.
 */

export type RailV1HopMethod = "GET" | "POST" | "PATCH";
export type RailV1WireAuth = "none" | "bearer";

export type RailV1HopMeta = {
  id: string;
  method: RailV1HopMethod;
  v1PathTemplate: string;
  v1Auth: RailV1WireAuth;
  cookieAuth: false;
  /** Dron / native mağaza bu hop'u çağırmaz (IAP). Native IAP hâlâ yasak; cüzdan DEBIT hop'u açık olabilir. */
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
  },
  {
    id: "academy-lock",
    method: "POST",
    v1PathTemplate: "/api/v1/academy/courses/{id}/lock",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "academy-curriculum",
    method: "POST",
    v1PathTemplate: "/api/v1/academy/courses/{id}/curriculum",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "academy-curriculum-read",
    method: "GET",
    v1PathTemplate: "/api/v1/academy/courses/{id}/curriculum",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "academy-exam",
    method: "POST",
    v1PathTemplate: "/api/v1/academy/courses/{id}/exam",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "academy-exam-read",
    method: "GET",
    v1PathTemplate: "/api/v1/academy/courses/{id}/exam",
    v1Auth: "bearer",
    cookieAuth: false,
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
    id: "wallet-top-up",
    method: "POST",
    v1PathTemplate: "/api/v1/wallet/top-up",
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
  {
    id: "career-portfolio",
    method: "POST",
    v1PathTemplate: "/api/v1/career/portfolio",
    v1Auth: "bearer",
    cookieAuth: false,
  },
  {
    id: "profile-patch",
    method: "PATCH",
    v1PathTemplate: "/api/v1/profile",
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
