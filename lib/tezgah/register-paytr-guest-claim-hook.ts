import { registerGuestClaimHook } from "@/lib/kernel/payments/guest-claim-hook";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  issueClaimTokenForClearedGuestOrder,
} from "@/lib/tezgah/guest-claim";
import { deliverGuestClaimMail } from "@/lib/tezgah/guest-claim-mail";

/**
 * Faz 3 / §4.1 — misafir CLEARED sipariş → `/claim/[token]` bağlantısı postalanır.
 *
 * Yalnız `userId === null` ve `status === "CLEARED"` iken çalışır. Dekont
 * (defter CREDIT) burada **yazılmaz**: sahipsiz defter satırı yasaktır; para
 * `/api/auth/claim-order` içinde, `userId` bağlanınca cüzdana girer.
 *
 * Sıra: token üret → postala. Posta gitmezse token **durur** (kullanıcı bağlantıyı
 * yeniden talep edebilir); sipariş ve tahsilat bozulmaz.
 */
export function registerPaytrTezgahGuestClaimHook(): void {
  registerGuestClaimHook(async (order) => {
    if (order.userId !== null || order.status !== "CLEARED") {
      return;
    }
    const issued = await issueClaimTokenForClearedGuestOrder(order);
    if (!issued.ok) {
      logEvent({
        level: issued.reason === "already_issued" ? "info" : "warn",
        event: "tezgah.guest.claim_issue_skipped",
        merchantOid: order.merchantOid,
        orderId: order.id,
        amountMinor: order.amountMinor,
        purpose: order.purpose,
        applied: false,
        reason: issued.reason,
      });
      return;
    }
    try {
      const mail = await deliverGuestClaimMail({
        email: issued.email,
        claimToken: issued.token,
        amountMinor: order.amountMinor,
        merchantOid: order.merchantOid,
      });
      logEvent({
        level: mail === "sent" ? "info" : "warn",
        event: "tezgah.guest.claim_notified",
        merchantOid: order.merchantOid,
        orderId: order.id,
        amountMinor: order.amountMinor,
        applied: true,
        reason: mail,
      });
    } catch (error) {
      logEvent({
        level: "error",
        event: "tezgah.guest.claim_mail_failed",
        merchantOid: order.merchantOid,
        orderId: order.id,
        amountMinor: order.amountMinor,
        applied: false,
        errorName: error instanceof Error ? error.name : "unknown",
      });
    }
  });
}
