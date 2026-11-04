import "server-only";

import { isSuperAdminActor, type SuperAdminActor } from "@/lib/kernel/auth/super-admin";
import { isSupabaseUserId } from "@/lib/kernel/auth/ids";
import { getPrisma } from "@/lib/kernel/db";
import type { OpsAnomalyRow, OpsAuditRow, OpsReadout } from "@/lib/kernel/admin/ops-desk";
import type { PaytrPendingRow } from "@/scripts/ops-list-paytr-pending-lib";

const ANOMALY_LIMIT = 40;
const PENDING_LIMIT = 40;
const AUDIT_LIMIT = 24;

function asCount(value: unknown): number {
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Olay masası okuması. Sapma anlık görüntüsü dikey koltukları çağırandan gelir.
 * Bu fonksiyon denetim satırı açmaz.
 */
export async function loadAdminOpsReadout(
  actor: SuperAdminActor,
): Promise<{ access: "forbidden" } | { access: "unavailable" } | { access: "ok"; readout: OpsReadout }> {
  if (!isSupabaseUserId(actor.id) || !isSuperAdminActor(actor)) {
    return { access: "forbidden" };
  }
  if (!process.env.DATABASE_URL?.trim()) {
    return { access: "unavailable" };
  }
  try {
    const prisma = getPrisma();
    const [anomalies, licenseGapAnomalyCount, pendingTotal, pendingRows, ghosts, audits] =
      await Promise.all([
        prisma.paymentAnomaly.findMany({
          orderBy: { createdAt: "desc" },
          take: ANOMALY_LIMIT,
          select: {
            kind: true,
            merchantOid: true,
            expectedMinor: true,
            reportedMinor: true,
            detail: true,
            createdAt: true,
          },
        }),
        prisma.paymentAnomaly.count({ where: { kind: "license_gap" } }),
        prisma.paymentOrder.count({ where: { status: "PENDING" } }),
        prisma.paymentOrder.findMany({
          where: { status: "PENDING" },
          orderBy: { createdAt: "asc" },
          take: PENDING_LIMIT,
          select: {
            merchantOid: true,
            purpose: true,
            amountMinor: true,
            currencyCode: true,
            createdAt: true,
            userId: true,
          },
        }),
        prisma.$queryRaw<{ count: number; total: number }[]>`
          SELECT COUNT(*)::int AS count,
                 COALESCE(SUM(gross_minor), 0)::int AS total
          FROM (
            SELECT DISTINCT h.id, h.gross_minor
            FROM escrow_holds h
            WHERE h.status = 'PENDING'
              AND (
                h.wallet_id IS NOT NULL
                OR EXISTS (
                  SELECT 1 FROM ledger_entries e
                  WHERE e.idempotency_key = 'escrow-hold:' || h.reference_key
                    AND e.direction = 'DEBIT'
                )
              )
          ) holds
        `,
        prisma.superAdminAuditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: AUDIT_LIMIT,
          select: {
            action: true,
            target: true,
            detail: true,
            actorUserId: true,
            createdAt: true,
          },
        }),
      ]);
    const anomalyRows: OpsAnomalyRow[] = anomalies.map((row) => ({
      kind: row.kind,
      merchantOid: row.merchantOid,
      expectedMinor: row.expectedMinor,
      reportedMinor: row.reportedMinor,
      detail: row.detail,
      createdAt: row.createdAt,
    }));
    const pending: PaytrPendingRow[] = pendingRows.map((row) => ({
      merchantOid: row.merchantOid,
      purpose: row.purpose,
      amountMinor: row.amountMinor,
      currencyCode: row.currencyCode,
      createdAt: row.createdAt,
      userId: row.userId,
    }));
    const auditRows: OpsAuditRow[] = audits.map((row) => ({
      action: row.action,
      target: row.target,
      detail: row.detail,
      actorUserId: row.actorUserId,
      createdAt: row.createdAt,
    }));
    const ghost = ghosts[0];
    return {
      access: "ok",
      readout: {
        anomalies: anomalyRows,
        licenseGapAnomalyCount,
        pending,
        pendingTotal,
        ghostCount: asCount(ghost?.count),
        ghostGrossMinor: asCount(ghost?.total),
        audits: auditRows,
      },
    };
  } catch {
    return { access: "unavailable" };
  }
}
