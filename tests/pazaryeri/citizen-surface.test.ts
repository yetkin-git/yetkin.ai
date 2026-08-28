import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PAZARYERI_SEN } from "@/archived/lib/copy/sen-voice/pazaryeri";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import {
  pazaryeriCitizenCashPhaseLabel,
  pazaryeriEscrowActiveStep,
  pazaryeriOfferStatusLabel,
  pazaryeriOrderCashPhases,
  pazaryeriOrderStatusLabel,
  pazaryeriSettlementActiveStep,
} from "@/archived/lib/copy/status-labels";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "İlanlarınız",
  "Siparişiniz",
  "cüzdanınız",
  "tezgâhınız",
  "giriş yapın",
  "yönetin",
  "yapın",
  "verin",
  "tutarınız",
];

const SEN_SURFACES = [
  "archived/app/pazaryeri/page.tsx",
  "archived/app/pazaryeri/[slug]/page.tsx",
  "archived/app/pazaryeri/tezgah/page.tsx",
  "archived/app/pazaryeri/siparisler/page.tsx",
  "archived/components/pazaryeri/stall-form.tsx",
  "archived/components/pazaryeri/purchase-button.tsx",
  "archived/components/pazaryeri/order-list.tsx",
  "archived/components/pazaryeri/product-list.tsx",
  "archived/components/pazaryeri/confirm-delivery-button.tsx",
  "archived/components/pazaryeri/offer-form.tsx",
  "archived/components/pazaryeri/offer-actions.tsx",
  "archived/components/pazaryeri/dual-cash-path-steps.tsx",
  "archived/lib/copy/sen-voice/pazaryeri.ts",
];

describe("Yetkinİlan vatandaş yüzeyi, çift nakit yolu ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = [
      "archived/app/pazaryeri/loading.tsx",
      "archived/app/pazaryeri/[slug]/loading.tsx",
      "archived/app/pazaryeri/tezgah/loading.tsx",
      "archived/app/pazaryeri/siparisler/loading.tsx",
      "archived/components/pazaryeri/pazaryeri-room-skeleton.tsx",
    ];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("archived/components/pazaryeri/pazaryeri-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("archived/app/pazaryeri/loading.tsx")).toContain("PazaryeriRoomSkeleton");
    expect(readSrc("archived/app/pazaryeri/loading.tsx")).not.toContain("use client");
    expect(readSrc("archived/app/pazaryeri/[slug]/loading.tsx")).not.toContain("use client");
    expect(readSrc("archived/app/pazaryeri/tezgah/loading.tsx")).not.toContain("use client");
    expect(readSrc("archived/app/pazaryeri/siparisler/loading.tsx")).not.toContain("use client");
  });

  it("/yetkinilan yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve çift nakit yolu bağlar", () => {
    expect(PAZARYERI_SEN.catalog.stallCta).toBe("Tezgâhı yönet");
    expect(PAZARYERI_SEN.catalog.description).toContain("anında bakiyeden transfer (Settlement)");
    expect(PAZARYERI_SEN.catalog.description).toContain("emanet korumasında kilit (Escrow Hold)");
    expect(PAZARYERI_SEN.offer.received).toBe("Teklif alındı.");
    expect(PAZARYERI_SEN.purchase.received).toBe("Sipariş alındı.");
    expect(PAZARYERI_SEN.stall.modelSettlement).toContain("Settlement");
    expect(PAZARYERI_SEN.stall.modelEscrow).toContain("Escrow Hold");
    expect(PAZARYERI_SEN.stall.modelVitrine).toContain("yalnız vitrindir");
    expect(HOLD_BPS_DEFAULT).toBe(1000);
    expect(PRICE_LOCK_GRACE_MINUTES).toBe(15);

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("archived/app/pazaryeri/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("archived/app/pazaryeri/page.tsx")).toContain("DualCashPathOverview");
    expect(readSrc("archived/app/pazaryeri/[slug]/page.tsx")).toContain("PurchaseButton");
    expect(readSrc("archived/app/pazaryeri/[slug]/page.tsx")).toContain("DualCashPathSteps");
    expect(readSrc("archived/app/pazaryeri/[slug]/page.tsx")).toContain("CashPhaseBadges");
    expect(readSrc("archived/app/pazaryeri/tezgah/page.tsx")).toContain("StallForm");
    expect(readSrc("archived/components/pazaryeri/stall-form.tsx")).toContain("modelSettlement");
    expect(readSrc("archived/components/pazaryeri/stall-form.tsx")).toContain("modelEscrow");
    expect(readSrc("archived/components/pazaryeri/stall-form.tsx")).toContain("modelVitrine");
    expect(readSrc("archived/app/pazaryeri/[slug]/page.tsx")).toContain("vitrineOnly");
    expect(readSrc("archived/components/pazaryeri/purchase-button.tsx")).toContain("aria-live");
    expect(readSrc("archived/components/pazaryeri/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/components/pazaryeri/confirm-delivery-button.tsx")).toContain("aria-live");
    expect(readSrc("archived/lib/pazaryeri/engine.ts")).not.toContain("tezgâhınız");
    expect(readSrc("archived/lib/pazaryeri/offer-engine.ts")).not.toContain("siparişiniz");
    expect(readSrc("archived/lib/pazaryeri/offer-engine.ts")).not.toContain("ilanınıza");
  });

  it("sipariş durumları PENDING/PAID/CLEARED/CANCELLED vatandaşa dürüst yansır", () => {
    expect(pazaryeriOrderStatusLabel("SETTLED")).toContain("Settlement");
    expect(pazaryeriOrderStatusLabel("AWAITING_DELIVERY")).toContain("Escrow Hold");
    expect(pazaryeriOrderStatusLabel("DELIVERED")).toContain("Teslimat onayında");
    expect(pazaryeriOrderStatusLabel("REFUNDED")).toBe("İade");
    expect(pazaryeriOrderCashPhases("SETTLED")).toEqual(["PAID", "CLEARED"]);
    expect(pazaryeriOrderCashPhases("AWAITING_DELIVERY")).toEqual(["PAID", "PENDING"]);
    expect(pazaryeriOrderCashPhases("DELIVERED")).toEqual(["PAID", "CLEARED"]);
    expect(pazaryeriOrderCashPhases("REFUNDED")).toEqual(["CANCELLED"]);
    expect(pazaryeriCitizenCashPhaseLabel("PENDING")).toContain("emanet kilitli");
    expect(pazaryeriCitizenCashPhaseLabel("PAID")).toContain("bakiyeden düştü");
    expect(pazaryeriCitizenCashPhaseLabel("CLEARED")).toContain("aktarım tamam");
    expect(pazaryeriCitizenCashPhaseLabel("CANCELLED")).toContain("iade");
    expect(pazaryeriSettlementActiveStep("SETTLED")).toBe("cleared");
    expect(pazaryeriEscrowActiveStep("AWAITING_DELIVERY")).toBe("hold");
    expect(pazaryeriEscrowActiveStep("DELIVERED")).toBe("release");
    expect(pazaryeriOfferStatusLabel("ACCEPTED")).toContain("emanet kilit");

    const settlement = PAZARYERI_SEN.paths.settlementSteps(PRICE_LOCK_GRACE_MINUTES);
    expect(settlement[1]?.label).toContain("anında bakiyeden transfer (Settlement)");
    const escrow = PAZARYERI_SEN.paths.escrowSteps(PRICE_LOCK_GRACE_MINUTES, HOLD_BPS_DEFAULT / 100);
    expect(escrow[1]?.label).toContain("Emanet korumasında kilit (Escrow Hold)");
    expect(escrow[2]?.label).toBe("Teslimat onayında aktarım");
  });
});
