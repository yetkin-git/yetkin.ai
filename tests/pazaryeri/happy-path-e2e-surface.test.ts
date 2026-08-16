import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O10 Yetkinİlan nakit E2E yüzeyi", () => {
  it("Playwright spec vitrin, çift nakit yolu ve oturumsuz 401 taşır", () => {
    const spec = readSrc("tests/e2e/yetkinilan-happy-path.spec.ts");
    expect(spec).toContain("/yetkinilan");
    expect(spec).toContain("Tezgâhı yönet");
    expect(spec).toContain("anında bakiyeden transfer (Settlement)");
    expect(spec).toContain("Emanet korumasında kilit (Escrow Hold)");
    expect(spec).toContain("/api/pazaryeri/products/e2e-product/lock");
    expect(spec).toContain("/api/pazaryeri/products/e2e-product/purchase");
    expect(spec).toContain("/api/pazaryeri/orders/e2e-order/confirm");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).toContain("runPazaryeriDualCashJourney");
    expect(spec).toContain("SETTLED");
    expect(spec).toContain("AWAITING_DELIVERY");
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");
  });
});
