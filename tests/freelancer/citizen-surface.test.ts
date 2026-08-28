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
  "components/freelancer/job-filter-bar.tsx",
  "components/freelancer/contract-actions.tsx",
  "components/freelancer/dispute-console.tsx",
  "components/freelancer/squad-panel.tsx",
  "components/freelancer/squad-teaser.tsx",
  "components/freelancer/squad-create-button.tsx",
  "components/freelancer/standalone-squad-modal.tsx",
  "components/freelancer/direct-job-offer-modal.tsx",
  "components/freelancer/direct-job-offer-button.tsx",
  "components/freelancer/direct-offer-inbox.tsx",
  "components/freelancer/usta-expertise-list.tsx",
  "components/freelancer/contract-chat-console.tsx",
  "components/freelancer/revision-tracker.tsx",
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
    expect(SEN_VOICE.freelancer.catalog.description).toContain(
      "İlan, teklif, mesajlaşma çalışır",
    );
    expect(SEN_VOICE.freelancer.catalog.description).toContain("503 Service Unavailable");
    expect(SEN_VOICE.freelancer.catalog.description).toContain("Cüzdan ile fonlanmaz");
    expect(SEN_VOICE.freelancer.catalog.description).toContain("yetkin.ai cüzdanına yazılmaz");
    expect(SEN_VOICE.freelancer.catalog.description).toContain("İtiraz durumunda tahkim süreci işler");
    expect(SEN_VOICE.freelancer.create.description).toContain("ödeme kuruluşunda");
    expect(SEN_VOICE.freelancer.create.description).toContain("503");
    expect(SEN_VOICE.freelancer.create.description).not.toContain("cüzdanda kilitlenir");
    expect(SEN_VOICE.freelancer.accept.cta).not.toContain("bakiyeyi kilitle");
    expect(SEN_VOICE.freelancer.accept.paymentsClosedBody).toContain("503 Service Unavailable");
    expect(SEN_VOICE.freelancer.accept.paymentsClosedBody).toContain("sahte CREDIT yazılmaz");
    expect(SEN_VOICE.freelancer.stats.escrowHint).not.toMatch(/bakiye kilitlidir/i);
    expect(SEN_VOICE.freelancer.bid.received).toBe("Teklif alındı.");
    expect(HOLD_BPS_DEFAULT).toBe(1000);

    for (const file of SEN_SURFACES) {
      const source = readSrc(file);
      for (const leak of SIZ_LEAKS) {
        expect(source, `${file} → ${leak}`).not.toContain(leak);
      }
    }
    expect(readSrc("app/freelancer/page.tsx")).toContain("SEN_VOICE");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("SquadCreateButton");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("DirectOfferInbox");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("UstaExpertiseList");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("StatInlineBar");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("StatGrid");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("SquadTeaser");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("eyebrow");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("unbound");
    expect(readSrc("app/freelancer/page.tsx")).toContain("stats.open(live.length)");
    expect(readSrc("app/freelancer/page.tsx")).toContain("paymentsClosedBody");
    expect(existsSync(join(ROOT, "app/freelancer/error.tsx"))).toBe(true);
    expect(readSrc("app/freelancer/error.tsx")).toContain("retry");
    expect(SEN_VOICE.freelancer.stats.escrowInline).toBe("Emanet Korumalı");
    expect(SEN_VOICE.freelancer.stats.pathInline).toBe("3 Adımda Teslim");
    expect(SEN_VOICE.freelancer.stats.revisionInline).toBe("3 Revizyon Hakkı");
    expect(SEN_VOICE.freelancer.stats.open(0)).toBe("0 Açık İlan");
    expect(SEN_VOICE.freelancer.directOffer.buttonCta).toBe("Doğrudan İş Teklifi Et");
    expect(SEN_VOICE.freelancer.directOffer.honestyNote).toBe(
      "Bu teklif doğrudan usta cüzdanına ve tezgâhına özel olarak iletilir. Kabul durumunda tutar ödeme kuruluşunda kilitlenir.",
    );
    expect(SEN_VOICE.freelancer.directOffer.declineCta).toBe("Teklifi reddet");
    expect(SEN_VOICE.freelancer.directOffer.holdWarning).toContain("PayTR Split");
    expect(SEN_VOICE.freelancer.list.clearFiltersCta).toBe("Süzgeçleri temizle");
    expect(SEN_VOICE.freelancer.job.loginCta).toBe("Giriş Yap");
    expect(SEN_VOICE.freelancer.job.visaCta).toBe("Kariyer Vize Defteri'ne Git");
    expect(readSrc("components/freelancer/direct-job-offer-modal.tsx")).toContain("honestyNote");
    expect(readSrc("components/freelancer/direct-job-offer-button.tsx")).toContain("DirectJobOfferModal");
    expect(readSrc("components/freelancer/direct-job-offer-button.tsx")).toContain("buttonCta");
    expect(readSrc("components/freelancer/usta-expertise-list.tsx")).toContain("DirectJobOfferButton");
    expect(readSrc("components/freelancer/direct-offer-inbox.tsx")).toContain("acceptCta");
    expect(readSrc("components/freelancer/direct-offer-inbox.tsx")).toContain("declineCta");
    expect(readSrc("components/freelancer/direct-offer-inbox.tsx")).toContain("holdWarning");
    expect(readSrc("components/freelancer/job-list.tsx")).toContain("clearFiltersCta");
    expect(readSrc("components/freelancer/job-list.tsx")).toContain("FreelancerJobCard");
    expect(readSrc("components/freelancer/job-card.tsx")).toContain("footerBadge");
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("line-clamp-2");
    expect(readSrc("components/showcase/listing-card.tsx")).toContain("footerBadge");
    expect(readSrc("components/freelancer/job-list.tsx")).not.toContain("QuietLuxuryJobBadges");
    expect(readSrc("components/freelancer/job-list.tsx")).not.toContain("lockLabel");
    expect(readSrc("components/freelancer/job-card.tsx")).not.toContain("lockLabel");
    expect(readSrc("components/freelancer/job-card.tsx")).not.toContain("extraBadge");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("LinkButton");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("visaCta");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("loginCta");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).not.toContain("hover:underline");
    expect(readSrc("app/api/freelancer/direct-offers/route.ts")).toContain("createDirectFreelancerOffer");
    expect(readSrc("app/api/freelancer/direct-offers/[id]/accept/route.ts")).toContain(
      "acceptDirectFreelancerOffer",
    );
    expect(readSrc("app/api/freelancer/direct-offers/[id]/decline/route.ts")).toContain(
      "declineDirectFreelancerOffer",
    );
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("EscrowHoldSteps");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("AcceptBidButton");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).not.toContain("SquadTeaser");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("ListingVisaScopeSign");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("listingVisa.message");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("EscrowHoldSteps");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("DeliveryHeroCard");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("<details");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("advancedSummary");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("DisputeConsole");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("SquadPanel");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("{board.squad ?");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("ContractChatConsole");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("RevisionTracker");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("freelancerDisputeRoundStatusLabel");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("holdNotice");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("aria-live");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("Idempotency");
    expect(readSrc("components/freelancer/contract-actions.tsx")).toContain("isPaymentsUnconfiguredError");
    expect(readSrc("components/freelancer/revision-tracker.tsx")).toContain("isPaymentsUnconfiguredError");
    expect(readSrc("components/freelancer/bid-form.tsx")).toContain("bidAsTeamToggle");
    expect(readSrc("components/freelancer/bid-form.tsx")).toContain("readyPickLabel");
    expect(readSrc("components/freelancer/bid-form.tsx")).toContain("freeBidNote");
    expect(readSrc("components/freelancer/bid-form.tsx")).toContain("subscribeStandaloneSquads");
    const bidForm = readSrc("components/freelancer/bid-form.tsx");
    expect(bidForm.indexOf("{copy.amountLabel}")).toBeLessThan(bidForm.indexOf("{squadCopy.bidAsTeamToggle}"));
    expect(readSrc("components/freelancer/contract-chat-console.tsx")).toContain("evidenceNote");
    expect(readSrc("components/freelancer/revision-tracker.tsx")).toContain("requestCta");
    expect(readSrc("components/freelancer/revision-tracker.tsx")).toContain("releaseCta");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("revisionInline");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("escrowInline");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("FREELANCER_SEN");
    expect(SEN_VOICE.freelancer.bid.freeBidNote).toContain("ücretsiz");
    expect(SEN_VOICE.freelancer.bid.freeBidNote).toContain("Kariyer Vizesi");
    expect(SEN_VOICE.freelancer.chat.evidenceNote).toContain("AI Bilirkişi");
    expect(SEN_VOICE.freelancer.revision.releaseCta).toBe("Teslimatı Onayla & Hakedişi Aktar");
    expect(SEN_VOICE.freelancer.revision.requestCta).toBe("Revizyon İstiyorum");
    expect(readSrc("components/freelancer/squad-panel.tsx")).toContain("paytrNote");
    expect(readSrc("components/freelancer/squad-teaser.tsx")).toContain("paytrNote");
    expect(readSrc("components/freelancer/squad-teaser.tsx")).toContain("teaserTitle");
    expect(readSrc("components/freelancer/squad-teaser.tsx")).toContain("teaserCreateCta");
    expect(readSrc("components/freelancer/squad-teaser.tsx")).toContain("StandaloneSquadModal");
    expect(readSrc("components/freelancer/squad-create-button.tsx")).toContain("StandaloneSquadModal");
    expect(readSrc("components/freelancer/squad-create-button.tsx")).toContain("teaserCreateCta");
    expect(readSrc("components/freelancer/squad-create-button.tsx")).toContain('variant="outline"');
    expect(readSrc("app/freelancer/page.tsx")).toContain('variant="primary"');
    expect(SEN_VOICE.freelancer.list.openCta).toBe("İlanı İncele");
    expect(SEN_VOICE.freelancer.list.inspectBidCta).toBe("İncele / Teklif Ver");
    expect(readSrc("components/freelancer/job-card.tsx")).toContain("copy.list.openCta");
    expect(readSrc("components/freelancer/job-list.tsx")).toContain("copy.catalog.createCta");
    expect(readSrc("components/freelancer/job-list.tsx")).toContain('href="/freelancer/new"');
    expect(readSrc("components/freelancer/job-list.tsx")).not.toContain("FREELANCER_SHOWCASE");
    expect(readSrc("components/freelancer/job-list.tsx")).not.toContain("örnek düzen");
    expect(SEN_VOICE.freelancer.catalog.unbound).not.toContain("örnek düzen");
    expect(SEN_VOICE.freelancer.list.emptyHint).not.toContain("temsili");
    expect(SEN_VOICE.freelancer.list.emptyHint).not.toContain("vitrin");
    expect(readSrc("components/freelancer/standalone-squad-modal.tsx")).toContain("honestyNote");
    expect(readSrc("components/freelancer/standalone-squad-modal.tsx")).toContain("modalSave");
    expect(readSrc("components/freelancer/dispute-console.tsx")).toContain("legalNote");
    expect(SEN_VOICE.freelancer.squad.paytrNote).toContain("IBAN");
    expect(SEN_VOICE.freelancer.squad.paytrNote).toContain("PayTR Split");
    expect(SEN_VOICE.freelancer.squad.teaserBody).toContain("PayTR Split");
    expect(SEN_VOICE.freelancer.squad.honestyNote).toContain("ön gruptur");
    expect(SEN_VOICE.freelancer.squad.honestyNote).toContain("PayTR Split");
    expect(SEN_VOICE.freelancer.squad.honestyNote).toContain("Sanal kasa");
    expect(SEN_VOICE.freelancer.squad.teaserCreateCta).toBe("Takım / Squad Kur");
    expect(SEN_VOICE.freelancer.squad.readyPickLabel).toBe("Hazır Takımlarımdan Seç");
    expect(SEN_VOICE.freelancer.dispute.legalNote).toContain("dostane tavsiye");
    expect(SEN_VOICE.freelancer.dispute.title).toContain("AI Bilirkişi");
    expect(readSrc("lib/freelancer/engine.ts")).not.toContain("verdiniz");
  });

  it("emanet ve tahkim etiketleri vatandaşa dürüst yansır", () => {
    expect(escrowHoldStatusLabel("PENDING")).toBe("Ödeme kuruluşunda kilitli");
    expect(escrowHoldStatusLabel("RELEASED")).toBe("Teslim onayı ile aktarıldı");
    expect(freelancerContractStatusLabel("FUNDED")).toBe("Ödeme kuruluşunda kilitli");
    expect(freelancerContractStatusLabel("RELEASED")).toBe("Teslim onayı ile aktarıldı");
    expect(freelancerContractStatusLabel("DISPUTED")).toBe("Tahkimde");
    expect(freelancerDisputeRoundStatusLabel("ROUND_ONE_SUBMITTED")).toBe(
      "1. tur — cevap bekleniyor",
    );
    expect(freelancerDisputeRoundStatusLabel("ROUND_TWO_SUBMITTED")).toBe(
      "1. tur — AI analizi üretiliyor",
    );
    expect(freelancerDisputeRoundStatusLabel("AI_REPORT_READY")).toBe("1. tur AI analizi hazır");
    expect(freelancerDisputeRoundStatusLabel("HUMAN_REVIEW")).toContain("emanet kilitli kalır");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.claim).toBe("İddia");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.answer).toBe("Cevap");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.aiRoundOne).toBe("1. Tur AI Analizi");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.appealClaim).toBe("Ek İddia / İtiraz");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.appealAnswer).toBe("Ek Cevap");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.aiFinal).toBe("Nihai AI Analizi");
    expect(readSrc("components/freelancer/dispute-console.tsx")).toContain("r1_claim");
    expect(readSrc("components/freelancer/dispute-console.tsx")).toContain("r2_ai");
    expect(freelancerMessageKindLabel("DELIVERY")).toBe("Teslim");
    expect(freelancerMessageKindLabel("REVISION")).toBe("Revizyon");
    expect(escrowHoldActiveStep({ contractStatus: "FUNDED", holdStatus: "PENDING" })).toBe("hold");
    expect(escrowHoldActiveStep({ contractStatus: "RELEASED", holdStatus: "RELEASED" })).toBe("release");
    expect(escrowHoldActiveStep({ contractStatus: "DISPUTED", holdStatus: "PENDING" })).toBe("dispute");

    const steps = SEN_VOICE.freelancer.escrow.steps(HOLD_BPS_DEFAULT / 100);
    expect(steps[0]?.detail).toContain("yetkin.ai cüzdanından düşülmez");
    expect(steps[1]?.detail).toContain("yetkin.ai cüzdanına yazılmaz");
    expect(steps[1]?.label).toBe("Teslim onayı ile aktarılır");
    expect(steps[2]?.label).toBe("İtiraz durumunda tahkim süreci işler");
  });
});
