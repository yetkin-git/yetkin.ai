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
    expect(spec).toContain("/api/academy/courses/ac_01_office_ai/purchase");
    expect(spec).toContain("/api/academy/courses/ac_01_office_ai/lock");
    expect(spec).toContain("/api/academy/courses/ac_01_office_ai/curriculum");
    expect(spec).toContain("/academy/01_office_ai/oyna");
    expect(spec).toContain("Ofiste Yapay Zekâ");
    expect(spec).toContain("E-Ticaret ve Pazaryeri Yapay Zekâ");
    expect(spec).toContain("Sosyal Medya İçerik Üretimi");
    expect(spec).toContain("Kodsuz WhatsApp");
    expect(spec).toContain("Pratik Prompt Mühendisliği");
    expect(spec).not.toContain("python-temel");
    expect(spec).not.toContain("ac_rail_temel");
    expect(spec).toContain("Idempotency-Key");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).toContain("purchase.status()).toBe(401)");
    expect(spec).toContain("lock.status()).toBe(401)");
    expect(spec).toContain("curriculum.status()).toBe(401)");
    expect(spec).toContain('page.url()).toContain("/login")');
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");
    expect(spec).toContain("data-academy-hero-paytr");
    expect(spec).toContain("/api/wallet/top-up");
    expect(spec).toContain("iframe[data-paytr-iframe]");

    // Bellek mutlu yol helper — Playwright’a gömülmez; unit/E2E yardımcı SSOT.
    expect(helper).toContain("runAcademyCashJourney");
    expect(helper).toContain("lockAcademyCoursePrice");
    expect(helper).toContain("purchaseAcademyCourse");
    expect(helper).toContain("completeAcademyCurriculum");
    expect(helper).toContain("submitAcademyExam");
    expect(helper).toContain("verifyAcademyCertificateHash");
    expect(helper).toContain("01_office_ai");
    expect(helper).toContain("E2E_ACADEMY_SLUG");
    expect(helper).not.toContain("sample-course");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");
  });
});
