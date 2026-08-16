"use client";

import { createBrowserClient } from "@supabase/ssr";
import { AUTH_COOKIE_ENCODING } from "@/lib/kernel/auth/cookie-options";

/** Tarayıcı Auth fetch/watchdog tavanı — varsayılan `fetch` zaman aşımı yok; form asılı kalır. */
export const AUTH_BROWSER_FETCH_TIMEOUT_MS = 15_000;

export type PublicSupabaseBrowserEnvProbe = {
  hasUrl: boolean;
  hasAnon: boolean;
  host: string | null;
};

export class SupabaseBrowserEnvError extends Error {
  readonly code: "missing" | "invalid_url";

  constructor(code: "missing" | "invalid_url", message: string) {
    super(message);
    this.name = "SupabaseBrowserEnvError";
    this.code = code;
  }
}

/**
 * `NEXT_PUBLIC_*` üye erişimi statik kalır — Next istemci paketinde inline eder.
 * Dinamik `process.env[name]` tarayıcıda boş düşer.
 */
export function describePublicSupabaseBrowserEnv(): PublicSupabaseBrowserEnvProbe {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  let host: string | null = null;
  if (url) {
    try {
      host = new URL(url).host;
    } catch {
      host = "invalid";
    }
  }
  return { hasUrl: Boolean(url), hasAnon: Boolean(anon), host };
}

export function readPublicSupabaseBrowserEnv(): { url: string; anon: string; host: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !anon) {
    throw new SupabaseBrowserEnvError(
      "missing",
      "Supabase tarayıcı istemcisi yapılandırılmadı.",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new SupabaseBrowserEnvError("invalid_url", "Supabase tarayıcı URL'si geçersiz.");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new SupabaseBrowserEnvError("invalid_url", "Supabase tarayıcı URL'si geçersiz.");
  }
  return { url, anon, host: parsed.host };
}

function fetchWithAuthTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const timeout = AbortSignal.timeout(AUTH_BROWSER_FETCH_TIMEOUT_MS);
  const inherited = init?.signal;
  const signal =
    inherited && typeof AbortSignal.any === "function"
      ? AbortSignal.any([inherited, timeout])
      : timeout;
  return fetch(input, { ...init, signal });
}

export function createSupabaseBrowserClient() {
  const { url, anon } = readPublicSupabaseBrowserEnv();
  return createBrowserClient(url, anon, {
    cookieEncoding: AUTH_COOKIE_ENCODING,
    global: {
      fetch: fetchWithAuthTimeout,
    },
  });
}
