import { PAZARYERI_SEN } from "@/lib/copy/sen-voice/pazaryeri";
import type { PazaryeriEscrowStepKey, PazaryeriSettlementStepKey } from "@/archived/lib/copy/status-labels";

function StepList({
  steps,
  active,
}: {
  steps: readonly { key: string; label: string; detail: string }[];
  active?: string | null;
}) {
  return (
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
  );
}

export function DualCashPathSteps({
  path,
  lockMinutes,
  holdPercent,
  active,
}: {
  path: "settlement" | "escrow";
  lockMinutes: number;
  holdPercent: number;
  active?: PazaryeriSettlementStepKey | PazaryeriEscrowStepKey | null;
}) {
  const steps =
    path === "settlement"
      ? PAZARYERI_SEN.paths.settlementSteps(lockMinutes)
      : PAZARYERI_SEN.paths.escrowSteps(lockMinutes, holdPercent);
  return <StepList steps={steps} active={active} />;
}

export function DualCashPathOverview({
  lockMinutes,
  holdPercent,
}: {
  lockMinutes: number;
  holdPercent: number;
}) {
  const copy = PAZARYERI_SEN.paths;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {copy.settlementEyebrow}
        </p>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {copy.settlementTitle}
        </h2>
        <DualCashPathSteps path="settlement" lockMinutes={lockMinutes} holdPercent={holdPercent} />
      </section>
      <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
          {copy.escrowEyebrow}
        </p>
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
          {copy.escrowTitle}
        </h2>
        <DualCashPathSteps path="escrow" lockMinutes={lockMinutes} holdPercent={holdPercent} />
      </section>
    </div>
  );
}
