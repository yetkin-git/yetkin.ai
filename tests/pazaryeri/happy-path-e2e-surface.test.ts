import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("O10 Yetkinİlan nakit E2E yüzeyi", () => {
  it("Playwright spec donmuş 410 basar; canlı vitrin beklenmez", () => {
    const spec = readSrc("tests/e2e/yetkinilan-happy-path.spec.ts");
    expect(spec).toContain("/yetkinilan");
    expect(spec).toContain("Bu oda üretimde kapalı.");
    expect(spec).toContain("/api/pazaryeri/products/e2e-product/lock");
    expect(spec).toContain("/api/pazaryeri/products/e2e-product/purchase");
    expect(spec).toContain("/api/pazaryeri/orders/e2e-order/confirm");
    expect(spec).toContain("410");
    expect(spec).not.toContain("Tezgâhı yönet");
    expect(spec).not.toContain("Oturum gerekli.");
    expect(spec).not.toContain("runPazaryeriDualCashJourney");
    expect(spec).not.toContain("LOCAL_MOCK_AUTH");
  });
});
