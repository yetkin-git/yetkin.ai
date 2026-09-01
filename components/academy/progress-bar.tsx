export function AcademyProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const clamped = Math.min(100, Math.max(0, Number.isFinite(value) ? Math.round(value) : 0));
  return (
    <div className="space-y-2" data-academy-progress="">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-[var(--foreground)]">{label}</span>
        <span className="tabular-nums text-[var(--muted)]">%{clamped}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)]"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-[var(--safir)] transition-[width] duration-300"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
