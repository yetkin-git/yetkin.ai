/**
 * K6 — `export const auth` kind'ını kenarda oku.
 * session = kenarda doğrulanmış JWT (`resolveEdgeSession`). İpucu yetmez.
 * admin = doğrulanmış JWT + SUPER_ADMIN_USER_ID eşitliği. Boş env = 403.
 * public / webhook imzasız geçer; webhook imzası handler'dadır.
 */

import { isSuperAdminUser } from "@/lib/kernel/auth/super-admin";
import {
  isApiPathname,
  isEdgeOpenApiAuthKind,
  matchApiAuthKind,
} from "@/lib/kernel/security/api-auth";
import { normalizePathname } from "@/lib/kernel/security/edge-guard";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

export const EDGE_API_SESSION_ERROR = "Oturum gerekli.";
export const EDGE_API_FORBIDDEN_ERROR = "Bu sığınak Super Admin kilidine bağlıdır.";
export const EDGE_API_NOT_FOUND_ERROR = "API yolu bulunamadı.";

export type EdgeApiDecision =
  | { kind: "skip" }
  | { kind: "next" }
  | { kind: "deny"; status: 401 | 403 | 404; error: string };

export function decideEdgeApiAuth(input: {
  pathname: string;
  method?: string;
  sessionHint: boolean;
  sessionUserId?: string | null;
  map?: Record<string, string>;
}): EdgeApiDecision {
  // sessionHint adı tarihîdir; çağıran kenar JWT doğrulaması geçirmelidir.
  const pathname = normalizePathname(input.pathname);
  if (!isApiPathname(pathname)) {
    return { kind: "skip" };
  }

  const method = (input.method ?? "GET").toUpperCase();
  if (method === "OPTIONS") {
    return { kind: "next" };
  }

  const map = input.map ?? (ROUTE_AUTH_MAP as Record<string, string>);
  const authKind = matchApiAuthKind(pathname, map);
  if (!authKind) {
    return { kind: "deny", status: 404, error: EDGE_API_NOT_FOUND_ERROR };
  }
  if (isEdgeOpenApiAuthKind(authKind)) {
    return { kind: "next" };
  }
  if (!input.sessionHint) {
    return { kind: "deny", status: 401, error: EDGE_API_SESSION_ERROR };
  }
  if (authKind === "admin") {
    const userId = input.sessionUserId?.trim() ?? "";
    if (!userId || !isSuperAdminUser(userId)) {
      return { kind: "deny", status: 403, error: EDGE_API_FORBIDDEN_ERROR };
    }
  }
  return { kind: "next" };
}
