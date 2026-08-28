import { describe, expect, it } from "vitest";
import {
  applyEdgeSecurityHeaders,
  buildEdgeCsp,
  CITIZEN_LOGIN_PATH,
  createEdgeNonce,
  decideEdgeAction,
  EDGE_CSP_PAYTR_FRAME_SRC,
  EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE,
  EDGE_CSP_STYLE_SRC_DIRECTIVE,
  EDGE_CSP_SUPABASE_CONNECT_SRC,
  EDGE_HSTS_VALUE,
  hasEdgeSessionHint,
  isProtectedCitizenPath,
  isProtectedKernelPath,
  isProtectedWritePath,
  readCspNonce,
} from "@/lib/kernel/security/edge-guard";

function expectClientStyleCsp(csp: string, nonce: string) {
  expect(csp).toContain(EDGE_CSP_STYLE_SRC_DIRECTIVE);
  expect(csp).toContain(EDGE_CSP_STYLE_SRC_ATTR_DIRECTIVE);
  expect(csp).not.toMatch(/style-src 'self' 'nonce-/);
  expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`);
  expect(csp).not.toMatch(/script-src[^;]*'unsafe-inline'/);
}

describe("kenar oturum ipucu", () => {
  it("boş cookie ve Bearer yokken oturumsuzdur", () => {
    expect(hasEdgeSessionHint({})).toBe(false);
    expect(hasEdgeSessionHint({ cookies: [], authorizationHeader: null })).toBe(false);
    expect(
      hasEdgeSessionHint({
        cookies: [{ name: "sb-ref-auth-token", value: "   " }],
      }),
    ).toBe(false);
  });

  it("Supabase auth cookie veya Bearer varken ipucu vardır", () => {
    expect(
      hasEdgeSessionHint({
        cookies: [{ name: "sb-abcdef-auth-token", value: "chunk" }],
      }),
    ).toBe(true);
    expect(
      hasEdgeSessionHint({
        cookies: [{ name: "sb-abcdef-auth-token.0", value: "chunk" }],
      }),
    ).toBe(true);
    expect(hasEdgeSessionHint({ authorizationHeader: "Bearer eyJhbGciOi" })).toBe(true);
  });
});

describe("korumalı çekirdek yolları", () => {
  it("/dashboard /cuzdan /profil /pasaport /admin ve alt yollarını tanır", () => {
    expect(isProtectedKernelPath("/dashboard")).toBe(true);
    expect(isProtectedKernelPath("/dashboard/")).toBe(true);
    expect(isProtectedKernelPath("/cuzdan/hareket")).toBe(true);
    expect(isProtectedKernelPath("/profil")).toBe(true);
    expect(isProtectedKernelPath("/pasaport")).toBe(true);
    expect(isProtectedKernelPath("/pasaport/vize")).toBe(true);
    expect(isProtectedKernelPath("/admin/katalog")).toBe(true);
  });

  it("kamu ve auth yollarını korumaz", () => {
    expect(isProtectedKernelPath("/")).toBe(false);
    expect(isProtectedKernelPath("/kayit")).toBe(false);
    expect(isProtectedKernelPath("/giris")).toBe(false);
    expect(isProtectedKernelPath("/login")).toBe(false);
    expect(isProtectedKernelPath("/register")).toBe(false);
    expect(isProtectedKernelPath("/academy")).toBe(false);
    expect(isProtectedKernelPath("/administration")).toBe(false);
  });
});

describe("korumalı yazma yolları", () => {
  it("/freelancer/new tezgâhı tanır; donmuş oda yazma listesinde yoktur", () => {
    expect(isProtectedWritePath("/freelancer/new")).toBe(true);
    expect(isProtectedWritePath("/studio/x")).toBe(false);
    expect(isProtectedWritePath("/junior/ebeveyn")).toBe(false);
    expect(isProtectedWritePath("/pazaryeri/tezgah")).toBe(false);
    expect(isProtectedWritePath("/yetkinilan/tezgah")).toBe(false);
    expect(isProtectedWritePath("/freelancer")).toBe(false);
    expect(isProtectedWritePath("/academy")).toBe(false);
    expect(isProtectedCitizenPath("/studio")).toBe(false);
    expect(isProtectedCitizenPath("/dashboard")).toBe(true);
    expect(isProtectedCitizenPath("/academy/python-temel/oyna")).toBe(true);
    expect(isProtectedCitizenPath("/academy")).toBe(false);
    expect(decideEdgeAction("/academy/python-temel/oyna", false).kind).toBe("auth-307");
    expect(decideEdgeAction("/academy/python-temel", false).kind).toBe("next");
    expect(decideEdgeAction("/studio", false).kind).toBe("frozen-410");
  });
});

describe("kenar kararları", () => {
  it("müze yolunu 404, /kayit yolunu 308 yapar", () => {
    expect(decideEdgeAction("/yetkin.ai", false)).toEqual({ kind: "museum-404" });
    expect(decideEdgeAction("/kayit/", false)).toEqual({ kind: "kayit-308" });
  });

  it("oturumsuz korumalı yolu /login 307 yapar; oturum ipucu varsa geçirir", () => {
    expect(CITIZEN_LOGIN_PATH).toBe("/login");
    expect(decideEdgeAction("/dashboard", false)).toEqual({
      kind: "auth-307",
      to: CITIZEN_LOGIN_PATH,
    });
    expect(decideEdgeAction("/cuzdan", false).kind).toBe("auth-307");
    expect(decideEdgeAction("/profil", false).kind).toBe("auth-307");
    expect(decideEdgeAction("/admin", false).kind).toBe("auth-307");
    expect(decideEdgeAction("/pasaport", false)).toEqual({
      kind: "auth-307",
      to: CITIZEN_LOGIN_PATH,
    });
    expect(decideEdgeAction("/pasaport/vize", false).kind).toBe("auth-307");
    expect(decideEdgeAction("/dashboard", true)).toEqual({ kind: "next" });
    expect(decideEdgeAction("/academy", false)).toEqual({ kind: "next" });
    expect(decideEdgeAction("/freelancer/new", false).kind).toBe("auth-307");
    expect(decideEdgeAction("/studio", false).kind).toBe("frozen-410");
    expect(decideEdgeAction("/studio", true).kind).toBe("frozen-410");
    expect(decideEdgeAction("/freelancer", false)).toEqual({ kind: "next" });
  });
});

describe("kenar güvenlik başlıkları", () => {
  it("CSP nonce + PayTR frame-src + Supabase connect-src basar; testte unsafe-eval yok", () => {
    const nonce = createEdgeNonce();
    const headers = new Map<string, string>();
    applyEdgeSecurityHeaders(
      {
        headers: {
          set(name, value) {
            headers.set(name, value);
          },
        },
      },
      { nonce, env: { NODE_ENV: "test" } },
    );
    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(readCspNonce(csp)).toBe(nonce);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("media-src 'self' blob: https://*.supabase.co");
    expect(csp).toContain(`'nonce-${nonce}'`);
    expect(csp).toContain(`frame-src ${EDGE_CSP_PAYTR_FRAME_SRC}`);
    expect(csp).toContain(`connect-src 'self' ${EDGE_CSP_SUPABASE_CONNECT_SRC}`);
    expect(csp).not.toContain("unsafe-eval");
    expectClientStyleCsp(csp, nonce);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toBe(
      "camera=(), microphone=(), geolocation=(), payment=()",
    );
    expect(headers.has("Strict-Transport-Security")).toBe(false);
  });

  it("geliştirmede unsafe-eval kalır; üretimde HSTS + upgrade-insecure-requests, eval yok", () => {
    const nonce = "prod-nonce";
    const development = buildEdgeCsp(nonce, { NODE_ENV: "development" });
    expect(development).toContain("unsafe-eval");
    expectClientStyleCsp(development, nonce);
    const production = buildEdgeCsp(nonce, { NODE_ENV: "production" });
    expect(production).not.toContain("unsafe-eval");
    expect(production).toContain("upgrade-insecure-requests");
    expectClientStyleCsp(production, nonce);

    const headers = new Map<string, string>();
    applyEdgeSecurityHeaders(
      {
        headers: {
          set(name, value) {
            headers.set(name, value);
          },
        },
      },
      { nonce, env: { NODE_ENV: "production" } },
    );
    expect(headers.get("Strict-Transport-Security")).toBe(EDGE_HSTS_VALUE);
    expect(headers.get("Content-Security-Policy")).not.toContain("unsafe-eval");
  });
});
