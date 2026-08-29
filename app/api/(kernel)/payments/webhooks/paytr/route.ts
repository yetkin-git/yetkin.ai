import { NextResponse } from "next/server";
import {
  isPaytrWebhookSourceIpAllowed,
  parsePaytrWebhookForm,
  parsePaytrWebhookIpAllowlist,
  PAYTR_WEBHOOK_PATH,
  readPaytrWebhookRequestIp,
} from "@/lib/kernel/payments/paytr/webhook";
import { paytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
import { isPaytrProductionSafetyError } from "@/lib/kernel/payments/paytr/checkout";
import { createPrismaClearingPorts, createPrismaPaymentOrderStore } from "@/lib/kernel/payments/prisma-order-store";
import { createPrismaPaymentAnomalyStore } from "@/lib/kernel/payments/prisma-anomaly-store";
import {
  settlePaytrWebhookFailure,
  settlePaytrWebhookSuccess,
} from "@/lib/kernel/payments/paytr/webhook-settle";
import { inngest, INNGEST_EVENTS } from "@/lib/kernel/jobs/inngest";
import { canSendInngestEvents } from "@/lib/kernel/jobs/inngest-guard";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { logEvent } from "@/lib/kernel/observability/log";

export const auth = "webhook" as const;

function paytrOk(requestId: string) {
  return new NextResponse("OK", {
    status: 200,
    headers: { [REQUEST_ID_HEADER]: requestId },
  });
}

function paytrReject(requestId: string, reason: string, status: 400 | 403) {
  return NextResponse.json(
    { status: "rejected", reason, requestId },
    { status, headers: { [REQUEST_ID_HEADER]: requestId } },
  );
}

function paytrRetry(requestId: string, reason: string) {
  return NextResponse.json(
    { status: "retry", reason, requestId },
    { status: 500, headers: { [REQUEST_ID_HEADER]: requestId } },
  );
}

function webhookSettlePorts() {
  return {
    ...createPrismaClearingPorts(),
    anomalies: createPrismaPaymentAnomalyStore(),
  };
}

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const formData = await request.formData();
  const payload = parsePaytrWebhookForm(formData);

  const allowlist = parsePaytrWebhookIpAllowlist();
  const sourceIp = readPaytrWebhookRequestIp(request);
  if (!isPaytrWebhookSourceIpAllowed(sourceIp, allowlist)) {
    logEvent({
      level: "warn",
      event: "paytr.webhook.rejected",
      requestId,
      reason: "ip_not_allowed",
      route: PAYTR_WEBHOOK_PATH,
    });
    return paytrReject(requestId, "ip_not_allowed", 403);
  }

  let verified: ReturnType<typeof paytrPaymentProvider.verifyWebhook>;
  try {
    verified = paytrPaymentProvider.verifyWebhook(payload);
  } catch (error) {
    if (isPaytrProductionSafetyError(error)) {
      logEvent({
        level: "error",
        event: "paytr.webhook.rejected",
        requestId,
        reason: "production_safety",
        errorName: error.name,
        route: PAYTR_WEBHOOK_PATH,
      });
      return paytrReject(requestId, "production_safety", 403);
    }
    throw error;
  }

  if (!verified.ok) {
    const status = verified.reason === "invalid_signature" ? 403 : 400;
    logEvent({
      level: "warn",
      event: "paytr.webhook.rejected",
      requestId,
      reason: verified.reason,
      route: PAYTR_WEBHOOK_PATH,
    });
    return paytrReject(requestId, verified.reason, status);
  }

  if (verified.status === "success") {
    try {
      const settled = await settlePaytrWebhookSuccess(webhookSettlePorts(), {
        merchantOid: verified.merchantOid,
        amountMinor: verified.amountMinor,
        requestId,
        sourceIp,
      });
      if (settled.disposition === "persist_failed") {
        return paytrRetry(requestId, "anomaly_unacked");
      }
      if (settled.disposition === "anomaly") {
        return paytrOk(requestId);
      }
      logEvent({
        level: "info",
        event: "paytr.webhook.cleared",
        requestId,
        merchantOid: verified.merchantOid,
        orderId: settled.orderId,
        amountMinor: verified.amountMinor,
        applied: settled.applied,
        route: PAYTR_WEBHOOK_PATH,
      });
      return paytrOk(requestId);
    } catch (error) {
      logEvent({
        level: "error",
        event: "paytr.webhook.clearing_deferred",
        requestId,
        merchantOid: verified.merchantOid,
        amountMinor: verified.amountMinor,
        errorName: error instanceof Error ? error.name : "unknown",
        route: PAYTR_WEBHOOK_PATH,
      });
      if (!canSendInngestEvents()) {
        logEvent({
          level: "error",
          event: "paytr.webhook.defer_unacked",
          requestId,
          merchantOid: verified.merchantOid,
          amountMinor: verified.amountMinor,
          reason: "inngest_event_key_unconfigured",
          errorName: "InngestEventKeyUnconfigured",
          route: PAYTR_WEBHOOK_PATH,
        });
        return NextResponse.json(
          { status: "deferred_unacked", reason: "inngest_unconfigured", requestId },
          { status: 503, headers: { [REQUEST_ID_HEADER]: requestId } },
        );
      }
      try {
        await inngest.send({
          name: INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED,
          data: { merchantOid: verified.merchantOid, requestId },
        });
      } catch (sendError) {
        logEvent({
          level: "error",
          event: "paytr.webhook.defer_unacked",
          requestId,
          merchantOid: verified.merchantOid,
          amountMinor: verified.amountMinor,
          errorName: sendError instanceof Error ? sendError.name : "unknown",
          route: PAYTR_WEBHOOK_PATH,
        });
        return NextResponse.json(
          { status: "deferred_unacked", requestId },
          { status: 500, headers: { [REQUEST_ID_HEADER]: requestId } },
        );
      }
      return paytrOk(requestId);
    }
  } else {
    const settled = await settlePaytrWebhookFailure(createPrismaPaymentOrderStore(), {
      merchantOid: verified.merchantOid,
      amountMinor: verified.amountMinor,
      requestId,
    });
    if (settled.disposition === "failed") {
      logEvent({
        level: "info",
        event: "paytr.webhook.failed",
        requestId,
        merchantOid: verified.merchantOid,
        amountMinor: verified.amountMinor,
        orderId: settled.orderId,
        applied: settled.applied,
        route: PAYTR_WEBHOOK_PATH,
      });
    } else {
      logEvent({
        level: "warn",
        event: "paytr.webhook.fail_skipped",
        requestId,
        merchantOid: verified.merchantOid,
        amountMinor: verified.amountMinor,
        errorName: settled.errorName,
        route: PAYTR_WEBHOOK_PATH,
      });
    }
  }

  return paytrOk(requestId);
}
