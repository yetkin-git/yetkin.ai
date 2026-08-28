/**
 * Statik kenar güvenlik başlıkları — next.config.ts CJS yükleme zinciri için
 * bağımlılıksız yaprak. `edge-guard` yeniden dışa aktarır; donmuş-oda /
 * rooms.ssot zincirine bağlanmaz.
 */

export const EDGE_HSTS_VALUE = "max-age=63072000; includeSubDomains; preload";

export const EDGE_SECURITY_HEADER_ENTRIES: ReadonlyArray<readonly [string, string]> = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  ["Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()"],
];
