import {
  recordPaymentAnomaly,
  type PaymentAnomalyKind,
  type PaymentAnomalyStore,
} from "@/lib/kernel/payments/anomaly";
import {
  clearSuccessfulPaymentOrder,
  failPaymentOrder,
  type ClearPaymentOrderPorts,
  type PaymentOrderStore,
} from "@/lib/kernel/payments/clearing";
import { logEvent } from "@/lib/kernel/observability/log";

export type PaytrWebhookSettlePorts = ClearPaymentOrderPorts & {
  anomalies: PaymentAnomalyStore;
};

export type PaytrWebhookSettleInput = {
  merchantOid: string;
  amountMinor: number;
  requestId: string;
  sourceIp: string;
};

export type PaytrWebhookSettleResult =
  | {
      disposition: "cleared";
      ack: true;
      applied: boolean;
      orderId: string;
      creditApplied: boolean;
    }
  | {
      disposition: "anomaly";
      ack: true;
      kind: PaymentAnomalyKind;
      duplicate: boolean;
      anomalyId: string;
      creditApplied: false;
    }
  | {
      disposition: "persist_failed";
      ack: false;
      kind: PaymentAnomalyKind;
      errorName: string;
      creditApplied: false;
    };

async function persistWebhookAnomaly(
  ports: PaytrWebhookSettlePorts,
  input: PaytrWebhookSettleInput,
  kind: PaymentAnomalyKind,
  extras: {
    expectedMinor?: number | null;
    orderId?: string | null;
  },
): Promise<PaytrWebhookSettleResult> {
  try {
    const recorded = await recordPaymentAnomaly(ports.anomalies, {
      kind,
      merchantOid: input.merchantOid,
      expectedMinor: extras.expectedMinor ?? null,
      reportedMinor: input.amountMinor,
      orderId: extras.orderId ?? null,
      requestId: input.requestId,
      sourceIp: input.sourceIp,
      detail: {
        expectedMinor: extras.expectedMinor ?? null,
        reportedMinor: input.amountMinor,
        orderId: extras.orderId ?? null,
      },
    });
    logEvent({
      level: "error",
      event: recorded.inserted ? "paytr.webhook.anomaly" : "paytr.webhook.anomaly.replay",
      requestId: input.requestId,
      merchantOid: input.merchantOid,
      orderId: extras.orderId ?? undefined,
      amountMinor: input.amountMinor,
      reason: kind,
      applied: false,
    });
    return {
      disposition: "anomaly",
      ack: true,
      kind,
      duplicate: !recorded.inserted,
      anomalyId: recorded.record.id,
      creditApplied: false,
    };
  } catch (error) {
    logEvent({
      level: "error",
      event: "paytr.webhook.anomaly.unacked",
      requestId: input.requestId,
      merchantOid: input.merchantOid,
      amountMinor: input.amountMinor,
      reason: kind,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return {
      disposition: "persist_failed",
      ack: false,
      kind,
      errorName: error instanceof Error ? error.name : "unknown",
      creditApplied: false,
    };
  }
}

/**
 * HMAC sonrası başarı bildirimi. Tutar/sipariş uyuşmazlığında CREDIT yazılmaz.
 * FAILED satır tutar eşleşirse geç paid recovery (revive + clearing).
 * Anomali kalıcılaştıktan sonra ACK; yazılamazsa PSP retry (5xx) alınır.
 */
export async function settlePaytrWebhookSuccess(
  ports: PaytrWebhookSettlePorts,
  input: PaytrWebhookSettleInput,
  now: Date = new Date(),
): Promise<PaytrWebhookSettleResult> {
  const order = await ports.orders.findByMerchantOid(input.merchantOid);
  if (!order) {
    return persistWebhookAnomaly(ports, input, "order_not_found", {});
  }
  if (order.amountMinor !== input.amountMinor) {
    return persistWebhookAnomaly(ports, input, "amount_mismatch", {
      expectedMinor: order.amountMinor,
      orderId: order.id,
    });
  }

  const cleared = await clearSuccessfulPaymentOrder(ports, input.merchantOid, now, {
    expectedAmountMinor: input.amountMinor,
  });
  return {
    disposition: "cleared",
    ack: true,
    applied: cleared.applied,
    orderId: cleared.order.id,
    creditApplied: cleared.applied,
  };
}

export type PaytrWebhookFailResult =
  | {
      disposition: "failed";
      ack: true;
      applied: boolean;
      orderId: string;
      creditApplied: false;
    }
  | {
      disposition: "fail_skipped";
      ack: true;
      applied: false;
      creditApplied: false;
      errorName: string;
    };

/**
 * HMAC sonrası başarısız bildirim. CREDIT yazılmaz.
 * PENDING FAILED olur; PAID/CLEARED ezilmez. Sipariş yoksa ACK (PSP retry döngüsü yok).
 */
export async function settlePaytrWebhookFailure(
  orders: PaymentOrderStore,
  input: Pick<PaytrWebhookSettleInput, "merchantOid" | "amountMinor" | "requestId">,
  now: Date = new Date(),
): Promise<PaytrWebhookFailResult> {
  try {
    const failed = await failPaymentOrder(orders, input.merchantOid, now);
    return {
      disposition: "failed",
      ack: true,
      applied: failed.applied,
      orderId: failed.order.id,
      creditApplied: false,
    };
  } catch (error) {
    return {
      disposition: "fail_skipped",
      ack: true,
      applied: false,
      creditApplied: false,
      errorName: error instanceof Error ? error.name : "unknown",
    };
  }
}
