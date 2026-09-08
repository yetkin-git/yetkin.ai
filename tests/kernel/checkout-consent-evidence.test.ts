import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  CHECKOUT_LEGAL_CONSENT_PAYLOAD,
  CHECKOUT_LEGAL_CONSENT_VERSION,
  toCheckoutConsentEvidence,
} from "@/lib/kernel/legal/checkout-consent";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("kasa rızası delil sicili", () => {
  it("Zod rızasını PaymentOrder / AcademyPurchase kolonlarına birebir basar", () => {
    expect(toCheckoutConsentEvidence(CHECKOUT_LEGAL_CONSENT_PAYLOAD)).toEqual({
      consentVersion: CHECKOUT_LEGAL_CONSENT_VERSION,
      distanceContractAccepted: true,
      digitalImmediatePerformanceAccepted: true,
    });
  });

  it("şema ve migrasyon kasa rıza kolonlarını taşır", () => {
    const kernel = readSrc("prisma/schema/kernel.prisma");
    const academy = readSrc("prisma/schema/academy.prisma");
    const sql = readSrc("prisma/migrations/20260905010000_checkout_consent_evidence/migration.sql");
    expect(kernel).toContain("consentVersion");
    expect(kernel).toContain("distanceContractAccepted");
    expect(kernel).toContain("digitalImmediatePerformanceAccepted");
    expect(academy).toContain("consentVersion");
    expect(academy).toContain('@@map("academy_purchases")');
    expect(sql).toContain('ALTER TABLE "payment_orders"');
    expect(sql).toContain('ALTER TABLE "academy_purchases"');
    expect(sql).toContain('"consent_version"');
    expect(sql).toContain('"distance_contract_accepted"');
    expect(sql).toContain('"digital_immediate_performance_accepted"');
  });

  it("cüzdan yükleme ve akademi satın alma rızayı kalıcı yazar; yalnız logEvent yetmez", () => {
    const topUp = readSrc("app/api/(kernel)/wallet/top-up/route.ts");
    const purchase = readSrc("app/api/academy/courses/[id]/purchase/route.ts");
    const engine = readSrc("lib/academy/engine.ts");
    expect(topUp).toContain("toCheckoutConsentEvidence(parsed.data)");
    expect(topUp).toContain("paymentOrder.create");
    expect(topUp.indexOf("toCheckoutConsentEvidence")).toBeLessThan(topUp.indexOf("paymentOrder.create"));
    expect(purchase).toContain("consent: toCheckoutConsentEvidence(parsed.data)");
    expect(engine).toContain("command.consent");
    expect(engine).toContain("toCheckoutConsentEvidence(command.consent)");
  });
});
