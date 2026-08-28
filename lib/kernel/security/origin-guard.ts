/**
 * Çerezli web yazmaları — Origin / Sec-Fetch-Site kalkanı.
 * `/api/v1/*` Bearer-only'dir; bu kalkan konuşmaz. Webhook imzası handler'dadır.
 */

import { isApiV1Pathname } from "@/lib/kernel/http/api-v1";
import { isApiPathname, matchApiAuthKind } from "@/lib/kernel/security/api-auth";
import { hasSupabaseAuthCookieHint } from "@/lib/kernel/security/edge-guard";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

export const WEB_ORIGIN_FORBIDDEN = "Çapraz kökenli yazma reddedildi.";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export type WebOriginDecision =
  | { kind: "skip" }
  | { kind: "allow" }
  | { kind: "deny"; error: typeof WEB_ORIGIN_FORBIDDEN };

export function isStateChangingMethod(method: string): boolean {
  return STATE_CHANGING_METHODS.has(method.trim().toUpperCase());
}

function isAbsoluteOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return url.origin === value;
  } catch {
    return false;
  }
}

function addOrigin(allowed: Set<string>, raw: string | undefined): void {
  const value = raw?.trim() ?? "";
  if (!value || value === "*") {
    return;
  }
  try {
    allowed.add(new URL(value).origin);
  } catch {
    // Geçersiz köken allowlist'e girmez.
  }
}

export function resolveWebOriginAllowlist(
  requestUrl: URL,
  env: NodeJS.ProcessEnv = process.env,
): Set<string> {
  const allowed = new Set<string>();
  addOrigin(allowed, env.NEXT_PUBLIC_APP_URL);
  if (env.NODE_ENV !== "production") {
    allowed.add(requestUrl.origin);
  }
  return allowed;
}

export function decideWebOriginGuard(input: {
  pathname: string;
  method: string;
  originHeader?: string | null;
  secFetchSite?: string | null;
  cookies?: ReadonlyArray<{ name: string; value: string }>;
  requestUrl: URL;
  env?: NodeJS.ProcessEnv;
}): WebOriginDecision {
  const env = input.env ?? process.env;
  if (isApiV1Pathname(input.pathname)) {
    return { kind: "skip" };
  }
  if (!isApiPathname(input.pathname)) {
    return { kind: "skip" };
  }
  if (!isStateChangingMethod(input.method)) {
    return { kind: "skip" };
  }

  const authKind = matchApiAuthKind(input.pathname, ROUTE_AUTH_MAP as Record<string, string>);
  if (authKind === "webhook") {
    return { kind: "skip" };
  }
  if (!hasSupabaseAuthCookieHint(input.cookies ?? [])) {
    return { kind: "skip" };
  }

  const site = input.secFetchSite?.trim().toLowerCase() ?? "";
  if (site === "cross-site") {
    return { kind: "deny", error: WEB_ORIGIN_FORBIDDEN };
  }

  const origin = input.originHeader?.trim() ?? "";
  const allowed = resolveWebOriginAllowlist(input.requestUrl, env);
  if (origin) {
    if (!isAbsoluteOrigin(origin) || !allowed.has(origin)) {
      return { kind: "deny", error: WEB_ORIGIN_FORBIDDEN };
    }
    return { kind: "allow" };
  }

  if (site === "same-origin" || site === "same-site") {
    return { kind: "allow" };
  }
  return { kind: "deny", error: WEB_ORIGIN_FORBIDDEN };
}
