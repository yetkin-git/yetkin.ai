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

export const EDGE_PERMISSIONS_POLICY_VALUE =
  'camera=(), microphone=(), geolocation=(), payment=(self "https://www.paytr.com" "https://*.paytr.com")';

export const EDGE_SECURITY_HEADER_ENTRIES: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", EDGE_PERMISSIONS_POLICY_VALUE],
];
