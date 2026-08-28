/**
 * Tek güvenilir istemci IP — trusted-proxy `X-Forwarded-For`.
 * İstemci spoof'u soldadır; platform hop'u sağa ekler. İlk XFF değeri kullanılmaz.
 * Platform dışı istemci IP başlıkları yedek kabul edilmez.
 */

export const UNKNOWN_REQUEST_IP = "unknown";
export const DEFAULT_TRUSTED_PROXY_HOPS = 1;
export const MAX_TRUSTED_PROXY_HOPS = 16;
export const MAX_FORWARDED_IP_LENGTH = 64;

const IPV4_PATTERN = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:.]+$/;

export function parseTrustedProxyHops(env: NodeJS.ProcessEnv = process.env): number {
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

/**
 * `hops=1` → XFF'nin sağındaki adres (en yakın proxy'nin gördüğü istemci).
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
  const forwarded = headers.get("x-forwarded-for") ?? "";
  const parts = forwarded
    .split(",")
    .map((part) => part.trim())
    .filter(isPlausibleForwardedIp);
  if (parts.length === 0) {
    return UNKNOWN_REQUEST_IP;
  }
  const index = Math.max(0, parts.length - hops);
  return parts[index] ?? UNKNOWN_REQUEST_IP;
}
