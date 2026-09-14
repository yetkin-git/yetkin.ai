import "server-only";

import {
  FUNNEL_CLEARED_STATUS,
  FUNNEL_FAILED_STATUS,
  FUNNEL_GRANT_LOCK_LIKE,
  FUNNEL_PAID_STATUS,
  FUNNEL_PENDING_STATUS,
  FUNNEL_TIME_ZONE,
  FUNNEL_VISA_SOURCE_KIND,
  FUNNEL_VIZE_HIT_STEP,
  FUNNEL_WALLET_PURPOSE,
  PAYTR_PENDING_TIMEOUT_MS,
  type FunnelRange,
  type FunnelStepId,
} from "@/lib/kernel/admin/funnel-constants";
import { buildCohortMetrics, buildFunnelStepMetrics, buildLeakMetrics } from "@/lib/kernel/admin/funnel-rates";
import type { FunnelSnapshot } from "@/lib/kernel/admin/funnel-types";
import { resolveFunnelWindow } from "@/lib/kernel/admin/funnel-window";
import { getPrisma } from "@/lib/kernel/db";

export type FunnelQueryPort = {
  $queryRaw: <T = unknown>(query: TemplateStringsArray, ...values: unknown[]) => Promise<T>;
};

type CountRow = { n: bigint | number | null };

type CohortLeakRow = {
  registrants?: bigint | number | null;
  converted?: bigint | number | null;
  still_open?: bigint | number | null;
  same_day?: bigint | number | null;
  d1_3?: bigint | number | null;
  d4_7?: bigint | number | null;
  d8_30?: bigint | number | null;
  after_30?: bigint | number | null;
  median_hours?: unknown;
  opened?: bigint | number | null;
  pending_in_flight?: bigint | number | null;
  pending_stale?: bigint | number | null;
  paid?: bigint | number | null;
  failed?: bigint | number | null;
  cleared?: bigint | number | null;
  cash_leak_minor?: bigint | number | null;
};

function asCount(rows: CountRow[]): number {
  const raw = rows[0]?.n ?? 0;
  const n = typeof raw === "bigint" ? Number(raw) : Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    return 0;
  }
  return Math.trunc(n);
}

function asInt(value: unknown): number {
  if (value == null) {
    return 0;
  }
  const n = typeof value === "bigint" ? Number(value) : Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return 0;
  }
  return Math.trunc(n);
}

function asNullableHours(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "object") {
    const decimal = value as { toNumber?: () => number };
    if (typeof decimal.toNumber === "function") {
      const n = decimal.toNumber();
      if (!Number.isFinite(n) || n < 0) {
        return null;
      }
      return n;
    }
  }
  const n = typeof value === "bigint" ? Number(value) : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return null;
  }
  return n;
}

async function countDistinct(query: Promise<CountRow[]>): Promise<number> {
  return asCount(await query);
}

/**
 * Altı adım — 1–5 COUNT(DISTINCT user_id), 6 günlük gösterim toplamı.
 * Pencere Europe/Istanbul takvim günüdür. sa_grant: bağışı ve freelancer damgası süzülür.
 */
export async function queryFunnelSnapshot(
  range: FunnelRange,
  now: Date = new Date(),
  db: FunnelQueryPort = getPrisma(),
): Promise<FunnelSnapshot> {
  const window = resolveFunnelWindow(range, now);
  const fromYmd = window.fromYmd;
  const toYmdExclusive = window.toYmdExclusive;
  const zone = FUNNEL_TIME_ZONE;
  const grantLike = FUNNEL_GRANT_LOCK_LIKE;
  const visaKind = FUNNEL_VISA_SOURCE_KIND;
  const walletPurpose = FUNNEL_WALLET_PURPOSE;
  const cleared = FUNNEL_CLEARED_STATUS;
  const pending = FUNNEL_PENDING_STATUS;
  const paid = FUNNEL_PAID_STATUS;
  const failed = FUNNEL_FAILED_STATUS;
  const vizeStep = FUNNEL_VIZE_HIT_STEP;
  const staleBefore = new Date(now.getTime() - PAYTR_PENDING_TIMEOUT_MS);

  const [register, walletCleared, purchaseSettled, examPass, visaStamp, vizeHit, cohortLeakRows] = await Promise.all([
    countDistinct(
      db.$queryRaw<CountRow[]>`
        SELECT COUNT(DISTINCT id)::bigint AS n
        FROM users
        WHERE ((created_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date >= ${fromYmd}::date
          AND ((created_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date < ${toYmdExclusive}::date
      `,
    ),
    countDistinct(
      db.$queryRaw<CountRow[]>`
        SELECT COUNT(DISTINCT user_id)::bigint AS n
        FROM payment_orders
        WHERE status = ${cleared}
          AND purpose = ${walletPurpose}
          AND cleared_at IS NOT NULL
          AND ((cleared_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date >= ${fromYmd}::date
          AND ((cleared_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date < ${toYmdExclusive}::date
      `,
    ),
    countDistinct(
      db.$queryRaw<CountRow[]>`
        SELECT COUNT(DISTINCT user_id)::bigint AS n
        FROM academy_purchases
        WHERE settled_at IS NOT NULL
          AND price_lock_id NOT LIKE ${grantLike}
          AND ((settled_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date >= ${fromYmd}::date
          AND ((settled_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date < ${toYmdExclusive}::date
      `,
    ),
    countDistinct(
      db.$queryRaw<CountRow[]>`
        SELECT COUNT(DISTINCT a.user_id)::bigint AS n
        FROM academy_exam_attempts a
        INNER JOIN academy_purchases p ON p.id = a.purchase_id
        WHERE a.passed = true
          AND p.price_lock_id NOT LIKE ${grantLike}
          AND ((a.submitted_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date >= ${fromYmd}::date
          AND ((a.submitted_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date < ${toYmdExclusive}::date
      `,
    ),
    countDistinct(
      db.$queryRaw<CountRow[]>`
        SELECT COUNT(DISTINCT user_id)::bigint AS n
        FROM career_visa_stamps
        WHERE source_kind = ${visaKind}
          AND ((issued_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date >= ${fromYmd}::date
          AND ((issued_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date < ${toYmdExclusive}::date
      `,
    ),
    countDistinct(
      db.$queryRaw<CountRow[]>`
        SELECT COALESCE(SUM(count), 0)::bigint AS n
        FROM funnel_daily_counters
        WHERE step = ${vizeStep}
          AND day >= ${fromYmd}::date
          AND day < ${toYmdExclusive}::date
      `,
    ),
    db.$queryRaw<CohortLeakRow[]>`
      WITH cohort_users AS (
        SELECT
          u.id,
          u.created_at,
          (
            SELECT MIN(po.cleared_at)
            FROM payment_orders po
            WHERE po.user_id = u.id
              AND po.status = ${cleared}
              AND po.purpose = ${walletPurpose}
              AND po.cleared_at IS NOT NULL
          ) AS first_cleared_at
        FROM users u
        WHERE ((u.created_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date >= ${fromYmd}::date
          AND ((u.created_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date < ${toYmdExclusive}::date
      ),
      cohort_lag AS (
        SELECT
          id,
          first_cleared_at,
          CASE
            WHEN first_cleared_at IS NULL THEN NULL
            ELSE (
              ((first_cleared_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date
              - ((created_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date
            )
          END AS lag_days,
          CASE
            WHEN first_cleared_at IS NULL THEN NULL
            ELSE EXTRACT(EPOCH FROM (first_cleared_at - created_at)) / 3600.0
          END AS lag_hours
        FROM cohort_users
      ),
      cohort AS (
        SELECT
          COUNT(*)::bigint AS registrants,
          COUNT(*) FILTER (WHERE first_cleared_at IS NOT NULL)::bigint AS converted,
          COUNT(*) FILTER (WHERE first_cleared_at IS NULL)::bigint AS still_open,
          COUNT(*) FILTER (WHERE lag_days = 0)::bigint AS same_day,
          COUNT(*) FILTER (WHERE lag_days BETWEEN 1 AND 3)::bigint AS d1_3,
          COUNT(*) FILTER (WHERE lag_days BETWEEN 4 AND 7)::bigint AS d4_7,
          COUNT(*) FILTER (WHERE lag_days BETWEEN 8 AND 30)::bigint AS d8_30,
          COUNT(*) FILTER (WHERE lag_days > 30)::bigint AS after_30,
          percentile_cont(0.5) WITHIN GROUP (ORDER BY lag_hours)
            FILTER (WHERE lag_hours IS NOT NULL) AS median_hours
        FROM cohort_lag
      ),
      leak AS (
        SELECT
          COUNT(*)::bigint AS opened,
          COUNT(*) FILTER (
            WHERE status = ${pending} AND created_at >= ${staleBefore}
          )::bigint AS pending_in_flight,
          COUNT(*) FILTER (
            WHERE status = ${pending} AND created_at < ${staleBefore}
          )::bigint AS pending_stale,
          COUNT(*) FILTER (WHERE status = ${paid})::bigint AS paid,
          COUNT(*) FILTER (WHERE status = ${failed})::bigint AS failed,
          COUNT(*) FILTER (WHERE status = ${cleared})::bigint AS cleared,
          COALESCE(SUM(amount_minor) FILTER (WHERE status = ${paid}), 0)::bigint AS cash_leak_minor
        FROM payment_orders
        WHERE purpose = ${walletPurpose}
          AND ((created_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date >= ${fromYmd}::date
          AND ((created_at AT TIME ZONE 'UTC') AT TIME ZONE ${zone})::date < ${toYmdExclusive}::date
      )
      SELECT
        cohort.registrants,
        cohort.converted,
        cohort.still_open,
        cohort.same_day,
        cohort.d1_3,
        cohort.d4_7,
        cohort.d8_30,
        cohort.after_30,
        cohort.median_hours,
        leak.opened,
        leak.pending_in_flight,
        leak.pending_stale,
        leak.paid,
        leak.failed,
        leak.cleared,
        leak.cash_leak_minor
      FROM cohort CROSS JOIN leak
    `,
  ]);

  const counts: Record<FunnelStepId, number> = {
    register,
    wallet_cleared: walletCleared,
    purchase_settled: purchaseSettled,
    exam_pass: examPass,
    visa_stamp: visaStamp,
    vize_hit: vizeHit,
  };

  const cohortLeak = cohortLeakRows[0] ?? {};
  return {
    window,
    steps: buildFunnelStepMetrics(counts),
    cohort: buildCohortMetrics(
      {
        registrants: asInt(cohortLeak.registrants),
        converted: asInt(cohortLeak.converted),
        stillOpen: asInt(cohortLeak.still_open),
        sameDay: asInt(cohortLeak.same_day),
        d1_3: asInt(cohortLeak.d1_3),
        d4_7: asInt(cohortLeak.d4_7),
        d8_30: asInt(cohortLeak.d8_30),
        after30: asInt(cohortLeak.after_30),
        medianHours: asNullableHours(cohortLeak.median_hours),
      },
      range,
    ),
    leak: buildLeakMetrics({
      opened: asInt(cohortLeak.opened),
      pendingInFlight: asInt(cohortLeak.pending_in_flight),
      pendingStale: asInt(cohortLeak.pending_stale),
      paid: asInt(cohortLeak.paid),
      failed: asInt(cohortLeak.failed),
      cleared: asInt(cohortLeak.cleared),
      cashLeakMinor: asInt(cohortLeak.cash_leak_minor),
    }),
    generatedAt: now,
  };
}
