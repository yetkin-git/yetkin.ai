import type { FunnelCohortBucketId, FunnelRange, FunnelStepId } from "@/lib/kernel/admin/funnel-constants";

export type FunnelStepUnit = "unique_users" | "impressions";
export type FunnelConversionKind = "unique_user" | "impressions_per_stamp";

export type FunnelWindow = {
  range: FunnelRange;
  timeZone: "Europe/Istanbul";
  fromYmd: string;
  toYmdExclusive: string;
  from: Date;
  to: Date;
};

export type FunnelStepMetric = {
  id: FunnelStepId;
  count: number;
  unit: FunnelStepUnit;
  conversionKind: FunnelConversionKind;
  conversionFromPrevious: number | null;
  dropOffFromPrevious: number | null;
};

export type FunnelCohortBucket = {
  id: FunnelCohortBucketId;
  n: number;
};

/** Pencere içi kayıt kohortu — kişi tanesi, PII yok. */
export type FunnelCohortMetric = {
  registrants: number;
  converted: number;
  stillOpen: number;
  buckets: FunnelCohortBucket[];
  cumulative: {
    withinSameDay: number | null;
    within3d: number | null;
    within7d: number | null;
    within30d: number | null;
  };
  medianHours: number | null;
  observationIncomplete: boolean;
};

/** Cüzdan yükleme emirleri — emir tanesi, PII yok. */
export type FunnelLeakMetric = {
  opened: number;
  pendingInFlight: number;
  pendingStale: number;
  paid: number;
  failed: number;
  cleared: number;
  checkoutLeak: number | null;
  cashLeakMinor: number;
  clearedRate: number | null;
};

export type FunnelSnapshot = {
  window: FunnelWindow;
  steps: FunnelStepMetric[];
  cohort: FunnelCohortMetric;
  leak: FunnelLeakMetric;
  generatedAt: Date;
};

export type AdminFunnelBoard =
  | { access: "forbidden" }
  | { access: "unavailable" }
  | { access: "ok"; snapshot: FunnelSnapshot };

/** BFF / RSC tel — Date yok, PII yok. */
export type FunnelBoardWire = {
  window: {
    range: FunnelRange;
    timeZone: "Europe/Istanbul";
    from: string;
    to: string;
    fromYmd: string;
    toYmdExclusive: string;
  };
  steps: FunnelStepMetric[];
  cohort: FunnelCohortMetric;
  leak: FunnelLeakMetric;
  generatedAt: string;
};
