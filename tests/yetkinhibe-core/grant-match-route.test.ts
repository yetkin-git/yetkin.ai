import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthRequiredError } from "@/lib/kernel/auth/require-session";
import * as sessionApi from "@/lib/kernel/auth/session";
import {
  EDGE_API_SESSION_ERROR,
  decideEdgeApiAuth,
} from "@/lib/kernel/security/edge-api-auth";
import {
  HTTP_RATE_LIMITS,
  resetHttpRateLimitBucketsForTests,
} from "@/lib/kernel/security/http-rate-limit";
import { ROUTE_AUTH_MAP } from "@/lib/kernel/security/route-auth-map";
import {
  GrantCatalogUnavailableError,
  type YetkinhibeGrantCatalogEntry,
} from "@/lib/yetkinhibe/grant-catalog-core";
import { loadYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";
import { GRANT_MATCH_MAX_BODY_BYTES } from "@/lib/yetkinhibe/grant-match-api";
import { POST } from "@/app/api/yetkinhibe/grant/match/route";

import { makeGrantCall } from "./fixtures";

vi.mock("@/lib/yetkinhibe/grant-catalog-live", () => ({
  loadYetkinhibeGrantCatalog: vi.fn(),
}));

const MATCH_PATH = "/api/yetkinhibe/grant/match";
const MATCH_URL = `http://localhost${MATCH_PATH}`;

const SESSION_USER = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "route-test@example.test",
  emailConfirmedAt: "2026-01-01T00:00:00.000Z",
};

const VALID_PROFILE = {
  sectorCode: "uretim",
  employeeCount: 25,
  companyAgeYears: 3,
  rdMaturityLevel: "EARLY",
  exportActive: false,
  isKobi: true,
  hasPatentOrUtilityModel: false,
};

function catalog(): YetkinhibeGrantCatalogEntry[] {
  return [
    {
      ...makeGrantCall({ id: "route-match-a", title: "Rota eşleşme çağrısı", remainingDays: 40 }),
      sourceVerifiedAt: null,
    },
    {
      ...makeGrantCall({ id: "route-closed", status: "CLOSED", remainingDays: 0 }),
      sourceVerifiedAt: null,
    },
  ];
}

function matchRequest(body: unknown, raw?: string): Request {
  return new Request(MATCH_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
}

function signIn(user: typeof SESSION_USER = SESSION_USER) {
  return vi.spyOn(sessionApi, "requireSession").mockResolvedValue(user);
}

describe("YetkinHibe ücretsiz eşleştirme rotası (POST)", () => {
  beforeEach(() => {
    resetHttpRateLimitBucketsForTests();
    vi.mocked(loadYetkinhibeGrantCatalog).mockReset();
    vi.mocked(loadYetkinhibeGrantCatalog).mockResolvedValue(catalog());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("oturumlu geçerli profili 200 ile eşleşme listesiyle yanıtlar", async () => {
    signIn();

    const response = await POST(matchRequest(VALID_PROFILE));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.data.matches).toHaveLength(1);
    expect(body.data.matches[0]).toMatchObject({
      grantId: "route-match-a",
      matchScorePct: 100,
      band: "READY",
    });
    expect(body.data.matches[0]).not.toHaveProperty("recommendedNextStep");
    expect(typeof body.data.generatedAt).toBe("string");
  });

  it("kapalı çağrıları eşleştirmeye almaz", async () => {
    signIn();

    const body = await (await POST(matchRequest(VALID_PROFILE))).json();
    const ids = body.data.matches.map((match: { grantId: string }) => match.grantId);
    expect(ids).not.toContain("route-closed");
  });

  it("oturum yoksa 401 döner ve katalog okunmaz", async () => {
    vi.spyOn(sessionApi, "requireSession").mockRejectedValue(new AuthRequiredError());

    const response = await POST(matchRequest(VALID_PROFILE));
    expect(response.status).toBe(401);
    expect(loadYetkinhibeGrantCatalog).not.toHaveBeenCalled();
  });

  it("sözleşme dışı gelir alanını 400 ile reddeder ve katalog okunmaz", async () => {
    signIn();

    const response = await POST(matchRequest({ ...VALID_PROFILE, annualRevenueMinor: 500 }));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(loadYetkinhibeGrantCatalog).not.toHaveBeenCalled();
  });

  it("bozuk JSON gövdesini 400 ile reddeder", async () => {
    signIn();

    const response = await POST(matchRequest(null, "{bozuk"));
    expect(response.status).toBe(400);
  });

  it("üst sınırı aşan gövdeyi 413 ile reddeder ve katalog okunmaz", async () => {
    signIn();

    const response = await POST(
      matchRequest(
        null,
        JSON.stringify({ ...VALID_PROFILE, pad: "x".repeat(GRANT_MATCH_MAX_BODY_BYTES) }),
      ),
    );
    expect(response.status).toBe(413);
    expect(loadYetkinhibeGrantCatalog).not.toHaveBeenCalled();
  });

  it("katalog okunamazsa 503 döner ve veri göndermez (sabit katalog yok)", async () => {
    signIn();
    vi.mocked(loadYetkinhibeGrantCatalog).mockRejectedValue(
      new GrantCatalogUnavailableError("read_failed"),
    );

    const response = await POST(matchRequest(VALID_PROFILE));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.data).toBeNull();
  });

  it("beklenmeyen hata 500 döner ve ayrıntı sızdırmaz", async () => {
    signIn();
    vi.mocked(loadYetkinhibeGrantCatalog).mockRejectedValue(new Error("iç ayrıntı"));

    const response = await POST(matchRequest(VALID_PROFILE));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain("iç ayrıntı");
  });

  it("kullanıcı başına 30 istekten sonra 429 döner", async () => {
    signIn();

    for (let i = 0; i < HTTP_RATE_LIMITS.yetkinhibeMatchUser.limit; i += 1) {
      const ok = await POST(matchRequest(VALID_PROFILE));
      expect(ok.status).toBe(200);
    }
    const limited = await POST(matchRequest(VALID_PROFILE));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("Retry-After")).not.toBeNull();
  });

  it("hız sınırı kullanıcı kimliğine göre ayrılır", async () => {
    const spy = signIn();

    for (let i = 0; i < HTTP_RATE_LIMITS.yetkinhibeMatchUser.limit; i += 1) {
      await POST(matchRequest(VALID_PROFILE));
    }
    expect((await POST(matchRequest(VALID_PROFILE))).status).toBe(429);

    spy.mockResolvedValue({ ...SESSION_USER, id: "22222222-2222-4222-8222-222222222222" });
    expect((await POST(matchRequest(VALID_PROFILE))).status).toBe(200);
  });
});

describe("YetkinHibe eşleştirme kenarı ve yetki haritası", () => {
  const envBackup = process.env.DRON_YETKINHIBE_OPEN;

  beforeEach(() => {
    delete process.env.DRON_YETKINHIBE_OPEN;
  });

  afterEach(() => {
    if (envBackup === undefined) {
      delete process.env.DRON_YETKINHIBE_OPEN;
    } else {
      process.env.DRON_YETKINHIBE_OPEN = envBackup;
    }
  });

  it("oda açıkken oturum ipucu varsa kenar 410 basmaz", () => {
    expect(
      decideEdgeApiAuth({
        pathname: MATCH_PATH,
        method: "POST",
        sessionHint: true,
        sessionUserId: SESSION_USER.id,
        sessionEmail: SESSION_USER.email,
        sessionEmailConfirmedAt: SESSION_USER.emailConfirmedAt,
      }),
    ).toEqual({ kind: "next" });
  });

  it("oda açıkken oturum ipucu yoksa kenarda 401 alır", () => {
    process.env.DRON_YETKINHIBE_OPEN = "1";
    expect(
      decideEdgeApiAuth({ pathname: MATCH_PATH, method: "POST", sessionHint: false }),
    ).toEqual({ kind: "deny", status: 401, error: EDGE_API_SESSION_ERROR });
  });

  it("oda açıkken oturum ipucu varsa kenar isteği rotaya geçirir", () => {
    process.env.DRON_YETKINHIBE_OPEN = "1";
    expect(
      decideEdgeApiAuth({
        pathname: MATCH_PATH,
        method: "POST",
        sessionHint: true,
        sessionUserId: SESSION_USER.id,
        sessionEmail: SESSION_USER.email,
        sessionEmailConfirmedAt: SESSION_USER.emailConfirmedAt,
      }),
    ).toEqual({ kind: "next" });
  });

  it("yol yetki haritasında oturum gerektiren rota olarak kayıtlı", () => {
    expect(ROUTE_AUTH_MAP[MATCH_PATH]).toBe("session");
  });
});
