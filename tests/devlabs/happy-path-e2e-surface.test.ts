import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O12 DevLabs icra dürüstlüğü E2E yüzeyi", () => {
  it("Playwright spec iniş mührü ve donmuş 410 taşır", () => {
    const spec = readSrc("tests/e2e/devlabs-happy-path.spec.ts");
    expect(spec).toContain("/devlabs");
    expect(spec).toContain("Kod tezgâhta üretilir; exec yoktur.");
    expect(spec).toContain("Projelerinizi yönetin");
    expect(spec).toContain("/devlabs/projeler/");
    expect(spec).toContain("/api/devlabs/projects");
    expect(spec).toContain("/api/devlabs/projects/e2e-project/generate");
    expect(spec).toContain("/api/devlabs/projects/e2e-project/keys");
    expect(spec).toContain("Bu oda üretimde kapalı.");
    expect(spec).toContain("410");
    expect(spec).not.toContain("Oturum gerekli.");
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");
  });
});
