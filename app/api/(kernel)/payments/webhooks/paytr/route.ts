import { NextResponse } from "next/server";
import { parsePaytrWebhookForm } from "@/lib/kernel/payments/paytr/webhook";
import { paytrPaymentProvider } from "@/lib/kernel/payments/paytr/adapter";
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

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const formData = await request.formData();
  const payload = parsePaytrWebhookForm(formData);
  const verified = paytrPaymentProvider.verifyWebhook(payload);
  if (!verified.ok) {
    logEvent({
      level: "warn",
      event: "paytr.webhook.rejected",
      requestId,
      reason: verified.reason,
      route: "/api/payments/webhooks/paytr",
    });
    return NextResponse.json(
      { status: "rejected", reason: verified.reason, requestId },
      { status: 400, headers: { [REQUEST_ID_HEADER]: requestId } },
    );
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
          route: "/api/payments/webhooks/paytr",
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
        route: "/api/payments/webhooks/paytr",
      });
    } catch (error) {
      logEvent({
        level: "error",
        event: "paytr.webhook.clearing_deferred",
        requestId,
        merchantOid: verified.merchantOid,
        errorName: error instanceof Error ? error.name : "unknown",
        route: "/api/payments/webhooks/paytr",
      });
      await inngest.send({
        name: INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED,
        data: { merchantOid: verified.merchantOid, requestId },
      });
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
        route: "/api/payments/webhooks/paytr",
      });
    } catch (error) {
      logEvent({
        level: "warn",
        event: "paytr.webhook.fail_skipped",
        requestId,
        merchantOid: verified.merchantOid,
        errorName: error instanceof Error ? error.name : "unknown",
        route: "/api/payments/webhooks/paytr",
      });
    }
  }

  return paytrOk(requestId);
}
