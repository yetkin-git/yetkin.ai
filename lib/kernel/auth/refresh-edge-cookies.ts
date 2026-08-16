import { createServerClient } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_ENCODING,
  applyAuthResponseHeaders,
  normalizeAuthCookieOptions,
  type AuthCookieWriteOptions,
} from "@/lib/kernel/auth/cookie-options";
import { isSupabaseConfigured } from "@/lib/kernel/auth/require-session";
import { hasSupabaseAuthCookieHint } from "@/lib/kernel/security/edge-guard";

export type PendingAuthCookie = {
  name: string;
  value: string;
  options: AuthCookieWriteOptions;
};

export type AuthCookieRefresh = {
  cookies: PendingAuthCookie[];
  headers: Record<string, string>;
  applyTo(response: NextResponse): void;
};

/**
 * Kenarda getUser — süresi dolmuş access_token'ı yeniler, Set-Cookie yazar.
 * Anon anahtar yoksa veya çerez yoksa Auth API çağrılmaz (test/dürüst kapalı).
 * LOCAL_MOCK_AUTH yoktur.
 */
export async function collectSupabaseAuthCookieRefresh(
  request: NextRequest,
): Promise<AuthCookieRefresh> {
  const cookies: PendingAuthCookie[] = [];
  const headers: Record<string, string> = {};

  const applyTo = (response: NextResponse) => {
    for (const cookie of cookies) {
      response.cookies.set(cookie.name, cookie.value, cookie.options);
    }
    if (Object.keys(headers).length > 0) {
      applyAuthResponseHeaders(response.headers, headers);
    }
  };

  const result: AuthCookieRefresh = { cookies, headers, applyTo };

  if (!isSupabaseConfigured()) {
    return result;
  }
  if (!hasSupabaseAuthCookieHint(request.cookies.getAll())) {
    return result;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

  try {
    const supabase = createServerClient(url, anon, {
      cookieEncoding: AUTH_COOKIE_ENCODING,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, responseHeaders) {
          for (const { name, value, options } of cookiesToSet) {
            const normalized = normalizeAuthCookieOptions(options, request.nextUrl);
            request.cookies.set(name, value);
            cookies.push({ name, value, options: normalized });
          }
          Object.assign(headers, responseHeaders);
        },
      },
    });
    await supabase.auth.getUser();
  } catch {
    // Yenileme ağ hatası oturumu sahte saymaz; kenar JWT fail-closed karar verir.
  }

  return result;
}
