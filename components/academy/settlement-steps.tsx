import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function SettlementSteps({
  lockMinutes,
  active,
}: {
  lockMinutes: number;
  active?: "lock" | "settle" | "record" | null;
}) {
  const steps = ACADEMY_SEN.settlement.steps(lockMinutes);
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
