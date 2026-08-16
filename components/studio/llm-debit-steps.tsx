import { STUDIO_SEN, type StudioDebitStepKey } from "@/lib/copy/sen-voice/studio";

export function LlmDebitSteps({ active }: { active?: StudioDebitStepKey | null }) {
  const steps = STUDIO_SEN.debit.steps;
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {STUDIO_SEN.debit.eyebrow}
      </p>
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-[var(--foreground)]">
        {STUDIO_SEN.debit.title}
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
