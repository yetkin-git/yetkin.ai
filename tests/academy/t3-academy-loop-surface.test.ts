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
    expect(script).toContain("ac_rail_temel");
    expect(script).toContain("Idempotency-Key");
    expect(script).toContain("computePaytrWebhookHash");
    expect(script).toContain("/academy/dogrula/");
    expect(script).toContain("Mühür geçerli");
    expect(script).toContain("CLEARED");
    expect(script).toContain("wallet-top-up");
    expect(script).not.toContain("LOCAL_MOCK_AUTH");
    expect(script).not.toContain("PAYTR_ALLOW_MOCK_CHECKOUT=true");
    expect(script).toContain("is_generated");
    expect(script).not.toMatch(/confirmed_at = COALESCE\(confirmed_at, NOW\(\)\)/);
    expect(script).toContain("FROM public.users WHERE id = $1::text");
    expect(script).not.toMatch(/FROM public\.users WHERE id = \$1::uuid/);
    expect(script).not.toMatch(/UPDATE\s+wallets/i);
    expect(script).not.toMatch(/SET\s+amount_minor/i);
  });
});
