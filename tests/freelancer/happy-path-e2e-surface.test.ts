import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O9 freelancer nakit E2E yüzeyi", () => {
  it("Playwright spec giriş, ilan, emanet ve release adımlarını taşır", () => {
    const spec = readSrc("tests/e2e/freelancer-happy-path.spec.ts");
    const helper = readSrc("tests/helpers/freelancer-cash-journey.ts");
    expect(spec).toContain("runFreelancerCashJourney");
    expect(spec).toContain("/giris");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).toContain("/api/freelancer/jobs");
    expect(spec).toContain("/api/freelancer/jobs/e2e-job/accept");
    expect(spec).toContain("/api/freelancer/contracts/e2e-contract/release");
    expect(spec).toContain("Freelancer tezgâhı");
    expect(spec).toContain("ilan → emanet → teslim");
    expect(spec).toContain("İlan oluştur");
    expect(spec).toContain("Bakiye kilitlidir");
    expect(spec).toContain("PENDING");
    expect(spec).toContain("RELEASED");
    expect(helper).toContain("createFreelancerJob");
    expect(helper).toContain("acceptFreelancerBid");
    expect(helper).toContain("releaseFreelancerContract");
    expect(helper).toContain("createMemoryLedgerStore");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");
  });
});
