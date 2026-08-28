import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";

/** Dört adımlı yetkinlik yolu — katalog ve kurs sayfasında aynı sicil. */
export function AcademyPilotPath({
  passScore = ACADEMY_EXAM_PASS_SCORE,
}: {
  passScore?: number;
}) {
  const copy = ACADEMY_SEN.pilotPath;
  const steps = copy.steps(passScore);

  return (
    <ol
      className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
      data-academy-pilot-path=""
      aria-label={copy.title}
    >
      {steps.map((step, index) => (
        <li
          key={step.key}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
            {index + 1}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{step.label}</p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{step.detail}</p>
        </li>
      ))}
    </ol>
  );
}
