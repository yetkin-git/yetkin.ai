import { createServerClient } from "@supabase/ssr";
import {
  AUTH_COOKIE_ENCODING,
  applyAuthResponseHeaders,
  normalizeAuthCookieOptions,
  type AuthCookieWriteOptions,
} from "@/lib/kernel/auth/cookie-options";

export type SupabaseCookieAdapter = {
  url: string;
  anon: string;
  getAll: () => { name: string; value: string }[];
  setCookie: (name: string, value: string, options: AuthCookieWriteOptions) => void;
  setHeaders?: { set(name: string, value: string): void };
  requestUrl?: URL;
};

/**
 * Tek sunucu istemcisi — getAll/setAll + base64url + name sızıntısı yok.
 * `setAll` ikinci argümanı CDN'nin oturum yanıtını önbelleklemesini keser.
 */
export function createSupabaseCookieClient(adapter: SupabaseCookieAdapter) {
  return createServerClient(adapter.url, adapter.anon, {
    cookieEncoding: AUTH_COOKIE_ENCODING,
    cookies: {
      getAll() {
        return adapter.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value, options } of cookiesToSet) {
          adapter.setCookie(name, value, normalizeAuthCookieOptions(options, adapter.requestUrl));
        }
        if (adapter.setHeaders) {
          applyAuthResponseHeaders(adapter.setHeaders, headers);
        }
      },
    },
  });
}
