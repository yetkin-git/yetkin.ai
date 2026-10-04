/**
 * Statik kenar güvenlik başlıkları — next.config.ts CJS yükleme zinciri için
 * bağımlılıksız yaprak. `edge-guard` yeniden dışa aktarır; donmuş-oda /
 * rooms.ssot zincirine bağlanmaz.
 *
 * `X-Frame-Options: DENY` yetkin.ai'nin başkası tarafından çerçevelenmesini
 * keser; PayTR'yi bizim iFrame'de göstermeyi engellemez. PayTR kilidi
 * `frame-src` (CSP) + `payment=(self …)` (Permissions-Policy) + iFrame `allow`.
 * `payment` boş allowlist çapraz köken Payment Request'i kapatır; iFrame `allow` yetmez.
 */

export const EDGE_HSTS_VALUE = "max-age=63072000; includeSubDomains; preload";

const EDGE_PERMISSIONS_POLICY_PAYMENT =
  'payment=(self "https://www.paytr.com" "https://*.paytr.com")';

/** Tüm site. Mikrofon kapalı. */
export const EDGE_PERMISSIONS_POLICY_VALUE = `camera=(), microphone=(), geolocation=(), ${EDGE_PERMISSIONS_POLICY_PAYMENT}`;

/** Yalnız `/junior` ve alt yollar. Mikrofon bu kökenle sınırlıdır. */
export const EDGE_JUNIOR_PERMISSIONS_POLICY_VALUE = `camera=(), microphone=(self), geolocation=(), ${EDGE_PERMISSIONS_POLICY_PAYMENT}`;

/**
 * Junior kanal yolu. `/junior` ve `/junior/...` evet.
 * `/juniorism` ve `/academy/junior` hayır.
 */
export function isJuniorMicrophonePath(pathname: string): boolean {
  const bare = (pathname.split("#")[0] ?? "").split("?")[0] ?? "";
  if (!bare.startsWith("/")) {
    return false;
  }
  const path = bare.length > 1 && bare.endsWith("/") ? bare.slice(0, -1) : bare;
  return path === "/junior" || path.startsWith("/junior/");
}

export function edgePermissionsPolicyForPath(pathname?: string | null): string {
  if (pathname && isJuniorMicrophonePath(pathname)) {
    return EDGE_JUNIOR_PERMISSIONS_POLICY_VALUE;
  }
  return EDGE_PERMISSIONS_POLICY_VALUE;
}

export function edgeSecurityHeaderEntriesForPath(
  pathname?: string | null,
): ReadonlyArray<readonly [string, string]> {
  return [
    ["X-Content-Type-Options", "nosniff"],
    ["X-Frame-Options", "DENY"],
    ["Referrer-Policy", "strict-origin-when-cross-origin"],
    ["Permissions-Policy", edgePermissionsPolicyForPath(pathname)],
  ];
}

export const EDGE_SECURITY_HEADER_ENTRIES = edgeSecurityHeaderEntriesForPath(null);
