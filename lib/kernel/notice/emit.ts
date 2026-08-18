import type { CitizenNotice, CitizenNoticeSink } from "@/lib/kernel/notice/types";
import { logEvent } from "@/lib/kernel/observability/log";

const PLATFORM_TREASURY_SENTINEL = "00000000-0000-4000-8000-000000000001";

function isPlatformTreasuryUserId(userId: string): boolean {
  const fromEnv = process.env.PLATFORM_TREASURY_USER_ID?.trim();
  return userId === (fromEnv && fromEnv.length > 0 ? fromEnv : PLATFORM_TREASURY_SENTINEL);
}

let sink: CitizenNoticeSink | null = null;

export function setCitizenNoticeSink(next: CitizenNoticeSink | null): void {
  sink = next;
}

function queueMail(notice: CitizenNotice): void {
  if (process.env.NODE_ENV === "test") {
    return;
  }
  void import("@/lib/kernel/notice/mail")
    .then((mod) => mod.deliverCitizenNoticeMail(notice))
    .catch((error: unknown) => {
      logEvent({
        level: "error",
        event: "citizen.notice.mail.failed",
        userId: notice.userId,
        action: notice.kind,
        errorName: error instanceof Error ? error.name : "unknown",
        requestId: notice.requestId,
      });
    });
}

/**
 * Vatandaş e-posta asgarisi — yapılandırılmış log + isteğe bağlı SMTP.
 * Resend yok. SMTP boşsa dürüst atlanır; nakit yolu durmaz.
 * applied=false (replay) ikinci bildirim basmaz.
 */
export function emitCitizenNotice(notice: CitizenNotice): void {
  if (!notice.applied) {
    return;
  }
  const userId = notice.userId.trim();
  if (!userId || isPlatformTreasuryUserId(userId)) {
    return;
  }
  logEvent({
    level: "info",
    event: `citizen.notice.${notice.kind}`,
    userId,
    amountMinor: notice.amountMinor,
    holdId:
      notice.kind === "escrow_released" || notice.kind === "escrow_ttl_approaching"
        ? notice.reference
        : undefined,
    action: notice.kind,
    applied: true,
    requestId: notice.requestId,
  });
  sink?.({ ...notice, userId });
  queueMail({ ...notice, userId });
}
