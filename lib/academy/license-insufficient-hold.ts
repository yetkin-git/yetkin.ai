import { parseAcademyLicenseSlug } from "@/lib/academy/paytr-license-bridge";
import { isPrismaUniqueViolation } from "@/lib/kernel/db-errors";
import { logEvent } from "@/lib/kernel/observability/log";
import type { PaymentOrderSnapshot } from "@/lib/kernel/payments/clearing";
import { requestPaytrRefund } from "@/lib/kernel/payments/paytr/refund";
import {
  settleWalletCardRefundDebit,
  type WalletCardRefundPorts,
} from "@/lib/kernel/payments/wallet-card-refund";

/** Aynı merchantOid ikinci kart iadesi açmaz. */
export const ACADEMY_UNLICENSED_CREDIT_REFUND_KEY_PREFIX = "academy-license-insufficient:" as const;

export function academyUnlicensedCreditRefundKey(merchantOid: string): string {
  return `${ACADEMY_UNLICENSED_CREDIT_REFUND_KEY_PREFIX}${merchantOid.trim()}`;
}

export type AcademyUnlicensedCreditPlan = {
  merchantOid: string;
  userId: string;
  amountMinor: number;
  idempotencyKey: string;
  reason: "insufficient_balance_unlicensed_credit";
};

export type AcademyUnlicensedCreditOutcome =
  | "refunded"
  | "replay"
  | "warned"
  | "skipped";

/**
 * CLEARED akademi kasası lisansı yazamadığında yalnız bu siparişin tutarı iade adayıdır.
 * Düz cüzdan yüklemesi ve henüz kapanmamış sipariş bu plana girmez.
 */
export function planAcademyUnlicensedCreditRefund(
  order: Pick<PaymentOrderSnapshot, "status" | "purpose" | "merchantOid" | "userId" | "amountMinor">,
): AcademyUnlicensedCreditPlan | null {
  if (order.status !== "CLEARED" || !parseAcademyLicenseSlug(order.purpose)) {
    return null;
  }
  const merchantOid = order.merchantOid.trim();
  if (!merchantOid || !Number.isInteger(order.amountMinor) || order.amountMinor <= 0) {
    return null;
  }
  return {
    merchantOid,
    userId: order.userId,
    amountMinor: order.amountMinor,
    idempotencyKey: academyUnlicensedCreditRefundKey(merchantOid),
    reason: "insufficient_balance_unlicensed_credit",
  };
}

/**
 * Lisans açılmayan tahsilatı karta geri yazar.
 * Bakiye sipariş tutarını karşılamıyorsa PayTR çağrılmaz; uyarı satırı kalır.
 * Aynı anahtar ikinci iade başlatmaz. Webhook bu fonksiyonun hatasını yutmalıdır.
 */
export async function refundUnlicensedAcademyCredit(
  ports: WalletCardRefundPorts,
  order: PaymentOrderSnapshot,
): Promise<{ outcome: AcademyUnlicensedCreditOutcome; reason: string }> {
  const plan = planAcademyUnlicensedCreditRefund(order);
  if (!plan) {
    return { outcome: "skipped", reason: "not_applicable" };
  }

  const existing = await ports.refunds.findByIdempotencyKey(plan.idempotencyKey);
  if (existing) {
    logEvent({
      level: "info",
      event: "academy.license.unlicensed_credit",
      userId: plan.userId,
      merchantOid: plan.merchantOid,
      orderId: order.id,
      amountMinor: plan.amountMinor,
      purpose: order.purpose,
      reason: "replay",
      applied: existing.status === "SUCCEEDED",
    });
    return { outcome: "replay", reason: existing.status };
  }

  const balanceMinor = await ports.refunds.lockBalanceMinor(plan.userId);
  if (balanceMinor < plan.amountMinor || ports.paytrConfigured === false) {
    const reason = balanceMinor < plan.amountMinor ? "balance_short_of_order" : "paytr_unconfigured";
    try {
      await ports.refunds.insert({
        userId: plan.userId,
        merchantOid: plan.merchantOid,
        amountMinor: plan.amountMinor,
        status: "REQUESTED",
        idempotencyKey: plan.idempotencyKey,
        detail: reason,
      });
    } catch (error) {
      if (isPrismaUniqueViolation(error)) {
        return { outcome: "replay", reason: "duplicate" };
      }
      throw error;
    }
    logEvent({
      level: "warn",
      event: "academy.license.unlicensed_credit",
      userId: plan.userId,
      merchantOid: plan.merchantOid,
      orderId: order.id,
      amountMinor: plan.amountMinor,
      purpose: order.purpose,
      reason,
      applied: false,
    });
    return { outcome: "warned", reason };
  }

  let row;
  try {
    row = await ports.refunds.insert({
      userId: plan.userId,
      merchantOid: plan.merchantOid,
      amountMinor: plan.amountMinor,
      status: "PENDING",
      idempotencyKey: plan.idempotencyKey,
    });
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      return { outcome: "replay", reason: "duplicate" };
    }
    throw error;
  }

  const callPaytr = ports.callPaytr ?? requestPaytrRefund;
  const paytr = await callPaytr({ merchantOid: plan.merchantOid, amountMinor: plan.amountMinor });
  if (!paytr.ok) {
    await ports.refunds.mark(row.id, "FAILED", paytr.reason, true);
    logEvent({
      level: "warn",
      event: "academy.license.unlicensed_credit",
      userId: plan.userId,
      merchantOid: plan.merchantOid,
      orderId: order.id,
      amountMinor: plan.amountMinor,
      purpose: order.purpose,
      reason: paytr.reason,
      applied: false,
      errorName: "PaytrRefundRejected",
    });
    return { outcome: "warned", reason: paytr.reason };
  }

  await ports.refunds.mark(row.id, "ACCEPTED", paytr.returnAmount, false);
  try {
    await settleWalletCardRefundDebit(ports, plan.userId, { ...row, status: "ACCEPTED" });
  } catch (error) {
    logEvent({
      level: "error",
      event: "academy.license.unlicensed_credit",
      userId: plan.userId,
      merchantOid: plan.merchantOid,
      orderId: order.id,
      amountMinor: plan.amountMinor,
      reason: "debit_failed",
      applied: false,
      errorName: error instanceof Error ? error.name : "unknown",
    });
    return { outcome: "warned", reason: "debit_failed" };
  }

  logEvent({
    level: "info",
    event: "academy.license.unlicensed_credit",
    userId: plan.userId,
    merchantOid: plan.merchantOid,
    orderId: order.id,
    amountMinor: plan.amountMinor,
    purpose: order.purpose,
    reason: plan.reason,
    applied: true,
  });
  return { outcome: "refunded", reason: plan.reason };
}
