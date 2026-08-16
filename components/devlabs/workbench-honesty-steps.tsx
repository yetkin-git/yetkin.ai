import {
  DEVLABS_SEN,
  type DevLabsFlowStepKey,
  type DevLabsHonestyStepKey,
} from "@/lib/copy/sen-voice/devlabs";

export function WorkbenchHonestySteps({ active }: { active?: DevLabsHonestyStepKey | null }) {
  const steps = DEVLABS_SEN.honesty.steps;
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {DEVLABS_SEN.honesty.eyebrow}
      </p>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {DEVLABS_SEN.honesty.title}
      </h2>
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
    </section>
  );
}

export function ProductionFlowStrip({ active }: { active?: DevLabsFlowStepKey | null }) {
  const steps = DEVLABS_SEN.flow.steps;
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {DEVLABS_SEN.flow.eyebrow}
      </p>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {DEVLABS_SEN.flow.title}
      </h2>
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                {index + 1}
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{step.label}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
