import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  LISTING_ACCESS_VISA_DENIED,
  assertAcademyCareerVisaForListing,
} from "@/lib/career/visa-gate";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import {
  applyRailV1Cors,
  buildV1FailBody,
  buildV1OkBody,
  canonicalApiPathname,
  decideRailApiVersion,
  parseRailDronOrigins,
  RAIL_VERSION_HEADER_INVALID,
  RAIL_VERSION_HEADER_REQUIRED,
} from "@/lib/kernel/http/api-v1";
import { RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE, RAIL_V1_HOPS, resolveRailV1HopPaths } from "@/lib/kernel/http/v1-contract";
import { RAIL_V1_ENVELOPE_KEYS } from "@/lib/kernel/http/v1-envelope";
import { assertPublishedRailV1Hop } from "@/lib/kernel/http/v1-hop-gate";
import { hashIdempotencyPayload, settleHttpIdempotency } from "@/lib/kernel/http/idempotency";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";
import { ForbiddenError } from "@/lib/kernel/http/errors";
import { matchApiAuthKind } from "@/lib/kernel/security/api-auth";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import { createMemoryCareerStore } from "../helpers/memory-career";
import {
  RAIL_IS_DAY0_HOPS,
  clientJobBidsPath,
  freelancerAcceptPath,
  freelancerBidPath,
  freelancerDeliveryPath,
  freelancerReleasePath,
} from "../../apps/rail-is/src/api/hops";
import {
  RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE as DRON_ACCEPT_INSUFFICIENT,
  RAIL_V1_ENVELOPE_KEYS as DRON_ENVELOPE_KEYS,
} from "../../apps/rail-is/src/contract/v1";

const ROOT = process.cwd();
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";
const IDEMPOTENCY_KEY = "7c9e6679-7425-40de-944b-e07fc1f90ae7";
const JOB_ID = "fj_lab_1";
const CONTRACT_ID = "fc_lab_1";
const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";

type RailIsLabHop = {
  v1: string;
  method: "GET" | "POST";
  canonical: string;
  auth: "public" | "session";
  idempotency: boolean;
  dataKeys: readonly string[];
  versionHeaderOptional?: boolean;
};

/** Rail İş (Diyar B) lab istemcisinin /api/v1 ile konuştuğu dondurulmuş hop — SSOT: v1-contract. */
const RAIL_IS_LAB_HOPS: readonly RailIsLabHop[] = RAIL_V1_HOPS.map((hop) => {
  const paths = resolveRailV1HopPaths(hop);
  return {
    v1: paths.v1,
    method: hop.method,
    canonical: paths.canonical,
    auth: hop.routeAuth,
    idempotency: hop.idempotency,
    dataKeys: hop.dataKeys,
    versionHeaderOptional: hop.minVersionHeaderRequired ? undefined : true,
  };
});

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function v1Request(path: string, init?: HeadersInit): Request {
  return new Request(new URL(path, "http://localhost:3000"), {
    headers: { "x-rail-api-version": "1", "x-request-id": REQUEST_ID, ...init },
  });
}

async function signHs256(sub = TEST_USER): Promise<string> {
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(sub)
    .setAudience("authenticated")
    .setIssuer(`${TEST_URL}/auth/v1`)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(TEST_SECRET));
}

function edgeRequest(
  path: string,
  init?: { cookie?: string; authorization?: string; headers?: HeadersInit; method?: string },
) {
  const headers = new Headers(init?.headers);
  if (init?.cookie) {
    headers.set("cookie", init.cookie);
  }
  if (init?.authorization) {
    headers.set("authorization", init.authorization);
  }
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    method: init?.method,
    headers,
  });
}

async function expectV1Envelope(
  response: Response,
  status: number,
  data: Record<string, unknown> | null,
) {
  expect(response.status).toBe(status);
  expect(response.headers.get("x-request-id")).toBe(REQUEST_ID);
  const body = (await response.json()) as {
    ok: boolean;
    error: string | null;
    requestId: string;
    apiVersion: string;
    data: Record<string, unknown> | null;
  };
  expect(body.apiVersion).toBe("1");
  expect(body.requestId).toBe(REQUEST_ID);
  if (data === null) {
    expect(body.ok).toBe(false);
    expect(typeof body.error).toBe("string");
    expect(body.data).toBeNull();
  } else {
    expect(body.ok).toBe(true);
    expect(body.error).toBeNull();
    expect(body.data).toEqual(data);
  }
  return body;
}

describe("Rail İş (Diyar B) /api/v1 lab sözleşmesi", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_JWT_SECRET", TEST_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", TEST_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("kopya v1 ağacı yok; her hop soyulur, kind eşler, handler request zarflar", () => {
    expect(existsSync(join(ROOT, "app/api/v1"))).toBe(false);
    expect(ROUTE_AUTH_MAP["/api/freelancer/contracts"]).toBe("session");

    for (const hop of RAIL_IS_LAB_HOPS) {
      expect(canonicalApiPathname(hop.v1), hop.v1).toBe(hop.canonical);
      expect(matchApiAuthKind(hop.v1, ROUTE_AUTH_MAP as Record<string, string>), hop.v1).toBe(
        hop.auth,
      );
      expect(matchApiAuthKind(hop.canonical, ROUTE_AUTH_MAP as Record<string, string>), hop.canonical).toBe(
        hop.auth,
      );
    }

    const health = readSrc("app/api/(kernel)/health/route.ts");
    expect(health).toContain("isV1JsonRequest");
    expect(health).toContain("buildV1OkBody");
    expect(health).toContain("checks:");

    const session = readSrc("app/api/(kernel)/auth/session/route.ts");
    expect(session).toContain("jsonOk({ user }, 200, undefined, request)");
    expect(session).toContain("jsonFromUnknown(error, 401, undefined, request)");

    const strip = readSrc("app/api/dashboard/wallet-strip/route.ts");
    expect(strip).toContain("undefined, request");
    expect(strip).toContain("amountMinor");

    const pulse = readSrc("app/api/dashboard/freelancer-pulse/route.ts");
    expect(pulse).toContain("jsonOk({ pulse: { ...pulse, live: true } }, 200, undefined, request)");

    const jobs = readSrc("app/api/freelancer/jobs/route.ts");
    expect(jobs).toContain("listOpenJobs");
    expect(jobs).toContain("jsonOk({ jobs }, 200, undefined, request)");

    const bids = readSrc("app/api/freelancer/jobs/[id]/bids/route.ts");
    expect(bids).toContain("assertAcademyCareerVisaForListing");
    expect(bids).toContain("requireRailV1IdempotencyKey");
    expect(bids).toContain('route: "/api/freelancer/jobs/[id]/bids"');

    const accept = readSrc("app/api/freelancer/jobs/[id]/accept/route.ts");
    expect(accept).toContain("requireRailV1IdempotencyKey");
    expect(accept).toContain("settleHttpIdempotency");
    expect(accept).toContain("toFreelancerAcceptWire");
    expect(accept).toContain('route: ACCEPT_ROUTE');
    expect(accept).toContain('"/api/freelancer/jobs/[id]/accept"');

    const ownerBids = readSrc("app/api/client/jobs/[id]/bids/route.ts");
    expect(ownerBids).toContain('export const auth = "session"');
    expect(ownerBids).toContain("listOwnerJobBids");
    expect(ownerBids).toContain("jsonOk(data, 200, requestId, request)");
    expect(ownerBids).not.toContain("requireRailV1IdempotencyKey");
    expect(ownerBids).not.toContain("bidderId");

    const contracts = readSrc("app/api/freelancer/contracts/route.ts");
    expect(contracts).toContain("listFreelancerContractViews");
    expect(contracts).toContain("jsonOk({ contracts }, 200, undefined, request)");
    const prismaStore = readSrc("lib/freelancer/prisma-store.ts");
    expect(prismaStore).toContain("listLatestDeliveryAtByContractIds");
    expect(prismaStore).toContain("select: { contractId: true, createdAt: true }");
    const view = readSrc("lib/freelancer/contract-view.ts");
    expect(view).not.toContain("artifactUrl");
    expect(view).not.toContain("reportJson");

    const release = readSrc("app/api/freelancer/contracts/[id]/release/route.ts");
    expect(release).toContain("requireRailV1IdempotencyKey");
    expect(release).toContain("settleHttpIdempotency");
    expect(release).toContain("toFreelancerReleaseWire");
    expect(release).toContain('route: RELEASE_ROUTE');
    expect(release).toContain('"/api/freelancer/contracts/[id]/release"');

    const refund = readSrc("app/api/freelancer/contracts/[id]/refund/route.ts");
    expect(refund).toContain("requireRailV1IdempotencyKey");
    expect(refund).toContain('"/api/freelancer/contracts/[id]/refund"');

    const delivery = readSrc("app/api/freelancer/contracts/[id]/messages/route.ts");
    expect(delivery).toContain("requireRailV1IdempotencyKey");
    expect(delivery).toContain("settleHttpIdempotency");
    expect(delivery).toContain("postFreelancerDeliveryProof");
    expect(delivery).toContain("isV1JsonRequest");
    expect(delivery).toContain('"/api/freelancer/contracts/[id]/messages"');
    expect(delivery).not.toContain("body: message.body");

    const certificate = readSrc("app/api/academy/certificates/[hash]/route.ts");
    expect(certificate).toContain('export const auth = "public"');
    expect(certificate).toContain("resolvePublicAcademyCertificate");
    expect(certificate).toContain("railV1PublicAcademyCertificateDataSchema");
    expect(certificate).not.toContain("requireSession");
    expect(certificate).not.toContain("userId");
    expect(certificate).not.toContain("attemptId");
    expect(certificate).not.toContain("purchaseId");
  });

  it("GET health başlık isteğe bağlı; data.checks zarfı; diğer hop'lar başlıksız 400 data:null", async () => {
    expect(
      decideRailApiVersion({
        pathname: "/api/v1/health",
        method: "GET",
        minVersionHeader: null,
      }).kind,
    ).toBe("next");
    expect(
      decideRailApiVersion({
        pathname: "/api/v1/freelancer/jobs",
        minVersionHeader: null,
      }),
    ).toEqual({ kind: "fail", status: 400, error: RAIL_VERSION_HEADER_REQUIRED });
    expect(
      decideRailApiVersion({
        pathname: "/api/v1/freelancer/jobs",
        minVersionHeader: "0",
      }),
    ).toEqual({ kind: "fail", status: 400, error: RAIL_VERSION_HEADER_INVALID });

    const health = await proxy(edgeRequest("/api/v1/health"));
    expect(health.status).toBe(200);
    expect(health.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/api/health");

    const checks = { db: "ok", supabaseAuth: "configured", inngest: "unconfigured", paytr: "unconfigured" };
    const enveloped = buildV1OkBody(
      { service: "yetkin-rail", probe: "readiness", status: "ok", checks },
      REQUEST_ID,
    );
    expect(enveloped).toEqual({
      ok: true,
      error: null,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: { service: "yetkin-rail", probe: "readiness", status: "ok", checks },
    });
    expect(enveloped.data.checks).toEqual(checks);

    const missing = await proxy(edgeRequest("/api/v1/auth/session"));
    expect(missing.status).toBe(400);
    expect(await missing.json()).toMatchObject({
      ok: false,
      error: RAIL_VERSION_HEADER_REQUIRED,
      apiVersion: "1",
      data: null,
    });

    const zero = await proxy(
      edgeRequest("/api/v1/freelancer/jobs", { headers: { "X-Rail-Min-Version": "0" } }),
    );
    expect(zero.status).toBe(400);
    expect(await zero.json()).toEqual(
      expect.objectContaining({
        ok: false,
        error: RAIL_VERSION_HEADER_INVALID,
        apiVersion: "1",
        data: null,
      }),
    );
    expect(buildV1FailBody(RAIL_VERSION_HEADER_INVALID, REQUEST_ID).data).toBeNull();
  });

  it("Bearer + X-Rail-Min-Version: 1 her session hop'u kanonik yola rewrite eder", async () => {
    const token = await signHs256();
    for (const hop of RAIL_IS_LAB_HOPS) {
      if (hop.auth !== "session") {
        continue;
      }
      const response = await proxy(
        edgeRequest(hop.v1, {
          method: hop.method,
          authorization: `Bearer ${token}`,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      expect(response.status, hop.v1).toBe(200);
      expect(response.headers.get("x-middleware-rewrite"), hop.v1).toBe(
        `http://localhost:3000${hop.canonical}`,
      );
      expect(response.headers.get("x-middleware-request-x-rail-api-version"), hop.v1).toBe("1");
    }
  });

  it("Paket 0+1 DTO zarfları dondurulmuş data anahtarlarını taşır", async () => {
    const session = jsonOk(
      { user: { id: TEST_USER, email: "usta@yetkin.rail" } },
      200,
      REQUEST_ID,
      v1Request("/api/v1/auth/session"),
    );
    await expectV1Envelope(session, 200, {
      user: { id: TEST_USER, email: "usta@yetkin.rail" },
    });

    const strip = jsonOk(
      { strip: { live: true, amountMinor: 12_500, currencyCode: "TRY" } },
      200,
      REQUEST_ID,
      v1Request("/api/v1/dashboard/wallet-strip"),
    );
    await expectV1Envelope(strip, 200, {
      strip: { live: true, amountMinor: 12_500, currencyCode: "TRY" },
    });

    const pulse = jsonOk(
      {
        pulse: {
          live: true,
          openJobsPosted: 1,
          fundedAsClient: 0,
          fundedAsFreelancer: 1,
          releasedAsFreelancer: 0,
          pendingEscrowMinor: 8_000,
          currencyCode: "TRY",
        },
      },
      200,
      REQUEST_ID,
      v1Request("/api/v1/dashboard/freelancer-pulse"),
    );
    const pulseBody = await expectV1Envelope(pulse, 200, {
      pulse: {
        live: true,
        openJobsPosted: 1,
        fundedAsClient: 0,
        fundedAsFreelancer: 1,
        releasedAsFreelancer: 0,
        pendingEscrowMinor: 8_000,
        currencyCode: "TRY",
      },
    });
    expect(pulseBody.data).not.toHaveProperty("jobs");

    const jobs = jsonOk(
      { jobs: [{ id: JOB_ID, status: "OPEN", budgetMinor: 10_000 }] },
      200,
      REQUEST_ID,
      v1Request("/api/v1/freelancer/jobs"),
    );
    await expectV1Envelope(jobs, 200, {
      jobs: [{ id: JOB_ID, status: "OPEN", budgetMinor: 10_000 }],
    });

    const contracts = jsonOk(
      { contracts: [{ id: CONTRACT_ID, status: "FUNDED" }] },
      200,
      REQUEST_ID,
      v1Request("/api/v1/freelancer/contracts"),
    );
    await expectV1Envelope(contracts, 200, {
      contracts: [{ id: CONTRACT_ID, status: "FUNDED" }],
    });

    for (const hop of RAIL_IS_LAB_HOPS) {
      if (hop.v1 === "/api/v1/health") {
        continue;
      }
      expect(hop.dataKeys.length).toBeGreaterThan(0);
    }
  });

  it("vizeli teklif 201 zarf; vizesiz 403 zarf; Idempotency-Key ikinci debit doğurmaz", async () => {
    const career = createMemoryCareerStore();
    await expect(assertAcademyCareerVisaForListing(career, TEST_USER)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
    await expect(assertAcademyCareerVisaForListing(career, TEST_USER)).rejects.toThrow(
      LISTING_ACCESS_VISA_DENIED,
    );

    const denied = jsonFromUnknown(
      new ForbiddenError(LISTING_ACCESS_VISA_DENIED),
      400,
      REQUEST_ID,
      v1Request(`/api/v1/freelancer/jobs/${JOB_ID}/bids`),
    );
    expect(denied.status).toBe(403);
    expect(await denied.json()).toEqual({
      ok: false,
      error: LISTING_ACCESS_VISA_DENIED,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: null,
    });

    const store = createMemoryHttpIdempotencyStore();
    let runs = 0;
    const base = {
      store,
      userId: TEST_USER,
      route: "/api/freelancer/jobs/[id]/bids",
      key: IDEMPOTENCY_KEY,
      requestHash: hashIdempotencyPayload({
        jobId: JOB_ID,
        amountMinor: 9_000,
        coverNote: "teslim",
      }),
      requestId: REQUEST_ID,
      request: v1Request(`/api/v1/freelancer/jobs/${JOB_ID}/bids`),
    };
    const first = await settleHttpIdempotency(base, async () => {
      runs += 1;
      return { status: 201, body: { bid: { id: "fb_lab_1", jobId: JOB_ID, status: "SUBMITTED" } } };
    });
    const replay = await settleHttpIdempotency(base, async () => {
      runs += 1;
      return { status: 201, body: { bid: { id: "should-not-run" } } };
    });
    expect(runs).toBe(1);
    await expectV1Envelope(first, 201, {
      bid: { id: "fb_lab_1", jobId: JOB_ID, status: "SUBMITTED" },
    });
    await expectV1Envelope(replay, 201, {
      bid: { id: "fb_lab_1", jobId: JOB_ID, status: "SUBMITTED" },
    });

    const missingKey = jsonFail(
      "Idempotency-Key başlığı zorunludur.",
      400,
      REQUEST_ID,
      v1Request(`/api/v1/freelancer/jobs/${JOB_ID}/bids`),
    );
    await expectV1Envelope(missingKey, 400, null);
  });

  it("release ve refund kanonik route + Idempotency-Key ile zarflanır", async () => {
    const store = createMemoryHttpIdempotencyStore();
    const release = await settleHttpIdempotency(
      {
        store,
        userId: TEST_USER,
        route: "/api/freelancer/contracts/[id]/release",
        key: IDEMPOTENCY_KEY,
        requestHash: hashIdempotencyPayload({ contractId: CONTRACT_ID }),
        requestId: REQUEST_ID,
        request: v1Request(`/api/v1/freelancer/contracts/${CONTRACT_ID}/release`),
      },
      async () => ({
        status: 200,
        body: { contract: { id: CONTRACT_ID, status: "RELEASED" }, visaStamp: null },
      }),
    );
    await expectV1Envelope(release, 200, {
      contract: { id: CONTRACT_ID, status: "RELEASED" },
      visaStamp: null,
    });

    const refund = await settleHttpIdempotency(
      {
        store,
        userId: TEST_USER,
        route: "/api/freelancer/contracts/[id]/refund",
        key: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
        requestHash: hashIdempotencyPayload({ contractId: CONTRACT_ID }),
        requestId: REQUEST_ID,
        request: v1Request(`/api/v1/freelancer/contracts/${CONTRACT_ID}/refund`),
      },
      async () => ({
        status: 200,
        body: { contract: { id: CONTRACT_ID, status: "REFUNDED" } },
      }),
    );
    await expectV1Envelope(refund, 200, {
      contract: { id: CONTRACT_ID, status: "REFUNDED" },
    });

    const delivery = await settleHttpIdempotency(
      {
        store,
        userId: TEST_USER,
        route: "/api/freelancer/contracts/[id]/messages",
        key: "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff",
        requestHash: hashIdempotencyPayload({
          contractId: CONTRACT_ID,
          kind: "DELIVERY",
          body: "teslim kaniti notu",
          artifactUrl: null,
        }),
        requestId: REQUEST_ID,
        request: v1Request(`/api/v1/freelancer/contracts/${CONTRACT_ID}/messages`),
      },
      async () => ({
        status: 201,
        body: {
          message: {
            id: "fm_lab_1",
            contractId: CONTRACT_ID,
            kind: "DELIVERY",
            createdAt: "2026-08-18T12:00:00.000Z",
          },
        },
      }),
    );
    await expectV1Envelope(delivery, 201, {
      message: {
        id: "fm_lab_1",
        contractId: CONTRACT_ID,
        kind: "DELIVERY",
        createdAt: "2026-08-18T12:00:00.000Z",
      },
    });
  });

  it("çerez-only /api/v1 session hop'ları 401 zarf; health kamu kalır", async () => {
    const token = await signHs256();
    const cookie = `sb-testref-auth-token=${encodeURIComponent(JSON.stringify({ access_token: token }))}`;
    const sessionHops = RAIL_IS_LAB_HOPS.filter((hop) => hop.auth === "session");
    for (const hop of sessionHops) {
      const response = await proxy(
        edgeRequest(hop.v1, {
          method: hop.method,
          cookie,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      expect(response.status, hop.v1).toBe(401);
      expect(await response.json(), hop.v1).toMatchObject({
        ok: false,
        error: "Oturum gerekli.",
        apiVersion: "1",
        data: null,
      });
    }

    const health = await proxy(edgeRequest("/api/v1/health", { cookie }));
    expect(health.status).toBe(200);
    expect(health.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/api/health");

    const publicHops = RAIL_IS_LAB_HOPS.filter((hop) => hop.auth === "public" && hop.v1 !== "/api/v1/health");
    for (const hop of publicHops) {
      const response = await proxy(
        edgeRequest(hop.v1, {
          method: hop.method,
          cookie,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      expect(response.status, hop.v1).toBe(200);
      expect(response.headers.get("x-middleware-rewrite"), hop.v1).toBe(
        `http://localhost:3000${hop.canonical}`,
      );
      expect(response.headers.get("set-cookie"), hop.v1).toBeNull();
    }
  });

  it("RAIL_DRON_ORIGINS joker taşımaz; yabancı origin yansımaz", async () => {
    expect(parseRailDronOrigins("*")).toEqual([]);
    expect(parseRailDronOrigins("*,https://lab.yetkin.rail")).toEqual(["https://lab.yetkin.rail"]);

    vi.stubEnv("RAIL_DRON_ORIGINS", "*");
    const wildcard = await proxy(
      edgeRequest("/api/v1/freelancer/jobs", {
        method: "OPTIONS",
        headers: { origin: "https://evil.example" },
      }),
    );
    expect(wildcard.status).toBe(204);
    expect(wildcard.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(wildcard.headers.get("Access-Control-Allow-Origin")).not.toBe("*");

    vi.stubEnv("RAIL_DRON_ORIGINS", "https://lab.yetkin.rail");
    const allowed = new Headers();
    applyRailV1Cors(
      { headers: allowed },
      {
        url: "http://localhost:3000/api/v1/freelancer/jobs",
        headers: new Headers({ origin: "https://lab.yetkin.rail" }),
      },
      { RAIL_DRON_ORIGINS: "https://lab.yetkin.rail" },
    );
    expect(allowed.get("Access-Control-Allow-Origin")).toBe("https://lab.yetkin.rail");
    expect(allowed.get("Access-Control-Allow-Credentials")).not.toBe("true");

    const foreign = await proxy(
      edgeRequest("/api/v1/freelancer/jobs", {
        method: "OPTIONS",
        headers: { origin: "https://evil.example" },
      }),
    );
    expect(foreign.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("Dron Gün 0 hop'ları v1 sicilinde durur; zarf anahtarları ve yetersiz bakiye metni kilitlidir", () => {
    expect([...DRON_ENVELOPE_KEYS]).toEqual([...RAIL_V1_ENVELOPE_KEYS]);
    expect(DRON_ACCEPT_INSUFFICIENT).toBe(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
    expect(assertPublishedRailV1Hop(RAIL_IS_DAY0_HOPS.session.path, "GET").id).toBe("auth-session");
    expect(assertPublishedRailV1Hop(RAIL_IS_DAY0_HOPS.jobs.path, "GET").id).toBe("freelancer-jobs");
    expect(assertPublishedRailV1Hop(RAIL_IS_DAY0_HOPS.walletStrip.path, "GET").id).toBe(
      "wallet-strip",
    );
    expect(assertPublishedRailV1Hop(RAIL_IS_DAY0_HOPS.contracts.path, "GET").id).toBe(
      "freelancer-contracts",
    );
    expect(assertPublishedRailV1Hop(freelancerBidPath(JOB_ID), "POST").id).toBe("freelancer-bid");
    expect(assertPublishedRailV1Hop(clientJobBidsPath(JOB_ID), "GET").id).toBe("client-job-bids");
    expect(assertPublishedRailV1Hop(freelancerAcceptPath(JOB_ID), "POST").id).toBe(
      "freelancer-accept",
    );
    expect(assertPublishedRailV1Hop(freelancerDeliveryPath(CONTRACT_ID), "POST").id).toBe(
      "freelancer-delivery",
    );
    expect(assertPublishedRailV1Hop(freelancerReleasePath(CONTRACT_ID), "POST").id).toBe(
      "freelancer-release",
    );
    expect(() => assertPublishedRailV1Hop("/api/v1/wallet/top-up", "POST")).toThrow(
      /Yayınlanmamış v1 hop/,
    );
    const hopsSrc = readSrc("apps/rail-is/src/api/hops.ts");
    expect(hopsSrc).not.toContain("/api/wallet/top-up");
    expect(hopsSrc).not.toContain("/api/v1/wallet/top-up");
  });

  it("Rail İş dronu Faz 1 kapanana kadar yayın hattından donuktur", () => {
    expect(existsSync(join(ROOT, "eas.json"))).toBe(false);
    expect(existsSync(join(ROOT, "apps/rail-is/eas.json"))).toBe(false);

    const ci = readSrc(".github/workflows/ci.yml");
    const ciRunSteps = [...ci.matchAll(/^\s+run:\s*(.+)$/gm)].map((match) => match[1] ?? "");
    expect(ciRunSteps.join("\n")).toContain("npm run verify:prebuild");
    expect(ciRunSteps.join("\n")).not.toMatch(/\beas\b/i);
    expect(ciRunSteps.join("\n")).not.toMatch(/expo\s+publish/i);
    expect(ci).not.toMatch(/eas-cli/);

    const rootPkg = JSON.parse(readSrc("package.json")) as {
      scripts?: Record<string, string>;
      workspaces?: unknown;
    };
    expect(JSON.stringify(rootPkg.scripts ?? {})).not.toMatch(/eas|expo publish/i);
    expect(rootPkg.workspaces).toBeUndefined();

    const dronPkg = JSON.parse(readSrc("apps/rail-is/package.json")) as {
      scripts?: Record<string, string>;
      rail?: { publishFrozenUntilFaz1Close?: boolean };
    };
    expect(dronPkg.rail?.publishFrozenUntilFaz1Close).toBe(true);
    expect(JSON.stringify(dronPkg.scripts ?? {})).not.toMatch(/eas|expo publish|eas build/i);

    const appConfig = readSrc("apps/rail-is/app.config.ts");
    expect(appConfig).toContain("publishFrozenUntilFaz1Close: true");

    const nextConfig = readSrc("next.config.ts");
    expect(nextConfig).toContain('"apps/**"');
  });
});
