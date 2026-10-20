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
export const FUNNEL_VITRINE_VISIT_STEP = "vitrine_visit" as const;
export const FUNNEL_FREE_LESSON_STEP = "free_lesson" as const;
export const FUNNEL_CHECKOUT_INTENT_STEP = "checkout_intent" as const;
export const FUNNEL_SETTLED_PURCHASE_STEP = "settled_purchase" as const;

/**
 * Pazar doğrulama — anonim gösterim, kişi kimliği yok.
 * `settled_purchase` sayaç değildir; ticari SETTLED tekil kişi sorgusunun aynısıdır.
 */
export const FUNNEL_ACQUISITION_STEP_IDS = [
  FUNNEL_VITRINE_VISIT_STEP,
  FUNNEL_FREE_LESSON_STEP,
  FUNNEL_CHECKOUT_INTENT_STEP,
  FUNNEL_SETTLED_PURCHASE_STEP,
] as const;

export type FunnelAcquisitionStepId = (typeof FUNNEL_ACQUISITION_STEP_IDS)[number];

/** Günlük sayaca yazılan adımlar. SETTLED bu listede yoktur. */
export const FUNNEL_COUNTER_STEP_IDS = [
  FUNNEL_VITRINE_VISIT_STEP,
  FUNNEL_FREE_LESSON_STEP,
  FUNNEL_CHECKOUT_INTENT_STEP,
  FUNNEL_VIZE_HIT_STEP,
] as const;

export type FunnelCounterStep = (typeof FUNNEL_COUNTER_STEP_IDS)[number];

/** B2C kazanım — iş tablolarından tekil kişi. Sıra değişmez. */
export const FUNNEL_COMMERCIAL_STEP_IDS = [
  "register",
  "wallet_cleared",
  "purchase_settled",
  "exam_pass",
  "visa_stamp",
  "vize_hit",
] as const;

/** Dört pazar adımı önde, altı kazanım adımı yerinde. */
export const FUNNEL_STEP_IDS = [
  ...FUNNEL_ACQUISITION_STEP_IDS,
  ...FUNNEL_COMMERCIAL_STEP_IDS,
] as const;

export type FunnelStepId = (typeof FUNNEL_STEP_IDS)[number];

export function isFunnelCounterStep(value: string): value is FunnelCounterStep {
  return (FUNNEL_COUNTER_STEP_IDS as readonly string[]).includes(value);
}

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
