/**
 * Kenar `/api/v1` hop allowlist.
 * Sicilde olmayan yol kanonik handler'a rewrite edilmez; 404 zarf.
 * Zod / OpenAPI bu dosyaya girmez. `RAIL_V1_HOPS` ile 1:1 kilit testtedir.
 */

import { isApiV1Pathname } from "@/lib/kernel/http/api-v1";
import { EDGE_API_NOT_FOUND_ERROR } from "@/lib/kernel/security/edge-api-auth";
import { normalizePathname } from "@/lib/kernel/security/edge-guard";

export const RAIL_V1_HOP_NOT_FOUND = EDGE_API_NOT_FOUND_ERROR;

export type RailV1HopGate = {
  id: string;
  method: "GET" | "POST";
  v1PathTemplate: string;
};

export type RailV1HopGateDecision =
  | { kind: "skip" }
  | { kind: "next" }
  | { kind: "fail"; status: 404; error: string };

/**
 * Kenar allowlist — `RAIL_V1_HOPS` id / method / v1PathTemplate ile birebir.
 * Yeni hop önce sözleşmeye, sonra buraya yazılır; test sapmayı kırar.
 */
export const RAIL_V1_HOP_GATES = [
  { id: "health", method: "GET", v1PathTemplate: "/api/v1/health" },
  { id: "academy-certificate", method: "GET", v1PathTemplate: "/api/v1/academy/certificates/{hash}" },
  { id: "auth-session", method: "GET", v1PathTemplate: "/api/v1/auth/session" },
  { id: "wallet-strip", method: "GET", v1PathTemplate: "/api/v1/dashboard/wallet-strip" },
  { id: "freelancer-pulse", method: "GET", v1PathTemplate: "/api/v1/dashboard/freelancer-pulse" },
  { id: "freelancer-jobs", method: "GET", v1PathTemplate: "/api/v1/freelancer/jobs" },
  { id: "client-job-bids", method: "GET", v1PathTemplate: "/api/v1/client/jobs/{id}/bids" },
  { id: "freelancer-bid", method: "POST", v1PathTemplate: "/api/v1/freelancer/jobs/{id}/bids" },
  { id: "freelancer-accept", method: "POST", v1PathTemplate: "/api/v1/freelancer/jobs/{id}/accept" },
  { id: "freelancer-contracts", method: "GET", v1PathTemplate: "/api/v1/freelancer/contracts" },
  { id: "freelancer-delivery", method: "POST", v1PathTemplate: "/api/v1/freelancer/contracts/{id}/messages" },
  { id: "freelancer-release", method: "POST", v1PathTemplate: "/api/v1/freelancer/contracts/{id}/release" },
  { id: "freelancer-refund", method: "POST", v1PathTemplate: "/api/v1/freelancer/contracts/{id}/refund" },
] as const satisfies readonly RailV1HopGate[];

const TEMPLATE_RE = new Map<string, RegExp>(
  RAIL_V1_HOP_GATES.map((hop) => [hop.v1PathTemplate, compileRailV1PathTemplate(hop.v1PathTemplate)]),
);

export function compileRailV1PathTemplate(template: string): RegExp {
  const source = template
    .replace(/\{([A-Za-z0-9_]+)\}/g, "\u0000param\u0000")
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\u0000param\u0000/g, "[^/]+");
  return new RegExp(`^${source}$`);
}

export function matchRailV1PathTemplate(pathname: string, template: string): boolean {
  const compiled = TEMPLATE_RE.get(template) ?? compileRailV1PathTemplate(template);
  return compiled.test(normalizePathname(pathname));
}

export function findRailV1Hop(pathname: string, method: string): RailV1HopGate | null {
  const path = normalizePathname(pathname);
  const verb = method.trim().toUpperCase();
  for (const hop of RAIL_V1_HOP_GATES) {
    if (hop.method === verb && matchRailV1PathTemplate(path, hop.v1PathTemplate)) {
      return hop;
    }
  }
  return null;
}

export function isPublishedRailV1Path(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return RAIL_V1_HOP_GATES.some((hop) => matchRailV1PathTemplate(path, hop.v1PathTemplate));
}

export const RAIL_V1_HOP_UNPUBLISHED = "Yayınlanmamış v1 hop.";

/** Dron / web istemcisi yalnız sicildeki method+path konuşur. */
export function assertPublishedRailV1Hop(pathname: string, method: string): RailV1HopGate {
  const hop = findRailV1Hop(pathname, method);
  if (!hop) {
    throw new Error(`${RAIL_V1_HOP_UNPUBLISHED} ${method.toUpperCase()} ${pathname}`);
  }
  return hop;
}

/**
 * v1 olmayan yollar skip. OPTIONS: path sicildeyse next, değilse 404.
 * Diğer metod: method+path sicildeyse next, değilse 404 (rewrite yok).
 */
export function decideRailV1HopGate(input: {
  pathname: string;
  method?: string;
}): RailV1HopGateDecision {
  if (!isApiV1Pathname(input.pathname)) {
    return { kind: "skip" };
  }
  const method = (input.method ?? "GET").toUpperCase();
  if (method === "OPTIONS") {
    if (isPublishedRailV1Path(input.pathname)) {
      return { kind: "next" };
    }
    return { kind: "fail", status: 404, error: RAIL_V1_HOP_NOT_FOUND };
  }
  if (findRailV1Hop(input.pathname, method)) {
    return { kind: "next" };
  }
  return { kind: "fail", status: 404, error: RAIL_V1_HOP_NOT_FOUND };
}
