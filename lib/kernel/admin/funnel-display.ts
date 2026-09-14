import { ADMIN_UNSET_LABEL } from "@/lib/kernel/admin/display";
import type { FunnelBoardWire, FunnelStepMetric, FunnelSnapshot } from "@/lib/kernel/admin/funnel-types";
import { formatMinorCompact } from "@/lib/kernel/money/format";

export function formatFunnelCount(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.max(0, Math.trunc(count)));
}

function formatPercent(ratio: number): string {
  const pct = Math.round(ratio * 1000) / 10;
  const label = Number.isInteger(pct) ? String(pct) : pct.toLocaleString("tr-TR", { maximumFractionDigits: 1 });
  return `%${label}`;
}

export function formatFunnelConversion(step: FunnelStepMetric): string {
  if (step.conversionFromPrevious == null) {
    return ADMIN_UNSET_LABEL;
  }
  if (step.conversionKind === "impressions_per_stamp") {
    const times = step.conversionFromPrevious.toLocaleString("tr-TR", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    });
    return `${times}×`;
  }
  return formatPercent(step.conversionFromPrevious);
}

export function formatFunnelDropOff(step: FunnelStepMetric): string {
  if (step.dropOffFromPrevious == null) {
    return ADMIN_UNSET_LABEL;
  }
  return formatPercent(step.dropOffFromPrevious);
}

export function formatLeakPercent(ratio: number | null): string {
  if (ratio == null || !Number.isFinite(ratio)) {
    return ADMIN_UNSET_LABEL;
  }
  return formatPercent(ratio);
}

export function formatFunnelHours(hours: number | null): string {
  if (hours == null || !Number.isFinite(hours) || hours < 0) {
    return ADMIN_UNSET_LABEL;
  }
  if (hours >= 24) {
    const days = hours / 24;
    const label = days.toLocaleString("tr-TR", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    });
    return `${label} gün`;
  }
  const label = hours.toLocaleString("tr-TR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
  return `${label} saat`;
}

export function formatFunnelCashLeak(amountMinor: number): string {
  return formatMinorCompact(Math.max(0, Math.trunc(amountMinor)), "TRY");
}

export function toFunnelBoardWire(snapshot: FunnelSnapshot): FunnelBoardWire {
  return {
    window: {
      range: snapshot.window.range,
      timeZone: snapshot.window.timeZone,
      from: snapshot.window.from.toISOString(),
      to: snapshot.window.to.toISOString(),
      fromYmd: snapshot.window.fromYmd,
      toYmdExclusive: snapshot.window.toYmdExclusive,
    },
    steps: snapshot.steps,
    cohort: snapshot.cohort,
    leak: snapshot.leak,
    generatedAt: snapshot.generatedAt.toISOString(),
  };
}
