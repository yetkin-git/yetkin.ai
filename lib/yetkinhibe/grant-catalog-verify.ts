import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { logEvent } from "@/lib/kernel/observability/log";
import {
  GRANT_REVERIFY_AFTER_DAYS,
  planGrantMaintenance,
  type GrantMaintenancePlan,
} from "@/lib/yetkinhibe/grant-catalog-core";
import { quarantineGrantCalls, scanYetkinhibeGrantCatalog } from "@/lib/yetkinhibe/grant-catalog-live";

/**
 * Haftalık katalog bakımı — katalog tazelik penceresinin tek bekçisi (Ş1 / B-01).
 *
 * Üç iş yapar:
 * 1. **Yeniden doğrular**: hâlâ açık ve doğrulaması `GRANT_REVERIFY_AFTER_DAYS` (25) günü
 *    aşan satırlara `sourceVerifiedAt = now` damgası basar (`VERIFY` revizyonu). 30 günlük
 *    tazelik penceresi böylece hiçbir zaman kırılmaz; 23 Aralık 2026 sabahı katalog
 *    sıfırlanmaz.
 * 2. **Karantinaya alır**: geçersiz satırı kalıcı kapatır. Bu yazım **yalnız** burada ve
 *    admin uçlarında olur; GET okuma yolu yazmaz (Ş11 / B-08).
 * 3. **Kapanan pencereyi uyarır**: `CLOSED` satırın doğrulama damgası tazelenmez.
 */
export async function runGrantCatalogVerify(now: Date = new Date()): Promise<{
  scanned: number;
  closedWarnings: number;
  staleWarnings: number;
  refreshed: number;
  refreshFailed: number;
  quarantined: number;
  thresholdDays: number;
}> {
  const prisma = getPrisma();
  const rows = await prisma.yetkinhibeGrantCall.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      applicationOpensAt: true,
      applicationDeadline: true,
      sourceVerifiedAt: true,
    },
  });

  const plan: GrantMaintenancePlan = planGrantMaintenance(rows, now, GRANT_REVERIFY_AFTER_DAYS);

  let closedWarnings = 0;
  for (const row of plan.closed) {
    closedWarnings += 1;
    logEvent({
      level: "warn",
      event: "yetkinhibe.grant_catalog.closed",
      orderId: row.id,
      action: "CLOSING_SOON_TO_CLOSED",
      reason: "deadline_passed",
    });
  }

  let staleWarnings = 0;
  let refreshed = 0;
  let refreshFailed = 0;
  const { verifyGrantCall } = await import("@/lib/yetkinhibe/grant-call-admin");
  for (const row of [...plan.refresh, ...plan.unverified]) {
    staleWarnings += 1;
    try {
      const result = await verifyGrantCall(row.id, null, now);
      if (result.ok) {
        refreshed += 1;
      } else {
        refreshFailed += 1;
      }
    } catch {
      refreshFailed += 1;
    }
    logEvent({
      level: refreshFailed > 0 ? "warn" : "info",
      event: "yetkinhibe.grant_catalog.reverified",
      orderId: row.id,
      action: "VERIFY",
      reason: "older_than_threshold",
    });
  }

  let quarantined = 0;
  try {
    const scan = await scanYetkinhibeGrantCatalog(now);
    if (scan.invalidIds.length > 0) {
      const result = await quarantineGrantCalls(scan.invalidIds);
      quarantined = result.quarantined.length;
      for (const id of result.quarantined) {
        logEvent({
          level: "error",
          event: "yetkinhibe.grant_catalog.quarantine",
          orderId: id,
          action: "QUARANTINE",
          reason: "invalid_row",
        });
      }
      for (const id of result.failed) {
        logEvent({
          level: "error",
          event: "yetkinhibe.grant_catalog.quarantine_failed",
          orderId: id,
          reason: "invalid_row",
        });
      }
    }
  } catch {
    // Katalog okunamadıysa karantina turu atlanır; yeniden doğrulama sonucu yine döner.
  }

  logEvent({
    level: refreshFailed > 0 ? "warn" : "info",
    event: "yetkinhibe.grant_catalog.maintenance",
    action: "VERIFY_SWEEP",
    status: refreshed,
    reason: `threshold_${GRANT_REVERIFY_AFTER_DAYS}d`,
  });

  return {
    scanned: rows.length,
    closedWarnings,
    staleWarnings,
    refreshed,
    refreshFailed,
    quarantined,
    thresholdDays: GRANT_REVERIFY_AFTER_DAYS,
  };
}
