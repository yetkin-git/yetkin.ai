import { NextResponse } from "next/server";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { Inngest } from "inngest";
import {
  paytrClearingScanResult,
  selectPaytrClearingCandidates,
} from "@/lib/kernel/jobs/paytr-clearing-scan";
import { runEscrowTimeoutRefunds } from "@/lib/kernel/jobs/escrow-timeout-scan";

/** HTTP + Inngest Cloud — Arena realtime yok (S3-A). S18-A: PayTR clearing + emanet timeout. */
export const inngest = new Inngest({ id: "yetkin-rail" });

export const INNGEST_EVENTS = {
  PAYTR_CLEARING_REQUESTED: "payments/paytr.clearing-requested",
  ESCROW_TIMEOUT_REQUESTED: "escrow/timeout-requested",
  ESCROW_REFUNDED: "escrow/refunded",
  ARENA_TENDER_ROUND_TICK: "arena/tender.round-tick",
} as const;

export const paytrClearingScan = inngest.createFunction(
  {
    id: "paytr-clearing-scan",
    name: "PayTR valör tarama",
    triggers: [{ cron: "TZ=Europe/Istanbul */30 * * * *" }],
  },
  async ({ step }) => {
    const pending = await step.run("scan-pending-paytr-clearing", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return [] as { merchantOid: string }[];
      }
      const { getPrisma } = await import("@/lib/kernel/db");
      const prisma = getPrisma();
      const rows = await prisma.paymentOrder.findMany({
        where: { status: { in: ["PENDING", "PAID"] } },
        take: 50,
        orderBy: { createdAt: "asc" },
        select: { merchantOid: true },
      });
      return selectPaytrClearingCandidates(rows);
    });
    // Adaylar kör CREDIT edilmez; paytrClearingSingle PSP durum sorgusu + markFailed.
    if (pending.length === 0) {
      return paytrClearingScanResult(pending);
    }
    await step.sendEvent(
      "dispatch-paytr-clearing-events",
      pending.map((row) => ({
        name: INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED,
        id: `paytr-clearing:${row.merchantOid}`,
        data: { merchantOid: row.merchantOid },
      })),
    );
    return paytrClearingScanResult(pending);
  },
);

export const paytrClearingSingle = inngest.createFunction(
  {
    id: "paytr-clearing-single",
    name: "PayTR valör tekil",
    idempotency: "event.data.merchantOid",
    triggers: [{ event: INNGEST_EVENTS.PAYTR_CLEARING_REQUESTED }],
  },
  async ({ event, step }) => {
    const merchantOid = String(
      (event.data as { merchantOid?: string }).merchantOid ?? "",
    ).trim();
    if (!merchantOid) {
      return { skipped: true };
    }
    return step.run("reconcile-payment-order", async () => {
      const { createPrismaClearingPorts } = await import(
        "@/lib/kernel/payments/prisma-order-store"
      );
      const { reconcilePaytrPaymentOrder } = await import(
        "@/lib/kernel/payments/paytr/reconcile"
      );
      const { logEvent } = await import("@/lib/kernel/observability/log");
      const requestId =
        typeof (event.data as { requestId?: string }).requestId === "string"
          ? (event.data as { requestId: string }).requestId
          : event.id;
      try {
        const result = await reconcilePaytrPaymentOrder(createPrismaClearingPorts(), merchantOid);
        logEvent({
          level: "info",
          event: "paytr.reconcile",
          requestId,
          merchantOid,
          orderId: result.orderId ?? undefined,
          action: result.action,
          applied: result.applied,
          reason: result.reason,
        });
        return {
          action: result.action,
          applied: result.applied,
          reason: result.reason,
          orderId: result.orderId,
        };
      } catch (error) {
        logEvent({
          level: "error",
          event: "paytr.reconcile.failed",
          requestId,
          merchantOid,
          errorName: error instanceof Error ? error.name : "unknown",
        });
        throw error;
      }
    });
  },
);

export const escrowTimeoutScan = inngest.createFunction(
  {
    id: "escrow-timeout-scan",
    name: "Emanet zaman aşımı tarama",
    triggers: [{ cron: "TZ=Europe/Istanbul 0 */6 * * *" }],
  },
  async ({ step }) => {
    const scanned = await step.run("refund-expired-holds", async () => {
      if (!process.env.DATABASE_URL?.trim()) {
        return { refunded: 0, frozen: 0, refundedHolds: [] as { holdId: string; referenceKey: string }[] };
      }
      const { createPrismaEscrowStore } = await import("@/lib/kernel/escrow/prisma-store");
      const { createPrismaLedgerStore } = await import("@/lib/kernel/ledger/prisma-store");
      return runEscrowTimeoutRefunds({
        escrow: createPrismaEscrowStore(),
        ledger: createPrismaLedgerStore(),
      });
    });
    if (scanned.refundedHolds.length === 0) {
      return { refunded: scanned.refunded, frozen: scanned.frozen };
    }
    await step.sendEvent(
      "dispatch-escrow-refunded-events",
      scanned.refundedHolds.map((row) => ({
        name: INNGEST_EVENTS.ESCROW_REFUNDED,
        id: `escrow-refunded:${row.holdId}`,
        data: { holdId: row.holdId, referenceKey: row.referenceKey },
      })),
    );
    return { refunded: scanned.refunded, frozen: scanned.frozen };
  },
);

export const escrowRefundedNotify = inngest.createFunction(
  {
    id: "escrow-refunded-notify",
    name: "Emanet iade dikey kanca",
    idempotency: "event.data.holdId",
    triggers: [{ event: INNGEST_EVENTS.ESCROW_REFUNDED }],
  },
  async ({ event, step }) => {
    const holdId = String((event.data as { holdId?: string }).holdId ?? "").trim();
    if (!holdId) {
      return { skipped: true };
    }
    return step.run("notify-vertical-hooks", async () => {
      const { notifyEscrowRefunded } = await import("@/lib/kernel/escrow/refund-hooks");
      await notifyEscrowRefunded(holdId);
      return { holdId };
    });
  },
);

export const kernelInngestFunctions = [
  paytrClearingScan,
  paytrClearingSingle,
  escrowTimeoutScan,
  escrowRefundedNotify,
];

export function inngestNotConfiguredResponse(requestId?: string) {
  return NextResponse.json(
    {
      ok: false,
      error: "Inngest Cloud anahtarları tanımlı değil.",
      ...(requestId ? { requestId } : {}),
    },
    {
      status: 503,
      headers: requestId ? { [REQUEST_ID_HEADER]: requestId } : undefined,
    },
  );
}
