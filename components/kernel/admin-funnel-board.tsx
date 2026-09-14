import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { StatGrid } from "@/components/ui/stat-grid";
import {
  IconCheck,
  IconCoin,
  IconEye,
  IconPassport,
  IconPulse,
  IconUser,
  IconWallet,
} from "@/components/ui/icons";
import { ADMIN_SEN } from "@/lib/copy/sen-voice/admin";
import {
  FUNNEL_COHORT_BUCKET_IDS,
  FUNNEL_DEFAULT_RANGE,
  FUNNEL_RANGES,
  FUNNEL_STEP_IDS,
  type FunnelCohortBucketId,
  type FunnelRange,
  type FunnelStepId,
} from "@/lib/kernel/admin/funnel-constants";
import {
  formatFunnelCashLeak,
  formatFunnelConversion,
  formatFunnelCount,
  formatFunnelDropOff,
  formatFunnelHours,
  formatLeakPercent,
} from "@/lib/kernel/admin/funnel-display";
import type { AdminFunnelBoard, FunnelCohortMetric, FunnelLeakMetric } from "@/lib/kernel/admin/funnel-types";
import { ADMIN_SURFACE_PATH } from "@/lib/kernel/admin/types";
import type { ReactNode } from "react";

const STEP_ICONS: Record<FunnelStepId, ReactNode> = {
  register: <IconUser />,
  wallet_cleared: <IconWallet />,
  purchase_settled: <IconCoin />,
  exam_pass: <IconCheck />,
  visa_stamp: <IconPassport />,
  vize_hit: <IconEye />,
};

const RANGE_LABEL: Record<FunnelRange, string> = {
  today: ADMIN_SEN.funnel.rangeToday,
  "7d": ADMIN_SEN.funnel.range7d,
  "30d": ADMIN_SEN.funnel.range30d,
};

function rangeHref(range: FunnelRange): string {
  return range === FUNNEL_DEFAULT_RANGE ? ADMIN_SURFACE_PATH : `${ADMIN_SURFACE_PATH}?range=${range}`;
}

const BUCKET_TONE: Record<FunnelCohortBucketId, string> = {
  same_day: "bg-[var(--safir-deep)]",
  d1_3: "bg-[color-mix(in_srgb,var(--safir-deep)_82%,white)]",
  d4_7: "bg-[color-mix(in_srgb,var(--safir-deep)_64%,white)]",
  d8_30: "bg-[color-mix(in_srgb,var(--safir-deep)_46%,white)]",
  after_30: "bg-[color-mix(in_srgb,var(--safir-deep)_28%,white)]",
  still_open: "bg-[color-mix(in_srgb,var(--muted)_75%,transparent)]",
};

function CohortLeakSection({ cohort, leak }: { cohort: FunnelCohortMetric; leak: FunnelLeakMetric }) {
  const copy = ADMIN_SEN.funnel;
  const cashLine =
    leak.cashLeakMinor <= 0 ? copy.cashLeakNone : copy.cashPaid(formatFunnelCashLeak(leak.cashLeakMinor));
  const within7d = copy.within7d(formatLeakPercent(cohort.cumulative.within7d));
  const registrants = cohort.registrants;

  return (
    <div className="mt-6 border-t border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] pt-4">
      <StatGrid
        columns={2}
        items={[
          {
            label: copy.leakTitle,
            value: formatLeakPercent(leak.checkoutLeak),
            hint: `${copy.leakHint} ${cashLine}`,
            icon: <IconWallet />,
          },
          {
            label: copy.medianTitle,
            value: formatFunnelHours(cohort.medianHours),
            hint: `${copy.medianHint} ${within7d}`,
            icon: <IconPulse />,
          },
        ]}
      />
      {registrants <= 0 ? (
        <p className="mt-3 text-xs text-[var(--muted)]">{copy.cohortEmpty}</p>
      ) : (
        <div className="mt-4">
          <div
            className="flex h-3 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--muted)_22%,transparent)]"
            role="img"
            aria-label={FUNNEL_COHORT_BUCKET_IDS.map(
              (id) => `${copy.buckets[id]} ${formatFunnelCount(cohort.buckets.find((row) => row.id === id)?.n ?? 0)}`,
            ).join(" · ")}
          >
            {cohort.buckets.map((bucket) => {
              const pct = (bucket.n / registrants) * 100;
              if (pct <= 0) {
                return null;
              }
              return (
                <span
                  key={bucket.id}
                  className={BUCKET_TONE[bucket.id]}
                  style={{ width: `${pct}%` }}
                  title={`${copy.buckets[bucket.id]} ${formatFunnelCount(bucket.n)}`}
                />
              );
            })}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--muted)]">
            {cohort.buckets.map((bucket) => (
              <li key={bucket.id}>
                {copy.buckets[bucket.id]} {formatFunnelCount(bucket.n)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {cohort.observationIncomplete ? (
        <p className="mt-3 text-xs text-[var(--muted)]">{copy.observationIncomplete}</p>
      ) : null}
      {leak.pendingInFlight > 0 ? (
        <p className="mt-1 text-xs text-[var(--muted)]">{copy.inFlightHint}</p>
      ) : null}
    </div>
  );
}

export function AdminFunnelBoard({
  board,
  range,
}: {
  board: AdminFunnelBoard | null;
  range: FunnelRange;
}) {
  const copy = ADMIN_SEN.funnel;

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title} variant="featured" bodyClassName="text-[var(--foreground)]">
      <p className="mb-3 text-sm text-[var(--muted)]">{copy.intro}</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {FUNNEL_RANGES.map((item) => (
          <LinkButton
            key={item}
            href={rangeHref(item)}
            variant={item === range ? "primary" : "outline"}
            size="sm"
            aria-current={item === range ? "page" : undefined}
          >
            {RANGE_LABEL[item]}
          </LinkButton>
        ))}
      </div>
      {board == null || board.access !== "ok" ? (
        <p className="text-sm text-[var(--muted)]">{copy.loadSoft}</p>
      ) : (
        <>
          <p className="mb-3 text-xs text-[var(--muted)]">
            {copy.windowHint} {board.snapshot.window.fromYmd} → {board.snapshot.window.toYmdExclusive}
          </p>
          <StatGrid
            columns={3}
            items={FUNNEL_STEP_IDS.map((id) => {
              const step = board.snapshot.steps.find((row) => row.id === id);
              const count = step?.count ?? 0;
              const conversion = step ? formatFunnelConversion(step) : "—";
              const dropOff = step ? formatFunnelDropOff(step) : "—";
              const unit = id === "vize_hit" ? copy.unitImpressions : copy.unitUsers;
              const ratioHint =
                id === "register"
                  ? copy.steps.register.hint
                  : id === "vize_hit"
                    ? `${copy.impressionsHint} ${conversion}`
                    : `${copy.conversionHint} ${conversion} · ${copy.dropOffLabel} ${dropOff}`;
              return {
                label: copy.steps[id].label,
                value: formatFunnelCount(count),
                hint: `${unit} · ${ratioHint}`,
                icon: STEP_ICONS[id],
              };
            })}
          />
          <p className="mt-3 text-xs text-[var(--muted)]">{copy.vizeHint}</p>
          <CohortLeakSection cohort={board.snapshot.cohort} leak={board.snapshot.leak} />
        </>
      )}
    </Card>
  );
}
