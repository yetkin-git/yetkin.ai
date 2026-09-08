import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("T3 akademi canlı nakit döngü yüzeyi", () => {
  it("ops betiği PayTR HMAC + HTTP kilit/satın alma taşır; sahte bakiye ve mock checkout yok", () => {
    const script = readSrc("scripts/ops-t3-academy-loop.ts");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:t3-academy-loop"]).toBe("tsx scripts/ops-t3-academy-loop.ts");
    expect(script).toContain("/api/wallet/top-up");
    expect(script).toContain("/api/academy/courses/${COURSE_ID}/purchase");
    expect(script).toContain("01_office_ai");
    expect(script).toContain("02_ecommerce_ai");
    expect(script).toContain("T3_COURSE_SLUG");
    expect(script).toContain("isAcademyGrowthSkuSlug");
    expect(script).not.toContain("ac_rail_temel");
    expect(script).not.toContain("python-temel");
    expect(script).toContain("Idempotency-Key");
    expect(script).toContain("computePaytrWebhookHash");
    expect(script).toContain("/academy/dogrula/");
    expect(script).toContain("Mühür geçerli");
    expect(script).toContain("ACADEMY_CERTIFICATE");
    expect(script).toContain("/api/career/visas");
    expect(script).toContain("CareerVisaStamp");
    expect(script).toContain("CLEARED");
    expect(script).toContain("wallet-top-up");
    expect(script).toContain("E2E_T3_EMAIL");
    expect(script).toContain("buildIdempotentMerchantOid");
    expect(script).toContain("PENDING sızıntısı");
    expect(script).toContain("checks.payments");
    expect(script).toContain("checks.inngest");
    expect(script).not.toContain("LOCAL_MOCK_AUTH");
    expect(script).not.toContain("PAYTR_ALLOW_MOCK_CHECKOUT=true");
    expect(script).not.toContain("auth.signUp");
    expect(script).not.toMatch(/confirmed_at = COALESCE\(confirmed_at, NOW\(\)\)/);
    expect(script).not.toMatch(/FROM public\.users WHERE id = \$1::uuid/);
    expect(script).not.toMatch(/UPDATE\s+wallets/i);
    expect(script).not.toMatch(/SET\s+amount_minor/i);
  });
});
