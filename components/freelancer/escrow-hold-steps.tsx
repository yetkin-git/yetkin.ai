import { FREELANCER_SEN } from "@/lib/copy/sen-voice/freelancer";
import type { FreelancerEscrowStepKey } from "@/lib/copy/status-labels";

export function EscrowHoldSteps({
  holdPercent,
  active,
}: {
  holdPercent: number;
  active?: FreelancerEscrowStepKey | null;
}) {
  const steps = FREELANCER_SEN.escrow.steps(holdPercent);
  return (
    <div className="space-y-3">
    {FREELANCER_SEN.escrow.lead ? (
      <p className="text-sm leading-6 text-[var(--foreground)]">{FREELANCER_SEN.escrow.lead}</p>
    ) : null}
    <ol className="space-y-3">
      {steps.map((step, index) => {
        const current = active === step.key;
        return (
          <li
            key={step.key}
            className={`rounded-2xl border px-4 py-3 ${
              current
                ? "border-[var(--safir)] bg-[var(--safir-soft)]"
                : "border-[var(--border)] bg-[var(--surface)]"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {index + 1}. {step.label}
            </p>
            <p className="mt-1 text-sm text-[var(--foreground)]">{step.detail}</p>
          </li>
        );
      })}
    </ol>
    </div>
  );
}
