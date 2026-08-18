import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import {
  escrowHoldActiveStep,
  escrowHoldStatusLabel,
  freelancerContractStatusLabel,
  freelancerDisputeRoundStatusLabel,
  freelancerMessageKindLabel,
} from "@/lib/copy/status-labels";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

const SIZ_LEAKS = [
  "İlanınız",
  "Başvurunuz",
  "ödemeniz",
  "verin",
  "kabul edin",
  "iddianız",
  "verdiniz",
  "oluşturun",
  "yapın",
];

const SEN_SURFACES = [
  "app/freelancer/page.tsx",
  "app/freelancer/new/page.tsx",
  "app/freelancer/jobs/[id]/page.tsx",
  "app/freelancer/contracts/[id]/page.tsx",
  "components/freelancer/accept-bid-button.tsx",
  "components/freelancer/bid-form.tsx",
  "components/freelancer/job-create-form.tsx",
  "components/freelancer/job-list.tsx",
  "components/freelancer/contract-actions.tsx",
  "components/freelancer/dispute-console.tsx",
  "components/freelancer/contract-message-thread.tsx",
  "components/freelancer/delivery-hero-card.tsx",
  "components/freelancer/escrow-hold-steps.tsx",
  "lib/copy/sen-voice/freelancer.ts",
];

describe("freelancer vatandaş yüzeyi, emanet mühürü ve SEN aksı", () => {
  it("oda loading.tsx iskeleti izomorftur (CLS)", () => {
    const files = [
      "app/freelancer/loading.tsx",
      "app/freelancer/new/loading.tsx",
      "app/freelancer/jobs/[id]/loading.tsx",
      "app/freelancer/contracts/[id]/loading.tsx",
      "components/freelancer/freelancer-room-skeleton.tsx",
    ];
    for (const file of files) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
    const skeleton = readSrc("components/freelancer/freelancer-room-skeleton.tsx");
    expect(skeleton).toContain("animate-pulse");
    expect(skeleton).toContain("variant");
    expect(skeleton).not.toContain("use client");
    expect(readSrc("app/freelancer/loading.tsx")).toContain("FreelancerRoomSkeleton");
    expect(readSrc("app/freelancer/loading.tsx")).not.toContain("use client");
    expect(readSrc("app/freelancer/jobs/[id]/loading.tsx")).not.toContain("use client");
    expect(readSrc("app/freelancer/contracts/[id]/loading.tsx")).not.toContain("use client");
  });

  it("/freelancer yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve emanet mühürü bağlar", () => {
    expect(SEN_VOICE.freelancer.catalog.createCta).toBe("İlan oluştur");
    expect(SEN_VOICE.freelancer.catalog.description).toContain("Bakiye kilitlidir");
    expect(SEN_VOICE.freelancer.catalog.description).toContain("Teslim onayı ile aktarılır");
    expect(SEN_VOICE.freelancer.catalog.description).toContain("İtiraz durumunda tahkim süreci işler");
    expect(SEN_VOICE.freelancer.bid.received).toBe("Teklif alındı.");
    expect(HOLD_BPS_DEFAULT).toBe(1000);

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/freelancer/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("EscrowHoldSteps");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("AcceptBidButton");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("EscrowHoldSteps");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("DeliveryHeroCard");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("freelancerDisputeRoundStatusLabel");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("holdNotice");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("aria-live");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("Idempotency");
    expect(readSrc("lib/freelancer/engine.ts")).not.toContain("verdiniz");
  });

  it("emanet ve tahkim etiketleri vatandaşa dürüst yansır", () => {
    expect(escrowHoldStatusLabel("PENDING")).toBe("Bakiye kilitli");
    expect(escrowHoldStatusLabel("RELEASED")).toBe("Teslim onayı ile aktarıldı");
    expect(freelancerContractStatusLabel("FUNDED")).toBe("Bakiye kilitli");
    expect(freelancerContractStatusLabel("RELEASED")).toBe("Teslim onayı ile aktarıldı");
    expect(freelancerContractStatusLabel("DISPUTED")).toBe("Tahkimde");
    expect(freelancerDisputeRoundStatusLabel("ROUND_ONE_SUBMITTED")).toBe(
      "1. tur doldu — karşı cevap bekleniyor",
    );
    expect(freelancerDisputeRoundStatusLabel("ROUND_TWO_SUBMITTED")).toBe(
      "2. tur doldu — bilirkişi raporu bekleniyor",
    );
    expect(freelancerDisputeRoundStatusLabel("AI_REPORT_READY")).toBe("Bilirkişi raporu hazır");
    expect(freelancerDisputeRoundStatusLabel("HUMAN_REVIEW")).toContain("emanet kilitli kalır");
    expect(freelancerMessageKindLabel("DELIVERY")).toBe("Teslim");
    expect(freelancerMessageKindLabel("REVISION")).toBe("Revizyon");
    expect(escrowHoldActiveStep({ contractStatus: "FUNDED", holdStatus: "PENDING" })).toBe("hold");
    expect(escrowHoldActiveStep({ contractStatus: "RELEASED", holdStatus: "RELEASED" })).toBe("release");
    expect(escrowHoldActiveStep({ contractStatus: "DISPUTED", holdStatus: "PENDING" })).toBe("dispute");

    const steps = SEN_VOICE.freelancer.escrow.steps(HOLD_BPS_DEFAULT / 100);
    expect(steps[0]?.detail).toContain("Bakiye kilitlidir");
    expect(steps[1]?.label).toBe("Teslim onayı ile aktarılır");
    expect(steps[2]?.label).toBe("İtiraz durumunda tahkim süreci işler");
  });
});
