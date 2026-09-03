import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { railCitizenHttpError } from "@/lib/copy/sen-voice/ux";
import { isInsufficientBalanceError } from "@/lib/kernel/money/insufficient-balance";
import { WEB_ORIGIN_FORBIDDEN } from "@/lib/kernel/security/origin-guard";

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
  "archived/components/studio/generate-panel.tsx",
  "archived/components/devlabs/code-bench-panel.tsx",
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
    expect(SEN_VOICE.ux.bridge.examPassed.cta).toBe("Sertifikanı gör");
    expect(SEN_VOICE.ux.topUp.trigger).toBe("Eksik tutarı yükle");
    expect(SEN_VOICE.ux.topUp.mockNoCredit).toContain("Yerel mock bakiyeye düşmez");
    expect(SEN_VOICE.ux.delivery.releaseFrozen("₺100,00")).toContain("henüz yazılmaz");
    for (const file of SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
  });

  it("yetersiz bakiyede /cuzdan yönlendirmesi yerine modal açılır", () => {
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).not.toContain("QuickTopUpModal");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).not.toContain("isInsufficientBalanceError");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/components/pazaryeri/purchase-button.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/components/studio/generate-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/components/studio/image-generate-panel.tsx")).toContain("QuickTopUpModal");
    expect(readSrc("archived/components/devlabs/code-bench-panel.tsx")).toContain("QuickTopUpModal");
    expect(isInsufficientBalanceError("Yetersiz bakiye. Teklif kabul edilemez.")).toBe(true);
  });

  it("sınav geçişi belge ve kariyer köprüsünü ve teslim kahraman kartını bağlar", () => {
    expect(readSrc("components/academy/exam-panel.tsx")).toContain("UX_SEN.bridge.examPassed");
    expect(readSrc("components/academy/exam-panel.tsx")).toContain("UX_SEN.bridge.examHref");
    expect(readSrc("components/academy/exam-panel.tsx")).toContain("onAbandon");
    expect(readSrc("components/academy/exam-start-gate.tsx")).toContain("data-academy-exam-exit");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("DeliveryHeroCard");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("pickLatestDeliveryMessage");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("aria-live");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("delivery-hero-glow");
    expect(readSrc("components/ui/action-bridge.tsx")).toContain("aria-live");
  });

  it("401 ve origin 403 vatandaş cümlesine düşer; API zarfı değişmez", () => {
    expect(SEN_VOICE.ux.http.sessionExpired).toContain("Oturum süresi doldu");
    expect(SEN_VOICE.ux.http.originDenied).toContain("Çapraz kökenli");
    expect(SEN_VOICE.ux.http.serviceUnavailable).toContain("Hizmet geçici olarak kapalı");
    expect(railCitizenHttpError(401, "Oturum gerekli.")).toBe(SEN_VOICE.ux.http.sessionExpired);
    expect(railCitizenHttpError(403, WEB_ORIGIN_FORBIDDEN)).toBe(SEN_VOICE.ux.http.originDenied);
    expect(railCitizenHttpError(503, null)).toBe(SEN_VOICE.ux.http.serviceUnavailable);
    expect(railCitizenHttpError(503, "Ödeme henüz bağlanmadı")).toBe("Ödeme henüz bağlanmadı");
    expect(railCitizenHttpError(403, "Nitelikli ilana teklif için geçerli Kariyer Vizesi")).toContain(
      "Kariyer Vizesi",
    );
    expect(readSrc("components/ui/use-citizen-write-feedback.ts")).toContain("citizenHttpToastKind");
    expect(readSrc("components/academy/purchase-button.tsx")).toContain("useCitizenWriteFeedback");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("useCitizenWriteFeedback");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("isPaymentsUnconfiguredError");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("paymentsClosed");
    expect(readSrc("components/ui/forbidden.tsx")).toContain("UX_SEN.http.forbidden");
    expect(readSrc("components/ui/forbidden.tsx")).not.toContain(">Forbidden<");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("bidsHidden");
    expect(readSrc("archived/app/arena/[id]/page.tsx")).toContain("FrozenRoomGonePage");
    expect(readSrc("lib/copy/sen-voice/freelancer.ts")).toContain("yalnız ilan sahibine açıktır");
    expect(readSrc("archived/lib/copy/sen-voice/arena.ts")).not.toContain("Güvenli kuyruk");
  });
});
