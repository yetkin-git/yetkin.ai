import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";

export function DeliveryProcessPanel({
  remaining,
  allowance,
}: {
  remaining: number;
  allowance: number;
}) {
  const copy = FREELANCER_SEN.delivery;
  const steps = [
    { key: "upload", label: copy.upload },
    { key: "submit", label: copy.submit },
  ] as const;

  return (
    <Card
      title={copy.title}
      eyebrow={copy.eyebrow}
      action={
        <Badge tone="safir" className="normal-case tracking-tight">
          {copy.remaining(remaining, allowance)}
        </Badge>
      }
    >
      <p className="mb-4 text-sm text-[var(--foreground)]">{copy.lead}</p>
      <ol className="grid gap-3 sm:grid-cols-2">
        {steps.map((step, index) => (
          <li
            key={step.key}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {index + 1}. adım
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{step.label}</p>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[var(--safir)]/25 bg-[var(--safir-soft)] px-4 py-3">
        <p className="text-sm font-medium text-[var(--foreground)]">{copy.remainingLabel}</p>
        <p className="tabular-nums text-sm font-semibold text-[var(--safir-deep)]">
          {copy.remaining(remaining, allowance)}
        </p>
      </div>
      <p className="mt-3 text-xs text-[var(--muted)]">{copy.remainingHint}</p>
    </Card>
  );
}
