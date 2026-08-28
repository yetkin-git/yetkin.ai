import { NextResponse } from "next/server";
import { buildV1FailBody, canonicalApiPathname } from "@/lib/kernel/http/api-v1";
import { v1EnvelopeHeaders } from "@/lib/kernel/http/unversioned-sunset";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  createInMemoryRateLimitPort,
  type RateLimitDecision,
  type RateLimitWindow,
} from "@/lib/kernel/security/rate-limit-port";
import { resolveTrustedForwardedIp } from "@/lib/kernel/security/trusted-proxy";

export type HttpRateLimitConfig = RateLimitWindow;

export type HttpRateLimitResult = RateLimitDecision & {
  headers: Record<string, string>;
};

const TEN_MINUTES_MS = 10 * 60_000;
const ONE_DAY_MS = 24 * 60 * 60_000;

const httpRateLimitPort = createInMemoryRateLimitPort();

export const HTTP_RATE_LIMITS = {
  walletTopUpIp: { keyPrefix: "wallet-top-up-ip", limit: 8, windowMs: TEN_MINUTES_MS },
  walletTopUpUser: { keyPrefix: "wallet-top-up-user", limit: 4, windowMs: TEN_MINUTES_MS },
  financialMutationIp: { keyPrefix: "financial-mutation-ip", limit: 30, windowMs: TEN_MINUTES_MS },
  llmIp: { keyPrefix: "llm-ip", limit: 20, windowMs: TEN_MINUTES_MS },
  llmUser: { keyPrefix: "llm-user", limit: 12, windowMs: TEN_MINUTES_MS },
  aiChatUser: { keyPrefix: "ai-chat-user", limit: 5, windowMs: ONE_DAY_MS },
  authIp: { keyPrefix: "auth-ip", limit: 40, windowMs: TEN_MINUTES_MS },
} as const;

export const HTTP_RATE_LIMIT_ERROR = "Çok fazla istek. Biraz sonra yeniden dene.";

const FINANCIAL_EXACT_PATHS = new Set([
  "/api/wallet/top-up",
  "/api/freelancer/jobs",
]);

const FINANCIAL_SUFFIXES = [
  "/purchase",
  "/lock",
  "/award",
  "/refund",
  "/release",
  "/confirm",
  "/accept",
] as const;

const LLM_EXACT_PATHS = new Set([
  "/api/ai/chat",
]);

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

export function resolveRequestIp(
  request: Request,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return resolveTrustedForwardedIp(request.headers, env);
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
  env: NodeJS.ProcessEnv = process.env,
): HttpRateLimitResult {
  const ip = resolveRequestIp(request, env);
  const identity = extraIdentity?.trim() ? `${ip}:${extraIdentity.trim()}` : ip;
  return consumeHttpRateLimit(identity, config);
}

export function isLlmMutationPath(pathname: string): boolean {
  const path = canonicalApiPathname(pathname);
  return LLM_EXACT_PATHS.has(path) || path.endsWith("/generate");
}

export function isFinancialMutationPath(pathname: string): boolean {
  const path = canonicalApiPathname(pathname);
  if (FINANCIAL_EXACT_PATHS.has(path)) {
    return true;
  }
  return FINANCIAL_SUFFIXES.some((suffix) => path.endsWith(suffix));
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
  if (isLlmMutationPath(path) && verb === "POST") {
    return HTTP_RATE_LIMITS.llmIp;
  }
  if (isFinancialMutationPath(path) && verb !== "GET" && verb !== "HEAD") {
    return HTTP_RATE_LIMITS.financialMutationIp;
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
  const requestId = request ? resolveRequestId(request) : crypto.randomUUID();
  return NextResponse.json(buildV1FailBody(HTTP_RATE_LIMIT_ERROR, requestId), {
    status: 429,
    headers: {
      ...result.headers,
      [REQUEST_ID_HEADER]: requestId,
      ...v1EnvelopeHeaders(),
    },
  });
}

/** Test sızıntısını keser — üretim çağırmaz. */
export function resetHttpRateLimitBucketsForTests(): void {
  httpRateLimitPort.resetForTests();
}
