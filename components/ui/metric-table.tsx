import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type MetricRow = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export function MetricTable({
  title,
  rows,
  className,
}: {
  title?: string;
  rows: MetricRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {title ? (
        <p className="border-b border-[var(--border)] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {title}
        </p>
      ) : null}
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-[var(--border)] last:border-b-0">
              <th className="px-4 py-3 text-left font-medium text-[var(--muted)]">{row.label}</th>
              <td className="px-4 py-3 text-right font-semibold tabular-nums text-[var(--foreground)]">{row.value}</td>
              {row.hint ? <td className="hidden px-4 py-3 text-right text-xs text-[var(--muted)] sm:table-cell">{row.hint}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
