import { randomInt, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getPortfolio } from "@/app/api/career/portfolio/route";
import { issueCareerVisaStamp } from "@/lib/career/engine";
import * as sessionApi from "@/lib/kernel/auth/session";
import * as careerRuntime from "@/lib/career/runtime";
import { resetHttpRateLimitBucketsForTests } from "@/lib/kernel/security/http-rate-limit";
import { createMemoryCareerProofStore, createMemoryCareerStore } from "../helpers/memory-career";
import { assertWireContains, assertWireOmits } from "../helpers/idor-leak";

/**
 * Vercel build KV / Redis sayacını paylaşır. Sabit `career-idor-alice` kovası
 * 40 istekten sonra 429 döner; kısmi Redis env ise fail-closed 429 üretir.
 * Her koşu benzersiz aktör + taze bellek sayacı kullanır.
 */
const runId = randomUUID();
const ALICE = `career-idor-alice-${runId}`;
const BOB = `career-idor-bob-${runId}`;
const ALICE_TITLE = "IDOR_PORTFOLIO_ALICE_SECRET";
const BOB_TITLE = "IDOR_PORTFOLIO_BOB_SECRET";
const ALICE_CERT =
  "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const BOB_CERT =
  "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

function world() {
  const career = createMemoryCareerStore();
  const proofs = createMemoryCareerProofStore([
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-alice-idor",
      userId: ALICE,
      actorUserIds: [ALICE],
      title: ALICE_TITLE,
      issuedAt: new Date("2026-08-14T00:00:00.000Z"),
      certificateHash: ALICE_CERT,
    },
    {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-bob-idor",
      userId: BOB,
      actorUserIds: [BOB],
      title: BOB_TITLE,
      issuedAt: new Date("2026-08-14T00:01:00.000Z"),
      certificateHash: BOB_CERT,
    },
  ]);
  return { career, proofs, ports: { career, proofs } };
}

function isolateCareerRateLimit(): void {
  vi.stubEnv("RATE_LIMIT_REDIS_REST_URL", "");
  vi.stubEnv("RATE_LIMIT_REDIS_REST_TOKEN", "");
  vi.stubEnv("KV_REST_API_URL", "");
  vi.stubEnv("KV_REST_API_TOKEN", "");
  resetHttpRateLimitBucketsForTests();
}

/** hops=0 XFF'yi yok sayar; aktör zaten benzersiz. hops≥1 için kova IP'ye de ayrılır. */
function portfolioRequest(url: string): Request {
  const third = randomInt(0, 256);
  const fourth = randomInt(1, 255);
  return new Request(url, {
    headers: { "x-forwarded-for": `203.0.${third}.${fourth}` },
  });
}

describe("kariyer portföy IDOR", () => {
  beforeEach(() => {
    isolateCareerRateLimit();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    resetHttpRateLimitBucketsForTests();
  });

  it("portföy listesi yalnız oturum sahibine aittir; rakip başlık/hash sızmaz", async () => {
    const { ports } = world();
    const alice = await issueCareerVisaStamp(ports, {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-alice-idor",
      actorUserId: ALICE,
    });
    const bob = await issueCareerVisaStamp(ports, {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-bob-idor",
      actorUserId: BOB,
    });
    expect(alice.portfolioItem.title).toBe(ALICE_TITLE);
    expect(bob.portfolioItem.title).toBe(BOB_TITLE);

    const aliceRows = await ports.career.listPortfolioForUser(ALICE);
    expect(aliceRows).toHaveLength(1);
    assertWireContains(aliceRows, [ALICE_TITLE]);
    assertWireOmits(aliceRows, [BOB_TITLE, bob.portfolioItem.id, BOB_CERT]);

    const bobRows = await ports.career.listPortfolioForUser(BOB);
    expect(bobRows).toHaveLength(1);
    assertWireContains(bobRows, [BOB_TITLE]);
    assertWireOmits(bobRows, [ALICE_TITLE, alice.portfolioItem.id, ALICE_CERT]);

    const strangerRows = await ports.career.listPortfolioForUser("career-idor-stranger");
    expect(strangerRows).toEqual([]);
    assertWireOmits(strangerRows, [ALICE_TITLE, BOB_TITLE, ALICE_CERT, BOB_CERT]);
  });

  it("GET /api/career/portfolio oturum aktörüne kilitli; query ile yabancı userId yok", async () => {
    const { ports } = world();
    await issueCareerVisaStamp(ports, {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-alice-idor",
      actorUserId: ALICE,
    });
    await issueCareerVisaStamp(ports, {
      sourceKind: "ACADEMY_CERTIFICATE",
      sourceId: "cert-bob-idor",
      actorUserId: BOB,
    });

    vi.spyOn(careerRuntime, "createPrismaCareerPorts").mockReturnValue(ports as never);
    const requireSession = vi.spyOn(sessionApi, "requireSession");

    const portfolioSrc = readFileSync("app/api/career/portfolio/route.ts", "utf8");
    expect(portfolioSrc).toContain("requireSession");
    expect(portfolioSrc).toContain("projectLiveCareerBoard");
    expect(portfolioSrc).not.toMatch(/searchParams|userId.*query|body\.userId/i);

    requireSession.mockResolvedValueOnce({
      id: ALICE,
      email: "alice@yetkin.rail",
    } as never);
    const aliceRes = await getPortfolio(
      portfolioRequest(`http://localhost/api/career/portfolio?userId=${encodeURIComponent(BOB)}`),
    );
    expect(aliceRes.status).toBe(200);
    const aliceBody = await aliceRes.json();
    assertWireContains(aliceBody, [ALICE_TITLE]);
    assertWireOmits(aliceBody, [BOB_TITLE, BOB_CERT]);

    requireSession.mockResolvedValueOnce({
      id: BOB,
      email: "bob@yetkin.rail",
    } as never);
    const bobRes = await getPortfolio(
      portfolioRequest("http://localhost/api/career/portfolio"),
    );
    expect(bobRes.status).toBe(200);
    const bobBody = await bobRes.json();
    assertWireContains(bobBody, [BOB_TITLE]);
    assertWireOmits(bobBody, [ALICE_TITLE, ALICE_CERT]);
  });
});
