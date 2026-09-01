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

    // Playwright: kamu katalog + oturumsuz BFF kenarı (401); donmuş oda 410 değildir.
    expect(spec).toContain("/academy");
    expect(spec).toContain("Akademi");
    expect(spec).toContain("/academy/dogrula/");
    expect(spec).toContain('page.goto("/academy/dogrula")');
    expect(spec).toContain("/api/academy/certificates/");
    expect(spec).toContain("/api/academy/courses/ac_rail_temel/purchase");
    expect(spec).toContain("/api/academy/courses/ac_rail_temel/lock");
    expect(spec).toContain("/api/academy/courses/ac_rail_temel/curriculum");
    expect(spec).toContain("/academy/python-temel/oyna");
    expect(spec).toContain("Idempotency-Key");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).toContain("purchase.status()).toBe(401)");
    expect(spec).toContain("lock.status()).toBe(401)");
    expect(spec).toContain("curriculum.status()).toBe(401)");
    expect(spec).toContain('page.url()).toContain("/login")');
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");

    // Bellek mutlu yol helper — Playwright’a gömülmez; unit/E2E yardımcı SSOT.
    expect(helper).toContain("runAcademyCashJourney");
    expect(helper).toContain("lockAcademyCoursePrice");
    expect(helper).toContain("purchaseAcademyCourse");
    expect(helper).toContain("completeAcademyCurriculum");
    expect(helper).toContain("submitAcademyExam");
    expect(helper).toContain("verifyAcademyCertificateHash");
    expect(helper).toContain("python-temel");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");
  });
});
