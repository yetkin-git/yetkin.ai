import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  KURUMSAL_SCREENING_MODULE,
  KURUMSAL_SCREENING_UNIT,
} from "@/lib/sales/kurumsal-screening";
import {
  KURUMSAL_SCREENING_ORDER_PURPOSE,
  KURUMSAL_SCREENING_PURCHASE_PATH,
} from "@/lib/sales/kurumsal-screening-entitlement";

function src(path: string): string {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("Kurumsal lisans kapısı ve başvuru e-posta kilidi (K2, Y1)", () => {
  it("ilan oluşturma entitlement kontrolü bağlar (K2)", () => {
    expect(KURUMSAL_SCREENING_MODULE).toBe("kurumsal");
    expect(KURUMSAL_SCREENING_UNIT).toBe("job-screening-pack");
    expect(KURUMSAL_SCREENING_ORDER_PURPOSE).toContain(KURUMSAL_SCREENING_UNIT);
    expect(KURUMSAL_SCREENING_PURCHASE_PATH).toContain("/kurumsal");
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("assertKurumsalScreeningEntitlement");
    expect(load).toContain("PaymentRequiredError");
    const entitlement = src("lib/sales/kurumsal-screening-entitlement.ts");
    expect(entitlement).toContain('status: "CLEARED"');
    expect(entitlement).toContain("findActiveEntry");
  });

  it("başvuru oturum e-postasını zorunlu kılar (Y1)", () => {
    const load = src("lib/sales/kurumsal-screening-load.ts");
    expect(load).toContain("sessionEmail");
    expect(load).toContain("oturumundaki doğrulanmış e-posta");
    const route = src("app/api/ilan/[slug]/basvuru/route.ts");
    expect(route).toContain("sessionEmail: user.email");
    const gate = src("components/kurumsal/job-apply-gate.tsx");
    expect(gate).toContain("readOnly");
    expect(gate).toContain("doğrulanmış adres");
  });
});
