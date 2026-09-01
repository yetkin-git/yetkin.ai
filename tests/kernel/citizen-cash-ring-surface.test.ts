import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("laboratuvar vatandaş nakit halkası yüzeyi", () => {
  it("verify:citizen-cash-ring dört basamağı ve tanığı bağlar; sahte bakiye yok", () => {
    const script = readSrc("scripts/verify-citizen-cash-ring.ts");
    const helper = readSrc("tests/helpers/citizen-cash-ring-journey.ts");
    const pkg = JSON.parse(readSrc("package.json")) as { scripts: Record<string, string> };

    expect(pkg.scripts["verify:citizen-cash-ring"]).toBe("tsx scripts/verify-citizen-cash-ring.ts");
    expect(script).toContain("runCitizenCashRingJourney");
    expect(script).toContain("formatCitizenCashRingReport");
    expect(script).toContain("ops:t3-academy-loop");
    expect(script).toContain("ops:t4-freelancer-loop");
    expect(script).not.toContain("LOCAL_MOCK_AUTH");
    expect(script).not.toContain("PAYTR_ALLOW_MOCK_CHECKOUT=true");
    expect(script).not.toMatch(/UPDATE\s+wallets/i);
    expect(script).not.toMatch(/SET\s+amount_minor/i);

    expect(helper).toContain("clearSuccessfulPaymentOrder");
    expect(helper).toContain("wallet-top-up");
    expect(helper).toContain("academy-purchase");
    expect(helper).toContain("escrow-hold");
    expect(helper).toContain("escrow-release-net");
    expect(helper).toContain("certificateHash");
    expect(helper).toContain("resolvePublicAcademyCertificate");
    expect(helper).toContain("createMemoryMarketplaceSplitPort");
    expect(helper).toContain("CREDIT yazmaz");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");
  });
});
