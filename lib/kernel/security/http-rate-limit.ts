import { NextResponse } from "next/server";
import { buildV1FailBody, canonicalApiPathname } from "@/lib/kernel/http/api-v1";
import { v1EnvelopeHeaders } from "@/lib/kernel/http/unversioned-sunset";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import {
  type RateLimitDecision,
  type RateLimitWindow,
} from "@/lib/kernel/security/rate-limit-port";
import { resolveRateLimitPort } from "@/lib/kernel/security/rate-limit-runtime";
import { resolveTrustedForwardedIp } from "@/lib/kernel/security/trusted-proxy";

export type HttpRateLimitConfig = RateLimitWindow;

export type HttpRateLimitResult = RateLimitDecision & {
  headers: Record<string, string>;
};

const TEN_MINUTES_MS = 10 * 60_000;
const ONE_DAY_MS = 24 * 60 * 60_000;

let httpRateLimitPort = resolveRateLimitPort();

export const HTTP_RATE_LIMITS = {
  walletTopUpIp: { keyPrefix: "wallet-top-up-ip", limit: 8, windowMs: TEN_MINUTES_MS },
  walletTopUpUser: { keyPrefix: "wallet-top-up-user", limit: 4, windowMs: TEN_MINUTES_MS },
  checkoutIp: { keyPrefix: "checkout-ip", limit: 30, windowMs: TEN_MINUTES_MS },
  checkoutUser: { keyPrefix: "checkout-user", limit: 30, windowMs: TEN_MINUTES_MS },
  financialMutationIp: { keyPrefix: "financial-mutation-ip", limit: 30, windowMs: TEN_MINUTES_MS },
  llmIp: { keyPrefix: "llm-ip", limit: 20, windowMs: TEN_MINUTES_MS },
  llmUser: { keyPrefix: "llm-user", limit: 12, windowMs: TEN_MINUTES_MS },
  aiChatUser: { keyPrefix: "ai-chat-user", limit: 5, windowMs: ONE_DAY_MS },
  careerCoachUser: { keyPrefix: "career-coach-user", limit: 20, windowMs: ONE_DAY_MS },
  /** Kariyer sınav / SWOT / pulse / desk / vize — oturum bazlı burst. */
  careerUser: { keyPrefix: "career-user", limit: 40, windowMs: TEN_MINUTES_MS },
  /** Kamu vitrinden iletişim talebi. */
  careerContactIp: { keyPrefix: "career-contact-ip", limit: 8, windowMs: TEN_MINUTES_MS },
  /** Kamuya açık mühür doğrulama (HMAC / hash). */
  careerVerifyIp: { keyPrefix: "career-verify-ip", limit: 60, windowMs: TEN_MINUTES_MS },
  /** Form koçu — IP burst (misafir + üye ortak kenar). */
  formCoachIp: { keyPrefix: "form-coach-ip", limit: 30, windowMs: TEN_MINUTES_MS },
  /** Form koçu — oturum/guest kova (10 dk / 20). */
  formCoachUser: { keyPrefix: "form-coach-user", limit: 20, windowMs: TEN_MINUTES_MS },
  authIp: { keyPrefix: "auth-ip", limit: 40, windowMs: TEN_MINUTES_MS },
  adminIp: { keyPrefix: "admin-ip", limit: 20, windowMs: TEN_MINUTES_MS },
  yetkinhibeMatchUser: { keyPrefix: "yetkinhibe-match-user", limit: 30, windowMs: TEN_MINUTES_MS },
  yetkinhibeCatalogIp: { keyPrefix: "yetkinhibe-catalog-ip", limit: 60, windowMs: TEN_MINUTES_MS },
  yetkinhibeExportUser: { keyPrefix: "yetkinhibe-export-user", limit: 30, windowMs: TEN_MINUTES_MS },
  tetkikPublicIp: { keyPrefix: "tetkik-public-ip", limit: 8, windowMs: TEN_MINUTES_MS },
  /**
   * S-01 — Tezgâh üretim hattı kullanıcı bazlı tavan.
   *
   * Kenar `llmIp` (20/10dk) **IP başına** çalışır; bir çıkış IP'sini paylaşan yüzlerce
   * kullanıcı (CGNAT, kurumsal NAT) aynı kovayı paylaşır. Bu tavan kullanıcı/guest
   * kimliği başına sayılır: paylaşılan IP adaletsizliği kapanır ve `AI_PLATFORM_DAILY_CAP_MINOR`
   * tek kalkanının tek IP'den tüketilmesi engellenir.
   */
  tezgahGenerateUser: { keyPrefix: "tezgah-generate-user", limit: 30, windowMs: TEN_MINUTES_MS },
  /** Misafir checkout — kart denemesi patlamasını keser. E-posta tekilliği handler'da. */
  guestCheckoutIp: { keyPrefix: "guest-checkout-ip", limit: 5, windowMs: TEN_MINUTES_MS },
  /** `/claim/[token]` şifre belirleme — kaba kuvvet ve token denemesi. */
  claimOrderIp: { keyPrefix: "claim-order-ip", limit: 10, windowMs: TEN_MINUTES_MS },
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
  "/api/ai/form-coach",
  "/api/career/coach",
  "/api/tezgah/studio-photo",
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

export async function consumeHttpRateLimit(
  identityKey: string,
  config: HttpRateLimitConfig,
  now: number = Date.now(),
): Promise<HttpRateLimitResult> {
  return withRateLimitHeaders(await httpRateLimitPort.consume(identityKey, config, now));
}

export async function applyHttpRateLimit(
  request: Request,
  config: HttpRateLimitConfig,
  extraIdentity?: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<HttpRateLimitResult> {
  const ip = resolveRequestIp(request, env);
  const identity = extraIdentity?.trim() ? `${ip}:${extraIdentity.trim()}` : ip;
  return consumeHttpRateLimit(identity, config);
}

export function isLlmMutationPath(pathname: string): boolean {
  const path = canonicalApiPathname(pathname);
  return LLM_EXACT_PATHS.has(path) || path.endsWith("/generate");
}

const CHECKOUT_EXACT_PATHS = new Set(["/api/tezgah/checkout", "/api/junior-pilot/checkout"]);

export function isCheckoutMutationPath(pathname: string): boolean {
  const path = canonicalApiPathname(pathname);
  if (CHECKOUT_EXACT_PATHS.has(path)) {
    return true;
  }
  return /^\/api\/commerce\/stores\/[^/]+\/subscription$/.test(path);
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
  if (isCheckoutMutationPath(path) && verb !== "GET" && verb !== "HEAD") {
    return HTTP_RATE_LIMITS.checkoutIp;
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
  if (path === "/api/admin/funnel" || path === "/api/admin/ai-models") {
    return HTTP_RATE_LIMITS.adminIp;
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

/** Test sızıntısını keser — üretim çağırmaz. Env stub sonrası portu yeniden bağlar. */
export function resetHttpRateLimitBucketsForTests(): void {
  httpRateLimitPort.resetForTests();
  httpRateLimitPort = resolveRateLimitPort();
}
