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
  "components/freelancer/delivery-process-panel.tsx",
  "components/freelancer/escrow-hold-steps.tsx",
  "lib/copy/sen-voice/freelancer.ts",
  "lib/freelancer/listing-face.ts",
  "lib/freelancer/job-listing-extras.ts",
];

describe("freelancer vatandaş yüzeyi, güvenli ödeme ve SEN aksı", () => {
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

  it("/freelancer yüzeyleri siz kaçakları taşımaz; SEN_VOICE ve güvenli ödeme bağlar", () => {
    expect(SEN_VOICE.freelancer.catalog.createCta).toBe("İlan oluştur");
    expect(SEN_VOICE.freelancer.catalog.title).toBe("İş Pazarı");
    expect(SEN_VOICE.freelancer.catalog.description).toBe(
      "Güvenli ödeme havuzuyla açık ilanlara teklif ver.",
    );
    expect(SEN_VOICE.freelancer.catalog.description).not.toContain("503");
    expect(SEN_VOICE.freelancer.catalog.description).not.toContain("settlement");
    expect(SEN_VOICE.freelancer.create.description).toContain("güvenli ödemeye alınır");
    expect(SEN_VOICE.freelancer.create.description).not.toContain("503");
    expect(SEN_VOICE.freelancer.create.description).not.toContain("cüzdanda kilitlenir");
    expect(SEN_VOICE.freelancer.accept.cta).not.toContain("bakiyeyi kilitle");
    expect(SEN_VOICE.freelancer.accept.paymentsClosedBody).toContain("Güvenli ödeme henüz bağlanmadı");
    expect(SEN_VOICE.freelancer.accept.paymentsClosedBody).not.toContain("503");
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
    expect(readSrc("app/freelancer/page.tsx")).toContain("        tight");
    expect(readSrc("app/freelancer/page.tsx")).not.toContain("escrow.lead");
    expect(existsSync(join(ROOT, "app/freelancer/error.tsx"))).toBe(true);
    expect(readSrc("app/freelancer/error.tsx")).toContain("retry");
    expect(SEN_VOICE.freelancer.stats.escrowInline).toBe("Güvenli Ödeme");
    expect(SEN_VOICE.freelancer.stats.pathInline).toBe("3 Adımda Teslim");
    expect(SEN_VOICE.freelancer.stats.revisionInline).toBe("3 Revizyon Hakkı");
    expect(SEN_VOICE.freelancer.stats.open(0)).toBe("0 Açık İlan");
    expect(SEN_VOICE.freelancer.satellite.frozenEyebrow).toBe("Bu fazda kapalı");
    expect(SEN_VOICE.freelancer.satellite.squadBody).toContain("Takım paylaşımı halkayı döndürmez");
    expect(SEN_VOICE.freelancer.satellite.directOfferBody).toContain("Doğrudan teklif bu fazda kapalı");
    expect(SEN_VOICE.freelancer.list.clearFiltersCta).toBe("Filtreleri Sıfırla");
    expect(SEN_VOICE.freelancer.job.loginCta).toBe("Giriş Yap");
    expect(SEN_VOICE.freelancer.job.visaCta).toBe("Eğitime Git");
    expect(readSrc("components/freelancer/direct-job-offer-modal.tsx")).toContain("FrozenDirectOfferNotice");
    expect(readSrc("components/freelancer/direct-job-offer-button.tsx")).toContain("FrozenDirectOfferNotice");
    expect(readSrc("components/freelancer/usta-expertise-list.tsx")).toContain("FrozenDirectOfferNotice");
    expect(readSrc("components/freelancer/direct-offer-inbox.tsx")).toContain("FrozenDirectOfferNotice");
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
    expect(readSrc("app/api/freelancer/direct-offers/route.ts")).toContain("FREELANCER_SATELLITE_GONE");
    expect(readSrc("app/api/freelancer/direct-offers/route.ts")).toContain("410");
    expect(readSrc("app/api/freelancer/direct-offers/[id]/accept/route.ts")).toContain(
      "FREELANCER_SATELLITE_GONE",
    );
    expect(readSrc("app/api/freelancer/direct-offers/[id]/decline/route.ts")).toContain(
      "FREELANCER_SATELLITE_GONE",
    );
    expect(readSrc("app/api/freelancer/squad/route.ts")).toContain("FREELANCER_SATELLITE_GONE");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("EscrowHoldSteps");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("DeliveryProcessPanel");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("AcceptBidButton");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).not.toContain("SquadTeaser");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("visaRequired");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).toContain("listingCertShortName");
    expect(readSrc("app/freelancer/jobs/[id]/page.tsx")).not.toContain("ListingVisaScopeSign");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("EscrowHoldSteps");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("DeliveryHeroCard");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("<details");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("advancedSummary");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("DisputeConsole");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).not.toContain("SquadPanel");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).not.toContain("{board.squad ?");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("ContractChatConsole");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("RevisionTracker");
    expect(readSrc("app/freelancer/contracts/[id]/page.tsx")).toContain("freelancerDisputeRoundStatusLabel");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("holdNotice");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("aria-live");
    expect(readSrc("components/freelancer/accept-bid-button.tsx")).toContain("Idempotency");
    expect(readSrc("components/freelancer/contract-actions.tsx")).toContain("isPaymentsUnconfiguredError");
    expect(readSrc("components/freelancer/revision-tracker.tsx")).toContain("isPaymentsUnconfiguredError");
    expect(readSrc("components/freelancer/bid-form.tsx")).toContain("freeBidNote");
    expect(readSrc("components/freelancer/bid-form.tsx")).not.toContain("bidAsTeamToggle");
    expect(readSrc("components/freelancer/bid-form.tsx")).not.toContain("subscribeStandaloneSquads");
    expect(readSrc("components/freelancer/bid-form.tsx")).toContain("{copy.amountLabel}");
    expect(readSrc("components/freelancer/contract-chat-console.tsx")).toContain("evidenceNote");
    expect(readSrc("components/freelancer/revision-tracker.tsx")).toContain("requestCta");
    expect(readSrc("components/freelancer/revision-tracker.tsx")).toContain("releaseCta");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("revisionInline");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("escrowInline");
    expect(readSrc("components/freelancer/delivery-hero-card.tsx")).toContain("FREELANCER_SEN");
    expect(SEN_VOICE.freelancer.bid.freeBidNote).toContain("ücretsiz");
    expect(SEN_VOICE.freelancer.bid.freeBidNote).toContain("Akademi sertifikası");
    expect(SEN_VOICE.freelancer.chat.evidenceNote).toContain("incelemede delil");
    expect(SEN_VOICE.freelancer.revision.releaseCta).toBe("Teslimatı Onayla");
    expect(SEN_VOICE.freelancer.revision.requestCta).toBe("Revizyon İstiyorum");
    expect(readSrc("components/freelancer/squad-panel.tsx")).toContain("FrozenSquadNotice");
    expect(readSrc("components/freelancer/squad-teaser.tsx")).toContain("FrozenSquadNotice");
    expect(readSrc("components/freelancer/squad-create-button.tsx")).toContain("FrozenSquadNotice");
    expect(readSrc("components/freelancer/standalone-squad-modal.tsx")).toContain("FrozenSquadNotice");
    expect(readSrc("app/freelancer/page.tsx")).toContain('variant="primary"');
    expect(SEN_VOICE.freelancer.list.openCta).toBe("İncele / Teklif Ver");
    expect(SEN_VOICE.freelancer.list.inspectBidCta).toBe("İncele / Teklif Ver");
    expect(readSrc("components/freelancer/job-card.tsx")).toContain("copy.list.openCta");
    expect(readSrc("components/freelancer/job-list.tsx")).toContain("copy.emptyCta");
    expect(readSrc("components/freelancer/job-list.tsx")).toContain('href="/freelancer/new"');
    expect(readSrc("components/freelancer/job-list.tsx")).not.toContain("FREELANCER_SHOWCASE");
    expect(readSrc("components/freelancer/job-list.tsx")).not.toContain("örnek düzen");
    expect(SEN_VOICE.freelancer.catalog.unbound).not.toContain("örnek düzen");
    expect(SEN_VOICE.freelancer.list.emptyHint).toBe("Henüz açık ilan bulunmuyor");
    expect(SEN_VOICE.freelancer.list.emptyBody).toContain("ilk ilanı sen oluşturarak");
    expect(SEN_VOICE.freelancer.list.emptyCta).toBe("İlan Oluştur");
    expect(readSrc("components/freelancer/job-list.tsx")).toContain("IconBriefcase");
    expect(SEN_VOICE.freelancer.list.filteredEmpty).toBe("Aramanıza uygun ilan bulunamadı.");
    expect(SEN_VOICE.freelancer.list.filteredEmptyHint).toContain("filtrelerini gevşeterek");
    expect(SEN_VOICE.freelancer.list.emptyHint).not.toContain("temsili");
    expect(SEN_VOICE.freelancer.list.emptyHint).not.toContain("vitrin");
    expect(readSrc("components/freelancer/standalone-squad-modal.tsx")).toContain("FrozenSquadNotice");
    expect(readSrc("components/freelancer/dispute-console.tsx")).toContain("legalNote");
    expect(SEN_VOICE.freelancer.satellite.squadTitle).toBe("Takım / Squad");
    expect(SEN_VOICE.freelancer.satellite.directOfferTitle).toBe("Doğrudan iş teklifi");
    expect(SEN_VOICE.freelancer.dispute.legalNote).toContain("dostane tavsiye");
    expect(SEN_VOICE.freelancer.dispute.title).toContain("AI Bilirkişi");
    expect(readSrc("lib/freelancer/engine.ts")).not.toContain("verdiniz");
  });

  it("güvenli ödeme ve teslim etiketleri vatandaşa sade yansır", () => {
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
    expect(freelancerDisputeRoundStatusLabel("HUMAN_REVIEW")).toContain("Sonuç Analiz Raporu");
    expect(freelancerDisputeRoundStatusLabel("HUMAN_REVIEW")).not.toMatch(/insan incelemesi/i);
    expect(SEN_VOICE.freelancer.dispute.roundLabels.claim).toBe("İddia");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.answer).toBe("Cevap");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.aiRoundOne).toBe("1. Tur AI Analizi");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.appealClaim).toBe("Ek İddia / İtiraz");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.appealAnswer).toBe("Ek Cevap");
    expect(SEN_VOICE.freelancer.dispute.roundLabels.aiFinal).toBe("Nihai AI Analizi");
    expect(SEN_VOICE.freelancer.dispute.finalReportTitle).toBe("Sonuç Analiz Raporu");
    expect(readSrc("components/freelancer/dispute-console.tsx")).toContain("r1_claim");
    expect(readSrc("components/freelancer/dispute-console.tsx")).toContain("r2_ai");
    expect(freelancerMessageKindLabel("DELIVERY")).toBe("Teslim");
    expect(freelancerMessageKindLabel("REVISION")).toBe("Revizyon");
    expect(escrowHoldActiveStep({ contractStatus: "FUNDED", holdStatus: "PENDING" })).toBe("hold");
    expect(escrowHoldActiveStep({ contractStatus: "RELEASED", holdStatus: "RELEASED" })).toBe("release");
    expect(escrowHoldActiveStep({ contractStatus: "DISPUTED", holdStatus: "PENDING" })).toBe("dispute");

    const steps = SEN_VOICE.freelancer.escrow.steps(HOLD_BPS_DEFAULT / 100);
    expect(SEN_VOICE.freelancer.escrow.lead).toContain("güvenli havuza alınır");
    expect(SEN_VOICE.freelancer.escrow.lead).toContain("bakiyene aktarılır");
    expect(SEN_VOICE.freelancer.escrow.title).toBe("Güvenli Ödeme (Escrow)");
    expect(steps[0]?.detail).toContain("Freelancer henüz almaz");
    expect(steps[1]?.detail).toContain("bakiyene aktarılır");
    expect(steps[1]?.label).toBe("Teslim onayında bakiyene geçer");
    expect(steps[2]?.label).toBe("Anlaşmazlıkta süreç durur");
    expect(steps[2]?.detail).toBe(
      "İtiraz durumunda bütçe havuzda bloke edilir. AI asistanı 2 turlu itiraz ve cevap sürecini inceleyerek Sonuç Analiz Raporu yayınlar. Çözülemeyen uyuşmazlıklarda resmi yasal başvuru yolları açıktır.",
    );
    expect(steps[2]?.detail).not.toMatch(/insan incelemesi|admin|platform yönet/i);
    expect(SEN_VOICE.freelancer.dispute.lead).toContain("Sonuç Analiz Raporu");
    expect(SEN_VOICE.freelancer.dispute.lead).toContain("yasal başvuru");
    expect(SEN_VOICE.freelancer.dispute.lead).not.toMatch(/insan incelemesi/i);
    expect(SEN_VOICE.freelancer.dispute.humanReview).toContain("Sonuç Analiz Raporu");
    expect(SEN_VOICE.freelancer.dispute.humanReview).not.toMatch(/insan incelemesi/i);
    expect(SEN_VOICE.freelancer.dispute.roundLabels.human).toBe("Yasal başvuru");
    expect(SEN_VOICE.freelancer.dispute.legalNote).toContain("yasal mercilere");
    expect(SEN_VOICE.freelancer.delivery.upload).toBe("Dosya Yükle");
    expect(SEN_VOICE.freelancer.delivery.submit).toBe("Onaya Gönder");
    expect(readSrc("components/freelancer/delivery-process-panel.tsx")).toContain("copy.upload");
    expect(readSrc("components/freelancer/escrow-hold-steps.tsx")).toContain("escrow.lead");
  });
});
