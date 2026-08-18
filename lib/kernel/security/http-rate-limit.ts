import { NextResponse } from "next/server";
import {
  buildV1FailBody,
  canonicalApiPathname,
  isV1JsonRequest,
} from "@/lib/kernel/http/api-v1";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  createInMemoryRateLimitPort,
  type RateLimitDecision,
  type RateLimitWindow,
} from "@/lib/kernel/security/rate-limit-port";

export type HttpRateLimitConfig = RateLimitWindow;

export type HttpRateLimitResult = RateLimitDecision & {
  headers: Record<string, string>;
};

const httpRateLimitPort = createInMemoryRateLimitPort();

export const HTTP_RATE_LIMITS = {
  walletTopUpIp: { keyPrefix: "wallet-top-up-ip", limit: 10, windowMs: 10 * 60_000 },
  walletTopUpUser: { keyPrefix: "wallet-top-up-user", limit: 5, windowMs: 10 * 60_000 },
  authIp: { keyPrefix: "auth-ip", limit: 60, windowMs: 10 * 60_000 },
} as const;

export const HTTP_RATE_LIMIT_ERROR = "Çok fazla istek. Biraz sonra yeniden dene.";

function withRateLimitHeaders(decision: RateLimitDecision): HttpRateLimitResult {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(decision.limit),
    "X-RateLimit-Remaining": String(decision.remaining),
  };
  if (!decision.allowed) {
    headers["Retry-After"] = String(decision.retryAfterSec);
  }
  return { ...decision, headers };
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
  return withRateLimitHeaders(httpRateLimitPort.consume(identityKey, config, now));
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
  const path = canonicalApiPathname(pathname);
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

export function rateLimitedJsonResponse(
  result: HttpRateLimitResult,
  request?: Request,
): NextResponse {
  if (request && isV1JsonRequest(request)) {
    const requestId = resolveRequestId(request);
    return NextResponse.json(buildV1FailBody(HTTP_RATE_LIMIT_ERROR, requestId), {
      status: 429,
      headers: { ...result.headers, [REQUEST_ID_HEADER]: requestId },
    });
  }
  return NextResponse.json(
    { ok: false, error: HTTP_RATE_LIMIT_ERROR },
    { status: 429, headers: result.headers },
  );
}

/** Test sızıntısını keser — üretim çağırmaz. */
export function resetHttpRateLimitBucketsForTests(): void {
  httpRateLimitPort.resetForTests();
}
