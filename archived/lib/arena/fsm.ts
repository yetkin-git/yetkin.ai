import type { ArenaTenderRound, ArenaTenderStatus } from "@/lib/arena/types";

export function arenaTenderReferenceKey(tenderId: string): string {
  return `arena-tender:${tenderId}`;
}

export function canSubmitToTender(status: ArenaTenderStatus, round: ArenaTenderRound): boolean {
  return status === "OPEN" && round === "SUBMISSION";
}

export function canAwardTender(status: ArenaTenderStatus): boolean {
  return status === "OPEN" || status === "EVALUATING";
}

export function canRefundTender(status: ArenaTenderStatus): boolean {
  return status === "OPEN" || status === "EVALUATING";
}
