import { afterEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  applyHttpRateLimit,
  consumeHttpRateLimit,
  HTTP_RATE_LIMITS,
  matchEdgeRateLimit,
  resetHttpRateLimitBucketsForTests,
  resolveRequestIp,
} from "@/lib/kernel/security/http-rate-limit";
import { createInMemoryRateLimitPort } from "@/lib/kernel/security/rate-limit-port";
import { UNKNOWN_REQUEST_IP } from "@/lib/kernel/security/trusted-proxy";

describe("HTTP hız tavanı", () => {
  afterEach(() => {
    resetHttpRateLimitBucketsForTests();
    vi.unstubAllEnvs();
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
    expect(matchEdgeRateLimit("/api/v1/wallet/top-up", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.walletTopUpIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/v1/auth/session", "GET")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.authIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/wallet/top-up", "GET")).toBeNull();
    expect(matchEdgeRateLimit("/api/auth/session", "GET")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.authIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/auth/login", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.authIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/auth/logout", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.authIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/auth/session", "OPTIONS")).toBeNull();
    expect(matchEdgeRateLimit("/api/studio/generate", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.llmIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/ai/chat", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.llmIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/v1/studio/generate", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.llmIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/academy/courses/c1/purchase", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.financialMutationIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/freelancer/jobs/j1/accept", "POST")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.financialMutationIp.keyPrefix,
    );
    expect(matchEdgeRateLimit("/api/studio/generate", "GET")).toBeNull();
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

  it("X-Forwarded-For spoof solda kalır; trusted hop sağdaki IP'yi alır", () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "1");
    const spoofed = new Request("http://localhost/api/wallet/top-up", {
      headers: { "x-forwarded-for": "1.2.3.4, 203.0.113.9" },
    });
    expect(resolveRequestIp(spoofed)).toBe("203.0.113.9");

    const first = applyHttpRateLimit(spoofed, { keyPrefix: "xff", limit: 1, windowMs: 60_000 });
    const sameClient = new Request("http://localhost/api/wallet/top-up", {
      headers: { "x-forwarded-for": "8.8.8.8, 203.0.113.9" },
    });
    const second = applyHttpRateLimit(sameClient, { keyPrefix: "xff", limit: 1, windowMs: 60_000 });
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
  });

  it("TRUSTED_PROXY_HOPS=0 iken XFF yok sayılır", () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "0");
    const request = new Request("http://localhost/api/auth/logout", {
      headers: { "x-forwarded-for": "198.51.100.1" },
    });
    expect(resolveRequestIp(request)).toBe(UNKNOWN_REQUEST_IP);
  });
});

describe("RateLimitPort", () => {
  it("süreç-içi bellek kovaları birbirine sızmaz", () => {
    const a = createInMemoryRateLimitPort();
    const b = createInMemoryRateLimitPort();
    const window = { keyPrefix: "port", limit: 1, windowMs: 60_000 };
    expect(a.consume("x", window, 1_000).allowed).toBe(true);
    expect(a.consume("x", window, 1_001).allowed).toBe(false);
    expect(b.consume("x", window, 1_001).allowed).toBe(true);
  });

  it("taşmada tüm haritayı silmez; en eski kovayı düşürür", () => {
    const port = createInMemoryRateLimitPort(2);
    const window = { keyPrefix: "lru", limit: 5, windowMs: 60_000 };
    expect(port.consume("a", window, 1_000).remaining).toBe(4);
    expect(port.consume("a", window, 1_001).remaining).toBe(3);
    expect(port.consume("b", window, 1_002).remaining).toBe(4);
    expect(port.consume("c", window, 1_003).remaining).toBe(4);
    const stillB = port.consume("b", window, 1_004);
    expect(stillB.remaining).toBe(3);
    const freshA = port.consume("a", window, 1_005);
    expect(freshA.remaining).toBe(4);
  });

  it("dış önbellek istemcisi hız tavanı portuna girmez", () => {
    const root = process.cwd();
    const banned = [
      /from\s+["']ioredis["']/,
      /from\s+["']redis["']/,
      /from\s+["']@upstash\/redis["']/,
      /require\(\s*["']ioredis["']\s*\)/,
      /require\(\s*["']redis["']\s*\)/,
    ];
    for (const relative of [
      "lib/kernel/security/rate-limit-port.ts",
      "lib/kernel/security/http-rate-limit.ts",
    ]) {
      const source = readFileSync(join(root, relative), "utf8");
      for (const pattern of banned) {
        expect(source, `${relative} ${pattern}`).not.toMatch(pattern);
      }
    }
  });
});
