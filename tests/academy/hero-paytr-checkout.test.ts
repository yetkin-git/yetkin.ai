import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ACADEMY_HERO_PAYTR_EVENT } from "@/lib/academy/storefront-cta";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("Antre hero Eğitimi Satın Al — PayTR iFrame", () => {
  it("oturumlu hero hash kaydırmaz; token POST ve modal iFrame bağlar", () => {
    const hero = readSrc("components/academy/course-hero-actions.tsx");
    const purchase = readSrc("components/academy/purchase-button.tsx");
    const modal = readSrc("components/kernel/quick-top-up-modal.tsx");
    const page = readSrc("app/academy/[slug]/page.tsx");

    expect(ACADEMY_HERO_PAYTR_EVENT).toBe("yetkin:academy-hero-paytr");
    expect(hero).toContain("ACADEMY_HERO_PAYTR_EVENT");
    expect(hero).toContain("data-academy-hero-paytr");
    expect(hero).toContain("paytrCheckout");
    expect(page).toContain("paytrCheckout={Boolean(session) && hero.action === \"buy\" && paymentsReady}");

    expect(purchase).toContain("ACADEMY_HERO_PAYTR_EVENT");
    expect(purchase).toContain("/api/wallet/top-up");
    expect(purchase).toContain("console.error");
    expect(purchase).toContain("UX_SEN.topUp.iframeFailTitle");
    expect(purchase).toContain("presetIframeUrl");
    expect(purchase).toContain("presetBilling");
    expect(purchase).toContain("academyPaytrTopUpMinor");
    expect(purchase).toContain("ACADEMY_CHECKOUT_HASH");
    expect(purchase).toContain("data-checkout-tik-tak");
    expect(purchase).not.toContain("ctaTopUp");

    expect(modal).toContain("presetIframeUrl");
    expect(modal).toContain("presetBilling");
    expect(modal).toContain("tokenPending");
    expect(modal).toContain("data-paytr-iframe");
    expect(modal).toContain("data-paytr-iframe-only");
    expect(modal).toContain("console.error");
    expect(modal).toContain("iframeFailTitle");
    expect(modal).not.toContain("CheckoutBillingFields");
    expect(modal).not.toContain("CheckoutConsentFields");
  });

  it("hata kopyası Türkçe toast basar; siz kaçmaz", () => {
    expect(UX_SEN.topUp.iframeFailTitle).toBe("Ödeme ekranı açılamadı");
    expect(UX_SEN.topUp.fail).toBe("Yükleme başlatılamadı.");
    expect(UX_SEN.topUp.iframeFailTitle).not.toMatch(/bakiyeniz|onaylayın|ödeyin/i);
  });
});
