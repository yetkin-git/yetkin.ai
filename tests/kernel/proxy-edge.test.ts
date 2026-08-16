import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE,
  EDGE_CSP_STYLE_SRC_DIRECTIVE,
  readCspNonce,
} from "@/lib/kernel/security/edge-guard";

const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";

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

function request(path: string, init?: { cookie?: string; authorization?: string }) {
  const headers = new Headers();
  if (init?.cookie) {
    headers.set("cookie", init.cookie);
  }
  if (init?.authorization) {
    headers.set("authorization", init.authorization);
  }
  return new NextRequest(new URL(path, "http://localhost:3000"), { headers });
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
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
      expectNonceCsp(response);
    }
  });

  it("sahte Supabase cookie korumalı yolu 307 ile keser", async () => {
    const response = await proxy(
      request("/dashboard", { cookie: "sb-testref-auth-token=session-chunk" }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login");
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

  it("oturumsuz session API 401; public ve webhook geçer; harita dışı 404", async () => {
    const studio = await proxy(request("/api/studio/generate"));
    expect(studio.status).toBe(401);
    expect(await studio.json()).toEqual({ ok: false, error: "Oturum gerekli." });
    expectNonceCsp(studio);

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
    expect(await unknown.json()).toEqual({ ok: false, error: "API yolu bulunamadı." });
  });

  it("sahte Bearer session API'yi kenarda 401 eker", async () => {
    const response = await proxy(
      request("/api/studio/generate", { authorization: "Bearer eyJhbGciOi" }),
    );
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ ok: false, error: "Oturum gerekli." });
  });

  it("doğrulanmış Bearer session API'yi kenarda geçirir", async () => {
    const token = await signHs256();
    const response = await proxy(
      request("/api/studio/generate", { authorization: `Bearer ${token}` }),
    );
    expect(response.status).toBe(200);
    expectNonceCsp(response);
  });

  it("oturumsuz katalog PATCH kenarda 401; profil session kalır", async () => {
    const catalog = await proxy(
      new NextRequest(new URL("/api/admin/catalog", "http://localhost:3000"), { method: "PATCH" }),
    );
    expect(catalog.status).toBe(401);
    expect(await catalog.json()).toEqual({ ok: false, error: "Oturum gerekli." });

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
    expect(await citizen.json()).toEqual({
      ok: false,
      error: "Bu sığınak Super Admin kilidine bağlıdır.",
    });
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
});
