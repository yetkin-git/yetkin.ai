import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { PRICE_LOCK_GRACE_MINUTES } from "@/lib/kernel/pricing/price-lock";
import {
  pazaryeriCitizenCashPhaseLabel,
  pazaryeriEscrowActiveStep,
  pazaryeriOfferStatusLabel,
  pazaryeriOrderCashPhases,
  pazaryeriOrderStatusLabel,
  pazaryeriSettlementActiveStep,
} from "@/lib/copy/status-labels";

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
  "app/pazaryeri/page.tsx",
  "app/pazaryeri/[slug]/page.tsx",
  "app/pazaryeri/tezgah/page.tsx",
  "app/pazaryeri/siparisler/page.tsx",
  "components/pazaryeri/stall-form.tsx",
  "components/pazaryeri/purchase-button.tsx",
  "components/pazaryeri/order-list.tsx",
  "components/pazaryeri/product-list.tsx",
  "components/pazaryeri/confirm-delivery-button.tsx",
  "components/pazaryeri/offer-form.tsx",
  "components/pazaryeri/offer-actions.tsx",
  "components/pazaryeri/dual-cash-path-steps.tsx",
  "lib/copy/sen-voice/pazaryeri.ts",
];

describe("Yetkinİlan vatandaş yüzeyi, çift nakit yolu ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = [
      "app/pazaryeri/loading.tsx",
      "app/pazaryeri/[slug]/loading.tsx",
      "app/pazaryeri/tezgah/loading.tsx",
      "app/pazaryeri/siparisler/loading.tsx",
      "components/pazaryeri/pazaryeri-room-skeleton.tsx",
    ];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("components/pazaryeri/pazaryeri-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("app/pazaryeri/loading.tsx")).toContain("PazaryeriRoomSkeleton");
    expect(readSrc("app/pazaryeri/loading.tsx")).not.toContain("use client");
    expect(readSrc("app/pazaryeri/[slug]/loading.tsx")).not.toContain("use client");
    expect(readSrc("app/pazaryeri/tezgah/loading.tsx")).not.toContain("use client");
    expect(readSrc("app/pazaryeri/siparisler/loading.tsx")).not.toContain("use client");
  });

  it("/yetkinilan yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve çift nakit yolu bağlar", () => {
    expect(SEN_VOICE.pazaryeri.catalog.stallCta).toBe("Tezgâhı yönet");
    expect(SEN_VOICE.pazaryeri.catalog.description).toContain("anında bakiyeden transfer (Settlement)");
    expect(SEN_VOICE.pazaryeri.catalog.description).toContain("emanet korumasında kilit (Escrow Hold)");
    expect(SEN_VOICE.pazaryeri.offer.received).toBe("Teklif alındı.");
    expect(SEN_VOICE.pazaryeri.purchase.received).toBe("Sipariş alındı.");
    expect(SEN_VOICE.pazaryeri.stall.modelSettlement).toContain("Settlement");
    expect(SEN_VOICE.pazaryeri.stall.modelEscrow).toContain("Escrow Hold");
    expect(SEN_VOICE.pazaryeri.stall.modelVitrine).toContain("yalnız vitrindir");
    expect(HOLD_BPS_DEFAULT).toBe(1000);
    expect(PRICE_LOCK_GRACE_MINUTES).toBe(15);

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/pazaryeri/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/pazaryeri/page.tsx")).toContain("DualCashPathOverview");
    expect(readSrc("app/pazaryeri/[slug]/page.tsx")).toContain("PurchaseButton");
    expect(readSrc("app/pazaryeri/[slug]/page.tsx")).toContain("DualCashPathSteps");
    expect(readSrc("app/pazaryeri/[slug]/page.tsx")).toContain("CashPhaseBadges");
    expect(readSrc("app/pazaryeri/tezgah/page.tsx")).toContain("StallForm");
    expect(readSrc("components/pazaryeri/stall-form.tsx")).toContain("modelSettlement");
    expect(readSrc("components/pazaryeri/stall-form.tsx")).toContain("modelEscrow");
    expect(readSrc("components/pazaryeri/stall-form.tsx")).toContain("modelVitrine");
    expect(readSrc("app/pazaryeri/[slug]/page.tsx")).toContain("vitrineOnly");
    expect(readSrc("components/pazaryeri/purchase-button.tsx")).toContain("aria-live");
    expect(readSrc("components/pazaryeri/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/pazaryeri/confirm-delivery-button.tsx")).toContain("aria-live");
    expect(readSrc("lib/pazaryeri/engine.ts")).not.toContain("tezgâhınız");
    expect(readSrc("lib/pazaryeri/offer-engine.ts")).not.toContain("siparişiniz");
    expect(readSrc("lib/pazaryeri/offer-engine.ts")).not.toContain("ilanınıza");
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

    const settlement = SEN_VOICE.pazaryeri.paths.settlementSteps(PRICE_LOCK_GRACE_MINUTES);
    expect(settlement[1]?.label).toContain("anında bakiyeden transfer (Settlement)");
    const escrow = SEN_VOICE.pazaryeri.paths.escrowSteps(PRICE_LOCK_GRACE_MINUTES, HOLD_BPS_DEFAULT / 100);
    expect(escrow[1]?.label).toContain("Emanet korumasında kilit (Escrow Hold)");
    expect(escrow[2]?.label).toBe("Teslimat onayında aktarım");
  });
});
