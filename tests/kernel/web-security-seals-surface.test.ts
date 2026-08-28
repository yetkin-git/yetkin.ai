import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("web oturum kalkanı mühür zinciri yüzeyi", () => {
  it("verify:web-security-seals nightly kovasında, surface vitest'ten önce çalışır", () => {
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    const prebuild = pkg.scripts["verify:prebuild"] ?? "";
    const nightly = pkg.scripts["verify:nightly"] ?? "";
    expect(pkg.scripts["verify:web-security-seals"]).toContain(
      "tsx scripts/verify-web-security-seals.ts",
    );
    expect(pkg.scripts["verify:web-security-seals"]).toContain("tests/kernel/origin-guard.test.ts");
    expect(pkg.scripts["verify:web-security-seals"]).toContain("tests/kernel/http-rate-limit.test.ts");
    expect(pkg.scripts["verify:web-security-seals"]).toContain(
      "tests/kernel/auth-cookie-surface.test.ts",
    );
    expect(prebuild).not.toContain("verify:web-security-seals");
    expect(nightly).toContain("verify:web-security-seals");
    const webAt = nightly.indexOf("verify:web-security-seals");
    const surfaceAt = nightly.indexOf("test:surface");
    expect(webAt).toBeGreaterThan(-1);
    expect(surfaceAt).toBeGreaterThan(webAt);
  });

  it("kenar proxy Origin kalkanını v1 rewrite'den önce bağlar", () => {
    const proxy = readSrc("proxy.ts");
    expect(proxy).toContain("decideWebOriginGuard");
    expect(proxy.indexOf("decideWebOriginGuard({")).toBeLessThan(proxy.indexOf("matchEdgeRateLimit("));
    expect(proxy).toContain("isApiV1Pathname(pathname)");
  });
});
