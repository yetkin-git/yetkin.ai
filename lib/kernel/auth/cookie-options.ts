/**
 * Supabase SSR 0.12 çerez yazımı.
 * `cookieOptions.name` Next.js cookieStore'u karıştırır; localhost'ta Secure/Domain oturumu düşürür.
 */

export type AuthCookieWriteOptions = {
  path: string;
  sameSite: "lax" | "strict" | "none";
  httpOnly: boolean;
  secure: boolean;
  maxAge?: number;
  expires?: Date;
  domain?: string;
  partitioned?: boolean;
};

export type AuthCookieOptionsInput = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: boolean | "lax" | "strict" | "none";
  name?: string;
  encode?: unknown;
  partitioned?: boolean;
};

export const AUTH_COOKIE_ENCODING = "base64url" as const;

export const AUTH_RESPONSE_CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
};

const LOCALHOST_HOST_PATTERN = /^(localhost|127\.0\.0\.1|\[::1\])$/i;

function isLocalhostHostname(hostname: string): boolean {
  return LOCALHOST_HOST_PATTERN.test(hostname);
}

function resolveRequestHostname(requestUrl?: URL, env: NodeJS.ProcessEnv = process.env): string | null {
  if (requestUrl) {
    return requestUrl.hostname;
  }
  const appUrl = env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) {
    return null;
  }
  try {
    return new URL(appUrl).hostname;
  } catch {
    return null;
  }
}

function resolveSameSite(value: AuthCookieOptionsInput["sameSite"]): AuthCookieWriteOptions["sameSite"] {
  if (value === true || value === "strict") {
    return "strict";
  }
  if (value === "none") {
    return "none";
  }
  return "lax";
}

export function normalizeAuthCookieOptions(
  options: AuthCookieOptionsInput = {},
  requestUrl?: URL,
  env: NodeJS.ProcessEnv = process.env,
): AuthCookieWriteOptions {
  const hostname = resolveRequestHostname(requestUrl, env);
  const isLocalhost = hostname ? isLocalhostHostname(hostname) : false;
  const isProduction = env.NODE_ENV === "production";
  const useSecureCookies = isProduction && !isLocalhost;

  const normalized: AuthCookieWriteOptions = {
    path: options.path ?? "/",
    sameSite: resolveSameSite(options.sameSite),
    httpOnly: false,
    secure: useSecureCookies,
  };

  if (typeof options.maxAge === "number") {
    normalized.maxAge = options.maxAge;
  }
  if (options.expires instanceof Date) {
    normalized.expires = options.expires;
  }
  if (options.partitioned === true) {
    normalized.partitioned = true;
  }
  if (options.domain && !isLocalhost) {
    normalized.domain = options.domain;
  }

  return normalized;
}

export function applyAuthResponseHeaders(
  headers: { set(name: string, value: string): void },
  incoming: Record<string, string> = AUTH_RESPONSE_CACHE_HEADERS,
): void {
  for (const [key, value] of Object.entries(incoming)) {
    headers.set(key, value);
  }
}
