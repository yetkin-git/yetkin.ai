import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import { POST as postBid } from "@/app/api/freelancer/jobs/[id]/bids/route";
import { POST as postAccept } from "@/app/api/freelancer/jobs/[id]/accept/route";
import { GET as getOwnerBids } from "@/app/api/client/jobs/[id]/bids/route";
import { POST as postDelivery } from "@/app/api/freelancer/contracts/[id]/messages/route";
import { POST as postRelease } from "@/app/api/freelancer/contracts/[id]/release/route";
import { GET as getSessionHop } from "@/app/api/(kernel)/auth/session/route";
import * as sessionApi from "@/lib/kernel/auth/session";
import * as freelancerRuntime from "@/lib/freelancer/runtime";
import * as prismaIdempotency from "@/lib/kernel/http/prisma-idempotency-store";
import * as careerRuntime from "@/lib/career/runtime";
import * as careerEngine from "@/lib/career/engine";
import * as catalogStore from "@/lib/kernel/pricing/prisma-catalog-store";
import { listFreelancerContractViews } from "@/lib/freelancer/contract-view";
import {
  acceptFreelancerBid,
  createFreelancerJob,
  submitFreelancerBid,
} from "@/lib/freelancer/engine";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { RAIL_V1_ACCEPT_FORBIDDEN, RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE, RAIL_V1_DELIVERY_FORBIDDEN, RAIL_V1_IDEMPOTENCY_REQUIRED, RAIL_V1_OWNER_BIDS_FORBIDDEN, RAIL_V1_OWNER_BIDS_NOT_FOUND, RAIL_V1_RELEASE_FORBIDDEN, RAIL_V1_SESSION_REQUIRED } from "@/lib/kernel/http/v1-contract";
import { createMemoryHttpIdempotencyStore } from "@/lib/kernel/http/memory-idempotency-store";
import { requireRailV1IdempotencyKey } from "@/lib/kernel/http/v1-runtime-shield";
import { createV1HttpClient } from "../../apps/rail-is/src/api/client";
import { RailV1HttpError, RailV1ProtocolError } from "../../apps/rail-is/src/api/errors";
import {
  assertRailIsDay0Path,
  clientJobBidsPath,
  freelancerAcceptPath,
  freelancerBidPath,
  freelancerDeliveryPath,
  freelancerReleasePath,
  RAIL_IS_DAY0_HOPS,
} from "../../apps/rail-is/src/api/hops";
import {
  IDEMPOTENCY_KEY_HEADER,
  RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE as DRON_ACCEPT_INSUFFICIENT,
  RAIL_V1_CLIENT_STALE,
  RAIL_V1_PARSE_FAIL,
  createRailV1Uuid,
  isRailV1Uuid,
  parseRailV1AcceptData,
  parseRailV1ClientJobBidsView,
  parseRailV1DeliveryData,
  parseRailV1Envelope,
  parseRailV1ContractsData,
  parseRailV1ReleaseData,
  type RailV1FailBody,
  type RailV1OkBody,
  type FreelancerContractView,
} from "../../apps/rail-is/src/contract/v1";
import {
  createMemoryEscrowStore,
  createMemoryFreelancerStore,
  createMemoryLedgerStore,
  withMemoryAcceptAtomic,
} from "../helpers/memory-money";
import { getOrCreateIntentIdempotencyKey } from "../../apps/rail-is/src/storage/idempotency";
import { createChunkedKvStore, createMemoryKvStore } from "../../apps/rail-is/src/storage/chunked-store";
import { dronAppReducer, initialDronAppState, visibleScreen } from "../../apps/rail-is/src/ui/dron-app-state";
import { emptyAcceptForm, presentAcceptError } from "../../apps/rail-is/src/ui/present-accept";
import { webWalletUrl } from "../../apps/rail-is/src/ui/present-wallet";

const ROOT = process.cwd();
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";
const TEST_EMAIL = "usta@yetkin.rail";
const JOB_ID = "fj_lab_1";
const ACCESS_TOKEN = "dron-access-token-lab";
const BASE_URL = "http://localhost:3000";
const DELIVERY_KEY = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const DELIVERY_NOTE = "teslim kaniti notu";
const RELEASE_KEY = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const CLIENT_USER = "22222222-2222-4222-8222-222222222222";
const STRANGER_USER = "33333333-3333-4333-8333-333333333333";
const SAMPLE_CONTRACT: FreelancerContractView = {
  id: "fc_lab_1",
  jobId: JOB_ID,
  bidId: "fb_lab_1",
  clientId: "client-lab",
  freelancerId: TEST_USER,
  escrowHoldId: "eh_lab_1",
  status: "FUNDED",
  currencyCode: "TRY",
  grossMinor: 10_000,
  holdMinor: 1_000,
  netMinor: 9_000,
  holdBps: 1000,
  fundedAt: "2026-08-18T00:00:00.000Z",
  releasedAt: null,
  refundedAt: null,
  createdAt: "2026-08-18T00:00:00.000Z",
  updatedAt: "2026-08-18T00:00:00.000Z",
  deliveredAt: null,
};

const FORBIDDEN_DRON_DEPS = ["next", "prisma", "@prisma/client", "inngest", "server-only"] as const;
const FROM_RE = /\bfrom\s+["']([^"']+)["']/g;
const DYNAMIC_RE = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;

function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
}

function importSpecs(source: string): string[] {
  const code = stripComments(source);
  const specs: string[] = [];
  for (const re of [FROM_RE, DYNAMIC_RE]) {
    re.lastIndex = 0;
    for (const match of code.matchAll(re)) {
      const spec = match[1];
      if (spec) {
        specs.push(spec);
      }
    }
  }
  return specs;
}

function isForbiddenDronImport(spec: string): boolean {
  return (
    spec === "next" ||
    spec.startsWith("next/") ||
    spec === "server-only" ||
    spec === "inngest" ||
    spec.startsWith("inngest/") ||
    spec === "@prisma/client" ||
    spec.startsWith("@prisma/") ||
    spec === "react-native-webview" ||
    spec.startsWith("@react-native-async-storage/") ||
    spec.startsWith("@/lib/") ||
    spec.includes("lib/kernel")
  );
}

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function walkTs(dir: string): string[] {
  if (!existsSync(dir)) {
    return [];
  }
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".expo") {
        continue;
      }
      files.push(...walkTs(full));
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      files.push(full.replace(/\\/g, "/"));
    }
  }
  return files;
}

function v1Headers(extra?: HeadersInit): Headers {
  return new Headers({
    "x-rail-api-version": "1",
    "x-request-id": REQUEST_ID,
    "X-Rail-Min-Version": "1",
    ...extra,
  });
}

function hopRequest(path: string, init?: { method?: string; headers?: HeadersInit; body?: string }): Request {
  return new Request(new URL(path, BASE_URL), {
    method: init?.method ?? "GET",
    headers: v1Headers(init?.headers),
    body: init?.body,
  });
}

async function signHs256(): Promise<string> {
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(TEST_USER)
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
  return new NextRequest(new URL(path, BASE_URL), {
    method: init?.method,
    headers,
  });
}

function jsonResponse(status: number, body: unknown, extra?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extra },
  });
}

function okEnvelope<T extends Record<string, unknown>>(data: T): RailV1OkBody<T> {
  return {
    ok: true,
    error: null,
    requestId: REQUEST_ID,
    apiVersion: "1",
    data,
  };
}

function failEnvelope(error: string): RailV1FailBody {
  return {
    ok: false,
    error,
    requestId: REQUEST_ID,
    apiVersion: "1",
    data: null,
  };
}

type CapturedCall = { url: string; init: RequestInit };

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  if (input instanceof URL) {
    return input.href;
  }
  return input.url;
}

function headerBag(init?: RequestInit): Headers {
  return new Headers(init?.headers);
}

function createCapturingFetch(handler: (url: string, headers: Headers, init: RequestInit) => Response) {
  const calls: CapturedCall[] = [];
  const fetchImpl: typeof fetch = async (input, init = {}) => {
    const url = requestUrl(input);
    const merged: RequestInit = { ...init };
    calls.push({ url, init: merged });
    return handler(url, headerBag(merged), merged);
  };
  return { fetchImpl, calls };
}

function createDronClient(fetchImpl: typeof fetch, token: string | null = ACCESS_TOKEN) {
  return createV1HttpClient({
    baseUrl: BASE_URL,
    getAccessToken: () => token,
    fetch: fetchImpl,
  });
}

describe("Protokol tanığı — Native Dron vs Core /api/v1", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_JWT_SECRET", TEST_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", TEST_URL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("iskelet Amiral'den ayrıdır; kernel/next/prisma/inngest/webview sızmaz", () => {
    expect(existsSync(join(ROOT, "apps/rail-is/package.json"))).toBe(true);
    expect(existsSync(join(ROOT, "apps/rail-is/src/api/client.ts"))).toBe(true);
    expect(existsSync(join(ROOT, "app/api/v1"))).toBe(false);
    expect(existsSync(join(ROOT, "packages"))).toBe(false);

    const pkg = JSON.parse(readSrc("apps/rail-is/package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const name of FORBIDDEN_DRON_DEPS) {
      expect(deps[name], name).toBeUndefined();
    }
    expect(deps["@supabase/supabase-js"]).toBeTruthy();
    expect(deps["expo-secure-store"]).toBeTruthy();
    expect(deps.expo).toBeTruthy();
    expect(deps["@react-native-async-storage/async-storage"]).toBeUndefined();
    expect(deps["react-native-webview"]).toBeUndefined();
    expect(JSON.stringify(pkg)).not.toContain("SUPABASE_SERVICE_ROLE");

    const clientSrc = readSrc("apps/rail-is/src/api/client.ts");
    expect(clientSrc).toContain('credentials: "omit"');
    expect(clientSrc).toContain("AUTHORIZATION_HEADER");
    expect(clientSrc).toContain("IDEMPOTENCY_KEY_HEADER");
    expect(clientSrc).toContain("RAIL_MIN_VERSION_HEADER");
    expect(clientSrc).toContain("stripCookieHeaders");
    expect(clientSrc).not.toContain("lib/kernel");

    for (const file of walkTs(join(ROOT, "apps/rail-is"))) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toContain("SUPABASE_SERVICE_ROLE");
      for (const spec of importSpecs(source)) {
        expect(isForbiddenDronImport(spec), `${file} import ${spec}`).toBe(false);
      }
    }
  });

  it("GET /api/v1/auth/session — Core: Bearer 200, çerez-only 401 zarf", async () => {
    const token = await signHs256();
    const cookie = `sb-testref-auth-token=${encodeURIComponent(JSON.stringify({ access_token: token }))}`;

    const bearer = await proxy(
      edgeRequest("/api/v1/auth/session", {
        authorization: `Bearer ${token}`,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(bearer.status).toBe(200);
    expect(bearer.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/api/auth/session");
    expect(bearer.headers.get("set-cookie")).toBeNull();

    const cookieOnly = await proxy(
      edgeRequest("/api/v1/auth/session", {
        cookie,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(cookieOnly.status).toBe(401);
    const cookieBody = parseRailV1Envelope(await cookieOnly.json());
    expect(cookieBody).toEqual({
      ok: false,
      error: RAIL_V1_SESSION_REQUIRED,
      requestId: cookieBody.requestId,
      apiVersion: "1",
      data: null,
    });
    expect(cookieOnly.headers.get("set-cookie")).toBeNull();

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const sessionOk = await getSessionHop(
      hopRequest("/api/v1/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    );
    expect(sessionOk.status).toBe(200);
    const sessionBody = parseRailV1Envelope(await sessionOk.json());
    expect(sessionBody).toMatchObject({
      ok: true,
      error: null,
      apiVersion: "1",
      data: { user: { id: TEST_USER, email: TEST_EMAIL } },
    });
    expect(JSON.stringify(sessionBody)).not.toContain("accessToken");
    expect(JSON.stringify(sessionBody)).not.toContain(token);
  });

  it("GET /api/v1/auth/session — Dron istemci Bearer 200; Cookie göndermez", async () => {
    const { fetchImpl, calls } = createCapturingFetch((url, headers) => {
      expect(url).toBe(`${BASE_URL}/api/v1/auth/session`);
      expect(headers.get("cookie")).toBeNull();
      expect(headers.get("Cookie")).toBeNull();
      if (headers.get("Authorization") === `Bearer ${ACCESS_TOKEN}`) {
        return jsonResponse(
          200,
          okEnvelope({ user: { id: TEST_USER, email: TEST_EMAIL } }),
        );
      }
      return jsonResponse(401, failEnvelope(RAIL_V1_SESSION_REQUIRED));
    });

    const client = createDronClient(fetchImpl);
    const result = await client.getSession();
    expect(result.data.user).toEqual({ id: TEST_USER, email: TEST_EMAIL });
    expect(calls).toHaveLength(1);
    const sent = headerBag(calls[0]?.init);
    expect(sent.get("Authorization")).toBe(`Bearer ${ACCESS_TOKEN}`);
    expect(sent.get("X-Rail-Min-Version")).toBe("1");
    expect(calls[0]?.init.credentials).toBe("omit");
    expect(sent.get("Idempotency-Key")).toBeNull();
  });

  it("POST /api/v1/freelancer/jobs/{id}/bids — Core UUID kabul, anahtarsız 400", async () => {
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const path = `/api/v1/freelancer/jobs/${JOB_ID}/bids`;
    const missing = await postBid(hopRequest(path, { method: "POST", body: "{}" }), {
      params: Promise.resolve({ id: JOB_ID }),
    });
    expect(missing.status).toBe(400);
    const missingBody = parseRailV1Envelope(await missing.json());
    expect(missingBody).toMatchObject({
      ok: false,
      error: RAIL_V1_IDEMPOTENCY_REQUIRED,
      apiVersion: "1",
      data: null,
    });

    const accepted = requireRailV1IdempotencyKey(
      hopRequest(path, {
        method: "POST",
        headers: { [IDEMPOTENCY_KEY_HEADER]: REQUEST_ID },
      }),
      REQUEST_ID,
    );
    expect(accepted).toEqual({ ok: true, key: REQUEST_ID });
  });

  it("POST …/bids — Dron otomatik Idempotency-Key ile kabul; anahtarsız Core 400", async () => {
    const minted = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    const { fetchImpl, calls } = createCapturingFetch((url, headers, init) => {
      expect(url).toBe(`${BASE_URL}${freelancerBidPath(JOB_ID)}`);
      expect(init.credentials).toBe("omit");
      expect(headers.get("cookie")).toBeNull();
      const key = headers.get(IDEMPOTENCY_KEY_HEADER);
      if (!key) {
        return jsonResponse(400, failEnvelope(RAIL_V1_IDEMPOTENCY_REQUIRED));
      }
      expect(isRailV1Uuid(key)).toBe(true);
      return jsonResponse(
        201,
        okEnvelope({
          bid: {
            id: "fb_lab_1",
            jobId: JOB_ID,
            bidderId: TEST_USER,
            amountMinor: 9_000,
            currencyCode: "TRY",
            coverNote: "teslim notu",
            status: "SUBMITTED",
            createdAt: "2026-08-18T00:00:00.000Z",
            updatedAt: "2026-08-18T00:00:00.000Z",
          },
        }),
      );
    });

    const client = createV1HttpClient({
      baseUrl: BASE_URL,
      getAccessToken: () => ACCESS_TOKEN,
      fetch: fetchImpl,
      createIdempotencyKey: () => minted,
    });
    const result = await client.submitBid(JOB_ID, { amountMinor: 9_000, coverNote: "teslim notu" });
    expect(result.ok).toBe(true);
    expect(result.data.bid.id).toBe("fb_lab_1");
    expect(headerBag(calls[0]?.init).get(IDEMPOTENCY_KEY_HEADER)).toBe(minted);

    const rawMissing = await fetchImpl(`${BASE_URL}${freelancerBidPath(JOB_ID)}`, {
      method: "POST",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "X-Rail-Min-Version": "1",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amountMinor: 9_000, coverNote: "teslim notu" }),
    });
    expect(rawMissing.status).toBe(400);
    const rawBody = parseRailV1Envelope(await rawMissing.json());
    expect(rawBody).toMatchObject({ ok: false, error: RAIL_V1_IDEMPOTENCY_REQUIRED, data: null });
  });

  it("401 ve 426 katı zarf parse eder; sahte jobs/strip üretmez", async () => {
    const { fetchImpl } = createCapturingFetch((_url, headers) => {
      if (headers.get("X-Rail-Min-Version") === "2") {
        return jsonResponse(426, failEnvelope(RAIL_V1_CLIENT_STALE));
      }
      return jsonResponse(401, failEnvelope(RAIL_V1_SESSION_REQUIRED));
    });
    const client = createDronClient(fetchImpl, ACCESS_TOKEN);

    await expect(client.getSession()).rejects.toBeInstanceOf(RailV1HttpError);
    try {
      await client.getSession();
    } catch (error) {
      expect(error).toBeInstanceOf(RailV1HttpError);
      if (error instanceof RailV1HttpError) {
        expect(error.status).toBe(401);
        expect(error.envelope.data).toBeNull();
        expect(error.envelope.error).toBe(RAIL_V1_SESSION_REQUIRED);
        expect(error).not.toHaveProperty("jobs");
        expect(error).not.toHaveProperty("strip");
      }
    }

    const staleClient = createV1HttpClient({
      baseUrl: BASE_URL,
      getAccessToken: () => ACCESS_TOKEN,
      minVersion: 2,
      fetch: fetchImpl,
    });
    await expect(staleClient.listOpenJobs()).rejects.toMatchObject({
      status: 426,
      envelope: { data: null, error: RAIL_V1_CLIENT_STALE },
    });
  });

  it("versiyonsuz JSON veya HTML parse fail'dir; boş home uydurulmaz", async () => {
    const htmlFetch: typeof fetch = async () =>
      new Response("<html>giriş</html>", { status: 401, headers: { "content-type": "text/html" } });
    const htmlClient = createDronClient(htmlFetch);
    await expect(htmlClient.getSession()).rejects.toBeInstanceOf(RailV1ProtocolError);
    await expect(htmlClient.getSession()).rejects.toThrow(RAIL_V1_PARSE_FAIL);

    const unversionedFetch: typeof fetch = async () =>
      jsonResponse(200, { ok: true, jobs: [] });
    const unversionedClient = createDronClient(unversionedFetch);
    await expect(unversionedClient.listOpenJobs()).rejects.toBeInstanceOf(RailV1ProtocolError);
  });

  it("Gün 0 allowlist owner GET ve POST accept açar; GET jobs/{id} ve GET messages kapalı", () => {
    expect(assertRailIsDay0Path(RAIL_IS_DAY0_HOPS.contracts.path)).toBe(
      "/api/v1/freelancer/contracts",
    );
    expect(assertRailIsDay0Path("/api/v1/freelancer/contracts/fc_1/messages", "POST")).toBe(
      "/api/v1/freelancer/contracts/fc_1/messages",
    );
    expect(freelancerDeliveryPath("fc_1")).toBe("/api/v1/freelancer/contracts/fc_1/messages");
    expect(assertRailIsDay0Path("/api/v1/freelancer/contracts/fc_1/release", "POST")).toBe(
      "/api/v1/freelancer/contracts/fc_1/release",
    );
    expect(freelancerReleasePath("fc_1")).toBe("/api/v1/freelancer/contracts/fc_1/release");
    expect(assertRailIsDay0Path("/api/v1/client/jobs/fj_1/bids")).toBe(
      "/api/v1/client/jobs/fj_1/bids",
    );
    expect(clientJobBidsPath(JOB_ID)).toBe(`/api/v1/client/jobs/${JOB_ID}/bids`);
    expect(assertRailIsDay0Path("/api/v1/freelancer/jobs/fj_1/accept", "POST")).toBe(
      "/api/v1/freelancer/jobs/fj_1/accept",
    );
    expect(freelancerAcceptPath("fj_1")).toBe("/api/v1/freelancer/jobs/fj_1/accept");
    expect(() => assertRailIsDay0Path("/api/v1/freelancer/jobs/fj_1")).toThrow(/allowlist/);
    expect(() => assertRailIsDay0Path("/api/v1/freelancer/jobs/fj_1/accept")).toThrow(/allowlist/);
    expect(() => assertRailIsDay0Path("/api/v1/client/jobs/fj_1/bids", "POST")).toThrow(/allowlist/);
    expect(() => assertRailIsDay0Path("/api/v1/freelancer/contracts/fc_1/release")).toThrow(
      /allowlist/,
    );
    expect(() => assertRailIsDay0Path("/api/v1/freelancer/contracts/fc_1/messages")).toThrow(
      /allowlist/,
    );
    expect(() => assertRailIsDay0Path("/api/v1/freelancer/contracts/fc_1/messages", "GET")).toThrow(
      /allowlist/,
    );
    expect(() => assertRailIsDay0Path("/api/freelancer/jobs")).toThrow(/\/api\/v1/);
    expect(freelancerBidPath(JOB_ID)).toBe(`/api/v1/freelancer/jobs/${JOB_ID}/bids`);
  });

  it("GET /api/v1/freelancer/contracts — Dron Bearer 200, çerez ve Idempotency-Key yok; DTO deliveredAt ister", async () => {
    const { fetchImpl, calls } = createCapturingFetch((url, headers) => {
      expect(url).toBe(`${BASE_URL}/api/v1/freelancer/contracts`);
      expect(headers.get("cookie")).toBeNull();
      expect(headers.get("Cookie")).toBeNull();
      if (headers.get("Authorization") === `Bearer ${ACCESS_TOKEN}`) {
        return jsonResponse(200, okEnvelope({ contracts: [SAMPLE_CONTRACT] }));
      }
      return jsonResponse(401, failEnvelope(RAIL_V1_SESSION_REQUIRED));
    });

    const client = createDronClient(fetchImpl);
    const result = await client.listContracts();
    expect(result.data.contracts).toEqual([SAMPLE_CONTRACT]);
    expect(result.data.contracts[0]?.deliveredAt).toBeNull();
    expect(calls).toHaveLength(1);
    const sent = headerBag(calls[0]?.init);
    expect(sent.get("Authorization")).toBe(`Bearer ${ACCESS_TOKEN}`);
    expect(sent.get("X-Rail-Min-Version")).toBe("1");
    expect(calls[0]?.init.credentials).toBe("omit");
    expect(sent.get("Idempotency-Key")).toBeNull();

    const missingDelivery = {
      id: SAMPLE_CONTRACT.id,
      jobId: SAMPLE_CONTRACT.jobId,
      bidId: SAMPLE_CONTRACT.bidId,
      clientId: SAMPLE_CONTRACT.clientId,
      freelancerId: SAMPLE_CONTRACT.freelancerId,
      escrowHoldId: SAMPLE_CONTRACT.escrowHoldId,
      status: SAMPLE_CONTRACT.status,
      currencyCode: SAMPLE_CONTRACT.currencyCode,
      grossMinor: SAMPLE_CONTRACT.grossMinor,
      holdMinor: SAMPLE_CONTRACT.holdMinor,
      netMinor: SAMPLE_CONTRACT.netMinor,
      holdBps: SAMPLE_CONTRACT.holdBps,
      fundedAt: SAMPLE_CONTRACT.fundedAt,
      releasedAt: SAMPLE_CONTRACT.releasedAt,
      refundedAt: SAMPLE_CONTRACT.refundedAt,
      createdAt: SAMPLE_CONTRACT.createdAt,
      updatedAt: SAMPLE_CONTRACT.updatedAt,
    };
    expect(() => parseRailV1ContractsData({ contracts: [missingDelivery] })).toThrow(RAIL_V1_PARSE_FAIL);

    const leaky = {
      ...SAMPLE_CONTRACT,
      body: "hasta notu",
      artifactUrl: "https://files.example/secret.png",
    };
    expect(() => parseRailV1ContractsData({ contracts: [leaky] })).toThrow(RAIL_V1_PARSE_FAIL);
  });

  it("contracts parse fail sahte iş listesi üretmez; data.contracts yoksa protokol hatası", async () => {
    const { fetchImpl } = createCapturingFetch(() =>
      jsonResponse(200, okEnvelope({ notContracts: true })),
    );
    const client = createDronClient(fetchImpl);
    await expect(client.listContracts()).rejects.toBeInstanceOf(RailV1ProtocolError);
    await expect(client.listContracts()).rejects.toThrow(RAIL_V1_PARSE_FAIL);

    const unauth = createCapturingFetch(() => jsonResponse(401, failEnvelope(RAIL_V1_SESSION_REQUIRED)));
    const denied = createDronClient(unauth.fetchImpl);
    await expect(denied.listContracts()).rejects.toBeInstanceOf(RailV1HttpError);
    try {
      await denied.listContracts();
    } catch (error) {
      expect(error).toBeInstanceOf(RailV1HttpError);
      if (error instanceof RailV1HttpError) {
        expect(error.status).toBe(401);
        expect(error.envelope.data).toBeNull();
        expect(error).not.toHaveProperty("contracts");
      }
    }
  });

  it("SecureStore parçalama ve niyet UUID'si yeniden çizimde değişmez", async () => {
    const memory = createMemoryKvStore();
    const chunked = createChunkedKvStore(memory);
    const bulky = "x".repeat(4000);
    await chunked.setItem("session.json", bulky);
    expect(await chunked.getItem("session.json")).toBe(bulky);

    const first = await getOrCreateIntentIdempotencyKey(memory, `bid:${JOB_ID}`);
    const second = await getOrCreateIntentIdempotencyKey(memory, `bid:${JOB_ID}`);
    expect(isRailV1Uuid(first)).toBe(true);
    expect(second).toBe(first);
    expect(createRailV1Uuid()).not.toBe(first);
  });

  it("POST …/messages kind=DELIVERY — geçerli UUID yazar; deliveredAt damgası oluşur; PII sızmaz", async () => {
    const ports = deliveryWorld();
    const contract = await fundedLabContract(ports);
    const store = createMemoryHttpIdempotencyStore();
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(store);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });

    const path = `/api/v1/freelancer/contracts/${contract.id}/messages`;
    const response = await postDelivery(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: DELIVERY_KEY,
        },
        body: JSON.stringify({ kind: "DELIVERY", body: DELIVERY_NOTE }),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    expect(response.status).toBe(201);
    const envelope = parseRailV1Envelope(await response.json());
    expect(envelope.ok).toBe(true);
    if (!envelope.ok) {
      throw new Error("teslim 201 zarfı ok değil");
    }
    const data = parseRailV1DeliveryData(envelope.data);
    expect(data.message.kind).toBe("DELIVERY");
    expect(data.message.contractId).toBe(contract.id);
    expect(data.message.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(JSON.stringify(envelope)).not.toContain(DELIVERY_NOTE);
    expect(JSON.stringify(envelope)).not.toContain("artifactUrl");
    expect(JSON.stringify(envelope)).not.toContain("userId");

    const views = await listFreelancerContractViews(ports.freelancer, TEST_USER);
    expect(views).toHaveLength(1);
    expect(views[0]?.deliveredAt).toBe(data.message.createdAt);
    expect(JSON.stringify(views)).not.toContain(DELIVERY_NOTE);

    const rows = await ports.freelancer.listMessagesForContract(contract.id);
    expect(rows.filter((row) => row.kind === "DELIVERY")).toHaveLength(1);
  });

  it("POST …/messages — Idempotency-Key yokken 400; 2xx doğmaz", async () => {
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const path = `/api/v1/freelancer/contracts/fc_lab_1/messages`;
    const missing = await postDelivery(
      hopRequest(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind: "DELIVERY", body: DELIVERY_NOTE }),
      }),
      { params: Promise.resolve({ id: "fc_lab_1" }) },
    );
    expect(missing.status).toBe(400);
    const missingBody = parseRailV1Envelope(await missing.json());
    expect(missingBody).toMatchObject({
      ok: false,
      error: RAIL_V1_IDEMPOTENCY_REQUIRED,
      apiVersion: "1",
      data: null,
    });

    const minted = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
    const { fetchImpl, calls } = createCapturingFetch((url, headers, init) => {
      expect(url).toBe(`${BASE_URL}${freelancerDeliveryPath("fc_lab_1")}`);
      expect(init.credentials).toBe("omit");
      const key = headers.get(IDEMPOTENCY_KEY_HEADER);
      if (!key) {
        return jsonResponse(400, failEnvelope(RAIL_V1_IDEMPOTENCY_REQUIRED));
      }
      expect(isRailV1Uuid(key)).toBe(true);
      return jsonResponse(
        201,
        okEnvelope({
          message: {
            id: "fm_lab_1",
            contractId: "fc_lab_1",
            kind: "DELIVERY",
            createdAt: "2026-08-18T12:00:00.000Z",
          },
        }),
      );
    });
    const client = createV1HttpClient({
      baseUrl: BASE_URL,
      getAccessToken: () => ACCESS_TOKEN,
      fetch: fetchImpl,
      createIdempotencyKey: () => minted,
    });
    const result = await client.postDelivery("fc_lab_1", { kind: "DELIVERY", body: DELIVERY_NOTE });
    expect(result.ok).toBe(true);
    expect(result.data.message.kind).toBe("DELIVERY");
    expect(headerBag(calls[0]?.init).get(IDEMPOTENCY_KEY_HEADER)).toBe(minted);

    const rawMissing = await fetchImpl(`${BASE_URL}${freelancerDeliveryPath("fc_lab_1")}`, {
      method: "POST",
      credentials: "omit",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "X-Rail-Min-Version": "1",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ kind: "DELIVERY", body: DELIVERY_NOTE }),
    });
    expect(rawMissing.status).toBe(400);
    expect(parseRailV1Envelope(await rawMissing.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_IDEMPOTENCY_REQUIRED,
      data: null,
    });
  });

  it("POST …/messages — aynı UUID mükerrer teslim tekil kayıt üretir; işveren 403", async () => {
    const ports = deliveryWorld();
    const contract = await fundedLabContract(ports);
    const store = createMemoryHttpIdempotencyStore();
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(store);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const path = `/api/v1/freelancer/contracts/${contract.id}/messages`;
    const payload = { kind: "DELIVERY" as const, body: DELIVERY_NOTE };
    const first = await postDelivery(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: DELIVERY_KEY,
        },
        body: JSON.stringify(payload),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    const replay = await postDelivery(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: DELIVERY_KEY,
        },
        body: JSON.stringify(payload),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    expect(first.status).toBe(201);
    expect(replay.status).toBe(201);
    const firstBody = parseRailV1Envelope(await first.json());
    const replayBody = parseRailV1Envelope(await replay.json());
    expect(firstBody).toEqual(replayBody);
    const rows = await ports.freelancer.listMessagesForContract(contract.id);
    expect(rows.filter((row) => row.kind === "DELIVERY")).toHaveLength(1);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT_USER,
      email: "isveren@yetkin.rail",
    });
    const asClient = await postDelivery(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee",
        },
        body: JSON.stringify(payload),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    expect(asClient.status).toBe(403);
    expect(parseRailV1Envelope(await asClient.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_DELIVERY_FORBIDDEN,
      data: null,
    });
    expect(await ports.freelancer.listMessagesForContract(contract.id)).toHaveLength(1);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: STRANGER_USER,
      email: "yabanci@yetkin.rail",
    });
    const asStranger = await postDelivery(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: "ffffffff-ffff-4fff-8fff-ffffffffffff",
        },
        body: JSON.stringify(payload),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    expect(asStranger.status).toBe(403);
    expect(await ports.freelancer.listMessagesForContract(contract.id)).toHaveLength(1);

    const leaky = {
      id: "fm_lab_1",
      contractId: contract.id,
      kind: "DELIVERY",
      createdAt: "2026-08-18T12:00:00.000Z",
      body: DELIVERY_NOTE,
    };
    expect(() => parseRailV1DeliveryData({ message: leaky })).toThrow(RAIL_V1_PARSE_FAIL);
  });

  it("POST …/release — usta 403; CREDIT yazılmaz", async () => {
    const ports = deliveryWorld();
    const contract = await fundedLabContract(ports);
    const store = createMemoryHttpIdempotencyStore();
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(store);
    vi.spyOn(careerRuntime, "createPrismaCareerPorts").mockReturnValue({} as never);
    vi.spyOn(careerEngine, "tryIssueCareerVisaStamp").mockResolvedValue(null);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });

    const path = `/api/v1/freelancer/contracts/${contract.id}/release`;
    const asFreelancer = await postRelease(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: RELEASE_KEY,
        },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    expect(asFreelancer.status).toBe(403);
    expect(parseRailV1Envelope(await asFreelancer.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_RELEASE_FORBIDDEN,
      data: null,
    });
    expect(ports.ledger.snapshot(TEST_USER).amountMinor).toBe(0);
    expect(netCreditCount(ports, TEST_USER)).toBe(0);
    const hold = await ports.escrow.findById(contract.escrowHoldId);
    expect(hold?.status).toBe("PENDING");
  });

  it("POST …/release — geçerli UUID emaneti çözer; freelancer'a tek CREDIT yazar", async () => {
    const ports = deliveryWorld();
    const contract = await fundedLabContract(ports);
    const store = createMemoryHttpIdempotencyStore();
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(store);
    vi.spyOn(careerRuntime, "createPrismaCareerPorts").mockReturnValue({} as never);
    vi.spyOn(careerEngine, "tryIssueCareerVisaStamp").mockResolvedValue(null);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT_USER,
      email: "isveren@yetkin.rail",
    });

    const path = `/api/v1/freelancer/contracts/${contract.id}/release`;
    const response = await postRelease(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: RELEASE_KEY,
        },
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    expect(response.status).toBe(200);
    const envelope = parseRailV1Envelope(await response.json());
    expect(envelope.ok).toBe(true);
    if (!envelope.ok) {
      throw new Error("release 200 zarfı ok değil");
    }
    const data = parseRailV1ReleaseData(envelope.data);
    expect(data.contract.status).toBe("RELEASED");
    expect(data.contract.freelancerId).toBe(TEST_USER);
    expect(data.contract.clientId).toBe(CLIENT_USER);
    expect(data.contract).not.toHaveProperty("deliveredAt");
    expect(data.visaStamp).toBeNull();
    expect(() => parseRailV1ContractsData({ contracts: [data.contract] })).toThrow(RAIL_V1_PARSE_FAIL);

    expect(ports.ledger.snapshot(TEST_USER).amountMinor).toBe(9_000);
    expect(ports.ledger.snapshot(CLIENT_USER).amountMinor).toBe(90_000);
    expect(netCreditCount(ports, TEST_USER)).toBe(1);
    const hold = await ports.escrow.findById(contract.escrowHoldId);
    expect(hold?.status).toBe("RELEASED");
  });

  it("POST …/release — mükerrer UUID tekil CREDIT üretir; kilitli zarf döner", async () => {
    const ports = deliveryWorld();
    const contract = await fundedLabContract(ports);
    const store = createMemoryHttpIdempotencyStore();
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(store);
    vi.spyOn(careerRuntime, "createPrismaCareerPorts").mockReturnValue({} as never);
    vi.spyOn(careerEngine, "tryIssueCareerVisaStamp").mockResolvedValue(null);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT_USER,
      email: "isveren@yetkin.rail",
    });

    const path = `/api/v1/freelancer/contracts/${contract.id}/release`;
    const payload = {};
    const first = await postRelease(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: RELEASE_KEY,
        },
        body: JSON.stringify(payload),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    const replay = await postRelease(
      hopRequest(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: RELEASE_KEY,
        },
        body: JSON.stringify(payload),
      }),
      { params: Promise.resolve({ id: contract.id }) },
    );
    expect(first.status).toBe(200);
    expect(replay.status).toBe(200);
    const firstBody = parseRailV1Envelope(await first.json());
    const replayBody = parseRailV1Envelope(await replay.json());
    expect(firstBody).toEqual(replayBody);
    expect(netCreditCount(ports, TEST_USER)).toBe(1);
    expect(ports.ledger.snapshot(TEST_USER).amountMinor).toBe(9_000);

    const leaky = {
      contract: {
        id: contract.id,
        jobId: contract.jobId,
        bidId: contract.bidId,
        clientId: CLIENT_USER,
        freelancerId: TEST_USER,
        escrowHoldId: contract.escrowHoldId,
        status: "RELEASED",
        currencyCode: "TRY",
        grossMinor: 10_000,
        holdMinor: 1_000,
        netMinor: 9_000,
        holdBps: 1000,
        fundedAt: "2026-08-18T00:00:00.000Z",
        releasedAt: "2026-08-18T13:00:00.000Z",
        refundedAt: null,
        createdAt: "2026-08-18T00:00:00.000Z",
        updatedAt: "2026-08-18T13:00:00.000Z",
        deliveredAt: "2026-08-18T12:00:00.000Z",
      },
      visaStamp: null,
    };
    expect(() => parseRailV1ReleaseData(leaky)).toThrow(RAIL_V1_PARSE_FAIL);
  });

  it("GET …/client/jobs/{id}/bids — yalnız ilan sahibi okur; usta ve üçüncü şahıs 403, bidderId sızmaz", async () => {
    const ports = deliveryWorld();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT_USER,
      title: "İkon seti",
      brief: "16 SVG, Quiet Luxury.",
      budgetMinor: 10_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: TEST_USER,
      amountMinor: 10_000,
      coverNote: "Teslim 5 gün.",
    });
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT_USER,
      email: "isveren@yetkin.rail",
    });
    const asOwner = await getOwnerBids(hopRequest(`/api/v1/client/jobs/${job.id}/bids`), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(asOwner.status).toBe(200);
    const ownerBody = parseRailV1Envelope(await asOwner.json());
    expect(ownerBody.ok).toBe(true);
    if (!ownerBody.ok) {
      throw new Error("owner GET 200 zarfı ok değil");
    }
    const view = parseRailV1ClientJobBidsView(ownerBody.data);
    expect(view.bids).toHaveLength(1);
    expect(view.bids[0]).toEqual({
      bidId: bid.id,
      amountMinor: 10_000,
      coverNote: "Teslim 5 gün.",
      createdAt: view.bids[0]?.createdAt,
    });
    expect(JSON.stringify(ownerBody)).not.toContain("bidderId");
    expect(JSON.stringify(ownerBody)).not.toContain(TEST_USER);
    expect(view.bids[0]).not.toHaveProperty("status");
    expect(view.bids[0]).not.toHaveProperty("id");
    expect(() =>
      parseRailV1ClientJobBidsView({
        bids: [
          {
            id: bid.id,
            jobId: job.id,
            bidderId: TEST_USER,
            amountMinor: 10_000,
            currencyCode: "TRY",
            coverNote: "Teslim 5 gün.",
            status: "SUBMITTED",
            createdAt: "2026-08-18T00:00:00.000Z",
            updatedAt: "2026-08-18T00:00:00.000Z",
          },
        ],
      }),
    ).toThrow(RAIL_V1_PARSE_FAIL);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const asFreelancer = await getOwnerBids(hopRequest(`/api/v1/client/jobs/${job.id}/bids`), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(asFreelancer.status).toBe(403);
    const denied = parseRailV1Envelope(await asFreelancer.json());
    expect(denied).toMatchObject({
      ok: false,
      error: RAIL_V1_OWNER_BIDS_FORBIDDEN,
      data: null,
    });
    expect(JSON.stringify(denied)).not.toContain("bids");
    expect(JSON.stringify(denied)).not.toContain(bid.id);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: STRANGER_USER,
      email: "yabanci@yetkin.rail",
    });
    const asStranger = await getOwnerBids(hopRequest(`/api/v1/client/jobs/${job.id}/bids`), {
      params: Promise.resolve({ id: job.id }),
    });
    expect(asStranger.status).toBe(403);
    expect(parseRailV1Envelope(await asStranger.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_OWNER_BIDS_FORBIDDEN,
      data: null,
    });

    const missing = await getOwnerBids(hopRequest("/api/v1/client/jobs/fj_yok/bids"), {
      params: Promise.resolve({ id: "fj_yok" }),
    });
    expect(missing.status).toBe(404);
    expect(parseRailV1Envelope(await missing.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_OWNER_BIDS_NOT_FOUND,
      data: null,
    });

    const { fetchImpl, calls } = createCapturingFetch((url, headers) => {
      expect(url).toBe(`${BASE_URL}${clientJobBidsPath(job.id)}`);
      expect(headers.get("cookie")).toBeNull();
      expect(headers.get(IDEMPOTENCY_KEY_HEADER)).toBeNull();
      return jsonResponse(
        200,
        okEnvelope({
          bids: [
            {
              bidId: bid.id,
              amountMinor: 10_000,
              coverNote: "Teslim 5 gün.",
              createdAt: "2026-08-18T00:00:00.000Z",
            },
          ],
        }),
      );
    });
    const client = createDronClient(fetchImpl);
    const listed = await client.listOwnerJobBids(job.id);
    expect(listed.data.bids[0]?.bidId).toBe(bid.id);
    expect(headerBag(calls[0]?.init).get(IDEMPOTENCY_KEY_HEADER)).toBeNull();
  });

  it("POST …/accept — Dron UUID ile DEBIT/blokaj üretir; Tezgâh FUNDED satırına düşer", async () => {
    expect(DRON_ACCEPT_INSUFFICIENT).toBe(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
    const ports = deliveryWorld();
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT_USER,
      title: "İkon seti",
      brief: "16 SVG, Quiet Luxury.",
      budgetMinor: 10_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: TEST_USER,
      amountMinor: 10_000,
      coverNote: "Teslim 5 gün.",
    });
    const store = createMemoryHttpIdempotencyStore();
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(store);
    vi.spyOn(catalogStore, "createPrismaPriceCatalogStore").mockReturnValue({
      findActiveEntry: async () => null,
    } as never);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const asFreelancer = await postAccept(
      hopRequest(`/api/v1/freelancer/jobs/${job.id}/accept`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        },
        body: JSON.stringify({ bidId: bid.id }),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(asFreelancer.status).toBe(403);
    expect(parseRailV1Envelope(await asFreelancer.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_ACCEPT_FORBIDDEN,
      data: null,
    });
    expect(debitCount(ports, CLIENT_USER)).toBe(0);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT_USER,
      email: "isveren@yetkin.rail",
    });

    const ACCEPT_KEY = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    const response = await postAccept(
      hopRequest(`/api/v1/freelancer/jobs/${job.id}/accept`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: ACCEPT_KEY,
        },
        body: JSON.stringify({ bidId: bid.id }),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(response.status).toBe(200);
    const envelope = parseRailV1Envelope(await response.json());
    expect(envelope.ok).toBe(true);
    if (!envelope.ok) {
      throw new Error("accept 200 zarfı ok değil");
    }
    const data = parseRailV1AcceptData(envelope.data);
    expect(data.contract.status).toBe("FUNDED");
    expect(data.contract.bidId).toBe(bid.id);
    expect(data.contract.clientId).toBe(CLIENT_USER);
    expect(data.contract.freelancerId).toBe(TEST_USER);
    expect(data.contract).not.toHaveProperty("deliveredAt");
    expect(data).not.toHaveProperty("visaStamp");
    expect(() => parseRailV1ContractsData({ contracts: [data.contract] })).toThrow(RAIL_V1_PARSE_FAIL);

    expect(debitCount(ports, CLIENT_USER)).toBe(1);
    expect(ports.ledger.snapshot(CLIENT_USER).amountMinor).toBe(90_000);
    const hold = await ports.escrow.findById(data.contract.escrowHoldId);
    expect(hold?.status).toBe("PENDING");

    const views = await listFreelancerContractViews(ports.freelancer, CLIENT_USER);
    expect(views).toHaveLength(1);
    expect(views[0]?.status).toBe("FUNDED");
    expect(views[0]?.deliveredAt).toBeNull();

    const minted = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
    const { fetchImpl, calls } = createCapturingFetch((url, headers, init) => {
      expect(url).toBe(`${BASE_URL}${freelancerAcceptPath(job.id)}`);
      expect(init.credentials).toBe("omit");
      expect(headers.get("cookie")).toBeNull();
      const key = headers.get(IDEMPOTENCY_KEY_HEADER);
      expect(isRailV1Uuid(key ?? "")).toBe(true);
      return jsonResponse(200, okEnvelope({ contract: data.contract }));
    });
    const client = createV1HttpClient({
      baseUrl: BASE_URL,
      getAccessToken: () => ACCESS_TOKEN,
      fetch: fetchImpl,
      createIdempotencyKey: () => minted,
    });
    const posted = await client.postAccept(job.id, { bidId: bid.id });
    expect(posted.data.contract.status).toBe("FUNDED");
    expect(headerBag(calls[0]?.init).get(IDEMPOTENCY_KEY_HEADER)).toBe(minted);

    const ownerJob = {
      id: job.id,
      clientId: CLIENT_USER,
      title: job.title,
      brief: job.brief,
      budgetMinor: 10_000,
      currencyCode: "TRY" as const,
      status: "OPEN" as const,
      createdAt: "2026-08-18T00:00:00.000Z",
      updatedAt: "2026-08-18T00:00:00.000Z",
    };
    let state = dronAppReducer(initialDronAppState, {
      type: "SESSION_OK",
      user: { id: CLIENT_USER, email: "isveren@yetkin.rail" },
    });
    state = dronAppReducer(state, { type: "SELECT_JOB", job: ownerJob });
    state = dronAppReducer(state, { type: "ACCEPT_OK" });
    expect(visibleScreen(state)).toBe("bench");
    expect(state.homeTab).toBe("bench");
    expect(state.selectedJob).toBeNull();
    expect(state.acceptView.fakeSuccess).toBe(false);
    state = dronAppReducer(state, { type: "CONTRACTS_OK", contracts: views });
    expect(state.benchView.kind).toBe("ready");
    if (state.benchView.kind === "ready") {
      expect(state.benchView.lanes.in_progress).toHaveLength(1);
      expect(state.benchView.items[0]?.role).toBe("client");
    }
  });

  it("POST …/accept — yetersiz bakiyede 409; /cuzdan köprüsü dürüst, sahte başarı yok", async () => {
    const ports = withMemoryAcceptAtomic({
      ledger: createMemoryLedgerStore([
        { userId: CLIENT_USER, amountMinor: 0 },
        { userId: TEST_USER, amountMinor: 0 },
        { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
      ]),
      escrow: createMemoryEscrowStore(),
      freelancer: createMemoryFreelancerStore(),
    });
    const job = await createFreelancerJob(ports, {
      clientId: CLIENT_USER,
      title: "İkon seti",
      brief: "16 SVG, Quiet Luxury.",
      budgetMinor: 10_000,
    });
    const bid = await submitFreelancerBid(ports, {
      jobId: job.id,
      bidderId: TEST_USER,
      amountMinor: 10_000,
      coverNote: "Teslim 5 gün.",
    });
    const store = createMemoryHttpIdempotencyStore();
    vi.spyOn(freelancerRuntime, "createPrismaFreelancerPorts").mockReturnValue(ports as never);
    vi.spyOn(prismaIdempotency, "createPrismaHttpIdempotencyStore").mockReturnValue(store);
    vi.spyOn(catalogStore, "createPrismaPriceCatalogStore").mockReturnValue({
      findActiveEntry: async () => null,
    } as never);
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: CLIENT_USER,
      email: "isveren@yetkin.rail",
    });

    const response = await postAccept(
      hopRequest(`/api/v1/freelancer/jobs/${job.id}/accept`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [IDEMPOTENCY_KEY_HEADER]: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        },
        body: JSON.stringify({ bidId: bid.id }),
      }),
      { params: Promise.resolve({ id: job.id }) },
    );
    expect(response.status).toBe(409);
    expect(parseRailV1Envelope(await response.json())).toMatchObject({
      ok: false,
      error: RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE,
      data: null,
    });
    expect(debitCount(ports, CLIENT_USER)).toBe(0);
    expect((await ports.freelancer.getJob(job.id))?.status).toBe("OPEN");
    expect(await ports.freelancer.getContractByJobId(job.id)).toBeNull();

    const { fetchImpl } = createCapturingFetch(() =>
      jsonResponse(409, failEnvelope(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE)),
    );
    const client = createDronClient(fetchImpl);
    await expect(client.postAccept(job.id, { bidId: bid.id })).rejects.toBeInstanceOf(RailV1HttpError);
    try {
      await client.postAccept(job.id, { bidId: bid.id });
    } catch (error) {
      expect(error).toBeInstanceOf(RailV1HttpError);
      if (error instanceof RailV1HttpError) {
        expect(error.status).toBe(409);
        expect(error.envelope.error).toBe(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
        expect(error.envelope.data).toBeNull();
        const form = presentAcceptError(emptyAcceptForm(), error);
        expect(form.fakeSuccess).toBe(false);
        expect(form.insufficientBalance).toBe(true);
        expect(form.testID).toBe("dron-accept-insufficient");
        expect(form.error).toBe(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
      }
    }

    expect(webWalletUrl("http://192.168.1.5:3000/")).toBe("http://192.168.1.5:3000/cuzdan");
    const hook = readSrc("apps/rail-is/src/runtime/use-dron-app.ts");
    expect(hook).toContain("openWebWallet");
    expect(hook).toContain("postAccept");
    expect(hook).toContain("ACCEPT_FAIL");
    expect(readSrc("apps/rail-is/src/screens/OwnerBidsScreen.tsx")).toContain("dron-accept-top-up");
    expect(readSrc("apps/rail-is/src/screens/OwnerBidsScreen.tsx")).toContain("wallet.topUp");
    expect(readSrc("apps/rail-is/src/ui/copy.ts")).toContain("Cüzdanı web'de yükle");
  });
});

function netCreditCount(ports: ReturnType<typeof deliveryWorld>, userId: string) {
  return ports.ledger.capture().entries.filter(
    ([, entry]) =>
      entry.userId === userId &&
      entry.direction === "CREDIT" &&
      entry.purpose === "escrow-release-net",
  ).length;
}

function debitCount(ports: ReturnType<typeof deliveryWorld>, userId: string) {
  return ports.ledger.capture().entries.filter(
    ([, entry]) =>
      entry.userId === userId &&
      entry.direction === "DEBIT" &&
      entry.purpose === "escrow-hold",
  ).length;
}

function deliveryWorld() {
  return withMemoryAcceptAtomic({
    ledger: createMemoryLedgerStore([
      { userId: CLIENT_USER, amountMinor: 100_000 },
      { userId: TEST_USER, amountMinor: 0 },
      { userId: PLATFORM_TREASURY_USER_ID, amountMinor: 0 },
    ]),
    escrow: createMemoryEscrowStore(),
    freelancer: createMemoryFreelancerStore(),
  });
}

async function fundedLabContract(ports: ReturnType<typeof deliveryWorld>) {
  const job = await createFreelancerJob(ports, {
    clientId: CLIENT_USER,
    title: "İkon seti",
    brief: "16 SVG, Quiet Luxury.",
    budgetMinor: 10_000,
  });
  const bid = await submitFreelancerBid(ports, {
    jobId: job.id,
    bidderId: TEST_USER,
    amountMinor: 10_000,
    coverNote: "Teslim 5 gün.",
  });
  const { contract } = await acceptFreelancerBid(ports, {
    jobId: job.id,
    bidId: bid.id,
    actorUserId: CLIENT_USER,
    holdBps: HOLD_BPS_DEFAULT,
    platformUserId: PLATFORM_TREASURY_USER_ID,
  });
  return contract;
}
