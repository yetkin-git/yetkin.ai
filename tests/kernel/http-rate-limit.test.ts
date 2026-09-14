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
import {
  createFailClosedRateLimitPort,
  createInMemoryRateLimitPort,
} from "@/lib/kernel/security/rate-limit-port";
import { resolveRateLimitPort } from "@/lib/kernel/security/rate-limit-runtime";
import { createRedisRestRateLimitPort } from "@/lib/kernel/security/redis-rate-limit-port";
import { UNKNOWN_REQUEST_IP } from "@/lib/kernel/security/trusted-proxy";

describe("HTTP hız tavanı", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetHttpRateLimitBucketsForTests();
  });

  it("limit dolunca allowed false ve Retry-After basar", async () => {
    const config = { keyPrefix: "test", limit: 2, windowMs: 60_000 };
    expect((await consumeHttpRateLimit("ip-1", config, 1_000)).allowed).toBe(true);
    expect((await consumeHttpRateLimit("ip-1", config, 1_001)).allowed).toBe(true);
    const denied = await consumeHttpRateLimit("ip-1", config, 1_002);
    expect(denied.allowed).toBe(false);
    expect(denied.headers["Retry-After"]).toBeTruthy();
  });

  it("farklı kimlikler ayrı kova kullanır", async () => {
    const config = { keyPrefix: "test", limit: 1, windowMs: 60_000 };
    expect((await consumeHttpRateLimit("a", config, 1_000)).allowed).toBe(true);
    expect((await consumeHttpRateLimit("b", config, 1_000)).allowed).toBe(true);
    expect((await consumeHttpRateLimit("a", config, 1_001)).allowed).toBe(false);
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
    expect(matchEdgeRateLimit("/api/admin/funnel", "GET")?.keyPrefix).toBe(
      HTTP_RATE_LIMITS.adminIp.keyPrefix,
    );
    expect(HTTP_RATE_LIMITS.adminIp.limit).toBe(20);
  });

  it("applyHttpRateLimit IP + kullanıcı kimliğini birleştirir", async () => {
    const request = new Request("http://localhost/api/wallet/top-up", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.9" },
    });
    const first = await applyHttpRateLimit(
      request,
      { keyPrefix: "u", limit: 1, windowMs: 60_000 },
      "user-1",
    );
    const second = await applyHttpRateLimit(
      request,
      { keyPrefix: "u", limit: 1, windowMs: 60_000 },
      "user-1",
    );
    const otherUser = await applyHttpRateLimit(
      request,
      { keyPrefix: "u", limit: 1, windowMs: 60_000 },
      "user-2",
    );
    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
    expect(otherUser.allowed).toBe(true);
  });

  it("X-Forwarded-For spoof solda kalır; trusted hop sağdaki IP'yi alır", async () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "1");
    const spoofed = new Request("http://localhost/api/wallet/top-up", {
      headers: { "x-forwarded-for": "1.2.3.4, 203.0.113.9" },
    });
    expect(resolveRequestIp(spoofed)).toBe("203.0.113.9");

    const first = await applyHttpRateLimit(spoofed, { keyPrefix: "xff", limit: 1, windowMs: 60_000 });
    const sameClient = new Request("http://localhost/api/wallet/top-up", {
      headers: { "x-forwarded-for": "8.8.8.8, 203.0.113.9" },
    });
    const second = await applyHttpRateLimit(sameClient, {
      keyPrefix: "xff",
      limit: 1,
      windowMs: 60_000,
    });
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

  it("TRUSTED_PROXY_HOPS=2 Cloudflare+Vercel zincirinde müşteri IPv4 alınır", () => {
    vi.stubEnv("TRUSTED_PROXY_HOPS", "2");
    const dualHop = new Request("http://localhost/api/wallet/top-up", {
      headers: { "x-forwarded-for": "203.0.113.50, 104.16.1.1" },
    });
    expect(resolveRequestIp(dualHop)).toBe("203.0.113.50");

    vi.stubEnv("TRUSTED_PROXY_HOPS", "1");
    expect(resolveRequestIp(dualHop)).toBe("104.16.1.1");
  });
});

describe("RateLimitPort", () => {
  it("süreç-içi bellek kovaları birbirine sızmaz", async () => {
    const a = createInMemoryRateLimitPort();
    const b = createInMemoryRateLimitPort();
    const window = { keyPrefix: "port", limit: 1, windowMs: 60_000 };
    expect((await a.consume("x", window, 1_000)).allowed).toBe(true);
    expect((await a.consume("x", window, 1_001)).allowed).toBe(false);
    expect((await b.consume("x", window, 1_001)).allowed).toBe(true);
  });

  it("taşmada tüm haritayı silmez; en eski kovayı düşürür", async () => {
    const port = createInMemoryRateLimitPort(2);
    const window = { keyPrefix: "lru", limit: 5, windowMs: 60_000 };
    expect((await port.consume("a", window, 1_000)).remaining).toBe(4);
    expect((await port.consume("a", window, 1_001)).remaining).toBe(3);
    expect((await port.consume("b", window, 1_002)).remaining).toBe(4);
    expect((await port.consume("c", window, 1_003)).remaining).toBe(4);
    const stillB = await port.consume("b", window, 1_004);
    expect(stillB.remaining).toBe(3);
    const freshA = await port.consume("a", window, 1_005);
    expect(freshA.remaining).toBe(4);
  });

  it("dış önbellek istemcisi hız tavanı portuna ve kenar bağlayıcısına girmez", () => {
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
    const runtime = readFileSync(join(root, "lib/kernel/security/http-rate-limit.ts"), "utf8");
    expect(runtime).toContain("resolveRateLimitPort");
    expect(runtime).not.toContain("createInMemoryRateLimitPort");
  });

  it("kısmi Redis config fail-closed; boş config bellek", async () => {
    const window = { keyPrefix: "fc", limit: 8, windowMs: 60_000 };
    const closed = createFailClosedRateLimitPort();
    expect((await closed.consume("a", window)).allowed).toBe(false);

    const partial = resolveRateLimitPort({
      RATE_LIMIT_REDIS_REST_URL: "https://example.upstash.io",
    });
    expect((await partial.consume("a", window)).allowed).toBe(false);

    const memory = resolveRateLimitPort({});
    expect((await memory.consume("a", window)).allowed).toBe(true);
  });

  it("Redis REST 5xx veya ağ hatasında belleğe düşmez", async () => {
    const window = { keyPrefix: "redis", limit: 8, windowMs: 60_000 };
    const down = createRedisRestRateLimitPort({
      restUrl: "https://example.upstash.io",
      token: "lab-token",
      fetchImpl: async () => new Response("down", { status: 503 }),
    });
    expect((await down.consume("a", window)).allowed).toBe(false);

    const boom = createRedisRestRateLimitPort({
      restUrl: "https://example.upstash.io",
      token: "lab-token",
      fetchImpl: async () => {
        throw new Error("network");
      },
    });
    expect((await boom.consume("a", window)).allowed).toBe(false);
  });

  it("Redis REST INCR sayacı limiti uygular", async () => {
    const window = { keyPrefix: "redis-ok", limit: 1, windowMs: 60_000 };
    let calls = 0;
    const port = createRedisRestRateLimitPort({
      restUrl: "https://example.upstash.io",
      token: "lab-token",
      fetchImpl: async () => {
        calls += 1;
        return new Response(JSON.stringify([[null, calls], [null, 1]]), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    });
    expect((await port.consume("a", window)).allowed).toBe(true);
    expect((await port.consume("a", window)).allowed).toBe(false);
  });
});
