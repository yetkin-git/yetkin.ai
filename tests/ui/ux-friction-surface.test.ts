import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "bakiyeniz",
  "cüzdanınız",
  "yapın",
  "yükleyin",
  "onaylayın",
  "kullanabilirsiniz",
  "dönebilirsiniz",
];

const SURFACES = [
  "lib/copy/sen-voice/ux.ts",
  "components/ui/action-bridge.tsx",
  "components/kernel/quick-top-up-modal.tsx",
  "components/freelancer/delivery-hero-card.tsx",
  "components/freelancer/accept-bid-button.tsx",
  "components/academy/purchase-button.tsx",
  "components/academy/exam-panel.tsx",
  "components/studio/generate-panel.tsx",
  "components/devlabs/code-bench-panel.tsx",
  "components/shell/shell-chrome.tsx",
  "app/freelancer/contracts/[id]/page.tsx",
];

describe("UI/UX sürtünme giderme yüzeyi", () => {
  it("üç P0 bileşen dosyası ve ActionBridge kabuğu durur", () => {
    expect(existsSync(join(ROOT, "components/ui/action-bridge.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "components/kernel/quick-top-up-modal.tsx"))).toBe(true);
    expect(existsSync(join(ROOT, "components/freelancer/delivery-hero-card.tsx"))).toBe(true);
    expect(readSrc("components/shell/shell-chrome.tsx")).toContain("ActionBridgeProvider");
    expect(readSrc("components/kernel/quick-top-up-modal.tsx")).toContain("/api/wallet/top-up");
    expect(readSrc("components/kernel/quick-top-up-modal.tsx")).toContain("fetchWalletStripClient");
    expect(readSrc("components/kernel/quick-top-up-modal.tsx")).toContain("suggestQuickTopUpAmountMinor");
    expect(readSrc("components/kernel/quick-top-up-modal.tsx")).not.toContain("CREDIT yaz");
  });

  it("SEN aksı siz kaçakları taşımaz; köprü metinleri sen dilindedir", () => {
    expect(SEN_VOICE.ux.bridge.examPassed.cta).toBe("İlanlara teklif ver");
    expect(SEN_VOICE.ux.topUp.trigger).toBe("Eksik tutarı yükle");
    expect(SEN_VOICE.ux.delivery.release("₺100,00")).toContain("serbest bırak");
    for (const file of SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
  });

  it("yetersiz bakiyede /cuzdan yönlendirmesi yerine modal açılır", () => {
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("isInsufficientBalanceError");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/pazaryeri/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/studio/generate-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/studio/image-generate-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("components/devlabs/code-bench-panel.tsx")).toContain("QuickTopUpModal");
    expect(isInsufficientBalanceError("Yetersiz bakiye. Teklif kabul edilemez.")).toBe(true);
  });

  it("sınav geçişi freelancer köprüsünü ve teslim kahraman kartını bağlar", () => {
    expect(readSrc("components/academy/exam-panel.tsx")).toContain("UX_SEN.bridge.examPassed");
    expect(readSrc("components/academy/exam-panel.tsx")).toContain("UX_SEN.bridge.examHref");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("DeliveryHeroCard");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("pickLatestDeliveryMessage");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("aria-live");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("delivery-hero-glow");
    expect(readSrc("components/ui/action-bridge.tsx")).toContain("aria-live");
  });
});
