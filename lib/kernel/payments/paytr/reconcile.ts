import {
  recordPaymentAnomaly,
  type PaymentAnomalyKind,
  type PaymentAnomalyStore,
} from "@/lib/kernel/payments/anomaly";
import {
  clearSuccessfulPaymentOrder,
  isPaymentOrderCasError,
  type ClearPaymentOrderPorts,
  type PaymentOrderSnapshot,
} from "@/lib/kernel/payments/clearing";
import { queryPaytrOrderStatus, type PaytrOrderStatusInquiry } from "@/lib/kernel/payments/paytr/status";
import { logEvent } from "@/lib/kernel/observability/log";

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
  anomalies?: PaymentAnomalyStore;
};

function isTimedOut(order: PaymentOrderSnapshot, now: Date): boolean {
  return now.getTime() - order.createdAt.getTime() >= PAYTR_PENDING_TIMEOUT_MS;
}

async function persistReconcileAnomaly(
  ports: PaytrReconcilePorts,
  input: {
    kind: PaymentAnomalyKind;
    merchantOid: string;
    expectedMinor?: number | null;
    reportedMinor?: number | null;
    orderId?: string | null;
  },
): Promise<void> {
  if (!ports.anomalies) {
    return;
  }
  const recorded = await recordPaymentAnomaly(ports.anomalies, {
    kind: input.kind,
    merchantOid: input.merchantOid,
    expectedMinor: input.expectedMinor ?? null,
    reportedMinor: input.reportedMinor ?? null,
    orderId: input.orderId ?? null,
    requestId: `paytr-reconcile:${input.merchantOid}`,
    detail: {
      expectedMinor: input.expectedMinor ?? null,
      reportedMinor: input.reportedMinor ?? null,
    },
  });
  logEvent({
    level: "error",
    event: recorded.inserted ? "paytr.reconcile.anomaly" : "paytr.reconcile.anomaly.replay",
    merchantOid: input.merchantOid,
    orderId: input.orderId ?? undefined,
    amountMinor: input.reportedMinor ?? input.expectedMinor ?? undefined,
    reason: input.kind,
    applied: false,
  });
}

/**
 * Fail-closed valör: PSP doğrulaması olmadan CREDIT yazılmaz.
 * paid + tutar eşleşmesi → clearing (FAILED dahil: geç paid recovery).
 * failed / timeout PENDING → markFailed (CAS). Tutar uyuşmazlığında CREDIT yok.
 */
export async function reconcilePaytrPaymentOrder(
  ports: PaytrReconcilePorts,
  merchantOid: string,
  now: Date = new Date(),
): Promise<PaytrReconcileResult> {
  const order = await ports.orders.findByMerchantOid(merchantOid);
  if (!order) {
    await persistReconcileAnomaly(ports, {
      kind: "order_not_found",
      merchantOid,
    });
    return { action: "skipped", applied: false, reason: "not_found", orderId: null };
  }
  if (order.status === "CLEARED") {
    return { action: "cleared", applied: false, reason: "already_cleared", orderId: order.id };
  }

  const inquire = ports.inquireStatus ?? queryPaytrOrderStatus;
  const psp = await inquire(merchantOid);

  if (psp.kind === "paid") {
    if (psp.amountMinor !== order.amountMinor) {
      await persistReconcileAnomaly(ports, {
        kind: "amount_mismatch",
        merchantOid,
        expectedMinor: order.amountMinor,
        reportedMinor: psp.amountMinor,
        orderId: order.id,
      });
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
      reason: order.status === "FAILED" && result.applied ? "late_paid_recovery" : result.applied ? "psp_paid" : "already_cleared",
      orderId: result.order.id,
    };
  }

  if (order.status === "FAILED") {
    return { action: "failed", applied: false, reason: "already_failed", orderId: order.id };
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
    try {
      const failed = await ports.orders.markFailed(order.id, now);
      return { action: "failed", applied: true, reason: "psp_failed", orderId: failed.id };
    } catch (error) {
      if (!isPaymentOrderCasError(error)) {
        throw error;
      }
      return {
        action: "skipped",
        applied: false,
        reason: "fail_cas_rejected",
        orderId: order.id,
      };
    }
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
    try {
      const failed = await ports.orders.markFailed(order.id, now);
      return { action: "failed", applied: true, reason: "pending_timeout", orderId: failed.id };
    } catch (error) {
      if (!isPaymentOrderCasError(error)) {
        throw error;
      }
      return {
        action: "skipped",
        applied: false,
        reason: "fail_cas_rejected",
        orderId: order.id,
      };
    }
  }

  return { action: "skipped", applied: false, reason: "still_pending", orderId: order.id };
}
