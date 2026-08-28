import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("ledger eşzamanlılık yüzeyi", () => {
  it("20 paralel farklı idempotency anahtarı ve wallet=ledger invariant testi durur", () => {
    const test = readSrc("tests/kernel/ledger-concurrency.test.ts");
    expect(test).toContain("PARALLEL = 20");
    expect(test).toContain("Promise.all");
    expect(test).toContain("idempotencyKey");
    expect(test).toContain("withMemoryLedgerAtomic");
    expect(test).toContain("signedLedgerSum");
    expect(test).toContain("toBeGreaterThanOrEqual(0)");
    expect(test).toContain("Promise.allSettled");
  });

  it("dikey rollback enjeksiyonu çalışan odalara (akademi/freelancer) bağlıdır; donmuş motor import etmez", () => {
    const test = readSrc("tests/kernel/money-uow-rollback.test.ts");
    expect(test).toContain("withMemoryAcademyAtomic");
    expect(test).toContain("failNextPurchaseInsert");
    expect(test).toContain("purchaseAcademyCourse");
    expect(test).toContain("withMemoryAcceptAtomic");
    expect(test).toContain("failNextContractInsert");
    expect(test).toContain("acceptFreelancerBid");
    expect(test).not.toContain("@/lib/pazaryeri");
    expect(test).not.toContain("@/lib/junior");
    expect(test).not.toContain("@/lib/arena");
    expect(test).not.toContain("@/lib/kurumsal");
    expect(test).not.toContain("@/lib/devlabs");
  });
});
