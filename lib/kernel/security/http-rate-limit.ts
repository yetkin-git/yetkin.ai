import { NextResponse } from "next/server";
import { normalizePathname } from "@/lib/kernel/security/edge-guard";

export type HttpRateLimitConfig = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

export type HttpRateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
  limit: number;
  headers: Record<string, string>;
};

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export const HTTP_RATE_LIMITS = {
  walletTopUpIp: { keyPrefix: "wallet-top-up-ip", limit: 10, windowMs: 10 * 60_000 },
  walletTopUpUser: { keyPrefix: "wallet-top-up-user", limit: 5, windowMs: 10 * 60_000 },
  authIp: { keyPrefix: "auth-ip", limit: 60, windowMs: 10 * 60_000 },
} as const;

export const HTTP_RATE_LIMIT_ERROR = "Çok fazla istek. Biraz sonra yeniden dene.";

function pruneBuckets(now: number): void {
  if (buckets.size < 2_000) {
    return;
  }
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
  if (buckets.size > MAX_BUCKETS) {
    buckets.clear();
  }
}

export function resolveRequestIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  if (ip) {
    return ip;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  return real || "unknown";
}

export function consumeHttpRateLimit(
  identityKey: string,
  config: HttpRateLimitConfig,
  now: number = Date.now(),
): HttpRateLimitResult {
  pruneBuckets(now);
  const key = `${config.keyPrefix}:${identityKey}`;
  let bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + config.windowMs };
  }
  bucket.count += 1;
  buckets.set(key, bucket);
  const allowed = bucket.count <= config.limit;
  const remaining = Math.max(0, config.limit - bucket.count);
  const retryAfterSec = allowed ? 0 : Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(config.limit),
    "X-RateLimit-Remaining": String(remaining),
  };
  if (!allowed) {
    headers["Retry-After"] = String(retryAfterSec);
  }
  return { allowed, remaining, retryAfterSec, limit: config.limit, headers };
}

export function applyHttpRateLimit(
  request: Request,
  config: HttpRateLimitConfig,
  extraIdentity?: string,
): HttpRateLimitResult {
  const ip = resolveRequestIp(request);
  const identity = extraIdentity?.trim() ? `${ip}:${extraIdentity.trim()}` : ip;
  return consumeHttpRateLimit(identity, config);
}

export function matchEdgeRateLimit(
  pathname: string,
  method: string,
): HttpRateLimitConfig | null {
  const path = normalizePathname(pathname);
  const verb = method.toUpperCase();
  if (verb === "OPTIONS") {
    return null;
  }
  if (path === "/api/wallet/top-up" && verb === "POST") {
    return HTTP_RATE_LIMITS.walletTopUpIp;
  }
  if (path === "/api/auth" || path.startsWith("/api/auth/")) {
    return HTTP_RATE_LIMITS.authIp;
  }
  return null;
}

export function rateLimitedJsonResponse(result: HttpRateLimitResult): NextResponse {
  return NextResponse.json(
    { ok: false, error: HTTP_RATE_LIMIT_ERROR },
    { status: 429, headers: result.headers },
  );
}

/** Test sızıntısını keser — üretim çağırmaz. */
export function resetHttpRateLimitBucketsForTests(): void {
  buckets.clear();
}
