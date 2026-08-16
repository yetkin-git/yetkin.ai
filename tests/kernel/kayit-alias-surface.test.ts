import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("vatandaş /kayit alias yüzeyi", () => {
  it("next.config /kayit → /register kalıcı yönlendirme taşır", () => {
    const config = readSrc("next.config.ts");
    expect(config).toContain('source: "/kayit"');
    expect(config).toContain('destination: "/register"');
    expect(config).toContain('source: "/giris"');
    expect(config).toContain('destination: "/login"');
    expect(config).toContain("EDGE_SECURITY_HEADER_ENTRIES");
    expect(config).toContain("CSP nonce");
    expect(config).not.toContain("EDGE_CSP_VALUE");
    expect(config).not.toMatch(/key:\s*"Content-Security-Policy"/);
  });

  it("proxy.ts /kayit yedek 308 yönlendirmesi taşır", () => {
    const proxy = readSrc("proxy.ts");
    expect(proxy).toContain("decideEdgeAction");
    expect(proxy).toContain("kayit-308");
    expect(proxy).toContain('url.pathname = "/register"');
    expect(proxy).toContain("NextResponse.redirect(url, 308)");
  });

  it("proxy.ts oturumsuz çekirdek yönlendirmesi ve CSP mühürler", () => {
    const proxy = readSrc("proxy.ts");
    expect(proxy).toContain("auth-307");
    expect(proxy).toContain("applyEdgeSecurityHeaders");
    expect(proxy).toContain("resolveEdgeSession");
    expect(proxy).toContain("createEdgeNonce");
    expect(proxy).toContain("attachEdgeNonceRequestHeaders");
    expect(proxy).toContain("decideEdgeApiAuth");
    const guard = readSrc("lib/kernel/security/edge-guard.ts");
    expect(guard).toContain('CITIZEN_LOGIN_PATH = "/login"');
    expect(guard).toContain("default-src 'self'");
    expect(guard).toContain("createEdgeNonce");
    expect(guard).toContain("buildEdgeCsp");
    expect(guard).toContain("'strict-dynamic'");
    expect(guard).toContain("style-src 'self' 'unsafe-inline'");
    expect(guard).not.toContain("style-src 'self' 'nonce-");
    expect(guard).toContain('"/dashboard"');
    expect(guard).toContain('"/cuzdan"');
    expect(guard).toContain('"/profil"');
    expect(guard).toContain('"/pasaport"');
    expect(guard).toContain('"/admin"');
    expect(guard).toContain("frame-src https://www.paytr.com https://*.paytr.com");
    expect(readSrc("app/layout.tsx")).toContain("connection()");
  });
});
