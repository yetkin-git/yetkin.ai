/**
 * Tek güvenilir istemci IP — trusted-proxy `X-Forwarded-For`.
 * İstemci spoof'u soldadır; platform hop'u sağa ekler. İlk XFF değeri kullanılmaz.
 * Platform dışı istemci IP başlıkları yedek kabul edilmez.
 *
 * Hop: 0 = XFF yok sayılır. 1 = tek kenar (yalnız Vercel).
 * Cloudflare → Vercel canlı reçete = 2 (`CLOUDFLARE_VERCEL_TRUSTED_PROXY_HOPS`).
 * Kod boş varsayılanı 1 (spoof güvenli). Production secret 2 olmalıdır.
 */

export const UNKNOWN_REQUEST_IP = "unknown";
export const DEFAULT_TRUSTED_PROXY_HOPS = 1;
/** Cloudflare kenarı + Vercel kenarı — yetkin.ai canlı reçetesi. */
export const CLOUDFLARE_VERCEL_TRUSTED_PROXY_HOPS = 2;
export const MAX_TRUSTED_PROXY_HOPS = 16;
export const MAX_FORWARDED_IP_LENGTH = 64;

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:.]+$/;

export type ForwardedIpKind = "unknown" | "private" | "ipv6" | "public_ipv4";

export function parseTrustedProxyHops(env: Record<string, string | undefined> = process.env): number {
  const raw = env.TRUSTED_PROXY_HOPS?.trim() ?? "";
  if (!raw) {
    return DEFAULT_TRUSTED_PROXY_HOPS;
  }
  if (!/^[0-9]+$/.test(raw)) {
    return DEFAULT_TRUSTED_PROXY_HOPS;
  }
  const hops = Number.parseInt(raw, 10);
  if (!Number.isSafeInteger(hops) || hops < 0 || hops > MAX_TRUSTED_PROXY_HOPS) {
    return DEFAULT_TRUSTED_PROXY_HOPS;
  }
  return hops;
}

export function isPlausibleForwardedIp(value: string): boolean {
  if (value.length === 0 || value.length > MAX_FORWARDED_IP_LENGTH) {
    return false;
  }
  if (IPV4_PATTERN.test(value)) {
    const octets = value.split(".");
    return octets.every((octet) => {
      const n = Number.parseInt(octet, 10);
      return n >= 0 && n <= 255;
    });
  }
  if (value.includes(":") && IPV6_PATTERN.test(value)) {
    return true;
  }
  return false;
}

export function isPrivateOrLoopbackIp(ip: string): boolean {
  const trimmed = ip.trim().toLowerCase();
  if (!trimmed || trimmed === UNKNOWN_REQUEST_IP) {
    return true;
  }
  if (trimmed === "localhost" || trimmed === "::1" || trimmed === "0.0.0.0") {
    return true;
  }
  if (trimmed.startsWith("127.") || trimmed.startsWith("10.")) {
    return true;
  }
  if (trimmed.startsWith("192.168.") || trimmed.startsWith("169.254.")) {
    return true;
  }
  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(trimmed);
}

export function classifyForwardedIp(ip: string): ForwardedIpKind {
  const trimmed = ip.trim();
  if (!trimmed || trimmed === UNKNOWN_REQUEST_IP) {
    return "unknown";
  }
  if (isPrivateOrLoopbackIp(trimmed)) {
    return "private";
  }
  if (trimmed.includes(":")) {
    return "ipv6";
  }
  if (IPV4_PATTERN.test(trimmed) && isPlausibleForwardedIp(trimmed)) {
    return "public_ipv4";
  }
  return "unknown";
}

/** XFF zincirindeki tüm makul adresler (soldan sağa). Spoof sol taraftadır. */
export function listForwardedIps(headers: Headers): string[] {
  const forwarded = headers.get("x-forwarded-for") ?? "";
  return forwarded
    .split(",")
    .map((part) => part.trim())
    .filter(isPlausibleForwardedIp);
}

/**
 * `hops=1` → XFF'nin sağındaki adres (en yakın proxy'nin gördüğü istemci).
 * `hops=2` → bir hop daha içeriden (Cloudflare+Vercel: gerçek müşteri IPv4).
 * `hops=0` → XFF yok sayılır; spoof ile kova çoğaltılamaz.
 */
export function resolveTrustedForwardedIp(
  headers: Headers,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const hops = parseTrustedProxyHops(env);
  if (hops <= 0) {
    return UNKNOWN_REQUEST_IP;
  }
  const parts = listForwardedIps(headers);
  if (parts.length === 0) {
    return UNKNOWN_REQUEST_IP;
  }
  const index = Math.max(0, parts.length - hops);
  return parts[index] ?? UNKNOWN_REQUEST_IP;
}
