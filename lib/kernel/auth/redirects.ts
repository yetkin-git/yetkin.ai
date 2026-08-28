/**
 * Supabase Auth yön sicili — Dashboard Redirect URLs ile birebir.
 * PKCE `?code=` `/auth/callback` üzerinden; açık yön (open redirect) yok.
 */

import { PASSWORD_RECOVERY_PATH } from "@/lib/kernel/auth/password";
import { CITIZEN_LOGIN_PATH } from "@/lib/kernel/security/edge-guard";

export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_CALLBACK_ERROR_PATH = "/login";
export const AUTH_CALLBACK_DEFAULT_NEXT = "/dashboard";
/** POST — çerezleri siler, 303 ile girişe döner. Kenar kind: public. */
export const AUTH_LOGOUT_API_PATH = "/api/auth/logout";

/** Dashboard allowlist — path (query `next` aynı origin'de kalır). */
export const SUPABASE_DASHBOARD_REDIRECT_PATHS = [
  AUTH_CALLBACK_PATH,
  PASSWORD_RECOVERY_PATH,
] as const;

const NEXT_EXACT = new Set([
  AUTH_CALLBACK_DEFAULT_NEXT,
  PASSWORD_RECOVERY_PATH,
  CITIZEN_LOGIN_PATH,
  "/register",
]);

/** Vatandaş odaları + sığınaklar. `/admin` yok — Super Admin sığınağına dönüş yok. Donmuş oda next değil. */
const NEXT_PREFIXES = [
  "/dashboard",
  "/cuzdan",
  "/profil",
  "/pasaport",
  "/academy",
  "/career",
  "/freelancer",
] as const;

function stripTrailingSlash(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function sanitizeNextPathname(raw: string | null | undefined): string | null {
  const path = raw?.trim() ?? "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.includes("://")) {
    return null;
  }
  const pathname = path.split("?")[0]?.split("#")[0] ?? "";
  if (!pathname || pathname.includes("..")) {
    return null;
  }
  return pathname;
}

export function isSafeAuthNextPath(raw: string | null | undefined): boolean {
  const pathname = sanitizeNextPathname(raw);
  if (!pathname) {
    return false;
  }
  if (NEXT_EXACT.has(pathname)) {
    return true;
  }
  return NEXT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function buildCitizenLoginHref(nextPath?: string | null): string {
  const pathname = sanitizeNextPathname(nextPath);
  if (!pathname || !isSafeAuthNextPath(pathname)) {
    return CITIZEN_LOGIN_PATH;
  }
  return `${CITIZEN_LOGIN_PATH}?next=${encodeURIComponent(pathname)}`;
}

export function resolvePostLoginPath(rawNext?: string | null): string {
  const pathname = sanitizeNextPathname(rawNext);
  if (pathname && isSafeAuthNextPath(pathname) && pathname !== CITIZEN_LOGIN_PATH && pathname !== "/register") {
    return pathname;
  }
  return AUTH_CALLBACK_DEFAULT_NEXT;
}

/** `/login?next=...` — query decode + allowlist; açık yön dashboard'a düşer. */
export function readPostLoginPathFromSearch(
  search: string | URLSearchParams | null | undefined,
  nextHint?: string | null,
): string {
  const params =
    search instanceof URLSearchParams
      ? search
      : new URLSearchParams(typeof search === "string" ? search.replace(/^\?/, "") : "");
  return resolvePostLoginPath(params.get("next") ?? nextHint);
}

export function resolveAuthCallbackNext(input: {
  next?: string | null;
  type?: string | null;
}): string {
  if (input.type?.trim() === "recovery") {
    return PASSWORD_RECOVERY_PATH;
  }
  if (isSafeAuthNextPath(input.next)) {
    return input.next!.trim().split("?")[0]!.split("#")[0]!;
  }
  return AUTH_CALLBACK_DEFAULT_NEXT;
}

export function buildAuthCallbackRedirectTo(origin: string, next?: string): string {
  const base = stripTrailingSlash(origin);
  const url = new URL(AUTH_CALLBACK_PATH, `${base}/`);
  if (next && isSafeAuthNextPath(next)) {
    url.searchParams.set("next", next.split("?")[0]!.split("#")[0]!);
  }
  return url.toString();
}

export function buildSignupEmailRedirectTo(origin: string): string {
  return buildAuthCallbackRedirectTo(origin, AUTH_CALLBACK_DEFAULT_NEXT);
}

export function buildPasswordResetRedirectTo(origin: string): string {
  return buildAuthCallbackRedirectTo(origin, PASSWORD_RECOVERY_PATH);
}

export function supabaseDashboardRedirectUrls(appUrl: string): string[] {
  const origin = stripTrailingSlash(appUrl);
  return SUPABASE_DASHBOARD_REDIRECT_PATHS.map((path) => `${origin}${path}`);
}

export function resolveAuthOrigin(requestUrl: URL, env: NodeJS.ProcessEnv = process.env): string {
  const configured = env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) {
    return stripTrailingSlash(configured);
  }
  return requestUrl.origin;
}
