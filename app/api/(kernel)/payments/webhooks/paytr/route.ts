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
import { clearSuccessfulPaymentOrder, failPaymentOrder } from "@/lib/kernel/payments/clearing";
import { createPrismaClearingPorts, createPrismaPaymentOrderStore } from "@/lib/kernel/payments/prisma-order-store";
import { inngest, INNGEST_EVENTS } from "@/lib/kernel/jobs/inngest";
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
      const ports = createPrismaClearingPorts();
      const order = await ports.orders.findByMerchantOid(verified.merchantOid);
      if (!order || order.amountMinor !== verified.amountMinor) {
        logEvent({
          level: "warn",
          event: "paytr.webhook.skipped",
          requestId,
          merchantOid: verified.merchantOid,
          amountMinor: verified.amountMinor,
          reason: !order ? "not_found" : "amount_mismatch",
          route: PAYTR_WEBHOOK_PATH,
        });
        return paytrOk(requestId);
      }
      const cleared = await clearSuccessfulPaymentOrder(ports, verified.merchantOid, new Date(), {
        expectedAmountMinor: verified.amountMinor,
      });
      logEvent({
        level: "info",
        event: "paytr.webhook.cleared",
        requestId,
        merchantOid: verified.merchantOid,
        orderId: cleared.order.id,
        amountMinor: verified.amountMinor,
        applied: cleared.applied,
        route: PAYTR_WEBHOOK_PATH,
      });
    } catch (error) {
      logEvent({
        level: "error",
        event: "paytr.webhook.clearing_deferred",
        requestId,
        merchantOid: verified.merchantOid,
        errorName: error instanceof Error ? error.name : "unknown",
        route: PAYTR_WEBHOOK_PATH,
      });
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
    try {
      await failPaymentOrder(createPrismaPaymentOrderStore(), verified.merchantOid);
      logEvent({
        level: "info",
        event: "paytr.webhook.failed",
        requestId,
        merchantOid: verified.merchantOid,
        route: PAYTR_WEBHOOK_PATH,
      });
    } catch (error) {
      logEvent({
        level: "warn",
        event: "paytr.webhook.fail_skipped",
        requestId,
        merchantOid: verified.merchantOid,
        errorName: error instanceof Error ? error.name : "unknown",
        route: PAYTR_WEBHOOK_PATH,
      });
    }
  }

  return paytrOk(requestId);
}
