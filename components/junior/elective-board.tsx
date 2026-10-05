export function ElectiveBoard({ beat, steps }: { beat: number; steps: readonly string[] }) {
  const line = steps[beat] ?? "";
  return (
    <div className="flex h-full flex-col justify-center gap-3 px-3 py-2">
      <ol className="flex flex-wrap gap-1" aria-label="Dokuz adım">
        {steps.map((step, index) => (
          <li
            key={`${index}-${step}`}
            className={
              index === beat
                ? "grid h-6 w-6 place-items-center rounded-full bg-[var(--safir)] text-[11px] font-bold text-white"
                : "grid h-6 w-6 place-items-center rounded-full bg-[var(--border)] text-[11px] font-semibold text-[var(--muted)]"
            }
          >
            {index + 1}
          </li>
        ))}
      </ol>
      <p className="text-sm font-semibold leading-5 text-[var(--foreground)]">{line}</p>
    </div>
  );
}
