import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export type BadgeTone = "neutral" | "safir" | "emerald" | "amber" | "rose" | "gold" | "violet";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-[var(--surface-muted)] text-[var(--muted)] ring-[var(--border)]",
  safir: "bg-[var(--safir-soft)] text-[var(--safir-deep)] ring-[var(--safir-soft)]",
  emerald: "bg-[var(--emerald-soft)] text-[var(--emerald)] ring-[var(--emerald-soft)]",
  amber: "bg-[var(--amber-soft)] text-[var(--amber)] ring-[var(--amber-soft)]",
  rose: "bg-[var(--rose-soft)] text-[var(--rose)] ring-[var(--rose-soft)]",
  gold: "bg-[var(--gold-soft)] text-[var(--gold)] ring-[var(--gold-soft)]",
  violet: "bg-[var(--violet-soft)] text-[var(--violet)] ring-[var(--violet-soft)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
