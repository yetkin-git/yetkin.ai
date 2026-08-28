/**
 * K6 — `export const auth` kind'ını kenarda oku.
 * session = kenarda doğrulanmış JWT (`resolveEdgeSession`). İpucu yetmez.
 * admin = doğrulanmış JWT + SUPER_ADMIN_USER_ID veya env kanonik Super Admin e-postası.
 * Boş UUID ve boş e-posta env kimseyi admin yapmaz.
 * public / webhook imzasız geçer; webhook imzası handler'dadır.
 */

import { isSuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { FROZEN_SHELL_ROOM_IDS } from "@/lib/kernel/compliance/circuit-breakers";
import { canonicalApiPathname } from "@/lib/kernel/http/api-v1";
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
export const EDGE_API_FROZEN_ROOM_ERROR = "Bu oda üretimde kapalı.";

export type EdgeApiDecision =
  | { kind: "skip" }
  | { kind: "next" }
  | { kind: "deny"; status: 401 | 403 | 404 | 410; error: string };

const MUTATING_HTTP_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isFrozenRoomApi(pathname: string): boolean {
  const path = canonicalApiPathname(pathname);
  return (FROZEN_SHELL_ROOM_IDS as readonly string[]).some(
    (id) => path === `/api/${id}` || path.startsWith(`/api/${id}/`),
  );
}

/** @deprecated isFrozenRoomApi — okuma da 410. */
export function isFrozenRoomApiWrite(pathname: string, method: string): boolean {
  if (!MUTATING_HTTP_METHODS.has(method.toUpperCase())) {
    return false;
  }
  return isFrozenRoomApi(pathname);
}

export function decideEdgeApiAuth(input: {
  pathname: string;
  method?: string;
  sessionHint: boolean;
  sessionUserId?: string | null;
  sessionEmail?: string | null;
  map?: Record<string, string>;
}): EdgeApiDecision {
  // sessionHint adı tarihîdir; çağıran kenar JWT doğrulaması geçirmelidir.
  const pathname = normalizePathname(input.pathname);
  if (!isApiPathname(pathname)) {
    return { kind: "skip" };
  }

  const method = (input.method ?? "GET").toUpperCase();
  if (method === "OPTIONS" && !isFrozenRoomApi(pathname)) {
    return { kind: "next" };
  }

  if (isFrozenRoomApi(pathname)) {
    return { kind: "deny", status: 410, error: EDGE_API_FROZEN_ROOM_ERROR };
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
    if (
      !userId ||
      !isSuperAdminActor({ id: userId, email: input.sessionEmail })
    ) {
      return { kind: "deny", status: 403, error: EDGE_API_FORBIDDEN_ERROR };
    }
  }
  return { kind: "next" };
}
