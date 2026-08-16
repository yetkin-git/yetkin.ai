import {
  clearSuccessfulPaymentOrder,
  type ClearPaymentOrderPorts,
  type PaymentOrderSnapshot,
} from "@/lib/kernel/payments/clearing";
import { queryPaytrOrderStatus, type PaytrOrderStatusInquiry } from "@/lib/kernel/payments/paytr/status";

/** iframe `timeout_limit` 30 dk; webhook gecikmesi için 2 saat PENDING tavanı. */
export const PAYTR_PENDING_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export type PaytrReconcileResult = {
  action: "cleared" | "failed" | "skipped";
  applied: boolean;
  reason: string;
  orderId: string | null;
};

export type PaytrReconcilePorts = ClearPaymentOrderPorts & {
  inquireStatus?: (merchantOid: string) => Promise<PaytrOrderStatusInquiry>;
};

function isTimedOut(order: PaymentOrderSnapshot, now: Date): boolean {
  return now.getTime() - order.createdAt.getTime() >= PAYTR_PENDING_TIMEOUT_MS;
}

/**
 * Fail-closed valör: PSP doğrulaması olmadan CREDIT yazılmaz.
 * paid + tutar eşleşmesi → clearing. failed / timeout PENDING → markFailed.
 */
export async function reconcilePaytrPaymentOrder(
  ports: PaytrReconcilePorts,
  merchantOid: string,
  now: Date = new Date(),
): Promise<PaytrReconcileResult> {
  const order = await ports.orders.findByMerchantOid(merchantOid);
  if (!order) {
    return { action: "skipped", applied: false, reason: "not_found", orderId: null };
  }
  if (order.status === "CLEARED") {
    return { action: "cleared", applied: false, reason: "already_cleared", orderId: order.id };
  }
  if (order.status === "FAILED") {
    return { action: "failed", applied: false, reason: "already_failed", orderId: order.id };
  }

  const inquire = ports.inquireStatus ?? queryPaytrOrderStatus;
  const psp = await inquire(merchantOid);

  if (psp.kind === "paid") {
    if (psp.amountMinor !== order.amountMinor) {
      return {
        action: "skipped",
        applied: false,
        reason: "amount_mismatch",
        orderId: order.id,
      };
    }
    const result = await clearSuccessfulPaymentOrder(ports, merchantOid, now, {
      expectedAmountMinor: psp.amountMinor,
    });
    return {
      action: "cleared",
      applied: result.applied,
      reason: result.applied ? "psp_paid" : "already_cleared",
      orderId: result.order.id,
    };
  }

  if (psp.kind === "failed") {
    if (order.status !== "PENDING") {
      return {
        action: "skipped",
        applied: false,
        reason: "not_pending_for_fail",
        orderId: order.id,
      };
    }
    const failed = await ports.orders.markFailed(order.id, now);
    return { action: "failed", applied: true, reason: "psp_failed", orderId: failed.id };
  }

  if (psp.kind === "unavailable") {
    return {
      action: "skipped",
      applied: false,
      reason: `psp_unavailable:${psp.reason}`,
      orderId: order.id,
    };
  }

  if (order.status === "PENDING" && isTimedOut(order, now)) {
    const failed = await ports.orders.markFailed(order.id, now);
    return { action: "failed", applied: true, reason: "pending_timeout", orderId: failed.id };
  }

  return { action: "skipped", applied: false, reason: "still_pending", orderId: order.id };
}
