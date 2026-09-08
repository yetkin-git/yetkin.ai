import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CHECKOUT_BILLING_COPY } from "@/lib/kernel/identity/billing-info";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Tik-Tak-Öde kasa yüzeyi", () => {
  it("fatura ve rıza tek yerde toplanır; modal yalnız PayTR iFrame basar", () => {
    const purchase = readSrc("components/academy/purchase-button.tsx");
    const modal = readSrc("components/kernel/quick-top-up-modal.tsx");
    const fields = readSrc("components/legal/checkout-billing-fields.tsx");
    const hook = readSrc("components/legal/use-checkout-billing.ts");

    expect(purchase.indexOf("CheckoutConsentFields")).toBeLessThan(purchase.indexOf("data-checkout-pay-cta"));
    expect(purchase).toContain("startPaytrCheckout");
    expect(purchase).toContain("revealCheckoutGap");
    expect(purchase).not.toContain("ctaTopUp");

    expect(modal).toContain("data-paytr-iframe-only");
    expect(modal).toContain("presetBilling");
    expect(modal).not.toContain("CheckoutBillingFields");
    expect(modal).not.toContain("CheckoutConsentFields");
    expect(modal).not.toContain("amountLabel");

    expect(fields).not.toContain("copy.tckn");
    expect(fields).toContain("data-checkout-billing-collapsed");
    expect(CHECKOUT_BILLING_COPY).not.toHaveProperty("tckn");
    expect(CHECKOUT_BILLING_COPY).not.toHaveProperty("tcknHint");
    expect(hook).toContain("hydrated");
  });
});
