import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O11 Studio LLM Debit E2E yüzeyi", () => {
  it("Playwright spec şerit mührü ve donmuş 410 taşır", () => {
    const spec = readSrc("tests/e2e/studio-happy-path.spec.ts");
    expect(spec).toContain("/studio");
    expect(spec).toContain("kariyer vizenle uzmanlığını belgele");
    expect(spec).toContain("jeton bakiyenizden düşülür");
    expect(spec).toContain("/api/studio/generate");
    expect(spec).toContain("/api/studio/images");
    expect(spec).toContain("Bu oda üretimde kapalı.");
    expect(spec).toContain("410");
    expect(spec).not.toContain("Oturum gerekli.");
    expect(spec).not.toContain("runStudioCashJourney");
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");
  });
});
