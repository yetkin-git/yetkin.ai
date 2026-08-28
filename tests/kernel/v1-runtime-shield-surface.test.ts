import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import { getCitizenAuth, getSession } from "@/lib/kernel/auth/require-session";
import {
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_HEADER_REQUIRED,
  RAIL_VERSION_SERVER_STALE,
} from "@/lib/kernel/http/api-v1";
import { IDEMPOTENCY_KEY_HEADER } from "@/lib/kernel/http/idempotency-key";
import {
  RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID,
  RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS,
  RAIL_V1_ACADEMY_CERTIFICATE_INCOMPLETE,
  RAIL_V1_ACADEMY_CERTIFICATE_INTEGRITY_KIND,
  RAIL_V1_ACADEMY_CERTIFICATE_MISMATCH,
  RAIL_V1_ACADEMY_CERTIFICATE_MISSING,
  RAIL_V1_ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  RAIL_V1_ACADEMY_EXAM_PASS_SCORE,
  RAIL_V1_HOPS,
  RAIL_V1_IDEMPOTENCY_REQUIRED,
  RAIL_V1_IDEMPOTENCY_UUID,
  RAIL_V1_SESSION_REQUIRED,
  buildRailV1OpenApiDocument,
  parseRailV1Envelope,
  resolveRailV1HopPaths,
  isRailV1HopForbiddenOnDron,
} from "@/lib/kernel/http/v1-contract";
import {
  assertRailV1HopHandlerShield,
  isRailV1SuccessStatus,
  railV1HopHandlerFile,
  requireRailV1IdempotencyKey,
} from "@/lib/kernel/http/v1-runtime-shield";
import { POST as postPurchase } from "@/app/api/academy/courses/[id]/purchase/route";
import { POST as postBid } from "@/app/api/freelancer/jobs/[id]/bids/route";
import { POST as postAccept } from "@/app/api/freelancer/jobs/[id]/accept/route";
import { POST as postRelease } from "@/app/api/freelancer/contracts/[id]/release/route";
import { POST as postRefund } from "@/app/api/freelancer/contracts/[id]/refund/route";
import { POST as postDelivery } from "@/app/api/freelancer/contracts/[id]/messages/route";
import { GET as getSessionHop } from "@/app/api/(kernel)/auth/session/route";
import { GET as getJobs } from "@/app/api/freelancer/jobs/route";
import { GET as getAcademyCertificate } from "@/app/api/academy/certificates/[hash]/route";
import * as sessionApi from "@/lib/kernel/auth/session";
import * as academyRuntime from "@/lib/academy/runtime";
import * as academyVerify from "@/lib/academy/certificate-verify";

const ROOT = process.cwd();
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";
const TEST_EMAIL = "usta@yetkin.rail";
const JOB_ID = "fj_lab_1";
const CONTRACT_ID = "fc_lab_1";

const WRITE_HANDLERS = {
  "academy-purchase": {
    post: postPurchase,
    params: { id: "course_lab_1" },
  },
  "freelancer-bid": {
    post: postBid,
    params: { id: JOB_ID },
  },
  "freelancer-accept": {
    post: postAccept,
    params: { id: JOB_ID },
  },
  "freelancer-delivery": {
    post: postDelivery,
    params: { id: CONTRACT_ID },
  },
  "freelancer-release": {
    post: postRelease,
    params: { id: CONTRACT_ID },
  },
  "freelancer-refund": {
    post: postRefund,
    params: { id: CONTRACT_ID },
  },
} as const;

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function v1Headers(extra?: HeadersInit): Headers {
  return new Headers({
    "x-rail-api-version": "1",
    "x-request-id": REQUEST_ID,
    "X-Rail-Min-Version": "1",
    ...extra,
  });
}

function hopRequest(
  hop: (typeof RAIL_V1_HOPS)[number],
  init?: { headers?: HeadersInit; method?: string },
): Request {
  const paths = resolveRailV1HopPaths(hop);
  return new Request(new URL(paths.v1, "http://localhost:3000"), {
    method: init?.method ?? hop.method,
    headers: v1Headers(init?.headers),
  });
}

async function signHs256(input?: { exp?: number | string; iat?: number }): Promise<string> {
  const jwt = new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(TEST_USER)
    .setAudience("authenticated")
    .setIssuer(`${TEST_URL}/auth/v1`);
  if (input?.iat !== undefined) {
    jwt.setIssuedAt(input.iat);
  } else {
    jwt.setIssuedAt();
  }
  jwt.setExpirationTime(input?.exp ?? "1h");
  return jwt.sign(new TextEncoder().encode(TEST_SECRET));
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

async function expectV1Fail(response: Response, status: number, error?: string) {
  expect(response.status).toBe(status);
  expect(isRailV1SuccessStatus(response.status)).toBe(false);
  expect(response.headers.get("content-type") ?? "").toContain("application/json");
  expect(response.headers.get("set-cookie")).toBeNull();
  const body: unknown = await response.json();
  const parsed = parseRailV1Envelope(body);
  expect(parsed).toMatchObject({
    ok: false,
    apiVersion: "1",
    data: null,
  });
  expect(typeof parsed.error).toBe("string");
  if (error) {
    expect(parsed.error).toBe(error);
  }
  return parsed;
}

describe("Diyar B v1 kimlik ve Idempotency runtime kalkanı", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_JWT_SECRET", TEST_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", TEST_URL);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("RAIL_V1_HOPS yazma hop'ları handler'da kalkanı çağırır; GET anahtar dayatmaz", () => {
    expect(readSrc("lib/kernel/http/v1-runtime-shield.ts")).toContain("readIdempotencyKey");
    const writeHops = RAIL_V1_HOPS.filter((hop) => hop.idempotency);
    expect(writeHops.map((hop) => hop.id)).toEqual([
      "academy-purchase",
      "freelancer-bid",
      "freelancer-accept",
      "freelancer-delivery",
      "freelancer-release",
      "freelancer-refund",
    ]);
    for (const hop of RAIL_V1_HOPS) {
      if (hop.method === "GET") {
        expect(hop.idempotency, hop.id).toBe(false);
      }
      if (hop.idempotency) {
        expect(hop.method, hop.id).toBe("POST");
      }
      const file = railV1HopHandlerFile(hop);
      expect(existsSync(join(ROOT, file)), file).toBe(true);
      assertRailV1HopHandlerShield(hop, readSrc(file));
    }

    const openapi = buildRailV1OpenApiDocument();
    for (const hop of RAIL_V1_HOPS) {
      const operation = openapi.paths[hop.v1PathTemplate]?.[hop.method.toLowerCase()] as
        | { parameters?: Array<{ name?: string }>; "x-rail-idempotency"?: boolean }
        | undefined;
      expect(operation, hop.id).toBeTruthy();
      const names = (operation?.parameters ?? []).map((item) => item.name);
      if (hop.idempotency) {
        expect(names, hop.id).toContain(IDEMPOTENCY_KEY_HEADER);
        expect(operation?.["x-rail-idempotency"], hop.id).toBe(true);
      } else {
        expect(names, hop.id).not.toContain(IDEMPOTENCY_KEY_HEADER);
        expect(operation?.["x-rail-idempotency"], hop.id).toBe(false);
      }
    }
  });

  it("UUID yok veya geçersizken kalkan 400 zarf basar; 2xx doğmaz", async () => {
    const bidHop = RAIL_V1_HOPS.find((hop) => hop.id === "freelancer-bid");
    expect(bidHop).toBeTruthy();
    const missing = requireRailV1IdempotencyKey(hopRequest(bidHop!), REQUEST_ID);
    expect(missing.ok).toBe(false);
    if (missing.ok) {
      throw new Error("kalkan UUID'siz geçti");
    }
    await expectV1Fail(missing.response, 400, RAIL_V1_IDEMPOTENCY_REQUIRED);

    const invalid = requireRailV1IdempotencyKey(
      hopRequest(bidHop!, { headers: { [IDEMPOTENCY_KEY_HEADER]: "not-a-uuid" } }),
      REQUEST_ID,
    );
    expect(invalid.ok).toBe(false);
    if (invalid.ok) {
      throw new Error("kalkan sahte UUID geçti");
    }
    await expectV1Fail(invalid.response, 400, RAIL_V1_IDEMPOTENCY_UUID);

    const ok = requireRailV1IdempotencyKey(
      hopRequest(bidHop!, {
        headers: { [IDEMPOTENCY_KEY_HEADER]: REQUEST_ID },
      }),
      REQUEST_ID,
    );
    expect(ok).toEqual({ ok: true, key: REQUEST_ID });
  });

  it("yazma handler'ı oturumla bile anahtarsız 2xx dönmez", async () => {
    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const writeHops = RAIL_V1_HOPS.filter(
      (hop) => hop.idempotency && !isRailV1HopForbiddenOnDron(hop.id),
    );
    for (const hop of writeHops) {
      const mapped = WRITE_HANDLERS[hop.id as keyof typeof WRITE_HANDLERS];
      expect(mapped, hop.id).toBeTruthy();
      const missing = await mapped.post(hopRequest(hop), {
        params: Promise.resolve(mapped.params),
      });
      await expectV1Fail(missing, 400, RAIL_V1_IDEMPOTENCY_REQUIRED);

      const invalid = await mapped.post(
        hopRequest(hop, { headers: { [IDEMPOTENCY_KEY_HEADER]: "not-a-uuid" } }),
        { params: Promise.resolve(mapped.params) },
      );
      await expectV1Fail(invalid, 400, RAIL_V1_IDEMPOTENCY_UUID);
    }
  });

  it("GET hop anahtarsız 401 zarfıdır; Idempotency-Key dayatılmaz", async () => {
    const sessionHop = RAIL_V1_HOPS.find((hop) => hop.id === "auth-session");
    expect(sessionHop).toBeTruthy();
    const session = await getSessionHop(hopRequest(sessionHop!));
    await expectV1Fail(session, 401, RAIL_V1_SESSION_REQUIRED);

    const jobsHop = RAIL_V1_HOPS.find((hop) => hop.id === "freelancer-jobs");
    const jobs = await getJobs(hopRequest(jobsHop!));
    await expectV1Fail(jobs, 401, RAIL_V1_SESSION_REQUIRED);

    vi.spyOn(sessionApi, "requireSession").mockResolvedValue({
      id: TEST_USER,
      email: TEST_EMAIL,
    });
    const keyed = await getSessionHop(
      hopRequest(sessionHop!, { headers: { [IDEMPOTENCY_KEY_HEADER]: REQUEST_ID } }),
    );
    expect(keyed.status).toBe(200);
    expect(isRailV1SuccessStatus(keyed.status)).toBe(true);
    const body = parseRailV1Envelope(await keyed.json());
    expect(body).toMatchObject({
      ok: true,
      error: null,
      apiVersion: "1",
      data: { user: { id: TEST_USER, email: TEST_EMAIL } },
    });
  });

  it("Bearer hop çerez-only ve eksik Bearer'da 401 zarf; Set-Cookie yok", async () => {
    const token = await signHs256();
    const cookie = `sb-testref-auth-token=${encodeURIComponent(JSON.stringify({ access_token: token }))}`;
    const bearerHops = RAIL_V1_HOPS.filter(
      (hop) => hop.v1Auth === "bearer" && !isRailV1HopForbiddenOnDron(hop.id),
    );
    expect(RAIL_V1_HOPS.filter((hop) => hop.v1Auth === "none").map((hop) => hop.id)).toEqual([
      "health",
      "academy-certificate",
    ]);
    expect(bearerHops.map((hop) => hop.id)).not.toContain("academy-purchase");
    for (const hop of bearerHops) {
      const paths = resolveRailV1HopPaths(hop);
      const cookieOnly = await proxy(
        edgeRequest(paths.v1, {
          method: hop.method,
          cookie,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      await expectV1Fail(cookieOnly, 401, RAIL_V1_SESSION_REQUIRED);

      const missing = await proxy(
        edgeRequest(paths.v1, {
          method: hop.method,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      await expectV1Fail(missing, 401, RAIL_V1_SESSION_REQUIRED);
    }

    const health = await proxy(edgeRequest("/api/v1/health", { cookie }));
    expect(health.status).toBe(200);
    expect(health.headers.get("set-cookie")).toBeNull();

    const certificateHop = RAIL_V1_HOPS.find((hop) => hop.id === "academy-certificate");
    expect(certificateHop).toBeTruthy();
    const certificatePaths = resolveRailV1HopPaths(certificateHop!);
    const publicSeal = await proxy(
      edgeRequest(certificatePaths.v1, {
        cookie,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(publicSeal.status).toBe(200);
    expect(publicSeal.headers.get("x-middleware-rewrite")).toBe(
      `http://localhost:3000${certificatePaths.canonical}`,
    );
    expect(publicSeal.headers.get("set-cookie")).toBeNull();
  });

  it("süresi dolmuş Bearer 401 zarf basar; sahte veri yok", async () => {
    const now = Math.floor(Date.now() / 1000);
    const expired = await signHs256({ iat: now - 3600, exp: now - 120 });
    const bearerHops = RAIL_V1_HOPS.filter(
      (hop) => hop.v1Auth === "bearer" && !isRailV1HopForbiddenOnDron(hop.id),
    );
    for (const hop of bearerHops) {
      const paths = resolveRailV1HopPaths(hop);
      const response = await proxy(
        edgeRequest(paths.v1, {
          method: hop.method,
          authorization: `Bearer ${expired}`,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      await expectV1Fail(response, 401, RAIL_V1_SESSION_REQUIRED);
      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
    }
  });

  it("uyumsuz X-Rail-Min-Version 426 zarf basar; HTML boş sayfa yok", async () => {
    const hops = RAIL_V1_HOPS.filter(
      (hop) => hop.minVersionHeaderRequired && !isRailV1HopForbiddenOnDron(hop.id),
    );
    expect(hops.length).toBeGreaterThan(0);
    for (const hop of hops) {
      const paths = resolveRailV1HopPaths(hop);
      const future = await proxy(
        edgeRequest(paths.v1, {
          method: hop.method,
          headers: { "X-Rail-Min-Version": "2" },
        }),
      );
      await expectV1Fail(future, 426, RAIL_VERSION_SERVER_STALE);

      const missing = await proxy(edgeRequest(paths.v1, { method: hop.method }));
      await expectV1Fail(missing, 400, RAIL_VERSION_HEADER_REQUIRED);
    }

    const clientStale = await proxy(
      edgeRequest("/api/v1/freelancer/jobs", {
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(clientStale.status).not.toBe(426);
    expect(RAIL_VERSION_CLIENT_STALE.length).toBeGreaterThan(0);
  });

  it("v1 getSession çerezden kullanıcı okumaz; kenar çerez yenilemez", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon-test-key");
    const token = await signHs256();
    const cookie = `sb-testref-auth-token=${encodeURIComponent(JSON.stringify({ access_token: token }))}`;
    const sessionHop = RAIL_V1_HOPS.find((hop) => hop.id === "auth-session")!;
    const request = hopRequest(sessionHop, { headers: { cookie } });
    expect(await getSession(request)).toBeNull();
    expect(await getCitizenAuth(request)).toBeNull();

    const rewritten = new Request("http://localhost:3000/api/auth/session", {
      headers: {
        "x-rail-api-version": "1",
        "x-rail-pathname": "/api/v1/auth/session",
        cookie,
      },
    });
    expect(await getSession(rewritten)).toBeNull();
    expect(await getCitizenAuth(rewritten)).toBeNull();

    const amiralExam = new Request("http://localhost:3000/api/academy/courses/ac_1/exam", {
      headers: {
        "x-rail-api-version": "1",
        "x-rail-pathname": "/api/academy/courses/ac_1/exam",
        cookie,
      },
    });
    // Amiral yolu çerez kilidine girmez; Supabase yoksa yine null (oturum çözümlemesi ayrı).
    const { isV1CookieSessionBlocked } = await import("@/lib/kernel/http/api-v1");
    expect(isV1CookieSessionBlocked(amiralExam)).toBe(false);

    const proxySrc = readSrc("proxy.ts");
    expect(proxySrc).toContain("cookies: v1 ? [] : request.cookies.getAll()");
    expect(proxySrc).toContain("collectSupabaseAuthCookieRefresh");
    expect(proxySrc).toContain("applyTo(_response: NextResponse) {}");
    expect(readSrc("lib/kernel/auth/require-session.ts")).toContain("isV1CookieSessionBlocked(request)");
    expect(readSrc("lib/kernel/http/api-v1.ts")).toContain("isV1CookieSessionBlocked");
    expect(readFileSync(join(ROOT, ".system_docs", "DRON_CLIENT_SPEC.md"), "utf8")).toContain(
      "Authorization: Bearer",
    );
    expect(readFileSync(join(ROOT, ".system_docs", "DRON_CLIENT_SPEC.md"), "utf8")).toContain(
      "Idempotency-Key",
    );
    expect(readFileSync(join(ROOT, ".system_docs", "DRON_CLIENT_SPEC.md"), "utf8")).not.toContain(
      "SUPABASE_SERVICE_ROLE_KEY",
    );
  });

  it("GET Bearer hop Idempotency-Key olmadan kenarda rewrite olur", async () => {
    const token = await signHs256();
    const getHops = RAIL_V1_HOPS.filter((hop) => hop.method === "GET" && hop.v1Auth === "bearer");
    for (const hop of getHops) {
      const paths = resolveRailV1HopPaths(hop);
      const response = await proxy(
        edgeRequest(paths.v1, {
          authorization: `Bearer ${token}`,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      expect(response.status, hop.id).toBe(200);
      expect(response.headers.get("x-middleware-rewrite"), hop.id).toBe(
        `http://localhost:3000${paths.canonical}`,
      );
      expect(response.headers.get("set-cookie"), hop.id).toBeNull();
    }
  });

  it("kamu mühür hop oturumsuz çalışır; hassas alan 200 zarfına girmez", async () => {
    const hop = RAIL_V1_HOPS.find((item) => item.id === "academy-certificate");
    expect(hop).toBeTruthy();
    expect(hop?.v1Auth).toBe("none");
    expect(hop?.cookieAuth).toBe(false);
    expect(hop?.idempotency).toBe(false);
    const handler = readSrc(railV1HopHandlerFile(hop!));
    expect(handler).not.toContain("requireSession");
    expect(handler).not.toContain("userId");
    expect(handler).not.toContain("attemptId");
    expect(handler).not.toContain("purchaseId");

    const paths = resolveRailV1HopPaths(hop!);
    const anonymous = await proxy(
      edgeRequest(paths.v1, { headers: { "X-Rail-Min-Version": "1" } }),
    );
    expect(anonymous.status).toBe(200);
    expect(anonymous.headers.get("x-middleware-rewrite")).toBe(
      `http://localhost:3000${paths.canonical}`,
    );
    expect(anonymous.headers.get("set-cookie")).toBeNull();

    vi.spyOn(academyRuntime, "createPrismaAcademyPorts").mockReturnValue({ academy: {} } as never);
    const SAMPLE_HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const SAMPLE_SEAL = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const issuedAt = new Date("2026-08-14T12:00:00.000Z");
    const validView = {
      title: "Rail Temel",
      courseTitle: "Rail Temel",
      courseSlug: "python-temel",
      score: 100,
      issuedAt,
      certificateHash: SAMPLE_HASH,
      curriculumSeal: SAMPLE_SEAL,
      algorithm: "SHA256" as const,
      payloadVersion: RAIL_V1_ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
      hashedFields: RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS,
      integrityKind: RAIL_V1_ACADEMY_CERTIFICATE_INTEGRITY_KIND,
      sealStatus: "valid" as const,
      revokedAt: null,
      passScore: RAIL_V1_ACADEMY_EXAM_PASS_SCORE,
      pathwayMastery: null,
      hashSubjectKind: "person-certificate" as const,
    };

    vi.spyOn(academyVerify, "resolvePublicAcademyCertificate").mockResolvedValueOnce({
      status: "invalid-format",
    });
    await expectV1Fail(
      await getAcademyCertificate(hopRequest(hop!), { params: Promise.resolve({ hash: "not-a-hash" }) }),
      400,
      RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID,
    );

    vi.spyOn(academyVerify, "resolvePublicAcademyCertificate").mockResolvedValueOnce({
      status: "missing",
    });
    await expectV1Fail(
      await getAcademyCertificate(hopRequest(hop!), { params: Promise.resolve({ hash: SAMPLE_HASH }) }),
      404,
      RAIL_V1_ACADEMY_CERTIFICATE_MISSING,
    );

    vi.spyOn(academyVerify, "resolvePublicAcademyCertificate").mockResolvedValueOnce({
      status: "found",
      view: { ...validView, sealStatus: "mismatch" },
    });
    await expectV1Fail(
      await getAcademyCertificate(hopRequest(hop!), { params: Promise.resolve({ hash: SAMPLE_HASH }) }),
      400,
      RAIL_V1_ACADEMY_CERTIFICATE_MISMATCH,
    );

    vi.spyOn(academyVerify, "resolvePublicAcademyCertificate").mockResolvedValueOnce({
      status: "found",
      view: { ...validView, sealStatus: "incomplete", score: null, curriculumSeal: null },
    });
    await expectV1Fail(
      await getAcademyCertificate(hopRequest(hop!), { params: Promise.resolve({ hash: SAMPLE_HASH }) }),
      400,
      RAIL_V1_ACADEMY_CERTIFICATE_INCOMPLETE,
    );

    vi.spyOn(academyVerify, "resolvePublicAcademyCertificate").mockResolvedValueOnce({
      status: "found",
      view: validView,
    });
    const ok = await getAcademyCertificate(hopRequest(hop!), {
      params: Promise.resolve({ hash: SAMPLE_HASH }),
    });
    expect(ok.status).toBe(200);
    expect(isRailV1SuccessStatus(ok.status)).toBe(true);
    const body = parseRailV1Envelope(await ok.json());
    expect(body).toMatchObject({
      ok: true,
      error: null,
      apiVersion: "1",
    });
    expect(body.data).toMatchObject({
      courseTitle: "Rail Temel",
      certificateHash: SAMPLE_HASH,
      curriculumSeal: SAMPLE_SEAL,
      integrityKind: RAIL_V1_ACADEMY_CERTIFICATE_INTEGRITY_KIND,
      sealStatus: "valid",
      revokedAt: null,
      score: 100,
    });

    vi.spyOn(academyVerify, "resolvePublicAcademyCertificate").mockResolvedValueOnce({
      status: "found",
      view: {
        ...validView,
        sealStatus: "revoked",
        revokedAt: new Date("2026-08-20T00:00:00.000Z"),
      },
    });
    const revoked = await getAcademyCertificate(hopRequest(hop!), {
      params: Promise.resolve({ hash: SAMPLE_HASH }),
    });
    expect(revoked.status).toBe(200);
    const revokedBody = parseRailV1Envelope(await revoked.json());
    expect(revokedBody).toMatchObject({
      ok: true,
      error: null,
      data: {
        sealStatus: "revoked",
        integrityKind: RAIL_V1_ACADEMY_CERTIFICATE_INTEGRITY_KIND,
        revokedAt: "2026-08-20T00:00:00.000Z",
      },
    });
    const serialized = JSON.stringify(body);
    expect(serialized).not.toContain("userId");
    expect(serialized).not.toContain("attemptId");
    expect(serialized).not.toContain("purchaseId");
    expect(serialized).not.toContain(TEST_USER);
  });
});
