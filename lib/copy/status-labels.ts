import type {
  FreelancerBidStatus,
  FreelancerContractMessageKind,
  FreelancerContractStatus,
  FreelancerDisputeRoundStatus,
  FreelancerJobStatus,
  FreelancerSquadStatus,
} from "@/lib/freelancer/types";
import type { EscrowHoldStatus } from "@/lib/kernel/escrow/split";

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
      return "Ödeme kuruluşunda kilitli";
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
      return "1. tur — cevap bekleniyor";
    case "ROUND_TWO_SUBMITTED":
      return "1. tur — AI analizi üretiliyor";
    case "AI_REPORT_READY":
      return "1. tur AI analizi hazır";
    case "HUMAN_REVIEW":
      return "Sonuç Analiz Raporu — emanet kilitli kalır";
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

export function escrowHoldStatusLabel(status: EscrowHoldStatus | undefined): string {
  switch (status) {
    case "PENDING":
      return "Ödeme kuruluşunda kilitli";
    case "RELEASED":
      return "Teslim onayı ile aktarıldı";
    case "REFUNDED":
      return "İade";
    default:
      return "—";
  }
}
