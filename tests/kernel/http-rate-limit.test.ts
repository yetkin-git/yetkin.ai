import { afterEach, describe, expect, it } from "vitest";
import {
  applyHttpRateLimit,
  consumeHttpRateLimit,
  HTTP_RATE_LIMITS,
  matchEdgeRateLimit,
  resetHttpRateLimitBucketsForTests,
} from "@/lib/kernel/security/http-rate-limit";

describe("HTTP hız tavanı", () => {
  afterEach(() => {
    resetHttpRateLimitBucketsForTests();
  });

  it("limit dolunca allowed false ve Retry-After basar", () => {
    const config = { keyPrefix: "test", limit: 2, windowMs: 60_000 };
    expect(consumeHttpRateLimit("ip-1", config, 1_000).allowed).toBe(true);
    expect(consumeHttpRateLimit("ip-1", config, 1_001).allowed).toBe(true);
    const denied = consumeHttpRateLimit("ip-1", config, 1_002);
    expect(denied.allowed).toBe(false);
    expect(denied.headers["Retry-After"]).toBeTruthy();
  });

  it("farklı kimlikler ayrı kova kullanır", () => {
    const config = { keyPrefix: "test", limit: 1, windowMs: 60_000 };
    expect(consumeHttpRateLimit("a", config, 1_000).allowed).toBe(true);
    expect(consumeHttpRateLimit("b", config, 1_000).allowed).toBe(true);
    expect(consumeHttpRateLimit("a", config, 1_001).allowed).toBe(false);
  });

  it("kenar POST top-up ve /api/auth/* eşler; OPTIONS eşlemez", () => {
    expect(matchEdgeRateLimit("/api/wallet/top-up", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.walletTopUpIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/wallet/top-up", "GET")).toBeNull();
    expect(matchEdgeRateLimit("/api/auth/session", "GET")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.authIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/auth/login", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.authIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/auth/session", "OPTIONS")).toBeNull();
  });

  it("applyHttpRateLimit IP + kullanıcı kimliğini birleştirir", () => {
    const request = new Request("http://localhost/api/wallet/top-up", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.9" },
    });
    const first = applyHttpRateLimit(request, { keyPrefix: "u", limit: 1, windowMs: 60_000 }, "user-1");
    const second = applyHttpRateLimit(request, { keyPrefix: "u", limit: 1, windowMs: 60_000 }, "user-1");
    const otherUser = applyHttpRateLimit(request, { keyPrefix: "u", limit: 1, windowMs: 60_000 }, "user-2");
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(otherUser.allowed).toBe(true);
  });
});
