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
  RAIL_V1_HOP_DRON_FORBIDDEN,
  RAIL_V1_HOP_GATES,
  RAIL_V1_HOP_NOT_FOUND,
  RAIL_V1_HOP_UNPUBLISHED,
} from "@/lib/kernel/http/v1-hop-gate";
import {
  isRailV1HopForbiddenOnDron,
  parseRailV1Envelope,
  RAIL_V1_HOPS,
  railV1JuniorPilotPracticeDataSchema,
  railV1JuniorProfileDataSchema,
  resolveRailV1HopPaths,
} from "@/lib/kernel/http/v1-contract";
import { EDGE_API_FROZEN_ROOM_ERROR, EDGE_API_NOT_FOUND_ERROR, EDGE_API_SESSION_ERROR, isFrozenRoomApi } from "@/lib/kernel/security/edge-api-auth";
import { JUNIOR_CHECKOUT_LOCKED_ERROR } from "@/lib/kernel/security/junior-gate";
import { juniorShelvesForGrade } from "@/lib/junior/catalog";
import { isRailV1SuccessStatus } from "@/lib/kernel/http/v1-runtime-shield";
import { RAIL_V1_HOP_META_COUNT } from "@/lib/kernel/http/api-route-census";

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

  it("RAIL_V1_HOP_GATES, RAIL_V1_HOPS ile 1:1 kilitlenir; sayı meta SSOT'tan okunur", () => {
    const gateSrc = readFileSync(join(process.cwd(), "lib/kernel/http/v1-hop-gate.ts"), "utf8");
    const proxySrc = readFileSync(join(process.cwd(), "proxy.ts"), "utf8");
    expect(gateSrc).not.toContain("v1-contract");
    expect(gateSrc).not.toContain("from \"zod\"");
    expect(gateSrc).toContain("v1-hops-meta");
    expect(gateSrc).not.toContain("v1PathTemplate: \"/api/v1/health\"");
    expect(proxySrc).toContain("decideRailV1HopGate");
    expect(proxySrc).toContain("hopGate.kind === \"fail\"");
    // Sayı sabit yazılmaz: tek ev `RAIL_V1_HOP_META_COUNT`. Yeni hop eklendiğinde
    // test kırılmaz, yalnız sicil sayısı büyür (TEDAVI §4.1 ile aynı ilke).
    expect(RAIL_V1_HOP_META_COUNT).toBeGreaterThanOrEqual(30);
    expect(RAIL_V1_HOPS).toHaveLength(RAIL_V1_HOP_META_COUNT);
    expect(RAIL_V1_HOP_GATES).toHaveLength(RAIL_V1_HOP_META_COUNT);
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

  it("sicil hop'ları method+path ile eşleşir; freelancer v1'de yayınlanmaz (PayTR B2C)", () => {
    // Düşürülen 8 hop kapı seviyesinde yayınlanmaz; proxy yine de önce donmuş-oda 410 basar.
    expect(findRailV1Hop("/api/v1/freelancer/jobs", "GET")).toBeNull();
    expect(findRailV1Hop("/api/v1/freelancer/jobs/", "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}`, "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}/bids`, "POST")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}/bids`, "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/jobs/${JOB_ID}/accept`, "POST")).toBeNull();
    expect(findRailV1Hop(`/api/v1/client/jobs/${JOB_ID}/bids`, "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/contracts/${CONTRACT_ID}`, "GET")).toBeNull();
    expect(findRailV1Hop(`/api/v1/freelancer/contracts/${CONTRACT_ID}/messages`, "POST")).toBeNull();
    expect(
      decideRailV1HopGate({ pathname: "/api/v1/freelancer/jobs", method: "GET" }),
    ).toEqual({ kind: "fail", status: 404, error: RAIL_V1_HOP_NOT_FOUND });
    expect(findRailV1Hop(`/api/v1/academy/certificates/${CERT_HASH}`, "GET")?.id).toBe(
      "academy-certificate",
    );
    expect(findRailV1Hop("/api/v1/health", "POST")).toBeNull();
    expect(findRailV1Hop("/api/v1/wallet/top-up", "POST")?.id).toBe("wallet-top-up");
    expect(findRailV1Hop(`/api/freelancer/jobs/${JOB_ID}`, "GET")).toBeNull();
    expect(assertPublishedRailV1Hop("/api/v1/auth/session", "GET").id).toBe("auth-session");
    expect(assertPublishedRailV1Hop("/api/v1/wallet/top-up", "POST").id).toBe("wallet-top-up");
    expect(() => assertPublishedRailV1Hop("/api/v1/freelancer/jobs", "GET")).toThrow(
      RAIL_V1_HOP_UNPUBLISHED,
    );

    for (const hop of RAIL_V1_HOPS) {
      const paths = resolveRailV1HopPaths(hop);
      expect(findRailV1Hop(paths.v1, hop.method)?.id, hop.id).toBe(hop.id);
      if (isRailV1HopForbiddenOnDron(hop.id)) {
        expect(decideRailV1HopGate({ pathname: paths.v1, method: hop.method })).toEqual({
          kind: "fail",
          status: 403,
          error: RAIL_V1_HOP_DRON_FORBIDDEN,
        });
      } else {
        expect(decideRailV1HopGate({ pathname: paths.v1, method: hop.method })).toEqual({
          kind: "next",
        });
      }
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

  it("GET /api/v1/freelancer/jobs/{id} kamu kilidi 410; rewrite yok; bids sızmaz", async () => {
    const token = await signHs256();
    const leak = await proxy(
      edgeRequest(`/api/v1/freelancer/jobs/${JOB_ID}`, {
        authorization: `Bearer ${token}`,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(leak.status).toBe(410);
    expect(isRailV1SuccessStatus(leak.status)).toBe(false);
    expect(leak.headers.get("x-middleware-rewrite")).toBeNull();
    expect(leak.headers.get("set-cookie")).toBeNull();
    const body = parseRailV1Envelope(await leak.json());
    expect(body).toEqual({
      ok: false,
      error: EDGE_API_FROZEN_ROOM_ERROR,
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
      expect(response.status, item.path).toBe(410);
      expect(response.headers.get("x-middleware-rewrite"), item.path).toBeNull();
    }

    const walletPublished = await proxy(
      edgeRequest("/api/v1/wallet/top-up", {
        method: "POST",
        authorization: `Bearer ${token}`,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(walletPublished.status).toBe(200);
    expect(walletPublished.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/api/wallet/top-up",
    );

    const probe = await proxy(edgeRequest(`/api/v1/freelancer/jobs/${JOB_ID}`));
    expect(probe.status).toBe(410);
    expect(await probe.json()).toMatchObject({
      ok: false,
      error: EDGE_API_FROZEN_ROOM_ERROR,
      apiVersion: "1",
      data: null,
    });
  });

  it("8 kanonik hop Bearer ile rewrite kalır; Dron-forbidden 403; freelancer 410", async () => {
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
      const bearerActor = { id: TEST_USER };
      if (isFrozenRoomApi(paths.canonical, bearerActor) || isFrozenRoomApi(paths.v1, bearerActor)) {
        expect(response.status, hop.id).toBe(410);
        expect(response.headers.get("x-middleware-rewrite"), hop.id).toBeNull();
        expect(await response.json()).toMatchObject({
          ok: false,
          error:
            hop.id === "junior-pilot-checkout"
              ? JUNIOR_CHECKOUT_LOCKED_ERROR
              : EDGE_API_FROZEN_ROOM_ERROR,
          apiVersion: "1",
          data: null,
        });
        continue;
      }
      if (isRailV1HopForbiddenOnDron(hop.id)) {
        expect(response.status, hop.id).toBe(403);
        expect(response.headers.get("x-middleware-rewrite"), hop.id).toBeNull();
        expect(await response.json()).toMatchObject({
          ok: false,
          error: RAIL_V1_HOP_DRON_FORBIDDEN,
          apiVersion: "1",
          data: null,
        });
        continue;
      }
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
    expect(list.status).toBe(410);
    expect(list.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("Junior pilot: misafir profil ve kasa 410, sicil dışı yazma 404, anlatış oturumsuz 401", async () => {
    vi.stubEnv("JUNIOR_CHECKOUT_OPEN", "");
    expect(findRailV1Hop("/api/v1/junior-pilot/profiles", "GET")?.id).toBe("junior-profile");
    expect(findRailV1Hop("/api/v1/junior-pilot/profiles", "POST")?.id).toBe("junior-profile-create");
    expect(findRailV1Hop("/api/v1/junior-pilot/profiles", "PATCH")?.id).toBe("junior-profile-select");
    expect(findRailV1Hop("/api/v1/junior-pilot/profiles", "PUT")?.id).toBe("junior-profile-consent");
    expect(findRailV1Hop("/api/v1/junior-pilot/profiles", "DELETE")?.id).toBe("junior-profile-erase");
    expect(findRailV1Hop("/api/v1/junior-pilot/electives", "POST")?.id).toBe("junior-electives");
    expect(findRailV1Hop("/api/v1/junior-pilot/tell", "POST")?.id).toBe("junior-tell");
    expect(findRailV1Hop("/api/v1/junior-pilot/practice", "POST")?.id).toBe("junior-practice");
    expect(findRailV1Hop("/api/v1/junior-pilot/quiz", "POST")?.id).toBe("junior-quiz");
    expect(findRailV1Hop("/api/v1/junior-pilot/checkout", "POST")?.id).toBe("junior-pilot-checkout");
    expect(findRailV1Hop("/api/v1/junior-pilot/grade", "POST")).toBeNull();
    expect(
      decideRailV1HopGate({ pathname: "/api/v1/junior-pilot/checkout", method: "POST" }),
    ).toEqual({ kind: "next" });
    expect(
      decideRailV1HopGate({ pathname: "/api/v1/junior-pilot/grade", method: "POST" }),
    ).toEqual({ kind: "fail", status: 404, error: RAIL_V1_HOP_NOT_FOUND });
    expect(
      decideRailV1HopGate({ pathname: "/api/v1/junior-pilot/profiles", method: "POST" }),
    ).toEqual({ kind: "next" });

    const guestProfiles = await proxy(
      edgeRequest("/api/v1/junior-pilot/profiles", {
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(guestProfiles.status).toBe(410);
    const guestProfileWrite = await proxy(
      edgeRequest("/api/v1/junior-pilot/profiles", {
        method: "POST",
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(guestProfileWrite.status).toBe(410);
    const guestElectives = await proxy(
      edgeRequest("/api/v1/junior-pilot/electives", {
        method: "POST",
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(guestElectives.status).toBe(410);
    expect(guestProfiles.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await guestProfiles.json()).toMatchObject({
      ok: false,
      error: EDGE_API_FROZEN_ROOM_ERROR,
      apiVersion: "1",
      data: null,
    });

    const guestCheckout = await proxy(
      edgeRequest("/api/v1/junior-pilot/checkout", {
        method: "POST",
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(guestCheckout.status).toBe(410);
    expect(guestCheckout.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await guestCheckout.json()).toMatchObject({
      ok: false,
      error: JUNIOR_CHECKOUT_LOCKED_ERROR,
      apiVersion: "1",
      data: null,
    });

    const guestTell = await proxy(
      edgeRequest("/api/v1/junior-pilot/tell", {
        method: "POST",
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(guestTell.status).toBe(401);
    expect(await guestTell.json()).toMatchObject({
      ok: false,
      error: EDGE_API_SESSION_ERROR,
      apiVersion: "1",
      data: null,
    });

    const unknown = await proxy(
      edgeRequest("/api/v1/academy/courses", {
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(unknown.status).toBe(404);
    expect(await unknown.json()).toMatchObject({
      ok: false,
      error: EDGE_API_NOT_FOUND_ERROR,
      apiVersion: "1",
      data: null,
    });

    const shelves = juniorShelvesForGrade(6, null);
    const home = railV1JuniorProfileDataSchema.safeParse(
      JSON.parse(
        JSON.stringify({
          profiles: [
            {
              id: "jp_1",
              nickname: "Ada",
              grade: 6,
              birthYear: null,
              selected: true,
              selectedElectives: [],
              gradeSwitchRights: 1,
            },
          ],
          selectedId: "jp_1",
          xp: { points: 0, badges: [] },
          courses: shelves,
        }),
      ),
    );
    expect(home.success, home.success ? "" : JSON.stringify(home.error.issues.slice(0, 4))).toBe(
      true,
    );

    const practice = railV1JuniorPilotPracticeDataSchema.safeParse({
      praised: "Bir kısmını bağladın.",
      missing: "Eksik kalan bağı bir kez daha dene.",
      advice: "Doğru bağı kendi cümlenle bir kez söyle.",
      score: 50,
      xpAwarded: 0,
      points: 0,
      badges: [],
      correct: 1,
      total: 2,
      notes: [
        {
          id: "card-1",
          ok: false,
          explanation: "",
          cards: [{ id: "gap-1", ok: false, answer: "" }],
        },
      ],
    });
    expect(practice.success).toBe(true);
  });

  it("kanonik Amiral GET /api/freelancer/jobs/{id} kamu kilidi 410", async () => {
    const canonical = await proxy(edgeRequest(`/api/freelancer/jobs/${JOB_ID}`));
    expect(canonical.status).toBe(410);
    expect(canonical.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await canonical.json()).toMatchObject({
      ok: false,
      error: EDGE_API_FROZEN_ROOM_ERROR,
      apiVersion: "1",
      data: null,
    });
  });
});
