import { afterEach, describe, expect, it, vi } from "vitest";
import { exportJWK, generateKeyPair, SignJWT } from "jose";
import {
  extractAccessTokenFromCookies,
  extractBearerAccessToken,
  extractEdgeAccessToken,
  needsEdgeJwtVerification,
  resetEdgeJwksCacheForTests,
  resolveEdgeSession,
  supabaseJwksUrl,
  verifyEdgeAccessToken,
} from "@/lib/kernel/security/edge-jwt";

const TEST_SECRET = "rail-edge-jwt-test-secret-32bytes-min";
const TEST_USER = "11111111-1111-4111-8111-111111111111";
const TEST_URL = "https://edge-test.supabase.co";
const TEST_ENV = { supabaseUrl: TEST_URL, jwtSecret: TEST_SECRET };

async function signHs256(input?: {
  exp?: number | string;
  iat?: number;
  role?: string;
  sub?: string;
  aud?: string;
  issuer?: string;
}): Promise<string> {
  const jwt = new SignJWT({ role: input?.role ?? "authenticated" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input?.sub ?? TEST_USER)
    .setAudience(input?.aud ?? "authenticated")
    .setIssuer(input?.issuer ?? `${TEST_URL}/auth/v1`);
  if (input?.iat !== undefined) {
    jwt.setIssuedAt(input.iat);
  } else {
    jwt.setIssuedAt();
  }
  jwt.setExpirationTime(input?.exp ?? "1h");
  return jwt.sign(new TextEncoder().encode(TEST_SECRET));
}

describe("kenar JWT çıkarımı", () => {
  it("Bearer üç parçalı JWT okur; tek parça çöpü düşürür", async () => {
    expect(extractBearerAccessToken("Bearer eyJhbGciOi")).toBeNull();
    expect(extractBearerAccessToken("Bearer not-a-jwt")).toBeNull();
    const token = await signHs256();
    expect(extractBearerAccessToken(`Bearer ${token}`)).toBe(token);
  });

  it("Supabase cookie JSON ve base64- oturumundan access_token okur", async () => {
    const token = await signHs256();
    expect(
      extractAccessTokenFromCookies([
        { name: "sb-testref-auth-token", value: JSON.stringify({ access_token: token }) },
      ]),
    ).toBe(token);

    const blob = `base64-${Buffer.from(JSON.stringify({ access_token: token })).toString("base64url")}`;
    expect(
      extractAccessTokenFromCookies([{ name: "sb-testref-auth-token", value: blob }]),
    ).toBe(token);

    expect(
      extractAccessTokenFromCookies([
        { name: "sb-testref-auth-token.0", value: token.slice(0, 20) },
        { name: "sb-testref-auth-token.1", value: token.slice(20) },
      ]),
    ).toBe(token);
  });

  it("Bearer varken cookie’ye düşmez; çöp Bearer fail-closed", async () => {
    const token = await signHs256();
    expect(
      extractEdgeAccessToken({
        authorizationHeader: "Bearer not.a.jwt",
        cookies: [{ name: "sb-testref-auth-token", value: JSON.stringify({ access_token: token }) }],
      }),
    ).toBeNull();
  });
});

describe("kenar JWT doğrulama (HS256)", () => {
  it("geçerli imzalı authenticated JWT’yi kabul eder", async () => {
    const token = await signHs256();
    expect(await verifyEdgeAccessToken(token, TEST_ENV)).toBe(true);
  });

  it("sahte imza, yanlış secret, süresi dolmuş ve service_role’ü reddeder", async () => {
    const token = await signHs256();
    const tampered = `${token.slice(0, -4)}aaaa`;
    expect(await verifyEdgeAccessToken(tampered, TEST_ENV)).toBe(false);
    expect(await verifyEdgeAccessToken(token, { ...TEST_ENV, jwtSecret: "other-secret" })).toBe(
      false,
    );
    expect(await verifyEdgeAccessToken(token, { supabaseUrl: TEST_URL })).toBe(false);

    const now = Math.floor(Date.now() / 1000);
    const expired = await signHs256({ iat: now - 3600, exp: now - 120 });
    expect(await verifyEdgeAccessToken(expired, TEST_ENV)).toBe(false);

    const service = await signHs256({ role: "service_role" });
    expect(await verifyEdgeAccessToken(service, TEST_ENV)).toBe(false);

    const anon = await signHs256({ role: "anon" });
    expect(await verifyEdgeAccessToken(anon, TEST_ENV)).toBe(false);

    const badSub = await signHs256({ sub: "not-a-uuid" });
    expect(await verifyEdgeAccessToken(badSub, TEST_ENV)).toBe(false);

    const badAud = await signHs256({ aud: "anon" });
    expect(await verifyEdgeAccessToken(badAud, TEST_ENV)).toBe(false);
  });
});

describe("kenar JWT doğrulama (JWKS ES256)", () => {
  afterEach(() => {
    resetEdgeJwksCacheForTests();
    vi.unstubAllGlobals();
  });

  it("JWKS ile ES256 doğrular; sahte imzayı fail-closed düşürür", async () => {
    const { publicKey, privateKey } = await generateKeyPair("ES256");
    const jwk = await exportJWK(publicKey);
    jwk.kid = "edge-test-kid";
    jwk.alg = "ES256";
    jwk.use = "sig";
    const url = "https://jwks-edge-test.supabase.co";
    const jwksHref = supabaseJwksUrl(url)!;

    vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
      const href = input instanceof Request ? input.url : String(input);
      if (href === jwksHref) {
        return new Response(JSON.stringify({ keys: [jwk] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response("no", { status: 404 });
    });

    const token = await new SignJWT({ role: "authenticated" })
      .setProtectedHeader({ alg: "ES256", kid: "edge-test-kid" })
      .setSubject(TEST_USER)
      .setAudience("authenticated")
      .setIssuer(`${url}/auth/v1`)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);

    expect(await verifyEdgeAccessToken(token, { supabaseUrl: url })).toBe(true);

    const { privateKey: other } = await generateKeyPair("ES256");
    const forged = await new SignJWT({ role: "authenticated" })
      .setProtectedHeader({ alg: "ES256", kid: "edge-test-kid" })
      .setSubject(TEST_USER)
      .setAudience("authenticated")
      .setIssuer(`${url}/auth/v1`)
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(other);
    expect(await verifyEdgeAccessToken(forged, { supabaseUrl: url })).toBe(false);
  });

  it("JWKS URL yokken ES256 fail-closed düşer", async () => {
    const { privateKey } = await generateKeyPair("ES256");
    const token = await new SignJWT({ role: "authenticated" })
      .setProtectedHeader({ alg: "ES256", kid: "x" })
      .setSubject(TEST_USER)
      .setAudience("authenticated")
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(privateKey);
    expect(await verifyEdgeAccessToken(token, { jwtSecret: TEST_SECRET })).toBe(false);
  });
});

describe("kenar JWT ihtiyaç kapısı", () => {
  it("korumalı sayfa ve session API ister; kamu, webhook ve OPTIONS istemez", () => {
    expect(needsEdgeJwtVerification("/dashboard")).toBe(true);
    expect(needsEdgeJwtVerification("/studio")).toBe(true);
    expect(needsEdgeJwtVerification("/api/studio/generate", "POST")).toBe(true);
    expect(needsEdgeJwtVerification("/academy")).toBe(false);
    expect(needsEdgeJwtVerification("/academy/rail-temel/oyna")).toBe(true);
    expect(needsEdgeJwtVerification("/api/health")).toBe(false);
    expect(needsEdgeJwtVerification("/api/payments/webhooks/paytr", "POST")).toBe(false);
    expect(needsEdgeJwtVerification("/api/studio/generate", "OPTIONS")).toBe(false);
  });

  it("sahte cookie korumalı yolda oturum sayılmaz", async () => {
    expect(
      await resolveEdgeSession({
        pathname: "/dashboard",
        cookies: [{ name: "sb-testref-auth-token", value: "session-chunk" }],
        env: TEST_ENV,
      }),
    ).toBe(false);
    expect(
      await resolveEdgeSession({
        pathname: "/api/studio/generate",
        method: "POST",
        authorizationHeader: "Bearer eyJhbGciOi",
        env: TEST_ENV,
      }),
    ).toBe(false);
  });

  it("geçerli JWT korumalı yolda oturum sayılır; kamu yolda doğrulamaz", async () => {
    const token = await signHs256();
    expect(
      await resolveEdgeSession({
        pathname: "/dashboard",
        cookies: [{ name: "sb-testref-auth-token", value: JSON.stringify({ access_token: token }) }],
        env: TEST_ENV,
      }),
    ).toBe(true);
    expect(
      await resolveEdgeSession({
        pathname: "/academy",
        cookies: [{ name: "sb-testref-auth-token", value: JSON.stringify({ access_token: token }) }],
        env: TEST_ENV,
      }),
    ).toBe(false);
  });
});
