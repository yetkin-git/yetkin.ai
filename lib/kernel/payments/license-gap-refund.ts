/**
 * Lisans sapmasından birebir kart iadesi.
 * Tutar sapmadaki sipariş kuruşudur. İstekten tutar okunmaz.
 * PayTR çağrısı veritabanı işlemiyle aynı atomda değildir.
 */
import { isPrismaUniqueViolation } from "@/lib/kernel/db-errors";
import type { SuperAdminAuditWriter } from "@/lib/kernel/admin/audit-log";
import { writeSuperAdminAudit } from "@/lib/kernel/admin/audit-log";
import { ConflictError } from "@/lib/kernel/http/errors";
import { logEvent } from "@/lib/kernel/observability/log";
import type { LicenseGap } from "@/lib/kernel/payments/license-gap";
import { requestPaytrRefund } from "@/lib/kernel/payments/paytr/refund";
import {
  settleWalletCardRefundDebit,
  WALLET_REFUND_IN_PROGRESS,
  type WalletCardRefundPorts,
  type WalletCardRefundRow,
} from "@/lib/kernel/payments/wallet-card-refund";

export const LICENSE_GAP_REFUND_KEY_PREFIX = "license-gap-refund:" as const;

export function licenseGapRefundKey(merchantOid: string): string {
  return `${LICENSE_GAP_REFUND_KEY_PREFIX}${merchantOid.trim()}`;
}

export type LicenseGapRefundOutcome = "refunded" | "replay" | "warned";

export type LicenseGapRefundPorts = WalletCardRefundPorts & {
  reservedMinor: (merchantOid: string) => Promise<number>;
  audit: SuperAdminAuditWriter;
};

async function seal(
  ports: LicenseGapRefundPorts,
  input: { actorUserId: string; gap: LicenseGap; reason: string; outcome: string },
): Promise<void> {
  const written = await writeSuperAdminAudit(ports.audit, {
    actorUserId: input.actorUserId,
    action: "manual_refund",
    target: input.gap.merchantOid,
    detail: `amountMinor=${input.gap.amountMinor} outcome=${input.outcome} ${input.reason}`,
  });
  if (!written) {
    throw new ConflictError("Süper yönetici mührü yazılamadı.");
  }
}

/**
 * Sapma satırının tutarını karta yazar. Serbest tutar parametresi yoktur.
 * Bakiye siparişi karşılamıyorsa PayTR çağrılmaz; talep satırı kalır.
 */
export async function refundLicenseGapExact(
  ports: LicenseGapRefundPorts,
  input: { actorUserId: string; gap: LicenseGap; reason: string },
): Promise<{ outcome: LicenseGapRefundOutcome; reason: string }> {
  const gap = input.gap;
  if (!Number.isInteger(gap.amountMinor) || gap.amountMinor <= 0) {
    throw new ConflictError("Sapma tutarı iade edilemez.");
  }
  const idempotencyKey = licenseGapRefundKey(gap.merchantOid);
  const existing = await ports.refunds.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    await seal(ports, { ...input, outcome: `replay:${existing.status}` });
    return { outcome: "replay", reason: existing.status };
  }
  const reserved = await ports.reservedMinor(gap.merchantOid);
  if (reserved >= gap.amountMinor) {
    await seal(ports, { ...input, outcome: "replay:reserved" });
    return { outcome: "replay", reason: "reserved" };
  }
  const open = await ports.refunds.listOpen(gap.userId);
  if (open.some((row) => row.status === "PENDING" || row.status === "ACCEPTED")) {
    throw new ConflictError(WALLET_REFUND_IN_PROGRESS);
  }

  const balanceMinor = await ports.refunds.lockBalanceMinor(gap.userId);
  if (balanceMinor < gap.amountMinor || ports.paytrConfigured === false) {
    const reason = balanceMinor < gap.amountMinor ? "balance_short_of_order" : "paytr_unconfigured";
    await insertOrReplay(ports, {
      userId: gap.userId,
      merchantOid: gap.merchantOid,
      amountMinor: gap.amountMinor,
      status: "REQUESTED",
      idempotencyKey,
      detail: reason,
    });
    await seal(ports, { ...input, outcome: `warned:${reason}` });
    logEvent({
      level: "warn",
      event: "license.gap.refund",
      userId: gap.userId,
      merchantOid: gap.merchantOid,
      orderId: gap.orderId,
      amountMinor: gap.amountMinor,
      reason,
      applied: false,
    });
    return { outcome: "warned", reason };
  }

  const row = await insertOrReplay(ports, {
    userId: gap.userId,
    merchantOid: gap.merchantOid,
    amountMinor: gap.amountMinor,
    status: "PENDING",
    idempotencyKey,
  });
  if (!row) {
    await seal(ports, { ...input, outcome: "replay:duplicate" });
    return { outcome: "replay", reason: "duplicate" };
  }

  const callPaytr = ports.callPaytr ?? requestPaytrRefund;
  const paytr = await callPaytr({ merchantOid: gap.merchantOid, amountMinor: gap.amountMinor });
  if (!paytr.ok) {
    await ports.refunds.mark(row.id, "FAILED", paytr.reason, true);
    await seal(ports, { ...input, outcome: `warned:${paytr.reason}` });
    return { outcome: "warned", reason: paytr.reason };
  }

  await ports.refunds.mark(row.id, "ACCEPTED", paytr.returnAmount, false);
  try {
    await settleWalletCardRefundDebit(ports, gap.userId, { ...row, status: "ACCEPTED" });
  } catch (error) {
    logEvent({
      level: "error",
      event: "license.gap.refund",
      userId: gap.userId,
      merchantOid: gap.merchantOid,
      orderId: gap.orderId,
      amountMinor: gap.amountMinor,
      reason: "debit_failed",
      applied: false,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    await seal(ports, { ...input, outcome: "warned:debit_failed" });
    return { outcome: "warned", reason: "debit_failed" };
  }
  await seal(ports, { ...input, outcome: "refunded" });
  logEvent({
    level: "info",
    event: "license.gap.refund",
    userId: gap.userId,
    merchantOid: gap.merchantOid,
    orderId: gap.orderId,
    amountMinor: gap.amountMinor,
    reason: "exact_order",
    applied: true,
  });
  return { outcome: "refunded", reason: "exact_order" };
}

async function insertOrReplay(
  ports: LicenseGapRefundPorts,
  input: {
    userId: string;
    merchantOid: string;
    amountMinor: number;
    status: WalletCardRefundRow["status"];
    idempotencyKey: string;
    detail?: string;
  },
): Promise<WalletCardRefundRow | null> {
  try {
    return await ports.refunds.insert(input);
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      return null;
    }
    throw error;
  }
}
