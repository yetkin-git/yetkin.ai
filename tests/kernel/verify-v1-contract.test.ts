import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import { LISTING_ACCESS_VISA_DENIED } from "@/lib/career/visa-gate";
import { jsonFail, jsonOk } from "@/lib/kernel/http/json";
import {
  applyRailV1Cors,
  buildV1FailBody,
  buildV1OkBody,
  RAIL_API_VERSION_LABEL,
  RAIL_VERSION_CLIENT_STALE,
  RAIL_VERSION_HEADER_REQUIRED,
} from "@/lib/kernel/http/api-v1";
import { IDEMPOTENCY_KEY_HEADER } from "@/lib/kernel/http/idempotency-key";
import {
  detectRailJsonFlavor,
  isRailUnversionedOkBody,
  isRailV1Envelope,
  RAIL_JSON_ENVELOPE_KINDS,
  RAIL_V1_ENVELOPE_KEYS,
  type RailUnversionedOkBody,
  type RailV1OkBody,
} from "@/lib/kernel/http/v1-envelope";
import {
  assertRailV1EnvelopeSchemaKeys,
  buildRailV1OpenApiDocument,
  parseRailV1Envelope,
  parseRailV1HopOkBody,
  RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS,
  RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID,
  RAIL_V1_ACADEMY_CERTIFICATE_MISSING,
  RAIL_V1_ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  RAIL_V1_ACADEMY_EXAM_PASS_SCORE,
  RAIL_V1_BEARER_SCHEME,
  RAIL_V1_HOPS,
  RAIL_V1_IDEMPOTENCY_REQUIRED,
  RAIL_V1_LISTING_VISA_DENIED,
  RAIL_V1_PUBLISHED_FIELD_PATHS,
  RAIL_V1_ACCEPT_FORBIDDEN,
  RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE,
  RAIL_V1_OWNER_BIDS_FORBIDDEN,
  RAIL_V1_OWNER_BIDS_NOT_FOUND,
  RAIL_V1_RELEASE_FORBIDDEN,
  RAIL_V1_RELEASE_NOT_FUNDED,
  railV1BidRequestSchema,
  railV1BidSchema,
  railV1ClientJobBidSchema,
  railV1ClientJobBidsViewSchema,
  railV1ContractSchema,
  railV1FailEnvelopeSchema,
  railV1FreelancerContractViewSchema,
  railV1HealthChecksSchema,
  railV1JobSchema,
  railV1DeliveryMessageSchema,
  railV1DeliveryRequestSchema,
  railV1OkEnvelopeSchema,
  railV1PublicAcademyCertificateDataSchema,
  railV1SessionUserSchema,
  railV1VisaStampSchema,
  railV1WalletStripSchema,
  resolveRailV1HopPaths,
  serializeRailV1OpenApiDocument,
  zodObjectKeys,
} from "@/lib/kernel/http/v1-contract";
import {
  ACADEMY_CERTIFICATE_HASHED_FIELDS,
  ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
  ACADEMY_EXAM_PASS_SCORE,
} from "@/lib/academy/exam";
import { matchApiAuthKind } from "@/lib/kernel/security/api-auth";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";

const ROOT = process.cwd();
const REQUEST_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";
const OPENAPI_FILE = "lib/kernel/http/openapi-v1.json";

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

const _unversionedNotV1: RailUnversionedOkBody<{ jobs: unknown[] }> extends RailV1OkBody<
  Record<string, unknown>
>
  ? "leak"
  : "sealed" = "sealed";
void _unversionedNotV1;

describe("/api/v1 sözleşme mührü", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_JWT_SECRET", TEST_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", TEST_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("zarf Zod şekli { ok, error, requestId, apiVersion, data } kilitler; versiyonsuz serim parse olmaz", async () => {
    assertRailV1EnvelopeSchemaKeys();
    expect(zodObjectKeys(railV1OkEnvelopeSchema)).toEqual([...RAIL_V1_ENVELOPE_KEYS]);
    expect(zodObjectKeys(railV1FailEnvelopeSchema)).toEqual([...RAIL_V1_ENVELOPE_KEYS]);
    expect(RAIL_API_VERSION_LABEL).toBe("1");

    const v1Ok = buildV1OkBody({ jobs: [{ id: "fj_1" }] }, REQUEST_ID);
    expect(isRailV1Envelope(v1Ok)).toBe(true);
    expect(isRailUnversionedOkBody(v1Ok)).toBe(false);
    expect(detectRailJsonFlavor(v1Ok)).toBe("v1");
    expect(parseRailV1Envelope(v1Ok)).toEqual(v1Ok);

    const unversioned = { ok: true, jobs: [{ id: "fj_1" }] };
    expect(detectRailJsonFlavor(unversioned)).toBe("unversioned-ok");
    expect(isRailV1Envelope(unversioned)).toBe(false);
    expect(() => parseRailV1Envelope(unversioned)).toThrow(/Versiyonsuz JSON/);
    expect(railV1OkEnvelopeSchema.safeParse(unversioned).success).toBe(false);

    const mixed = { ...v1Ok, jobs: [{ id: "fj_1" }] };
    expect(isRailV1Envelope(mixed)).toBe(false);
    expect(railV1OkEnvelopeSchema.safeParse(mixed).success).toBe(false);

    const fromJson = jsonOk({ jobs: [{ id: "fj_1" }] }, 200, REQUEST_ID, v1Request("/api/v1/freelancer/jobs"));
    const enveloped = await fromJson.json();
    expect(parseRailV1Envelope(enveloped)).toMatchObject({
      ok: true,
      error: null,
      apiVersion: "1",
      data: { jobs: [{ id: "fj_1" }] },
    });

    const web = jsonOk({ jobs: [{ id: "fj_1" }] });
    const webBody = await web.json();
    expect(detectRailJsonFlavor(webBody)).toBe("unversioned-ok");
    expect(RAIL_JSON_ENVELOPE_KINDS).toEqual(["v1", "unversioned"]);
    expect(() => parseRailV1Envelope(webBody)).toThrow(/Versiyonsuz JSON/);

    const denied = jsonFail(RAIL_VERSION_HEADER_REQUIRED, 400, REQUEST_ID, v1Request("/api/v1/auth/session"));
    expect(parseRailV1Envelope(await denied.json())).toMatchObject({
      ok: false,
      error: RAIL_VERSION_HEADER_REQUIRED,
      data: null,
    });
  });

  it("yayınlanmış data alanları sessizce düşmez; hop sicili ROUTE_AUTH_MAP ve handler ile örtüşür", () => {
    expect(RAIL_V1_HOPS).toHaveLength(13);
    expect(RAIL_V1_PUBLISHED_FIELD_PATHS.length).toBeGreaterThan(40);
    expect(new Set(RAIL_V1_PUBLISHED_FIELD_PATHS).size).toBe(RAIL_V1_PUBLISHED_FIELD_PATHS.length);

    expect(zodObjectKeys(railV1SessionUserSchema)).toEqual(["id", "email"]);
    expect(zodObjectKeys(railV1SessionUserSchema)).not.toContain("accessToken");
    expect(zodObjectKeys(railV1WalletStripSchema)).toEqual(["live", "amountMinor", "currencyCode"]);
    expect(zodObjectKeys(railV1HealthChecksSchema)).toEqual([
      "db",
      "supabaseAuth",
      "inngest",
      "paytr",
    ]);
    expect(zodObjectKeys(railV1JobSchema)).toEqual([
      "id",
      "clientId",
      "title",
      "brief",
      "budgetMinor",
      "currencyCode",
      "status",
      "createdAt",
      "updatedAt",
    ]);
    expect(zodObjectKeys(railV1BidSchema)).toEqual([
      "id",
      "jobId",
      "bidderId",
      "amountMinor",
      "currencyCode",
      "coverNote",
      "status",
      "createdAt",
      "updatedAt",
    ]);
    expect(zodObjectKeys(railV1BidRequestSchema)).toEqual(["amountMinor", "coverNote"]);
    expect(zodObjectKeys(railV1ClientJobBidSchema)).toEqual([
      "bidId",
      "amountMinor",
      "coverNote",
      "createdAt",
    ]);
    expect(zodObjectKeys(railV1ClientJobBidSchema)).not.toContain("bidderId");
    expect(zodObjectKeys(railV1ClientJobBidsViewSchema)).toEqual(["bids"]);
    expect(zodObjectKeys(railV1ContractSchema)).toEqual([
      "id",
      "jobId",
      "bidId",
      "clientId",
      "freelancerId",
      "escrowHoldId",
      "status",
      "currencyCode",
      "grossMinor",
      "holdMinor",
      "netMinor",
      "holdBps",
      "fundedAt",
      "releasedAt",
      "refundedAt",
      "createdAt",
      "updatedAt",
    ]);
    expect(zodObjectKeys(railV1FreelancerContractViewSchema)).toEqual([
      ...zodObjectKeys(railV1ContractSchema),
      "deliveredAt",
    ]);
    expect(zodObjectKeys(railV1ContractSchema)).not.toContain("deliveredAt");
    expect(zodObjectKeys(railV1FreelancerContractViewSchema)).not.toContain("body");
    expect(zodObjectKeys(railV1FreelancerContractViewSchema)).not.toContain("artifactUrl");
    expect(zodObjectKeys(railV1DeliveryRequestSchema)).toEqual(["kind", "body", "artifactUrl"]);
    expect(zodObjectKeys(railV1DeliveryMessageSchema)).toEqual(["id", "contractId", "kind", "createdAt"]);
    expect(zodObjectKeys(railV1DeliveryMessageSchema)).not.toContain("body");
    expect(zodObjectKeys(railV1DeliveryMessageSchema)).not.toContain("artifactUrl");
    expect(zodObjectKeys(railV1DeliveryMessageSchema)).not.toContain("userId");
    expect(zodObjectKeys(railV1VisaStampSchema)).toEqual([
      "id",
      "userId",
      "sourceKind",
      "sourceId",
      "visaKey",
      "moduleId",
      "title",
      "certificateHash",
      "issuedAt",
      "createdAt",
    ]);
    expect([...RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS]).toEqual([...ACADEMY_CERTIFICATE_HASHED_FIELDS]);
    expect(RAIL_V1_ACADEMY_CERTIFICATE_PAYLOAD_VERSION).toBe(ACADEMY_CERTIFICATE_PAYLOAD_VERSION);
    expect(RAIL_V1_ACADEMY_EXAM_PASS_SCORE).toBe(ACADEMY_EXAM_PASS_SCORE);
    expect(zodObjectKeys(railV1PublicAcademyCertificateDataSchema)).toEqual([
      "title",
      "courseTitle",
      "courseSlug",
      "score",
      "issuedAt",
      "certificateHash",
      "curriculumSeal",
      "algorithm",
      "payloadVersion",
      "hashedFields",
      "sealStatus",
      "passScore",
    ]);
    expect(zodObjectKeys(railV1PublicAcademyCertificateDataSchema)).not.toContain("userId");
    expect(zodObjectKeys(railV1PublicAcademyCertificateDataSchema)).not.toContain("attemptId");
    expect(zodObjectKeys(railV1PublicAcademyCertificateDataSchema)).not.toContain("purchaseId");

    const openapi = buildRailV1OpenApiDocument();
    for (const hop of RAIL_V1_HOPS) {
      expect(zodObjectKeys(hop.dataSchema), hop.id).toEqual([...hop.dataKeys]);
      expect(hop.cookieAuth, hop.id).toBe(false);
      expect(hop.v1Auth, hop.id).toBe(hop.routeAuth === "public" ? "none" : "bearer");
      expect(matchApiAuthKind(hop.routeAuthPattern, ROUTE_AUTH_MAP as Record<string, string>), hop.id).toBe(
        hop.routeAuth,
      );
      const paths = resolveRailV1HopPaths(hop);
      expect(paths.v1.startsWith("/api/v1/"), hop.id).toBe(true);
      expect(paths.canonical.startsWith("/api/"), hop.id).toBe(true);
      expect(paths.canonical.startsWith("/api/v1/"), hop.id).toBe(false);

      const operation = openapi.paths[hop.v1PathTemplate]?.[hop.method.toLowerCase()] as
        | { "x-rail-published-data-paths"?: string[]; security?: unknown[] }
        | undefined;
      expect(operation, hop.id).toBeTruthy();
      expect(operation?.["x-rail-published-data-paths"], hop.id).toEqual([...hop.publishedDataPaths]);
      if (hop.v1Auth === "bearer") {
        expect(operation?.security, hop.id).toEqual([{ [RAIL_V1_BEARER_SCHEME]: [] }]);
      } else {
        expect(operation?.security, hop.id).toEqual([]);
      }

      for (const path of hop.publishedDataPaths) {
        expect(RAIL_V1_PUBLISHED_FIELD_PATHS).toContain(
          `${hop.method} ${hop.v1PathTemplate} data.${path}`,
        );
      }
    }

    expect(readSrc("lib/career/visa-gate.ts")).toContain(RAIL_V1_LISTING_VISA_DENIED);
    expect(LISTING_ACCESS_VISA_DENIED).toBe(RAIL_V1_LISTING_VISA_DENIED);
    expect(readSrc("lib/kernel/http/idempotency-key.ts")).toContain(RAIL_V1_IDEMPOTENCY_REQUIRED);
    expect(readSrc("lib/freelancer/types.ts")).toContain('status: FreelancerJobStatus');
    expect(readSrc("lib/freelancer/types.ts")).toContain("OPEN");
    expect(readSrc("lib/kernel/auth/ids.ts")).toContain("id: string");
    expect(readSrc("lib/kernel/auth/ids.ts")).toContain("email: string");
    expect(readSrc("lib/kernel/auth/ids.ts")).not.toMatch(/export type SessionUser = \{[^}]*accessToken/s);
  });

  it("OpenAPI sicili Bearer/Session ayrımını, Idempotency-Key'i ve zarfı belgeler; JSON kopyası sapmaz", () => {
    const document = buildRailV1OpenApiDocument();
    expect(document.openapi).toBe("3.0.3");
    expect(document.info.version).toBe("1");
    expect(document.components.securitySchemes).toHaveProperty(RAIL_V1_BEARER_SCHEME);
    expect(document.components.securitySchemes).not.toHaveProperty("CookieAuth");
    expect(JSON.stringify(document)).not.toContain("accessToken");
    expect(JSON.stringify(document.components.securitySchemes)).not.toContain("cookie");
    expect(JSON.stringify(document)).toContain(IDEMPOTENCY_KEY_HEADER);
    expect(JSON.stringify(document)).toContain(RAIL_VERSION_CLIENT_STALE);

    const failSchema = document.components.schemas.RailV1FailEnvelope as {
      additionalProperties?: boolean;
      required?: string[];
    };
    expect(failSchema.additionalProperties).toBe(false);
    expect(failSchema.required).toEqual([...RAIL_V1_ENVELOPE_KEYS]);

    const bidOp = document.paths["/api/v1/freelancer/jobs/{id}/bids"]?.post as {
      "x-rail-idempotency"?: boolean;
      "x-rail-cookie-auth"?: boolean;
    };
    expect(bidOp["x-rail-idempotency"]).toBe(true);
    expect(bidOp["x-rail-cookie-auth"]).toBe(false);

    const certOp = document.paths["/api/v1/academy/certificates/{hash}"]?.get as {
      security?: unknown[];
      "x-rail-idempotency"?: boolean;
      "x-rail-cookie-auth"?: boolean;
      "x-rail-route-auth"?: string;
      parameters?: Array<{ name?: string; required?: boolean }>;
      responses?: Record<string, unknown>;
    };
    expect(certOp.security).toEqual([]);
    expect(certOp["x-rail-idempotency"]).toBe(false);
    expect(certOp["x-rail-cookie-auth"]).toBe(false);
    expect(certOp["x-rail-route-auth"]).toBe("public");
    expect((certOp.parameters ?? []).some((item) => item.name === "Authorization")).toBe(false);
    expect((certOp.parameters ?? []).some((item) => item.name === IDEMPOTENCY_KEY_HEADER)).toBe(false);
    expect((certOp.parameters ?? []).some((item) => item.name === "hash" && item.required)).toBe(true);
    expect(certOp.responses).toHaveProperty("404");
    const publicCert = document.components.schemas.RailV1PublicAcademyCertificate as {
      additionalProperties?: boolean;
      properties?: Record<string, unknown>;
      required?: string[];
    };
    expect(publicCert.additionalProperties).toBe(false);
    expect(publicCert.properties).not.toHaveProperty("userId");
    expect(publicCert.properties).not.toHaveProperty("attemptId");
    expect(publicCert.properties).not.toHaveProperty("purchaseId");
    expect(JSON.stringify(publicCert)).not.toContain("userId");
    expect(JSON.stringify(publicCert)).not.toContain("attemptId");
    expect(JSON.stringify(publicCert)).not.toContain("purchaseId");

    const committed = JSON.parse(readSrc(OPENAPI_FILE)) as unknown;
    expect(committed).toEqual(document);
    expect(serializeRailV1OpenApiDocument(document)).toBe(`${JSON.stringify(document, null, 2)}\n`);
    expect(document.components.schemas).toHaveProperty("FreelancerContractView");
    expect(document.components.schemas).toHaveProperty("RailV1DeliveryMessage");
    expect(document.components.schemas).toHaveProperty("RailV1DeliveryRequest");
    const contractsOp = document.paths["/api/v1/freelancer/contracts"]?.get as {
      security?: unknown[];
      "x-rail-idempotency"?: boolean;
      "x-rail-cookie-auth"?: boolean;
      description?: string;
    };
    expect(contractsOp.security).toEqual([{ [RAIL_V1_BEARER_SCHEME]: [] }]);
    expect(contractsOp["x-rail-idempotency"]).toBe(false);
    expect(contractsOp["x-rail-cookie-auth"]).toBe(false);
    expect(contractsOp.description).toContain("deliveredAt");
    const deliveryOp = document.paths["/api/v1/freelancer/contracts/{id}/messages"]?.post as {
      security?: unknown[];
      "x-rail-idempotency"?: boolean;
      "x-rail-cookie-auth"?: boolean;
      description?: string;
      responses?: Record<string, unknown>;
    };
    expect(deliveryOp.security).toEqual([{ [RAIL_V1_BEARER_SCHEME]: [] }]);
    expect(deliveryOp["x-rail-idempotency"]).toBe(true);
    expect(deliveryOp["x-rail-cookie-auth"]).toBe(false);
    expect(deliveryOp.description).toContain("kind=DELIVERY");
    expect(deliveryOp.responses).toHaveProperty("403");
    expect(deliveryOp.responses).toHaveProperty("409");
    expect(document.components.schemas).toHaveProperty("RailV1ReleaseData");
    const releaseHop = RAIL_V1_HOPS.find((hop) => hop.id === "freelancer-release");
    expect(releaseHop?.v1Auth).toBe("bearer");
    expect(releaseHop?.cookieAuth).toBe(false);
    expect(releaseHop?.idempotency).toBe(true);
    expect(releaseHop?.errors).toContain(RAIL_V1_RELEASE_FORBIDDEN);
    expect(releaseHop?.errors).toContain(RAIL_V1_RELEASE_NOT_FUNDED);
    const releaseOp = document.paths["/api/v1/freelancer/contracts/{id}/release"]?.post as {
      security?: unknown[];
      "x-rail-idempotency"?: boolean;
      "x-rail-cookie-auth"?: boolean;
      description?: string;
      responses?: Record<string, unknown>;
    };
    expect(releaseOp.security).toEqual([{ [RAIL_V1_BEARER_SCHEME]: [] }]);
    expect(releaseOp["x-rail-idempotency"]).toBe(true);
    expect(releaseOp["x-rail-cookie-auth"]).toBe(false);
    expect(releaseOp.description).toContain("clientId");
    expect(releaseOp.responses).toHaveProperty("403");
    expect(releaseOp.responses).toHaveProperty("409");
    expect(document.components.schemas).toHaveProperty("RailV1AcceptData");
    expect(document.components.schemas).toHaveProperty("RailV1AcceptRequest");
    const acceptHop = RAIL_V1_HOPS.find((hop) => hop.id === "freelancer-accept");
    expect(acceptHop?.v1Auth).toBe("bearer");
    expect(acceptHop?.cookieAuth).toBe(false);
    expect(acceptHop?.idempotency).toBe(true);
    expect(acceptHop?.errors).toContain(RAIL_V1_ACCEPT_FORBIDDEN);
    expect(acceptHop?.errors).toContain(RAIL_V1_ACCEPT_INSUFFICIENT_BALANCE);
    const acceptOp = document.paths["/api/v1/freelancer/jobs/{id}/accept"]?.post as {
      security?: unknown[];
      "x-rail-idempotency"?: boolean;
      "x-rail-cookie-auth"?: boolean;
      description?: string;
      responses?: Record<string, unknown>;
    };
    expect(acceptOp.security).toEqual([{ [RAIL_V1_BEARER_SCHEME]: [] }]);
    expect(acceptOp["x-rail-idempotency"]).toBe(true);
    expect(acceptOp["x-rail-cookie-auth"]).toBe(false);
    expect(acceptOp.description).toContain("DEBIT");
    expect(acceptOp.responses).toHaveProperty("403");
    expect(acceptOp.responses).toHaveProperty("409");
    expect(document.components.schemas).toHaveProperty("ClientJobBidsView");
    expect(document.components.schemas).toHaveProperty("ClientJobBidView");
    const ownerHop = RAIL_V1_HOPS.find((hop) => hop.id === "client-job-bids");
    expect(ownerHop?.v1Auth).toBe("bearer");
    expect(ownerHop?.cookieAuth).toBe(false);
    expect(ownerHop?.idempotency).toBe(false);
    expect(ownerHop?.errors).toContain(RAIL_V1_OWNER_BIDS_FORBIDDEN);
    expect(ownerHop?.errors).toContain(RAIL_V1_OWNER_BIDS_NOT_FOUND);
    const ownerOp = document.paths["/api/v1/client/jobs/{id}/bids"]?.get as {
      security?: unknown[];
      "x-rail-idempotency"?: boolean;
      "x-rail-cookie-auth"?: boolean;
      description?: string;
      responses?: Record<string, unknown>;
    };
    expect(ownerOp.security).toEqual([{ [RAIL_V1_BEARER_SCHEME]: [] }]);
    expect(ownerOp["x-rail-idempotency"]).toBe(false);
    expect(ownerOp["x-rail-cookie-auth"]).toBe(false);
    expect(ownerOp.description).toContain("bidderId");
    expect(ownerOp.responses).toHaveProperty("403");
    expect(ownerOp.responses).toHaveProperty("404");
  });

  it("yetkisiz çerez v1 session hop'una sızmaz; CORS kimlik bilgisi yansımaz", async () => {
    expect(existsSync(join(ROOT, "app/api/v1"))).toBe(false);
    expect(readSrc("proxy.ts")).toContain("cookies: v1 ? [] : request.cookies.getAll()");
    expect(readSrc("proxy.ts")).toContain("v1 ?");
    expect(readSrc("proxy.ts")).toContain("decideRailV1HopGate");
    expect(readSrc("lib/kernel/security/edge-jwt.ts")).toContain(
      "cookies: isApiV1Pathname(input.pathname) ? [] : input.cookies",
    );
    expect(readSrc("lib/kernel/auth/require-session.ts")).toContain("isV1JsonRequest(request)");
    expect(readSrc("lib/kernel/auth/require-session.ts")).toContain("return null;");
    expect(readSrc("lib/kernel/http/api-v1.ts")).not.toContain("Access-Control-Allow-Credentials");

    const token = await signHs256();
    const cookie = `sb-testref-auth-token=${encodeURIComponent(JSON.stringify({ access_token: token }))}`;
    const sessionHops = RAIL_V1_HOPS.filter((hop) => hop.v1Auth === "bearer");
    expect(sessionHops.length).toBeGreaterThan(0);
    for (const hop of sessionHops) {
      const paths = resolveRailV1HopPaths(hop);
      const response = await proxy(
        edgeRequest(paths.v1, {
          method: hop.method,
          cookie,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      expect(response.status, hop.id).toBe(401);
      const body = await response.json();
      expect(parseRailV1Envelope(body), hop.id).toMatchObject({
        ok: false,
        error: "Oturum gerekli.",
        apiVersion: "1",
        data: null,
      });
      expect(response.headers.get("set-cookie"), hop.id).toBeNull();
    }

    const health = await proxy(edgeRequest("/api/v1/health", { cookie }));
    expect(health.status).toBe(200);

    const certificateHop = RAIL_V1_HOPS.find((hop) => hop.id === "academy-certificate");
    expect(certificateHop).toBeTruthy();
    expect(certificateHop?.v1Auth).toBe("none");
    expect(certificateHop?.cookieAuth).toBe(false);
    expect(certificateHop?.idempotency).toBe(false);
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

    const unauthenticated = await proxy(
      edgeRequest(certificatePaths.v1, {
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(unauthenticated.status).toBe(200);
    expect(unauthenticated.headers.get("x-middleware-rewrite")).toBe(
      `http://localhost:3000${certificatePaths.canonical}`,
    );

    const cors = new Headers();
    applyRailV1Cors(
      { headers: cors },
      {
        url: "http://localhost:3000/api/v1/freelancer/jobs",
        headers: new Headers({ origin: "https://lab.yetkin.rail" }),
      },
      { RAIL_DRON_ORIGINS: "https://lab.yetkin.rail" },
    );
    expect(cors.get("Access-Control-Allow-Origin")).toBe("https://lab.yetkin.rail");
    expect(cors.get("Access-Control-Allow-Credentials")).toBeNull();
    expect(cors.get("Access-Control-Allow-Headers")).toContain("Authorization");
    expect(cors.get("Access-Control-Allow-Headers")).toContain(IDEMPOTENCY_KEY_HEADER);
  });

  it("hop DTO örnekleri v1 zarf şemasından geçer; accessToken ve kök serim reddedilir", () => {
    const sessionHop = RAIL_V1_HOPS.find((hop) => hop.id === "auth-session");
    expect(sessionHop).toBeTruthy();
    const ok = buildV1OkBody(
      { user: { id: TEST_USER, email: "usta@yetkin.rail" } },
      REQUEST_ID,
    );
    expect(parseRailV1HopOkBody(sessionHop!, ok)).toEqual(ok);
    expect(
      railV1SessionUserSchema.safeParse({
        id: TEST_USER,
        email: "usta@yetkin.rail",
        accessToken: "leak",
      }).success,
    ).toBe(false);

    const stripHop = RAIL_V1_HOPS.find((hop) => hop.id === "wallet-strip");
    const strip = buildV1OkBody(
      { strip: { live: true, amountMinor: 12_500, currencyCode: "TRY" } },
      REQUEST_ID,
    );
    expect(parseRailV1HopOkBody(stripHop!, strip)).toEqual(strip);
    const dropped = {
      ok: true,
      error: null,
      requestId: REQUEST_ID,
      apiVersion: "1",
      data: { strip: { live: true, currencyCode: "TRY" } },
    };
    expect(stripHop!.dataSchema.safeParse(dropped.data).success).toBe(false);
    expect(() => parseRailV1HopOkBody(stripHop!, dropped)).toThrow();

    const contractsHop = RAIL_V1_HOPS.find((hop) => hop.id === "freelancer-contracts");
    expect(contractsHop).toBeTruthy();
    expect(contractsHop?.v1Auth).toBe("bearer");
    expect(contractsHop?.cookieAuth).toBe(false);
    expect(contractsHop?.idempotency).toBe(false);
    expect(contractsHop?.publishedDataPaths).toContain("contracts[].deliveredAt");
    const contractView = {
      id: "fc_lab_1",
      jobId: "fj_lab_1",
      bidId: "fb_lab_1",
      clientId: TEST_USER,
      freelancerId: "22222222-2222-4222-8222-222222222222",
      escrowHoldId: "eh_lab_1",
      status: "FUNDED" as const,
      currencyCode: "TRY" as const,
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
    const contractsOk = buildV1OkBody({ contracts: [contractView] }, REQUEST_ID);
    expect(parseRailV1HopOkBody(contractsHop!, contractsOk)).toEqual(contractsOk);
    expect(
      railV1FreelancerContractViewSchema.safeParse({
        ...contractView,
        deliveredAt: undefined,
      }).success,
    ).toBe(false);
    expect(
      railV1FreelancerContractViewSchema.safeParse({
        ...contractView,
        body: "hasta notu",
        artifactUrl: "https://files.example/secret.png",
      }).success,
    ).toBe(false);

    const deliveryHop = RAIL_V1_HOPS.find((hop) => hop.id === "freelancer-delivery");
    expect(deliveryHop).toBeTruthy();
    expect(deliveryHop?.v1Auth).toBe("bearer");
    expect(deliveryHop?.cookieAuth).toBe(false);
    expect(deliveryHop?.idempotency).toBe(true);
    expect(deliveryHop?.successStatus).toBe(201);
    const deliveryOk = buildV1OkBody(
      {
        message: {
          id: "fm_lab_1",
          contractId: "fc_lab_1",
          kind: "DELIVERY" as const,
          createdAt: "2026-08-18T12:00:00.000Z",
        },
      },
      REQUEST_ID,
    );
    expect(parseRailV1HopOkBody(deliveryHop!, deliveryOk)).toEqual(deliveryOk);
    expect(
      railV1DeliveryMessageSchema.safeParse({
        id: "fm_lab_1",
        contractId: "fc_lab_1",
        kind: "DELIVERY",
        createdAt: "2026-08-18T12:00:00.000Z",
        body: "hasta notu",
      }).success,
    ).toBe(false);
    expect(railV1DeliveryRequestSchema.safeParse({ kind: "TEXT", body: "sohbet notu" }).success).toBe(
      false,
    );

    const ownerHop = RAIL_V1_HOPS.find((hop) => hop.id === "client-job-bids");
    expect(ownerHop).toBeTruthy();
    expect(ownerHop?.v1Auth).toBe("bearer");
    expect(ownerHop?.cookieAuth).toBe(false);
    expect(ownerHop?.idempotency).toBe(false);
    const ownerOk = buildV1OkBody(
      {
        bids: [
          {
            bidId: "fb_lab_1",
            amountMinor: 10_000,
            coverNote: "Teslim 5 gün.",
            createdAt: "2026-08-18T00:00:00.000Z",
          },
        ],
      },
      REQUEST_ID,
    );
    expect(parseRailV1HopOkBody(ownerHop!, ownerOk)).toEqual(ownerOk);
    expect(railV1ClientJobBidSchema.safeParse({
        bidId: "fb_lab_1",
        amountMinor: 10_000,
        coverNote: "Teslim 5 gün.",
        createdAt: "2026-08-18T00:00:00.000Z",
        bidderId: TEST_USER,
      }).success,
    ).toBe(false);
    const hopPaths: readonly string[] = RAIL_V1_HOPS.map((hop) => hop.v1PathTemplate);
    expect(hopPaths).not.toContain("/api/v1/freelancer/jobs/{id}");

    const fail = buildV1FailBody(RAIL_VERSION_CLIENT_STALE, REQUEST_ID);
    expect(parseRailV1Envelope(fail)).toEqual(fail);

    const certificateHop = RAIL_V1_HOPS.find((hop) => hop.id === "academy-certificate");
    expect(certificateHop).toBeTruthy();
    const SAMPLE_HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const SAMPLE_SEAL = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const certificateOk = buildV1OkBody(
      {
        title: "Rail Temel",
        courseTitle: "Rail Temel",
        courseSlug: "rail-temel",
        score: 100,
        issuedAt: "2026-08-14T12:00:00.000Z",
        certificateHash: SAMPLE_HASH,
        curriculumSeal: SAMPLE_SEAL,
        algorithm: "SHA256",
        payloadVersion: RAIL_V1_ACADEMY_CERTIFICATE_PAYLOAD_VERSION,
        hashedFields: [...RAIL_V1_ACADEMY_CERTIFICATE_HASHED_FIELDS],
        sealStatus: "valid",
        passScore: RAIL_V1_ACADEMY_EXAM_PASS_SCORE,
      },
      REQUEST_ID,
    );
    expect(parseRailV1HopOkBody(certificateHop!, certificateOk)).toEqual(certificateOk);
    expect(
      railV1PublicAcademyCertificateDataSchema.safeParse({
        ...certificateOk.data,
        userId: TEST_USER,
      }).success,
    ).toBe(false);
    expect(
      railV1PublicAcademyCertificateDataSchema.safeParse({
        ...certificateOk.data,
        attemptId: "attempt-1",
        purchaseId: "purchase-1",
      }).success,
    ).toBe(false);
    expect(
      railV1PublicAcademyCertificateDataSchema.safeParse({
        ...certificateOk.data,
        sealStatus: "mismatch",
      }).success,
    ).toBe(false);
    const failFormat = buildV1FailBody(RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID, REQUEST_ID);
    expect(parseRailV1Envelope(failFormat)).toMatchObject({
      ok: false,
      error: RAIL_V1_ACADEMY_CERTIFICATE_HASH_INVALID,
      data: null,
    });
    const failMissing = buildV1FailBody(RAIL_V1_ACADEMY_CERTIFICATE_MISSING, REQUEST_ID);
    expect(parseRailV1Envelope(failMissing)).toMatchObject({
      ok: false,
      error: RAIL_V1_ACADEMY_CERTIFICATE_MISSING,
      data: null,
    });
  });
});
