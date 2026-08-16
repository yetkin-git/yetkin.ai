import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O12 DevLabs icra dürüstlüğü E2E yüzeyi", () => {
  it("Playwright spec şerit mührü, kamu konsol, oturumsuz 401 ve giriş kapısını taşır", () => {
    const spec = readSrc("tests/e2e/devlabs-happy-path.spec.ts");
    expect(spec).toContain("/devlabs");
    expect(spec).toContain("Kod tezgâhta üretilir; exec yoktur.");
    expect(spec).toContain("Projelerinizi yönetin");
    expect(spec).toContain("Exec Yoktur / Çalıştırma Yapılmaz");
    expect(spec).toContain("/devlabs/projeler/");
    expect(spec).toContain("/api/devlabs/projects");
    expect(spec).toContain("/api/devlabs/projects/e2e-project/generate");
    expect(spec).toContain("/api/devlabs/projects/e2e-project/keys");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");
  });
});
