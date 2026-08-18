import { logEvent } from "@/lib/kernel/observability/log";

export type TransactionNoticeKind = "wallet_cleared" | "escrow_refunded";

export type TransactionNotice = {
  kind: TransactionNoticeKind;
  userId: string;
  amountMinor: number;
  reference: string;
  applied: boolean;
  requestId?: string;
};

type TransactionNoticeSink = (notice: TransactionNotice) => void;

let sink: TransactionNoticeSink | null = null;

export function setTransactionNoticeSink(next: TransactionNoticeSink | null): void {
  sink = next;
}

/**
 * Temel işlem bildirimi — yapılandırılmış log.
 * Vatandaş e-posta asgarisi `lib/kernel/notice` (Resend yok; SMTP boşsa dürüst atlanır).
 * Auth SMTP kimlik maillerine aittir.
 * applied=false (replay) ikinci bildirim basmaz.
 */
export function emitTransactionNotice(notice: TransactionNotice): void {
  if (!notice.applied) {
    return;
  }
  logEvent({
    level: "info",
    event: `txn.notice.${notice.kind}`,
    userId: notice.userId,
    amountMinor: notice.amountMinor,
    merchantOid: notice.kind === "wallet_cleared" ? notice.reference : undefined,
    holdId: notice.kind === "escrow_refunded" ? notice.reference : undefined,
    applied: true,
    requestId: notice.requestId,
  });
  sink?.(notice);
}
