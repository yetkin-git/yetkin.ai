import {
  FUNNEL_COHORT_BUCKET_IDS,
  FUNNEL_STEP_IDS,
  type FunnelCohortBucketId,
  type FunnelRange,
  type FunnelStepId,
} from "@/lib/kernel/admin/funnel-constants";
import type {
  FunnelCohortMetric,
  FunnelConversionKind,
  FunnelLeakMetric,
  FunnelStepMetric,
  FunnelStepUnit,
} from "@/lib/kernel/admin/funnel-types";

const STEP_UNIT: Record<FunnelStepId, FunnelStepUnit> = {
  register: "unique_users",
  wallet_cleared: "unique_users",
  purchase_settled: "unique_users",
  exam_pass: "unique_users",
  visa_stamp: "unique_users",
  vize_hit: "impressions",
};

const STEP_CONVERSION_KIND: Record<FunnelStepId, FunnelConversionKind> = {
  register: "unique_user",
  wallet_cleared: "unique_user",
  purchase_settled: "unique_user",
  exam_pass: "unique_user",
  visa_stamp: "unique_user",
  vize_hit: "impressions_per_stamp",
};

function ratio(current: number, previous: number): number | null {
  if (previous <= 0 || !Number.isFinite(previous) || !Number.isFinite(current)) {
    return null;
  }
  return current / previous;
}

/**
 * Adım 1–5: tekil kişi dönüşümü. Adım 6: gösterim / damga — kişi %'si değildir.
 * Payda 0 iken sahte %100 basılmaz.
 */
export function buildFunnelStepMetrics(counts: Record<FunnelStepId, number>): FunnelStepMetric[] {
  return FUNNEL_STEP_IDS.map((id, index) => {
    const previousId = index === 0 ? null : FUNNEL_STEP_IDS[index - 1];
    const previous = previousId ? counts[previousId] : null;
    const count = Math.max(0, Math.trunc(counts[id] || 0));
    const conversionFromPrevious = previous == null ? null : ratio(count, previous);
    const dropOffFromPrevious =
      conversionFromPrevious == null || STEP_CONVERSION_KIND[id] !== "unique_user"
        ? null
        : 1 - conversionFromPrevious;
    return {
      id,
      count,
      unit: STEP_UNIT[id],
      conversionKind: STEP_CONVERSION_KIND[id],
      conversionFromPrevious,
      dropOffFromPrevious,
    };
  });
}

export type FunnelCohortCounts = {
  registrants: number;
  converted: number;
  stillOpen: number;
  sameDay: number;
  d1_3: number;
  d4_7: number;
  d8_30: number;
  after30: number;
  medianHours: number | null;
};

export type FunnelLeakCounts = {
  opened: number;
  pendingInFlight: number;
  pendingStale: number;
  paid: number;
  failed: number;
  cleared: number;
  cashLeakMinor: number;
};

function truncNonNeg(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }
  return Math.trunc(value);
}

const BUCKET_COUNT_KEY: Record<FunnelCohortBucketId, keyof FunnelCohortCounts> = {
  same_day: "sameDay",
  d1_3: "d1_3",
  d4_7: "d4_7",
  d8_30: "d8_30",
  after_30: "after30",
  still_open: "stillOpen",
};

/**
 * Kayıt kohortu kovaları ve kümülatif oranlar. Payda 0 iken sahte %100 yok.
 * today / 7d pencerelerinde 30 günlük kova henüz dolmamıştır.
 */
export function buildCohortMetrics(counts: FunnelCohortCounts, range: FunnelRange): FunnelCohortMetric {
  const registrants = truncNonNeg(counts.registrants);
  const sameDay = truncNonNeg(counts.sameDay);
  const d1_3 = truncNonNeg(counts.d1_3);
  const d4_7 = truncNonNeg(counts.d4_7);
  const d8_30 = truncNonNeg(counts.d8_30);
  const medianHours =
    counts.medianHours == null || !Number.isFinite(counts.medianHours) || counts.medianHours < 0
      ? null
      : counts.medianHours;
  return {
    registrants,
    converted: truncNonNeg(counts.converted),
    stillOpen: truncNonNeg(counts.stillOpen),
    buckets: FUNNEL_COHORT_BUCKET_IDS.map((id) => ({
      id,
      n: truncNonNeg(Number(counts[BUCKET_COUNT_KEY[id]])),
    })),
    cumulative: {
      withinSameDay: ratio(sameDay, registrants),
      within3d: ratio(sameDay + d1_3, registrants),
      within7d: ratio(sameDay + d1_3 + d4_7, registrants),
      within30d: ratio(sameDay + d1_3 + d4_7 + d8_30, registrants),
    },
    medianHours,
    observationIncomplete: range === "today" || range === "7d",
  };
}

/**
 * Checkout kaçağı = bayat PENDING + FAILED. Uçuştaki PENDING (< 2 saat) paydada durur, payda kaçakta sayılmaz.
 * Nakit kaçağı tutarı (PAID) ayrı alandır. Payda 0 iken sahte %100 yok.
 */
export function buildLeakMetrics(counts: FunnelLeakCounts): FunnelLeakMetric {
  const opened = truncNonNeg(counts.opened);
  const pendingStale = truncNonNeg(counts.pendingStale);
  const failed = truncNonNeg(counts.failed);
  const cleared = truncNonNeg(counts.cleared);
  return {
    opened,
    pendingInFlight: truncNonNeg(counts.pendingInFlight),
    pendingStale,
    paid: truncNonNeg(counts.paid),
    failed,
    cleared,
    checkoutLeak: ratio(pendingStale + failed, opened),
    cashLeakMinor: truncNonNeg(counts.cashLeakMinor),
    clearedRate: ratio(cleared, opened),
  };
}
