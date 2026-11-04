/**
 * Ölü yenileme jetonu uygulama hatası değildir: oturum yok.
 * `@supabase/auth-js` bunu `onAuthStateChange` INITIAL_SESSION içinde
 * `console.warn` / `console.error` ile basar (SSR çerezi, `refresh_token_not_found`).
 * Filtre yalnız bu nesneyi yutar; diğer günlükler durur.
 * Çerez `Max-Age=0` ile düşer, sonraki istek Auth API'ye gitmez.
 */

import {
  normalizeAuthCookieOptions,
  type AuthCookieWriteOptions,
} from "@/lib/kernel/auth/cookie-options";
import { SUPABASE_AUTH_COOKIE_NAME } from "@/lib/kernel/security/edge-guard";

const FILTER_MARK = Symbol.for("rail.staleRefreshTokenLogFilter");

const STALE_REFRESH_TOKEN_CODES = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
  "session_expired",
]);

type MarkedConsoleMethod = ((...args: unknown[]) => void) & { [FILTER_MARK]?: true };

function readErrorCode(error: object): string | null {
  if (!("code" in error)) {
    return null;
  }
  const code = error.code;
  return typeof code === "string" && code.trim() ? code : null;
}

function readErrorMessage(error: object): string {
  if (!("message" in error) || typeof error.message !== "string") {
    return "";
  }
  return error.message;
}

export function isStaleRefreshTokenError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = readErrorCode(error);
  if (code && STALE_REFRESH_TOKEN_CODES.has(code)) {
    return true;
  }
  const name = "name" in error && typeof error.name === "string" ? error.name : "";
  if (name === "AuthApiError" && /invalid refresh token/i.test(readErrorMessage(error))) {
    return true;
  }
  if ("cause" in error && error.cause && error.cause !== error) {
    return isStaleRefreshTokenError(error.cause);
  }
  return false;
}

function wrapConsoleMethod(method: "warn" | "error"): void {
  const current = console[method] as MarkedConsoleMethod;
  if (typeof current !== "function" || current[FILTER_MARK]) {
    return;
  }
  const wrapped: MarkedConsoleMethod = (...args: unknown[]) => {
    if (args.some((arg) => isStaleRefreshTokenError(arg))) {
      return;
    }
    current(...args);
  };
  try {
    console[method] = wrapped as typeof console.warn;
    wrapped[FILTER_MARK] = true;
  } catch {
    // Kenar konsolu salt okunursa çerez düşürme yine çalışır.
  }
}

/** Süreçte bir kez. Test konsolu geri alınırsa işaretsiz metoda yeniden sarar. */
export function installStaleRefreshTokenLogFilter(): void {
  wrapConsoleMethod("warn");
  wrapConsoleMethod("error");
}

export function expireSupabaseAuthCookies(
  cookies: ReadonlyArray<{ name: string; value?: string | null }>,
  setCookie: (name: string, value: string, options: AuthCookieWriteOptions) => void,
  requestUrl?: URL,
): void {
  const options = normalizeAuthCookieOptions({ path: "/", maxAge: 0 }, requestUrl);
  for (const cookie of cookies) {
    if (!SUPABASE_AUTH_COOKIE_NAME.test(cookie.name)) {
      continue;
    }
    if (!cookie.value?.trim()) {
      continue;
    }
    setCookie(cookie.name, "", options);
  }
}
