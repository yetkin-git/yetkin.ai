import { loadLicenseGapSnapshot } from "@/app/api/(kernel)/payments/license-gap-runtime";
import { SUPER_ADMIN_AUDIT_SEAL_MISSED } from "@/lib/kernel/admin/audit-log";
import { bindSuperAdminAuditWriter } from "@/lib/kernel/admin/prisma-super-admin-audit";
import { parseLicenseGapRefundBody, selectLicenseGap } from "@/lib/kernel/admin/ops-desk";
import { requireSuperAdmin } from "@/lib/kernel/auth/session";
import { getPrisma } from "@/lib/kernel/db";
import { ConflictError, ServiceUnavailableError } from "@/lib/kernel/http/errors";
import { jsonFail, jsonFromUnknown, jsonOk } from "@/lib/kernel/http/json";
import { bindLedgerStore } from "@/lib/kernel/ledger/prisma-store";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { evaluateClearedLicenseGaps } from "@/lib/kernel/payments/license-gap";
import { refundLicenseGapExact } from "@/lib/kernel/payments/license-gap-refund";
import { getPaytrCheckoutCredentials } from "@/lib/kernel/payments/paytr/checkout";
import { bindWalletCardRefundStore } from "@/lib/kernel/payments/prisma-wallet-card-refund";
import type { WalletCardRefundPorts } from "@/lib/kernel/payments/wallet-card-refund";

export const auth = "admin" as const;

export async function POST(request: Request) {
  try {
    const session = await requireSuperAdmin(request);
    const body: unknown = await request.json().catch(() => null);
    const parsed = parseLicenseGapRefundBody(body);
    if ("error" in parsed) {
      return jsonFail(parsed.error, 400, undefined, request);
    }
    let snapshot;
    try {
      snapshot = await loadLicenseGapSnapshot();
    } catch {
      throw new ServiceUnavailableError("Sapma listesi okunamadı. İade başlatılmadı.");
    }
    const gap = selectLicenseGap(evaluateClearedLicenseGaps(snapshot).gaps, parsed.merchantOid);
    if (!gap) {
      throw new ConflictError("Bu sipariş sapma listesinde yok. Tutar serbest bırakılmaz.");
    }
    const prisma = getPrisma();
    const order = await prisma.paymentOrder.findUnique({
      where: { merchantOid: gap.merchantOid },
      select: { amountMinor: true, status: true },
    });
    if (!order || order.status !== "CLEARED" || order.amountMinor !== gap.amountMinor) {
      throw new ConflictError("Sipariş tutarı sapma ile aynı değil. İade başlatılmadı.");
    }
    const result = await prisma.$transaction(
      async (tx) => {
        const ports: WalletCardRefundPorts = {
          refunds: bindWalletCardRefundStore(tx),
          ledger: bindLedgerStore(tx) as LedgerStore,
          paytrConfigured: getPaytrCheckoutCredentials() != null,
        };
        return refundLicenseGapExact(
          {
            ...ports,
            audit: bindSuperAdminAuditWriter(tx),
            reservedMinor: async (merchantOid) => {
              const rows = await tx.$queryRaw<{ reserved: number }[]>`
                SELECT COALESCE(SUM(amount_minor), 0)::int AS reserved
                FROM wallet_card_refunds
                WHERE merchant_oid = ${merchantOid}
                  AND status IN ('PENDING', 'ACCEPTED', 'SUCCEEDED', 'REQUESTED')
              `;
              return Number(rows[0]?.reserved ?? 0);
            },
          },
          { actorUserId: session.id, gap, reason: parsed.reason },
        );
      },
      { maxWait: 10_000, timeout: 20_000 },
    );
    if (!result) {
      throw new ConflictError(SUPER_ADMIN_AUDIT_SEAL_MISSED);
    }
    return jsonOk({ outcome: result.outcome, reason: result.reason }, 200, undefined, request);
  } catch (error) {
    return jsonFromUnknown(error, 400, undefined, request);
  }
}
