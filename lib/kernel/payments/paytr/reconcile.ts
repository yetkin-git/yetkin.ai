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
import { notifyAcademyLicenseHook } from "@/lib/kernel/payments/academy-license-hook";
import { notifyJuniorLicenseHook } from "@/lib/kernel/payments/junior-license-hook";
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

/**
 * PENDING siparişin neden CLEARED olmadığı.
 * Yetersiz bakiye lisansı bu sınıfta değildir; o durum CLEARED sonrası `academy.license.unlicensed_credit` olayıdır.
 */
export const PAYTR_PENDING_DIAGNOSIS = {
  webhook_pending_within_window:
    "Webhook henüz düşmedi veya alıcı iFrame içinde. Süre dolmadı. CREDIT yazılmaz.",
  webhook_timeout:
    "PENDING tavanı doldu. Webhook gelmedi veya ödeme terk edildi. Sipariş FAILED olur. CREDIT yazılmaz.",
  psp_declined_or_cancelled:
    "PayTR başarısız. Kart reddi, kart bakiyesinin yetmemesi veya alıcı iptali. CREDIT yazılmaz.",
  amount_mismatch_no_credit: "Bildirilen tutar sipariş tutarıyla uyuşmuyor. CREDIT yazılmaz.",
  psp_status_unavailable: "Durum sorgusu yok veya yanıt okunamadı. PENDING durur. CREDIT yazılmaz.",
  order_missing: "merchantOid için sipariş satırı yok.",
} as const;

export type PaytrPendingDiagnosisCode = keyof typeof PAYTR_PENDING_DIAGNOSIS;

export function paytrPendingDiagnosisCode(reason: string): PaytrPendingDiagnosisCode | null {
  if (reason === "still_pending") return "webhook_pending_within_window";
  if (reason === "pending_timeout") return "webhook_timeout";
  if (reason === "psp_failed") return "psp_declined_or_cancelled";
  if (reason === "amount_mismatch") return "amount_mismatch_no_credit";
  if (reason.startsWith("psp_unavailable:")) return "psp_status_unavailable";
  if (reason === "not_found") return "order_missing";
  return null;
}

function logPaytrPendingDiagnosis(
  reason: string,
  merchantOid: string,
  order: PaymentOrderSnapshot | null,
): void {
  const code = paytrPendingDiagnosisCode(reason);
  if (!code) {
    return;
  }
  logEvent({
    level: code === "webhook_pending_within_window" ? "info" : "warn",
    event: "paytr.pending.diagnosis",
    userId: order?.userId,
    merchantOid: order?.merchantOid ?? merchantOid,
    orderId: order?.id,
    amountMinor: order?.amountMinor,
    purpose: order?.purpose,
    reason: code,
    applied: false,
  });
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
    logPaytrPendingDiagnosis("not_found", merchantOid, null);
    return { action: "skipped", applied: false, reason: "not_found", orderId: null };
  }
  if (order.status === "CLEARED") {
    await notifyAcademyLicenseHook(order);
    await notifyJuniorLicenseHook(order);
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
      logPaytrPendingDiagnosis("amount_mismatch", merchantOid, order);
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
    await notifyAcademyLicenseHook(result.order);
    await notifyJuniorLicenseHook(result.order);
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
      logPaytrPendingDiagnosis("psp_failed", merchantOid, failed);
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
    const reason = `psp_unavailable:${psp.reason}`;
    logPaytrPendingDiagnosis(reason, merchantOid, order);
    return {
      action: "skipped",
      applied: false,
      reason,
      orderId: order.id,
    };
  }

  if (order.status === "PENDING" && isTimedOut(order, now)) {
    try {
      const failed = await ports.orders.markFailed(order.id, now);
      logPaytrPendingDiagnosis("pending_timeout", merchantOid, failed);
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

  logPaytrPendingDiagnosis("still_pending", merchantOid, order);
  return { action: "skipped", applied: false, reason: "still_pending", orderId: order.id };
}
