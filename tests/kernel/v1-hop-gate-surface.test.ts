import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  assertPublishedRailV1Hop,
  decideRailV1HopGate,
  findRailV1Hop,
  RAIL_V1_HOP_GATES,
  RAIL_V1_HOP_NOT_FOUND,
  RAIL_V1_HOP_UNPUBLISHED,
} from "@/lib/kernel/http/v1-hop-gate";
import {
  RAIL_V1_HOPS,
  parseRailV1Envelope,
  resolveRailV1HopPaths,
} from "@/lib/kernel/http/v1-contract";
import { EDGE_API_NOT_FOUND_ERROR } from "@/lib/kernel/security/edge-api-auth";
import { isRailV1SuccessStatus } from "@/lib/kernel/http/v1-runtime-shield";

const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";
const JOB_ID = "fj_lab_1";
const CONTRACT_ID = "fc_lab_1";
const CERT_HASH = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

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
  init?: { authorization?: string; headers?: HeadersInit; method?: string },
) {
  const headers = new Headers(init?.headers);
  if (init?.authorization) {
    headers.set("authorization", init.authorization);
  }
  return new NextRequest(new URL(path, "http://localhost:3000"), {
    method: init?.method,
    headers,
  });
}

describe("kenar /api/v1 hop allowlist kalkanı", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_JWT_SECRET", TEST_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", TEST_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("RAIL_V1_HOP_GATES, RAIL_V1_HOPS ile 1:1 kilitlenir; 13 hop", () => {
    const gateSrc = readFileSync(join(process.cwd(), "lib/kernel/http/v1-hop-gate.ts"), "utf8");
    const proxySrc = readFileSync(join(process.cwd(), "proxy.ts"), "utf8");
    expect(gateSrc).not.toContain("v1-contract");
    expect(gateSrc).not.toContain("from \"zod\"");
    expect(proxySrc).toContain("decideRailV1HopGate");
    expect(proxySrc).toContain("hopGate.kind === \"fail\"");
    expect(RAIL_V1_HOPS).toHaveLength(13);
    expect(RAIL_V1_HOP_GATES).toHaveLength(13);
    expect(
      RAIL_V1_HOP_GATES.map((hop) => ({
        id: hop.id,
        method: hop.method,
        v1PathTemplate: hop.v1PathTemplate,
      })),
    ).toEqual(
      RAIL_V1_HOPS.map((hop) => ({
        id: hop.id,
        method: hop.method,
        v1PathTemplate: hop.v1PathTemplate,
      })),
    );
    expect(RAIL_V1_HOP_NOT_FOUND).toBe(EDGE_API_NOT_FOUND_ERROR);
  });

  it("sicil hop'ları method+path ile eşleşir; prefix jobs/{id} listesine düşmez", () => {
    expect(findRailV1Hop("/api/v1/freelancer/jobs", "GET")?.id).toBe("freelancer-jobs");
    expect(findRailV1Hop("/api/v1/freelancer/jobs/", "GET")?.id).toBe("freelancer-jobs");
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}`, "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}/bids`, "POST")?.id).toBe("freelancer-bid");
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}/bids`, "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}/accept`, "POST")?.id).toBe(
      "freelancer-accept",
    );
    expect(findRailV1Hop(`/api/v1/client/jobs/${JOB_ID}/bids`, "GET")?.id).toBe("client-job-bids");
    expect(findRailV1Hop(`/api/v1/freelancer/contracts/${CONTRACT_ID}`, "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/contracts/${CONTRACT_ID}/messages`, "POST")?.id).toBe(
      "freelancer-delivery",
    );
    expect(findRailV1Hop(`/api/v1/academy/certificates/${CERT_HASH}`, "GET")?.id).toBe(
      "academy-certificate",
    );
    expect(findRailV1Hop("/api/v1/health", "POST")).toBeNull();
    expect(findRailV1Hop("/api/v1/wallet/top-up", "POST")).toBeNull();
    expect(findRailV1Hop(`/api/freelancer/jobs/${JOB_ID}`, "GET")).toBeNull();
    expect(assertPublishedRailV1Hop("/api/v1/freelancer/jobs", "GET").id).toBe("freelancer-jobs");
    expect(() => assertPublishedRailV1Hop("/api/v1/wallet/top-up", "POST")).toThrow(
      RAIL_V1_HOP_UNPUBLISHED,
    );

    for (const hop of RAIL_V1_HOPS) {
      const paths = resolveRailV1HopPaths(hop);
      expect(findRailV1Hop(paths.v1, hop.method)?.id, hop.id).toBe(hop.id);
      expect(decideRailV1HopGate({ pathname: paths.v1, method: hop.method })).toEqual({
        kind: "next",
      });
      expect(decideRailV1HopGate({ pathname: paths.v1, method: "OPTIONS" })).toEqual({
        kind: "next",
      });
    }
  });

  it("v1 olmayan kanonik Amiral yolu skip; sicil dışı v1 404", () => {
    expect(decideRailV1HopGate({ pathname: `/api/freelancer/jobs/${JOB_ID}`, method: "GET" })).toEqual(
      { kind: "skip" },
    );
    expect(decideRailV1HopGate({ pathname: "/dashboard", method: "GET" })).toEqual({ kind: "skip" });
    expect(
      decideRailV1HopGate({ pathname: `/api/v1/freelancer/jobs/${JOB_ID}`, method: "GET" }),
    ).toEqual({ kind: "fail", status: 404, error: RAIL_V1_HOP_NOT_FOUND });
    expect(
      decideRailV1HopGate({ pathname: `/api/v1/freelancer/jobs/${JOB_ID}`, method: "OPTIONS" }),
    ).toEqual({ kind: "fail", status: 404, error: RAIL_V1_HOP_NOT_FOUND });
  });

  it("GET /api/v1/freelancer/jobs/{id} Bearer ile 404 zarf; rewrite yok; bids sızmaz", async () => {
    const token = await signHs256();
    const leak = await proxy(
      edgeRequest(`/api/v1/freelancer/jobs/${JOB_ID}`, {
        authorization: `Bearer ${token}`,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(leak.status).toBe(404);
    expect(isRailV1SuccessStatus(leak.status)).toBe(false);
    expect(leak.headers.get("x-middleware-rewrite")).toBeNull();
    expect(leak.headers.get("set-cookie")).toBeNull();
    const body = parseRailV1Envelope(await leak.json());
    expect(body).toEqual({
      ok: false,
      error: RAIL_V1_HOP_NOT_FOUND,
      requestId: expect.any(String),
      apiVersion: "1",
      data: null,
    });
    expect(JSON.stringify(body)).not.toContain("bidderId");
    expect(JSON.stringify(body)).not.toContain("bids");
    expect(JSON.stringify(body)).not.toContain("contract");

    const leakPaths: ReadonlyArray<{ path: string; method?: string }> = [
      { path: `/api/v1/freelancer/jobs/${JOB_ID}` },
      { path: `/api/v1/freelancer/jobs/${JOB_ID}/bids` },
      { path: `/api/v1/freelancer/contracts/${CONTRACT_ID}` },
      { path: `/api/v1/freelancer/contracts/${CONTRACT_ID}/messages` },
      { path: "/api/v1/wallet/top-up", method: "POST" },
      { path: "/api/v1/freelancer/jobs", method: "POST" },
    ];
    for (const item of leakPaths) {
      const response = await proxy(
        edgeRequest(item.path, {
          method: item.method,
          authorization: `Bearer ${token}`,
          headers: { "X-Rail-Min-Version": "1" },
        }),
      );
      expect(response.status, item.path).toBe(404);
      expect(response.headers.get("x-middleware-rewrite"), item.path).toBeNull();
    }

    const probe = await proxy(edgeRequest(`/api/v1/freelancer/jobs/${JOB_ID}`));
    expect(probe.status).toBe(404);
    expect(await probe.json()).toMatchObject({
      ok: false,
      error: RAIL_V1_HOP_NOT_FOUND,
      apiVersion: "1",
      data: null,
    });
  });

  it("13 kanonik hop Bearer ile rewrite kalır; list GET jobs/{id} değildir", async () => {
    const token = await signHs256();
    for (const hop of RAIL_V1_HOPS) {
      const paths = resolveRailV1HopPaths(hop);
      const headers: HeadersInit = {};
      if (hop.minVersionHeaderRequired) {
        headers["X-Rail-Min-Version"] = "1";
      }
      const response = await proxy(
        edgeRequest(paths.v1, {
          method: hop.method,
          authorization: hop.v1Auth === "bearer" ? `Bearer ${token}` : undefined,
          headers,
        }),
      );
      expect(response.status, hop.id).toBe(200);
      expect(response.headers.get("x-middleware-rewrite"), hop.id).toBe(
        `http://localhost:3000${paths.canonical}`,
      );
    }

    const list = await proxy(
      edgeRequest("/api/v1/freelancer/jobs", {
        authorization: `Bearer ${token}`,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(list.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/api/freelancer/jobs");
  });

  it("versiyonsuz Amiral GET /api/freelancer/jobs/{id} hop kapısından 404 almaz", async () => {
    const canonical = await proxy(edgeRequest(`/api/freelancer/jobs/${JOB_ID}`));
    expect(canonical.status).toBe(401);
    expect(canonical.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await canonical.json()).toEqual({ ok: false, error: "Oturum gerekli." });
  });
});
