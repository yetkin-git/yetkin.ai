import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../../proxy";
import {
  isProtectedCitizenPath,
  isProtectedWritePath,
  PROTECTED_WRITE_PATHS,
} from "@/lib/kernel/security/edge-guard";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function request(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("dikey yazma kenar yüzeyi", () => {
  it("yazma kabuklarını korur; akademi katalog ve açık ilan kamu kalır", () => {
    expect(PROTECTED_WRITE_PATHS).toContain("/freelancer/new");
    expect(PROTECTED_WRITE_PATHS).toContain("/studio");
    expect(PROTECTED_WRITE_PATHS).toContain("/junior/ebeveyn");
    expect(PROTECTED_WRITE_PATHS).toContain("/pazaryeri/tezgah");
    expect(PROTECTED_WRITE_PATHS).toContain("/yetkinilan/tezgah");
    expect(isProtectedWritePath("/freelancer/new")).toBe(true);
    expect(isProtectedWritePath("/studio")).toBe(true);
    expect(isProtectedWritePath("/freelancer")).toBe(false);
    expect(isProtectedWritePath("/academy")).toBe(false);
    expect(isProtectedCitizenPath("/academy/rail-temel/oyna")).toBe(true);
    expect(PROTECTED_WRITE_PATHS).toContain("/devlabs/projeler");
    expect(isProtectedWritePath("/devlabs/projeler/abc")).toBe(true);
    expect(isProtectedWritePath("/devlabs")).toBe(false);
  });

  it("oturumsuz yazma yolları /login 307; akademi geçer", async () => {
    for (const path of [
      "/freelancer/new",
      "/studio",
      "/junior/ebeveyn",
      "/pazaryeri/tezgah",
      "/yetkinilan/tezgah",
      "/arena/yeni",
      "/kurumsal/ilan/yeni",
      "/devlabs/projeler/e2e",
    ]) {
      const response = await proxy(request(path));
      expect(response.status, path).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login");
    }
    expect((await proxy(request("/academy"))).status).toBe(200);
    expect((await proxy(request("/freelancer"))).status).toBe(200);
    expect((await proxy(request("/academy/rail-temel/oyna"))).status).toBe(307);
  });

  it("yazma sayfaları requirePageSession bağlar; CSP PayTR frame-src taşır", () => {
    expect(readSrc("app/freelancer/new/page.tsx")).toContain("requirePageSession");
    expect(readSrc("app/studio/layout.tsx")).toContain("requirePageSession");
    expect(readSrc("app/junior/ebeveyn/page.tsx")).toContain("requirePageSession");
    expect(readSrc("app/pazaryeri/tezgah/page.tsx")).toContain("requirePageSession");
    expect(readSrc("app/devlabs/projeler/[id]/page.tsx")).toContain("requirePageSession");
    expect(readSrc("app/academy/[slug]/oyna/page.tsx")).toContain("requirePageSession");
    const csp = readSrc("lib/kernel/security/edge-guard.ts");
    expect(csp).toContain("frame-src https://www.paytr.com https://*.paytr.com");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).not.toContain("style-src 'self' 'nonce-");
  });
});
