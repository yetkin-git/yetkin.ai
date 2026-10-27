"use client";

import { useMemo, useState, type ReactElement } from "react";

/** Yüzlük tablo. MEB 6. sınıf asal konusunda çocuk bu eleği kullanır. */
export const PRIME_SIEVE_LIMIT = 100;
export const PRIME_SIEVE_STEPS = [2, 3, 5, 7] as const;
/** 1 ile 100 arasında 25 asal sayı vardır. */
export const PRIME_SIEVE_PRIME_COUNT = 25;

export function strikePrimeMultiples(
  struck: ReadonlySet<number>,
  prime: number,
  limit = PRIME_SIEVE_LIMIT,
): Set<number> {
  const next = new Set(struck);
  next.add(1);
  if (!Number.isInteger(prime) || prime < 2) {
    return next;
  }
  for (let value = prime * 2; value <= limit; value += prime) {
    next.add(value);
  }
  return next;
}

export function remainingSieveNumbers(struck: ReadonlySet<number>, limit = PRIME_SIEVE_LIMIT): number[] {
  const left: number[] = [];
  for (let value = 2; value <= limit; value += 1) {
    if (!struck.has(value)) {
      left.push(value);
    }
  }
  return left;
}

/**
 * Eratosthenes eleği. Çocuk 2, 3, 5 ve 7'nin katlarını yüzlük tablodan eler.
 * Kalan sayılar asaldır. 1 baştan elenmiştir.
 */
export function PrimeSieve({ limit = PRIME_SIEVE_LIMIT }: { limit?: number }): ReactElement {
  const [struck, setStruck] = useState<Set<number>>(() => new Set([1]));
  const [lastStep, setLastStep] = useState<number | null>(null);
  const remaining = useMemo(() => remainingSieveNumbers(struck, limit), [struck, limit]);
  const done = remaining.length === PRIME_SIEVE_PRIME_COUNT && limit === PRIME_SIEVE_LIMIT;

  function sieve(prime: number) {
    setStruck((current) => strikePrimeMultiples(current, prime, limit));
    setLastStep(prime);
  }

  return (
    <section
      data-junior-prime-sieve=""
      data-junior-sieve-limit={limit}
      className="flex flex-col gap-3 rounded-2xl border-2 border-indigo-300 bg-gradient-to-b from-indigo-50 via-white to-slate-50 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
          Eratosthenes kalburu · yüzlük tablo
        </p>
        <p className="rounded-full bg-white/80 px-3 py-1 text-xs font-black text-indigo-950" aria-live="polite">
          {done
            ? `Kalbur bitti. ${remaining.length} asal sayı kaldı.`
            : lastStep
              ? `${lastStep} katları elendi. Kalan ${remaining.length} sayı.`
              : "2'ye bas. Katları yüzlük tablodan elensin."}
        </p>
      </div>
      <p className="text-sm text-indigo-950">
        1 asal değildir, baştan elenir. Sırayla 2, 3, 5 ve 7'nin katlarını ele. Üstü çizilmeyen sayılar asaldır.
      </p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Kalbur adımları">
        {PRIME_SIEVE_STEPS.map((prime) => (
          <button
            key={prime}
            type="button"
            data-junior-sieve-step={prime}
            className="rounded-xl border-2 border-indigo-400 bg-white px-3 py-1.5 text-xs font-extrabold text-indigo-950 transition hover:-translate-y-0.5 hover:bg-indigo-100 sm:text-sm"
            onClick={() => sieve(prime)}
          >
            {prime} katlarını ele
          </button>
        ))}
      </div>
      <div
        className="grid grid-cols-10 gap-1"
        data-junior-sieve-board=""
        aria-label="1'den 100'e yüzlük tablo"
      >
        {Array.from({ length: limit }, (_, index) => {
          const value = index + 1;
          const crossed = struck.has(value);
          return (
            <button
              key={value}
              type="button"
              data-junior-sieve-cell={value}
              data-junior-sieve-struck={crossed ? "true" : "false"}
              aria-pressed={crossed}
              disabled={value === 1}
              className={`rounded-md border px-0 py-1 text-[11px] font-black sm:text-xs ${
                crossed
                  ? "border-slate-200 bg-slate-100 text-slate-400 line-through"
                  : "border-indigo-200 bg-white text-indigo-950"
              }`}
              onClick={() => sieve(value)}
            >
              {value}
            </button>
          );
        })}
      </div>
    </section>
  );
}
