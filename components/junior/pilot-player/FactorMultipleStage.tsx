"use client";

import type { ReactElement } from "react";
import type { SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";

export function FactorMultipleStage(props: {
  state: SceneGraphState;
  currentTimeMs: number;
}): ReactElement {
  const { state, currentTimeMs } = props;
  const { factorTree, multipleTower } = state;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden p-2 sm:p-3">
      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-1 items-stretch gap-2">
        {/* SOL PANEL: ÇARPAN (BÖLEN) — PARÇALAR */}
        <div
          className={`flex min-h-0 flex-col rounded-xl border p-3 transition-all duration-500 ${
            factorTree.visible
              ? "border-cyan-400/45 bg-cyan-950/25 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
              : "border-slate-700/50 bg-slate-900/40 opacity-75"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-cyan-400/20 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-cyan-300">
              Çarpan (= Bölen)
            </span>
            <span className="text-xs font-bold text-cyan-200/80">Böler & Küçültür</span>
          </div>

          <div className="mt-2 flex min-h-0 flex-1 flex-col items-center justify-center">
            {/* Ana Sayı: 6 */}
            <div className="@container/factor flex h-[34%] min-h-12 w-[46%] max-w-[11rem] items-center justify-center rounded-2xl border-2 border-cyan-300 bg-gradient-to-b from-cyan-400 to-cyan-600 text-[clamp(1.75rem,40cqh,4.5rem)] font-black leading-none text-slate-950 shadow-lg">
              {factorTree.number}
            </div>

            <div className="my-2 text-xs font-bold text-cyan-300">
              {factorTree.label || "6 sayısını kalansız bölen parçalar:"}
            </div>

            {/* Çarpan Yapboz Taşları: 1, 2, 3, 6 */}
            <div className="mt-2 grid w-full max-w-md grid-cols-4 gap-2">
              {factorTree.visible
                ? factorTree.factors.map((factor, idx) => (
                <div
                  key={factor}
                  style={{
                    transitionDelay: `${idx * 90}ms`,
                    transform: "scale(1) translateY(0)",
                    opacity: 1,
                  }}
                  className="flex aspect-square w-full items-center justify-center rounded-xl border border-cyan-300/60 bg-slate-900/90 text-2xl font-black text-cyan-200 shadow-md transition-all duration-500 sm:text-3xl"
                >
                  {factor}
                </div>
              ))
                : null}
            </div>

            {factorTree.visible && factorTree.pairs.length > 0 ? (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {factorTree.pairs.map((pair) => (
                  <span
                    key={pair}
                    className="rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-extrabold text-cyan-100"
                  >
                    {pair}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* SAĞ PANEL: KAT — YÜKSELEN LEGO KULESİ */}
        <div
          className={`flex min-h-0 flex-col rounded-xl border p-3 transition-all duration-500 ${
            multipleTower.visible
              ? "border-amber-400/45 bg-amber-950/20 shadow-[0_0_25px_rgba(251,191,36,0.12)]"
              : "border-slate-700/50 bg-slate-900/40 opacity-60"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="rounded-lg bg-amber-400/20 px-2.5 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
              Kat (Katlanan Kule)
            </span>
            <span className="text-xs font-bold text-amber-200/80">Çarpar & Büyütür</span>
          </div>

          <div className="mt-2 flex min-h-0 flex-1 flex-col-reverse items-stretch justify-center gap-2">
            {multipleTower.multiples.map((item) => {
              const unlocked = multipleTower.visible && currentTimeMs >= item.atMs;
              const widthClass =
                item.step === 1
                  ? "w-[78%]"
                  : item.step === 2
                    ? "w-[86%]"
                    : item.step === 3
                      ? "w-[93%]"
                      : "w-full";
              return (
                <div
                  key={item.step}
                  style={{
                    transform: unlocked ? "scale(1) translateY(0)" : "scale(0.82) translateY(14px)",
                    opacity: unlocked ? 1 : 0.18,
                    transition: "all 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  className={`${widthClass} mx-auto flex min-h-9 flex-1 items-center justify-between rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-500/30 via-amber-400/25 to-orange-500/30 px-4 py-1.5 shadow-md`}
                >
                  <span className="text-sm font-bold text-amber-200">
                    {multipleTower.base} × {item.step}
                  </span>
                  <span className="text-xl font-black text-white sm:text-2xl">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Alt Karşılaştırma Özeti (cue-05 sonunda) */}
      {multipleTower.comparisonLeft && multipleTower.comparisonRight ? (
        <div className="mt-3 grid grid-cols-1 gap-2 rounded-xl border border-emerald-400/40 bg-emerald-950/30 p-2.5 text-center sm:grid-cols-2">
          <div className="rounded-lg bg-cyan-500/15 px-3 py-1.5 text-xs font-black text-cyan-200">
            🧩 {multipleTower.comparisonLeft}
          </div>
          <div className="rounded-lg bg-amber-500/15 px-3 py-1.5 text-xs font-black text-amber-200">
            🚀 {multipleTower.comparisonRight}
          </div>
        </div>
      ) : null}
    </div>
  );
}
