import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O8 akademi nakit E2E yüzeyi", () => {
  it("Playwright spec katalog, kilit, satın alma ve Idempotency-Key taşır", () => {
    const spec = readSrc("tests/e2e/academy-happy-path.spec.ts");
    const helper = readSrc("tests/helpers/academy-cash-journey.ts");
    expect(spec).toContain("runAcademyCashJourney");
    expect(spec).toContain("/academy");
    expect(spec).toContain("/api/academy/courses/ac_rail_temel/purchase");
    expect(spec).toContain("/api/academy/courses/ac_rail_temel/curriculum");
    expect(spec).toContain("/academy/rail-temel/oyna");
    expect(spec).toContain("Idempotency-Key");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).toContain("Öne çıkan kurslar");
    expect(spec).toContain("/academy/dogrula/");
    expect(helper).toContain("lockAcademyCoursePrice");
    expect(helper).toContain("purchaseAcademyCourse");
    expect(helper).toContain("completeAcademyCurriculum");
    expect(helper).toContain("submitAcademyExam");
    expect(helper).toContain("verifyAcademyCertificateHash");
    expect(helper).toContain("rail-temel");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");
  });
});
