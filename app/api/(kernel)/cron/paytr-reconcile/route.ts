import { NextResponse, type NextRequest } from "next/server";
import {
  cronBearerMatches,
  CRON_UNAUTHORIZED_ERROR,
  CRON_UNCONFIGURED_ERROR,
  readCronSecret,
} from "@/lib/kernel/security/api-auth";
import { getPrisma } from "@/lib/kernel/db";
import { createPrismaClearingPorts } from "@/lib/kernel/payments/prisma-order-store";
import { createPrismaPaymentAnomalyStore } from "@/lib/kernel/payments/prisma-anomaly-store";
import {
  PAYTR_PENDING_TIMEOUT_MS,
  reconcilePaytrPaymentOrder,
} from "@/lib/kernel/payments/paytr/reconcile";
import { shouldNoOpPaytrClearingScan } from "@/lib/kernel/jobs/paytr-clearing-scan";
import { logEvent } from "@/lib/kernel/observability/log";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/kernel/http/request-id";
import { registerPaytrValorLicenseHooks } from "@/app/api/(kernel)/payments/register-paytr-valor-hooks";

/**
 * Vercel Cron valör yedeği.
 * Inngest Cloud anahtarları yokken PENDING tavanı hiç kapanmıyordu
 * (16 sipariş 48 gün açık kaldı). Bu rota aynı mutabakat motorunu çağırır;
 * CREDIT yalnız PSP `paid` + tutar eşleşmesiyle yazılır. Sahte ACK yok.
 *
 * Yetki: kenar ve gövde aynı kilidi okur — `Authorization: Bearer ${CRON_SECRET}`.
 * Vercel Cron bu başlığı basar. Oturum rotayı açmaz.
 * `CRON_SECRET` boşsa rota fail-closed 503 döner (Inngest gibi).
 *
 * Tavan: tek tetiklemede en fazla `BATCH_LIMIT` sipariş.
 * Zaman: `vercel.json` crons `0 3 * * *` (UTC, günde bir).
 * Hobby planı günde birden sık ifadeyi dağıtımda reddeder.
 * 30 dakikalık tarama Inngest `paytr-clearing-scan` işidir.
 * Daha sık dış tetik: `.system_docs/ops/ops-paytr.md`.
 */
registerPaytrValorLicenseHooks();
export const auth = "cron" as const;

const BATCH_LIMIT = 50;

type ReconcileOutcome = {
  merchantOid: string;
  action: string;
  reason: string;
  applied: boolean;
};

function isAuthorized(request: NextRequest): boolean {
  return cronBearerMatches(request.headers.get("authorization"), readCronSecret());
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = resolveRequestId(request);
  const headers = { [REQUEST_ID_HEADER]: requestId, "cache-control": "no-store" };

  if (!readCronSecret()) {
    return NextResponse.json(
      { ok: false, error: CRON_UNCONFIGURED_ERROR },
      { status: 503, headers },
    );
  }
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: CRON_UNAUTHORIZED_ERROR }, { status: 401, headers });
  }
  if (shouldNoOpPaytrClearingScan()) {
    return NextResponse.json(
      { ok: true, noop: true, reason: "payments_port_unconfigured", stale: 0, outcomes: [] },
      { status: 200, headers },
    );
  }

  const prisma = getPrisma();
  const candidates = await prisma.paymentOrder.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: BATCH_LIMIT,
    select: { merchantOid: true, createdAt: true },
  });
  const now = new Date();
  const stale = candidates.filter(
    (row) => now.getTime() - row.createdAt.getTime() >= PAYTR_PENDING_TIMEOUT_MS,
  );

  const ports = {
    ...createPrismaClearingPorts(),
    anomalies: createPrismaPaymentAnomalyStore(),
  };

  const outcomes: ReconcileOutcome[] = [];
  const failures: { merchantOid: string; error: string }[] = [];
  for (const row of stale) {
    try {
      const result = await reconcilePaytrPaymentOrder(ports, row.merchantOid, now);
      outcomes.push({
        merchantOid: row.merchantOid,
        action: result.action,
        reason: result.reason,
        applied: result.applied,
      });
    } catch (error) {
      failures.push({
        merchantOid: row.merchantOid,
        error: error instanceof Error ? error.name : "unknown",
      });
    }
  }

  logEvent({
    level: failures.length > 0 ? "error" : "info",
    event: "paytr.cron.reconcile",
    requestId,
    applied: outcomes.some((row) => row.applied),
    action: String(stale.length),
    reason: failures.length > 0 ? "partial_failure" : "ok",
  });

  return NextResponse.json(
    {
      ok: failures.length === 0,
      scanned: candidates.length,
      stale: stale.length,
      outcomes,
      failures,
    },
    { status: failures.length > 0 ? 500 : 200, headers },
  );
}
