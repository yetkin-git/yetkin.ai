import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE,
  EDGE_CSP_STYLE_SRC_DIRECTIVE,
  readCspNonce,
} from "@/lib/kernel/security/edge-guard";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";

const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";

function expectV1Fail(body: unknown, error: string) {
  expect(body).toMatchObject({
    ok: false,
    error,
    apiVersion: "1",
    data: null,
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

function request(
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

function expectNonceCsp(response: { headers: Headers }) {
  const csp = response.headers.get("content-security-policy") ?? "";
  const nonce = readCspNonce(csp);
  expect(nonce, csp).toBeTruthy();
  expect(csp).toContain(`'nonce-${nonce}'`);
  expect(csp).toContain("frame-src https://www.paytr.com https://*.paytr.com");
  expect(csp).toContain("connect-src 'self' https://*.supabase.co wss://*.supabase.co");
  expect(csp).not.toContain("unsafe-eval");
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
  expect(csp).toContain(EDGE_CSP_STYLE_SRC_DIRECTIVE);
  expect(csp).toContain(EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE);
  expect(csp).not.toMatch(/style-src 'self' 'nonce-/);
  expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
}

function loginLocation(path: string): string {
  return `http://localhost:3000${buildCitizenLoginHref(path)}`;
}

describe("proxy.ts kenar mühürleri", () => {
  beforeEach(() => {
    vi.stubEnv("SUPABASE_JWT_SECRET", TEST_SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", TEST_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("/kayit 308 /register ve nonce CSP basar", async () => {
    const response = await proxy(request("/kayit"));
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe("http://localhost:3000/register");
    expectNonceCsp(response);
  });

  it("/login istemci stillerine unsafe-inline basar; script nonce kalır", async () => {
    const response = await proxy(request("/login"));
    expect(response.status).toBe(200);
    expectNonceCsp(response);
  });

  it("oturumsuz /dashboard /cuzdan /profil /pasaport /admin → /login 307", async () => {
    for (const path of ["/dashboard", "/cuzdan", "/profil", "/pasaport", "/admin"]) {
      const response = await proxy(request(path));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(loginLocation(path));
      expectNonceCsp(response);
    }
  });

  it("sahte Supabase cookie korumalı yolu 307 ile keser", async () => {
    const response = await proxy(
      request("/dashboard", { cookie: "sb-testref-auth-token=session-chunk" }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(loginLocation("/dashboard"));
    expectNonceCsp(response);
  });

  it("doğrulanmış JWT cookie korumalı yolu geçirir", async () => {
    const token = await signHs256();
    const cookie = `sb-testref-auth-token=${encodeURIComponent(JSON.stringify({ access_token: token }))}`;
    const response = await proxy(request("/dashboard", { cookie }));
    expect(response.status).toBe(200);
    expectNonceCsp(response);
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
  });

  it("müze yoluna 404 basar", async () => {
    const response = await proxy(request("/yetkin.ai/app"));
    expect(response.status).toBe(404);
    expectNonceCsp(response);
  });

  it("donmuş oda sayfası vatandaş HTML 410 basar", async () => {
    const response = await proxy(request("/studio"));
    expect(response.status).toBe(410);
    expect(response.headers.get("content-type")).toContain("text/html");
    const html = await response.text();
    expect(html).toContain("Bu oda üretimde kapalı.");
    expect(html).toContain("Akademi");
    expect(html).toContain("href=\"/\"");
    expectNonceCsp(response);
  });

  it("oturumsuz session API 401; donmuş oda 410; public ve webhook geçer; harita dışı 404", async () => {
    const frozen = await proxy(request("/api/studio/generate"));
    expect(frozen.status).toBe(410);
    expectV1Fail(await frozen.json(), "Bu oda üretimde kapalı.");
    expectNonceCsp(frozen);

    const pulse = await proxy(request("/api/dashboard/pulse"));
    expect(pulse.status).toBe(401);
    expectV1Fail(await pulse.json(), "Oturum gerekli.");
    expectNonceCsp(pulse);

    const health = await proxy(request("/api/health"));
    expect(health.status).toBe(200);

    const callback = await proxy(request("/auth/callback"));
    expect(callback.status).toBe(200);

    const webhook = await proxy(
      new NextRequest(new URL("/api/payments/webhooks/paytr", "http://localhost:3000"), {
        method: "POST",
      }),
    );
    expect(webhook.status).toBe(200);

    const unknown = await proxy(request("/api/not-a-route"));
    expect(unknown.status).toBe(404);
    expectV1Fail(await unknown.json(), "API yolu bulunamadı.");
  });

  it("sahte Bearer session API'yi kenarda 401 eker", async () => {
    const response = await proxy(
      request("/api/dashboard/pulse", { authorization: "Bearer eyJhbGciOi" }),
    );
    expect(response.status).toBe(401);
    expectV1Fail(await response.json(), "Oturum gerekli.");
  });

  it("doğrulanmış Bearer session API'yi kenarda geçirir", async () => {
    const token = await signHs256();
    const response = await proxy(
      request("/api/dashboard/pulse", { authorization: `Bearer ${token}` }),
    );
    expect(response.status).toBe(200);
    expectNonceCsp(response);
  });

  it("oturumsuz katalog PATCH kenarda 401; profil session kalır", async () => {
    const catalog = await proxy(
      new NextRequest(new URL("/api/admin/catalog", "http://localhost:3000"), { method: "PATCH" }),
    );
    expect(catalog.status).toBe(401);
    expectV1Fail(await catalog.json(), "Oturum gerekli.");

    const profile = await proxy(
      new NextRequest(new URL("/api/profile", "http://localhost:3000"), { method: "PATCH" }),
    );
    expect(profile.status).toBe(401);
  });

  it("doğrulanmış vatandaş katalog PATCH kenarda 403; Super Admin geçer", async () => {
    vi.stubEnv("SUPER_ADMIN_USER_ID", TEST_USER);
    const admin = await proxy(
      new NextRequest(new URL("/api/admin/catalog", "http://localhost:3000"), {
        method: "PATCH",
        headers: { authorization: `Bearer ${await signHs256()}` },
      }),
    );
    expect(admin.status).toBe(200);

    const citizen = await proxy(
      new NextRequest(new URL("/api/admin/catalog", "http://localhost:3000"), {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${await signHs256("22222222-2222-4222-8222-222222222222")}`,
        },
      }),
    );
    expect(citizen.status).toBe(403);
    expectV1Fail(await citizen.json(), "Bu sığınak Super Admin kilidine bağlıdır.");
  });

  it("her istekte ayrı nonce basar", async () => {
    const first = await proxy(request("/academy"));
    const second = await proxy(request("/academy"));
    const left = readCspNonce(first.headers.get("content-security-policy"));
    const right = readCspNonce(second.headers.get("content-security-policy"));
    expect(left).toBeTruthy();
    expect(right).toBeTruthy();
    expect(left).not.toBe(right);
  });

  it("/api/v1 sürüm kapısı 400/426 zarflar; geçerli istek /v1 soyar", async () => {
    const missing = await proxy(request("/api/v1/freelancer/jobs"));
    expect(missing.status).toBe(400);
    const missingBody = (await missing.json()) as {
      ok: boolean;
      error: string;
      apiVersion: string;
      data: null;
    };
    expect(missingBody).toMatchObject({
      ok: false,
      error: "Sürüm başlığı gerekli.",
      apiVersion: "1",
      data: null,
    });
    expect(missingBody.data).toBeNull();

    const stale = await proxy(
      request("/api/v1/freelancer/jobs", { headers: { "X-Rail-Min-Version": "2" } }),
    );
    expect(stale.status).toBe(426);
    expect(await stale.json()).toMatchObject({
      ok: false,
      error: "Bu sunucu henüz o sözleşmeyi konuşmuyor.",
      apiVersion: "1",
      data: null,
    });

    const stripped = await proxy(
      request("/api/v1/freelancer/jobs", { headers: { "X-Rail-Min-Version": "1" } }),
    );
    expect(stripped.status).toBe(401);
    expect(stripped.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await stripped.json()).toMatchObject({
      ok: false,
      error: "Oturum gerekli.",
      apiVersion: "1",
      data: null,
    });

    const unpublished = await proxy(
      request("/api/v1/freelancer/jobs/fj_lab_1", {
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(unpublished.status).toBe(404);
    expect(unpublished.headers.get("x-middleware-rewrite")).toBeNull();
    expect(await unpublished.json()).toMatchObject({
      ok: false,
      error: "API yolu bulunamadı.",
      apiVersion: "1",
      data: null,
    });

    const token = await signHs256();
    const rewritten = await proxy(
      request("/api/v1/freelancer/jobs", {
        authorization: `Bearer ${token}`,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(rewritten.status).toBe(200);
    expect(rewritten.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/api/freelancer/jobs",
    );
    expect(rewritten.headers.get("x-middleware-request-x-rail-api-version")).toBe("1");

    const health = await proxy(request("/api/v1/health"));
    expect(health.status).toBe(200);
    expect(health.headers.get("x-middleware-rewrite")).toBe("http://localhost:3000/api/health");

    const cookie = `sb-testref-auth-token=${encodeURIComponent(JSON.stringify({ access_token: token }))}`;
    const cookieOnly = await proxy(
      request("/api/v1/freelancer/jobs", {
        cookie,
        headers: { "X-Rail-Min-Version": "1" },
      }),
    );
    expect(cookieOnly.status).toBe(401);

    const unversioned = await proxy(request("/api/health"));
    expect(unversioned.status).toBe(200);
    expect(unversioned.headers.get("x-middleware-rewrite")).toBeNull();

    const certHash = "a".repeat(64);
    const certMissing = await proxy(request(`/api/v1/academy/certificates/${certHash}`));
    expect(certMissing.status).toBe(400);
    expect(await certMissing.json()).toMatchObject({
      ok: false,
      error: "Sürüm başlığı gerekli.",
      apiVersion: "1",
      data: null,
    });

    const certHop = await proxy(
      request(`/api/v1/academy/certificates/${certHash}`, {
        headers: { "x-rail-api-version": "1" },
      }),
    );
    expect(certHop.status).toBe(200);
    expect(certHop.headers.get("x-middleware-rewrite")).toBe(
      `http://localhost:3000/api/academy/certificates/${certHash}`,
    );
    expect(certHop.headers.get("x-middleware-request-x-rail-api-version")).toBe("1");
  });

  it("/api/v1 OPTIONS CORS yansıtır; joker yok; versiyonsuz CORS basmaz", async () => {
    vi.stubEnv("RAIL_DRON_ORIGINS", "https://app.yetkin.rail");
    const allowed = await proxy(
      request("/api/v1/freelancer/jobs", {
        method: "OPTIONS",
        headers: { origin: "https://app.yetkin.rail" },
      }),
    );
    expect(allowed.status).toBe(204);
    expect(allowed.headers.get("Access-Control-Allow-Origin")).toBe("https://app.yetkin.rail");
    expect(allowed.headers.get("Access-Control-Allow-Origin")).not.toBe("*");
    expect(allowed.headers.get("Access-Control-Allow-Credentials")).not.toBe("true");

    const foreign = await proxy(
      request("/api/v1/freelancer/jobs", {
        method: "OPTIONS",
        headers: { origin: "https://evil.example" },
      }),
    );
    expect(foreign.status).toBe(204);
    expect(foreign.headers.get("Access-Control-Allow-Origin")).toBeNull();

    const unversioned = await proxy(
      request("/api/freelancer/jobs", {
        method: "OPTIONS",
        headers: { origin: "https://app.yetkin.rail" },
      }),
    );
    expect(unversioned.headers.get("Access-Control-Allow-Origin")).toBeNull();

    vi.stubEnv("RAIL_DRON_ORIGINS", "");
    const emptyOrigins = await proxy(
      request("/api/v1/freelancer/jobs", {
        method: "OPTIONS",
        headers: { origin: "https://lab.yetkin.rail" },
      }),
    );
    expect(emptyOrigins.status).toBe(204);
    expect(emptyOrigins.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(emptyOrigins.headers.get("Access-Control-Allow-Credentials")).not.toBe("true");
  });
});
