import type {
  FreelancerBidStatus,
  FreelancerContractMessageKind,
  FreelancerContractStatus,
  FreelancerDisputeRoundStatus,
  FreelancerJobStatus,
  FreelancerSquadStatus,
} from "@/lib/freelancer/types";
import type { ArenaSubmissionStatus, ArenaTenderRound, ArenaTenderStatus } from "@/lib/arena/types";
import type { CorporateJobOfferStatus, CorporateJobPostingStatus, CorporateWorkbenchKind } from "@/lib/kurumsal/types";
import type { DevLabsProjectStatus } from "@/lib/devlabs/types";
import type { EscrowHoldStatus } from "@/lib/kernel/escrow/split";
import type {
  MarketplaceOfferStatus,
  MarketplaceOrderStatus,
  MarketplaceProductKind,
} from "@/lib/pazaryeri/types";

export type FreelancerEscrowStepKey = "hold" | "release" | "dispute";

export function freelancerJobStatusLabel(status: FreelancerJobStatus): string {
  switch (status) {
    case "OPEN":
      return "Açık";
    case "AWARDED":
      return "Verildi";
    case "CANCELLED":
      return "İptal";
  }
}

export function freelancerBidStatusLabel(status: FreelancerBidStatus): string {
  switch (status) {
    case "SUBMITTED":
      return "Bekliyor";
    case "ACCEPTED":
      return "Kabul";
    case "REJECTED":
      return "Red";
  }
}

export function freelancerContractStatusLabel(status: FreelancerContractStatus): string {
  switch (status) {
    case "FUNDED":
      return "Bakiye kilitli";
    case "RELEASED":
      return "Teslim onayı ile aktarıldı";
    case "REFUNDED":
      return "İade";
    case "DISPUTED":
      return "Tahkimde";
  }
}

export function freelancerDisputeRoundStatusLabel(status: FreelancerDisputeRoundStatus): string {
  switch (status) {
    case "ROUND_ONE_OPEN":
      return "1. tur — iddia bekleniyor";
    case "ROUND_ONE_SUBMITTED":
      return "1. tur doldu — karşı cevap bekleniyor";
    case "ROUND_TWO_SUBMITTED":
      return "2. tur doldu — bilirkişi raporu bekleniyor";
    case "AI_REPORT_READY":
      return "Bilirkişi raporu hazır";
    case "HUMAN_REVIEW":
      return "İnsan incelemesinde — emanet kilitli kalır";
    case "SETTLED":
      return "Tahkim kapandı";
  }
}

export function freelancerMessageKindLabel(kind: FreelancerContractMessageKind): string {
  switch (kind) {
    case "TEXT":
      return "Mesaj";
    case "DELIVERY":
      return "Teslim";
    case "REVISION":
      return "Revizyon";
  }
}

export function freelancerSquadStatusLabel(status: FreelancerSquadStatus): string {
  switch (status) {
    case "FORMING":
      return "Kuruluyor";
    case "ACTIVE":
      return "Aktif";
    case "DISBANDED":
      return "Dağıtıldı";
  }
}

export function escrowHoldActiveStep(input: {
  contractStatus?: FreelancerContractStatus | null;
  holdStatus?: EscrowHoldStatus | null;
}): FreelancerEscrowStepKey | null {
  if (input.contractStatus === "DISPUTED") {
    return "dispute";
  }
  if (input.contractStatus === "RELEASED" || input.holdStatus === "RELEASED") {
    return "release";
  }
  if (input.contractStatus === "FUNDED" || input.holdStatus === "PENDING") {
    return "hold";
  }
  return null;
}

export function arenaTenderStatusLabel(status: ArenaTenderStatus): string {
  switch (status) {
    case "OPEN":
      return "Açık";
    case "EVALUATING":
      return "Değerlendirmede";
    case "AWARDED":
      return "Ödüllendirildi";
    case "REFUNDED":
      return "İade";
  }
}

export function arenaTenderRoundLabel(round: ArenaTenderRound): string {
  switch (round) {
    case "SUBMISSION":
      return "Teslim";
    case "EVALUATION":
      return "Değerlendirme";
    case "CLOSED":
      return "Kapandı";
  }
}

export function arenaSubmissionStatusLabel(status: ArenaSubmissionStatus): string {
  switch (status) {
    case "SUBMITTED":
      return "Teslim edildi";
    case "REJECTED":
      return "Red";
    case "AWARDED":
      return "Kazandı";
  }
}

export function kurumsalPostingStatusLabel(status: CorporateJobPostingStatus): string {
  switch (status) {
    case "SEALED":
      return "Mühürlü";
    case "AWARDED":
      return "İş verildi";
    case "RELEASED":
      return "Serbest";
    case "REFUNDED":
      return "İade";
  }
}

export function kurumsalOfferStatusLabel(status: CorporateJobOfferStatus): string {
  switch (status) {
    case "SUBMITTED":
      return "Bekliyor";
    case "ACCEPTED":
      return "Kabul";
    case "REJECTED":
      return "Red";
  }
}

export function kurumsalWorkbenchLabel(kind: CorporateWorkbenchKind): string {
  switch (kind) {
    case "FREELANCER":
      return "Freelancer";
    case "DEVLABS":
      return "DevLabs";
  }
}

export function devlabsProjectStatusLabel(status: DevLabsProjectStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Aktif";
    case "ARCHIVED":
      return "Arşiv";
  }
}

export type PazaryeriCitizenCashPhase = "PENDING" | "PAID" | "CLEARED" | "CANCELLED";
export type PazaryeriSettlementStepKey = "lock" | "settle" | "cleared";
export type PazaryeriEscrowStepKey = "lock" | "hold" | "release";

export function pazaryeriOrderStatusLabel(status: MarketplaceOrderStatus): string {
  switch (status) {
    case "SETTLED":
      return "Anında teslim — bakiyeden transfer (Settlement)";
    case "AWAITING_DELIVERY":
      return "Emanet korumasında kilit (Escrow Hold)";
    case "DELIVERED":
      return "Teslimat onayında aktarıldı";
    case "REFUNDED":
      return "İade";
  }
}

export function pazaryeriOrderCashPhases(
  status: MarketplaceOrderStatus,
): readonly PazaryeriCitizenCashPhase[] {
  switch (status) {
    case "SETTLED":
      return ["PAID", "CLEARED"];
    case "AWAITING_DELIVERY":
      return ["PAID", "PENDING"];
    case "DELIVERED":
      return ["PAID", "CLEARED"];
    case "REFUNDED":
      return ["CANCELLED"];
  }
}

export function pazaryeriCitizenCashPhaseLabel(phase: PazaryeriCitizenCashPhase): string {
  switch (phase) {
    case "PENDING":
      return "PENDING — emanet kilitli";
    case "PAID":
      return "PAID — bakiyeden düştü";
    case "CLEARED":
      return "CLEARED — aktarım tamam";
    case "CANCELLED":
      return "CANCELLED — iade";
  }
}

export function pazaryeriCashPhaseTone(
  phase: PazaryeriCitizenCashPhase,
): "amber" | "safir" | "emerald" | "rose" {
  switch (phase) {
    case "PENDING":
      return "amber";
    case "PAID":
      return "safir";
    case "CLEARED":
      return "emerald";
    case "CANCELLED":
      return "rose";
  }
}

export function pazaryeriSettlementActiveStep(
  status?: MarketplaceOrderStatus | null,
): PazaryeriSettlementStepKey | null {
  if (status === "SETTLED") {
    return "cleared";
  }
  return null;
}

export function pazaryeriEscrowActiveStep(
  status?: MarketplaceOrderStatus | null,
): PazaryeriEscrowStepKey | null {
  if (status === "AWAITING_DELIVERY") {
    return "hold";
  }
  if (status === "DELIVERED") {
    return "release";
  }
  return null;
}

export function pazaryeriOfferStatusLabel(status: MarketplaceOfferStatus): string {
  switch (status) {
    case "OPEN":
      return "Açık";
    case "ACCEPTED":
      return "Kabul — emanet kilit";
    case "REJECTED":
      return "Red";
  }
}

export function pazaryeriKindLockLabel(kind: MarketplaceProductKind): string {
  return kind === "DIGITAL_GOOD" ? "Anında teslim" : "Emanet kilit";
}

export function escrowHoldStatusLabel(status: EscrowHoldStatus | undefined): string {
  switch (status) {
    case "PENDING":
      return "Bakiye kilitli";
    case "RELEASED":
      return "Teslim onayı ile aktarıldı";
    case "REFUNDED":
      return "İade";
    default:
      return "—";
  }
}
