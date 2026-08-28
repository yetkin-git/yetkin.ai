/** Donmuş oda etiketleri — canlı `lib/copy/status-labels.ts` freelancer/escrow taşır. */

type ArenaTenderStatus = "OPEN" | "EVALUATING" | "AWARDED" | "REFUNDED";
type ArenaTenderRound = "SUBMISSION" | "EVALUATION" | "CLOSED";
type ArenaSubmissionStatus = "SUBMITTED" | "REJECTED" | "AWARDED";
type CorporateJobPostingStatus = "SEALED" | "AWARDED" | "RELEASED" | "REFUNDED";
type CorporateJobOfferStatus = "SUBMITTED" | "ACCEPTED" | "REJECTED";
type CorporateWorkbenchKind = "FREELANCER" | "DEVLABS";
type DevLabsProjectStatus = "ACTIVE" | "ARCHIVED";
type MarketplaceProductKind = "DIGITAL_GOOD" | "SERVICE";
type MarketplaceOrderStatus = "SETTLED" | "AWAITING_DELIVERY" | "DELIVERED" | "REFUNDED";
type MarketplaceOfferStatus = "OPEN" | "ACCEPTED" | "REJECTED";

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
