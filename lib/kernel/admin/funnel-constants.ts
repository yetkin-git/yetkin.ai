/**
 * B2C kazanım hunisi sabitleri — kernel ↛ akademi.
 * `sa_grant:` öneki academy enrolment SSOT ile aynı dizgedir; motor import edilmez.
 */

export const FUNNEL_TIME_ZONE = "Europe/Istanbul" as const;

/** Super Admin bağışı — nakit SETTLED değildir; ticari huniden çıkarılır. */
export const FUNNEL_GRANT_LOCK_PREFIX = "sa_grant:" as const;
export const FUNNEL_GRANT_LOCK_LIKE = `${FUNNEL_GRANT_LOCK_PREFIX}%` as const;

export const FUNNEL_WALLET_PURPOSE = "wallet-top-up" as const;
export const FUNNEL_PENDING_STATUS = "PENDING" as const;
export const FUNNEL_PAID_STATUS = "PAID" as const;
export const FUNNEL_FAILED_STATUS = "FAILED" as const;
export const FUNNEL_CLEARED_STATUS = "CLEARED" as const;

/**
 * PayTR PENDING bayat eşiği (2 saat).
 * `lib/kernel/payments/paytr/reconcile.ts` ile aynı milisaniye — academy import yok.
 */
export const PAYTR_PENDING_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export const FUNNEL_COHORT_BUCKET_IDS = [
  "same_day",
  "d1_3",
  "d4_7",
  "d8_30",
  "after_30",
  "still_open",
] as const;

export type FunnelCohortBucketId = (typeof FUNNEL_COHORT_BUCKET_IDS)[number];

/** B2C damgası. FREELANCER_RELEASE ticari huniden süzülür. */
export const FUNNEL_VISA_SOURCE_KIND = "ACADEMY_CERTIFICATE" as const;
export const FUNNEL_EXCLUDED_VISA_SOURCE_KIND = "FREELANCER_RELEASE" as const;

export const FUNNEL_VIZE_HIT_STEP = "vize_hit" as const;

export const FUNNEL_STEP_IDS = [
  "register",
  "wallet_cleared",
  "purchase_settled",
  "exam_pass",
  "visa_stamp",
  "vize_hit",
] as const;

export type FunnelStepId = (typeof FUNNEL_STEP_IDS)[number];

export const FUNNEL_RANGES = ["today", "7d", "30d"] as const;
export type FunnelRange = (typeof FUNNEL_RANGES)[number];
export const FUNNEL_DEFAULT_RANGE: FunnelRange = "7d";

export const FUNNEL_RANGE_INVALID = "Huni penceresi today, 7d veya 30d olmalıdır." as const;

export function isFunnelRange(value: string): value is FunnelRange {
  return (FUNNEL_RANGES as readonly string[]).includes(value);
}

export function isCommercialFunnelPriceLockId(priceLockId: string): boolean {
  return !priceLockId.startsWith(FUNNEL_GRANT_LOCK_PREFIX);
}

export function isAcademyFunnelVisaSource(sourceKind: string): boolean {
  return sourceKind === FUNNEL_VISA_SOURCE_KIND;
}
