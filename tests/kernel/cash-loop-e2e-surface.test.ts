import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("T4 nakit e2e yüzeyi", () => {
  it("Playwright spec kayıt, pulse 401, bellek döngüsü ve sandbox opt-in taşır", () => {
    const spec = readSrc("tests/e2e/cash-loop.spec.ts");
    const helper = readSrc("tests/helpers/cash-loop-journey.ts");
    const checkout = readSrc("lib/kernel/payments/paytr/checkout.ts");

    expect(spec).toContain("runCashLoopJourney");
    expect(spec).toContain("/kayit");
    expect(spec).toContain("/register");
    expect(spec).toContain("/api/dashboard/pulse");
    expect(spec).toContain("/api/wallet/top-up");
    expect(spec).toContain("/api/freelancer/jobs");
    expect(spec).toContain("/api/freelancer/contracts/e2e-contract/release");
    expect(spec).toContain("Oturum gerekli.");
    expect(spec).toContain("E2E_CASH_SANDBOX");
    expect(spec).toContain("yeşil boyama yok");
    expect(spec).toContain("CLEARED");
    expect(spec).toContain("RELEASED");
    expect(spec).toContain("FREELANCER_RELEASE");

    expect(helper).toContain("clearSuccessfulPaymentOrder");
    expect(helper).toContain("issueCareerVisaStamp");
    expect(helper).not.toContain("LOCAL_MOCK_AUTH");

    expect(checkout).toContain("PAYTR_ALLOW_MOCK_CHECKOUT");
    expect(checkout).toContain("mockCheckout: true");
    expect(checkout).toContain("buildPaytrMockCheckoutToken");
    expect(checkout).toContain("assertPaytrProductionSafety");
  });

  it("mock checkout CREDIT yazmaz; üretimde sandbox/mock fail-closed durur", () => {
    const checkout = readSrc("lib/kernel/payments/paytr/checkout.ts");
    const webhook = readSrc("lib/kernel/payments/paytr/webhook.ts");
    const clearing = readSrc("lib/kernel/payments/clearing.ts");
    const route = readSrc("app/api/(kernel)/payments/webhooks/paytr/route.ts");
    expect(checkout).toContain("CREDIT yazmaz");
    expect(checkout).toContain("PAYTR_SANDBOX üretimde yasak");
    expect(webhook).toContain("verifyPaytrWebhookHash");
    expect(webhook).toContain("PAYTR_MERCHANT_SALT");
    expect(clearing).toContain("appendLedgerEntry");
    expect(clearing).toContain("wallet-top-up");
    const handler = route.slice(route.indexOf("export async function POST"));
    const verifyAt = handler.indexOf("verifyWebhook");
    const rejectedAt = handler.indexOf("paytr.webhook.rejected");
    const creditAt = handler.indexOf("clearSuccessfulPaymentOrder");
    expect(verifyAt).toBeGreaterThan(-1);
    expect(rejectedAt).toBeGreaterThan(verifyAt);
    expect(creditAt).toBeGreaterThan(rejectedAt);
    expect(readSrc("lib/kernel/payments/paytr/adapter.ts")).toContain("invalid_signature");
  });
});
