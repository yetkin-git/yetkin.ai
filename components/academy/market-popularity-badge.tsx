import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { cn } from "@/components/ui/cn";

/**
 * Quiet Luxury Piyasa Talep Skoru (Match Score).
 * TrendScore (asc): düşük skor = daha yüksek vitrin sırası → 100 üzerinden prestij puanı.
 * 1 → 99.8 · 2 → 98.6 · 6 → 94.0 (taban 70).
 */
export function marketDemandMatchScore(trendScore: number): number {
  const t = Math.max(1, Number(trendScore) || 1);
  // Soft prestige decay — Quiet Luxury mührü için 100 üzerinden.
  return Math.max(70, Math.round((99.8 - (t - 1) * 1.16) * 10) / 10);
}

export function MarketPopularityBadge({
  trendScore,
  className,
}: {
  trendScore: number;
  className?: string;
}) {
  const match = marketDemandMatchScore(trendScore);
  const label = ACADEMY_SEN.catalog.marketDemandScore(match);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] text-[color-mix(in_srgb,var(--gold)_82%,var(--safir-deep))]",
        className,
      )}
      title={ACADEMY_SEN.catalog.marketDemandScoreTitle}
      aria-label={`${ACADEMY_SEN.catalog.marketDemandScoreTitle}: ${match.toFixed(1)}`}
    >
      {label}
    </span>
  );
}
