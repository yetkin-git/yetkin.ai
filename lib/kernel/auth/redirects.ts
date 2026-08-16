/**
 * Supabase Auth yön sicili — Dashboard Redirect URLs ile birebir.
 * PKCE `?code=` `/auth/callback` üzerinden; açık yön (open redirect) yok.
 */

import { PASSWORD_RECOVERY_PATH } from "@/lib/kernel/auth/password";

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

const NEXT_ALLOWLIST = new Set([
  AUTH_CALLBACK_DEFAULT_NEXT,
  PASSWORD_RECOVERY_PATH,
  "/login",
  "/register",
  "/cuzdan",
  "/profil",
  "/studio",
  "/academy",
  "/freelancer",
]);

function stripTrailingSlash(origin: string): string {
  return origin.replace(/\/+$/, "");
}

export function isSafeAuthNextPath(raw: string | null | undefined): boolean {
  const path = raw?.trim() ?? "";
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\") || path.includes("://")) {
    return false;
  }
  const pathname = path.split("?")[0]?.split("#")[0] ?? "";
  return NEXT_ALLOWLIST.has(pathname);
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
