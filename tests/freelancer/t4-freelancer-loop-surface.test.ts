import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("T4 freelancer canlı emanet/hakediş yüzeyi", () => {
  it("ops betiği OPEN ilan, katalog hold, EscrowHold, release ve vize taşır; sahte bakiye yok", () => {
    const script = readSrc("scripts/ops-t4-freelancer-loop.ts");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };
    expect(pkg.scripts["ops:t4-freelancer-loop"]).toBe("tsx scripts/ops-t4-freelancer-loop.ts");
    expect(script).toContain("/api/freelancer/jobs");
    expect(script).toContain("/accept");
    expect(script).toContain("/release");
    expect(script).toContain("Idempotency-Key");
    expect(script).toContain("computePaytrWebhookHash");
    expect(script).toContain("EscrowHold");
    expect(script).toContain("escrow-hold");
    expect(script).toContain("escrow-release-net");
    expect(script).toContain("FREELANCER_RELEASE");
    expect(script).toContain("fj_rail_escrow_audit");
    expect(script).toContain("information_schema.columns");
    expect(script).toContain("amount_minor");
    expect(script).toContain("DELIVERY");
    expect(script).toContain("is_generated");
    expect(script).not.toMatch(/confirmed_at = COALESCE\(confirmed_at, NOW\(\)\)/);
    expect(script).toContain("FROM public.users WHERE id = $1::text");
    expect(script).not.toMatch(/FROM public\.users WHERE id = \$1::uuid/);
    expect(script).not.toContain("LOCAL_MOCK_AUTH");
    expect(script).not.toContain("PAYTR_ALLOW_MOCK_CHECKOUT=true");
    expect(script).not.toMatch(/UPDATE\s+wallets/i);
    expect(script).not.toMatch(/SET\s+amount_minor/i);
  });
});
