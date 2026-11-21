import type { CheckoutInvoiceType } from "@/lib/kernel/identity/billing-info";

/** 30 gün. İlk ay ücretli çekim değildir; 1 TL kart doğrulamasıdır. */
export const COMMERCE_TRIAL_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;
/** PayTR kart saklama için sembolik doğrulama. */
export const COMMERCE_TRIAL_VERIFY_MINOR = 100;
export const COMMERCE_TRIAL_QUESTION_LIMIT = 250;
export const COMMERCE_TRIAL_OPTIMIZATION_LIMIT = 100;
export const COMMERCE_GRACE_MS = 3 * 24 * 60 * 60 * 1000;
export const COMMERCE_DUNNING_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const COMMERCE_DUNNING_MAX_ATTEMPTS = 3;

export type CommerceRenewalStatus = "PENDING" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";

export type CommerceRenewalRow = {
  status: CommerceRenewalStatus;
  listPriceMinor: number;
  expiresAt: Date | null;
  trialEndsAt?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  paytrUtoken?: string;
  paytrCtoken?: string;
  dunningAttempts?: number;
  lastDunningAt?: Date | null;
};

export function commerceMerchantTrialKey(billing: {
  invoiceType: CheckoutInvoiceType;
  vkn?: string | null;
  tckn?: string | null;
}): string | null {
  const raw = billing.invoiceType === "corporate" ? billing.vkn : billing.tckn;
  const digits = (raw ?? "").replace(/\D/g, "");
  if (digits.length !== 10 && digits.length !== 11) {
    return null;
  }
  return digits;
}

export function commerceTrialWindow(now: Date): { trialEndsAt: Date; currentPeriodEnd: Date } {
  const trialEndsAt = new Date(now.getTime() + COMMERCE_TRIAL_PERIOD_MS);
  return { trialEndsAt, currentPeriodEnd: trialEndsAt };
}

export function commercePeriodEnd(row: {
  currentPeriodEnd?: Date | null;
  trialEndsAt?: Date | null;
  expiresAt: Date | null;
}): Date | null {
  return row.currentPeriodEnd ?? row.trialEndsAt ?? row.expiresAt ?? null;
}

export function trialQuotaAllows(used: number, limit: number): boolean {
  return Number.isInteger(used) && Number.isInteger(limit) && used >= 0 && used < limit;
}

export function commerceGraceEndsAt(periodEnd: Date): Date {
  return new Date(periodEnd.getTime() + COMMERCE_GRACE_MS);
}

export type CommerceRenewalStep =
  | { kind: "skip" }
  | { kind: "cancel" }
  | { kind: "charge"; amountMinor: number }
  | { kind: "past_due" };

function attempts(row: CommerceRenewalRow): number {
  return row.dunningAttempts ?? 0;
}

function hasCardToken(row: CommerceRenewalRow): boolean {
  return Boolean(row.paytrUtoken?.trim() && row.paytrCtoken?.trim());
}

/**
 * Süresi dolan TRIALING / ACTIVE (iptal işaretsiz) çekime gider.
 * PAST_DUE 24 saatte bir, en fazla 3 deneme, 3 günlük esneklik içinde kalır.
 */
export function decideCommerceRenewal(row: CommerceRenewalRow, now: Date): CommerceRenewalStep {
  if (row.status === "PENDING" || row.status === "CANCELED") {
    return { kind: "skip" };
  }
  const end = commercePeriodEnd(row);
  if (!end) {
    return { kind: "skip" };
  }
  if (row.cancelAtPeriodEnd) {
    return end.getTime() <= now.getTime() ? { kind: "cancel" } : { kind: "skip" };
  }
  if (row.status !== "TRIALING" && row.status !== "ACTIVE" && row.status !== "PAST_DUE") {
    return { kind: "skip" };
  }
  if (end.getTime() > now.getTime()) {
    return { kind: "skip" };
  }
  if (now.getTime() >= commerceGraceEndsAt(end).getTime() || attempts(row) >= COMMERCE_DUNNING_MAX_ATTEMPTS) {
    return { kind: "cancel" };
  }
  if (row.status === "PAST_DUE" && row.lastDunningAt) {
    const wait = row.lastDunningAt.getTime() + COMMERCE_DUNNING_INTERVAL_MS;
    if (now.getTime() < wait) {
      return { kind: "skip" };
    }
  }
  if (!hasCardToken(row) || row.listPriceMinor <= 0) {
    return { kind: "past_due" };
  }
  return { kind: "charge", amountMinor: row.listPriceMinor };
}

export type CommerceRenewalPatch = {
  status: CommerceRenewalStatus;
  expiresAt: Date | null;
  currentPeriodEnd: Date | null;
  dunningAttempts: number;
  lastDunningAt: Date | null;
  cancelAtPeriodEnd: boolean;
};

function addMonth(from: Date): Date {
  const next = new Date(from.getTime());
  next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

export function applyCommerceRenewalResult(
  row: CommerceRenewalRow,
  step: CommerceRenewalStep,
  chargeOk: boolean,
  now: Date,
): CommerceRenewalPatch | null {
  const end = commercePeriodEnd(row);
  if (step.kind === "skip") {
    return null;
  }
  if (step.kind === "cancel") {
    return {
      status: "CANCELED",
      expiresAt: end,
      currentPeriodEnd: end,
      dunningAttempts: attempts(row),
      lastDunningAt: row.lastDunningAt ?? null,
      cancelAtPeriodEnd: true,
    };
  }
  if (step.kind === "charge" && chargeOk) {
    const base = end && end.getTime() > now.getTime() ? end : now;
    const nextEnd = addMonth(base);
    return {
      status: "ACTIVE",
      expiresAt: nextEnd,
      currentPeriodEnd: nextEnd,
      dunningAttempts: 0,
      lastDunningAt: null,
      cancelAtPeriodEnd: false,
    };
  }
  const nextAttempts = attempts(row) + 1;
  const graceOver = end != null && now.getTime() >= commerceGraceEndsAt(end).getTime();
  const exhausted = nextAttempts >= COMMERCE_DUNNING_MAX_ATTEMPTS || graceOver;
  return {
    status: exhausted ? "CANCELED" : "PAST_DUE",
    expiresAt: end,
    currentPeriodEnd: end,
    dunningAttempts: nextAttempts,
    lastDunningAt: now,
    cancelAtPeriodEnd: exhausted ? true : Boolean(row.cancelAtPeriodEnd),
  };
}
