"use client";

import { useState } from "react";
import type { JuniorDiscoveryPrompt } from "@/lib/junior/discovery";

/**
 * Keşif kartları: öğrenci önce tahmin eder, sonra ipucunu, en son
 * genelleme cümlesini açar. Puanlanmaz; amaç kuralı kendisinin bulmasıdır.
 */
export function DiscoveryPrompts({ prompts }: { prompts: readonly JuniorDiscoveryPrompt[] }) {
  const [openHint, setOpenHint] = useState<string | null>(null);
  const [openReveal, setOpenReveal] = useState<string | null>(null);
  if (prompts.length === 0) {
    return null;
  }
  return (
    <section
      data-junior-discovery=""
      aria-labelledby="junior-discovery-heading"
      className="rounded-[1.6rem] border border-sky-200 bg-gradient-to-b from-sky-50 via-white to-emerald-50 p-4 shadow-sm"
    >
      <h2 id="junior-discovery-heading" className="text-base font-black text-slate-900 sm:text-lg">
        Kendin Keşfet
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Önce tahmin et, sonra ipucunu aç. Kuralı kendi cümlenle söylemek, dinlemekten daha çok öğretir.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {prompts.map((item) => {
          const hintOpen = openHint === item.id;
          const revealOpen = openReveal === item.id;
          return (
            <article key={item.id} data-junior-discovery-card={item.rule} className="rounded-xl border border-sky-200 bg-white p-3 shadow-sm">
              <p className="text-sm font-semibold leading-6 text-slate-900">{item.prompt}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-extrabold text-sky-900"
                  aria-expanded={hintOpen}
                  onClick={() => setOpenHint(hintOpen ? null : item.id)}
                >
                  {hintOpen ? "İpucunu kapat" : "İpucu iste"}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-extrabold text-emerald-900 disabled:opacity-50"
                  aria-expanded={revealOpen}
                  disabled={!hintOpen && !revealOpen}
                  onClick={() => setOpenReveal(revealOpen ? null : item.id)}
                >
                  {revealOpen ? "Kuralı kapat" : "Kuralı kendin söyle, sonra aç"}
                </button>
              </div>
              {hintOpen ? (
                <p className="mt-2 rounded-lg bg-sky-50 px-3 py-2 text-sm leading-6 text-sky-950">💡 {item.hint}</p>
              ) : null}
              {revealOpen ? (
                <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold leading-6 text-emerald-950">
                  ⭐ {item.reveal}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
