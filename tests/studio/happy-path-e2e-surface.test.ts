import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O11 Studio LLM Debit E2E yüzeyi", () => {
  it("Playwright spec şerit mührü, oturumsuz 401 ve giriş kapısını taşır", () => {
    const spec = readSrc("tests/e2e/studio-happy-path.spec.ts");
    expect(spec).toContain("/studio");
    expect(spec).toContain("Üretim anında bakiyeden transfer (LLM Debit).");
    expect(spec).toContain("jeton bakiyenizden düşülür");
    expect(spec).toContain("/api/studio/generate");
    expect(spec).toContain("/api/studio/images");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).toContain("runStudioCashJourney");
    expect(spec).toContain("runStudioImageCatalogMissingJourney");
    expect(spec).toContain("STUDIO_IMAGE_CATALOG_MISSING");
    expect(spec).toContain("413");
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");
  });
});
