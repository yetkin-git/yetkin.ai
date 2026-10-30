"use client";

import type { ReactElement } from "react";
import {
  JUNIOR_DIGIT_BOX_CLASS,
  juniorDigitBoxStyle,
} from "@/components/junior/pilot-player/digit-box";
import type { SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";

/** Ana sayı (ör. 6): koyu rakam, opak camgöbeği zemin. Gradyan bunun üstüne biner. */
const HERO_DIGIT = juniorDigitBoxStyle("#06b6d4", "#020617", "light");
/** Çarpan karoları: açık rakam, opak lacivert zemin. */
const FACTOR_DIGIT = juniorDigitBoxStyle("#0f172a", "#a5f3fc", "dark");
/** Kat kulesi değeri: beyaz rakam, opak amber zemin. */
const TOWER_DIGIT = juniorDigitBoxStyle("#78350f", "#ffffff", "dark");

/**
 * Çarpan / kat sahnesi.
 * İki kart sahne kapsayıcısı 36rem ve üzerinde yan yana durur; daha dar
 * tuvalde alt alta iner. Kartlar `min-w-0` ile ızgara izinin dışına taşmaz,
 * başlık ve işlem rozetleri sarılır, sayılar kapsayıcıya göre ölçeklenir.
 */
export function FactorMultipleStage(props: {
  state: SceneGraphState;
  currentTimeMs: number;
}): ReactElement {
  const { state, currentTimeMs } = props;
  const { factorTree, multipleTower } = state;

  return (
    <div
      data-junior-factor-stage=""
      className="@container/factorstage relative flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto p-2"
    >
      <div className="grid w-full min-w-0 flex-1 auto-rows-fr grid-cols-1 items-stretch gap-2 min-h-[22rem] @min-[36rem]/factorstage:min-h-[15rem] @min-[36rem]/factorstage:grid-cols-2">
        {/* SOL PANEL: ÇARPAN (BÖLEN) — PARÇALAR */}
        <div
          className={`@container/factorpanel flex h-full min-h-[11rem] min-w-0 flex-col overflow-hidden rounded-xl border p-2 transition-all duration-500 @min-[36rem]/factorstage:min-h-0 ${
            factorTree.visible
              ? "border-cyan-400/45 bg-cyan-950/25 shadow-[0_0_25px_rgba(34,211,238,0.12)]"
              : "border-slate-700/50 bg-slate-900/40 opacity-75"
          }`}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="max-w-full rounded-lg bg-cyan-400/20 px-2 py-1 text-[clamp(0.625rem,3.1cqi,0.75rem)] font-black uppercase leading-tight tracking-wide text-cyan-300">
              Çarpan (= Bölen)
            </span>
            <span className="max-w-full text-[clamp(0.625rem,2.8cqi,0.75rem)] font-bold leading-tight text-cyan-200/80">
              Kalansız Böler (≤ Sayı)
            </span>
          </div>

          <div className="mt-1 flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden">
            <div className="flex min-h-0 w-full flex-[1.15] items-center justify-center overflow-hidden">
              <div
                data-junior-digit-box="hero"
                style={HERO_DIGIT}
                className={`${JUNIOR_DIGIT_BOX_CLASS} @container/factornum flex aspect-square h-full max-h-full w-auto max-w-[min(70%,11rem)] items-center justify-center overflow-hidden rounded-2xl border-2 border-cyan-300 bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-lg`}
              >
                <span
                  style={{ color: "#020617", fontFamily: "system-ui, sans-serif" }}
                  className="text-[clamp(1.125rem,52cqmin,4.5rem)] font-black leading-none"
                >
                  {factorTree.number}
                </span>
              </div>
            </div>

            <div className="max-w-full shrink-0 px-1 text-center text-[clamp(0.625rem,2.8cqi,0.75rem)] font-bold leading-tight text-cyan-300">
              {factorTree.label || "6 sayısını kalansız bölen parçalar:"}
            </div>

            <div className="grid min-h-0 w-full max-w-md flex-1 grid-cols-4 content-center gap-1.5">
              {factorTree.visible
                ? factorTree.factors.map((factor, idx) => (
                    <div key={factor} className="flex min-h-0 min-w-0 items-center justify-center">
                      <div
                        data-junior-digit-box="factor"
                        style={{
                          ...FACTOR_DIGIT,
                          transitionDelay: `${idx * 90}ms`,
                          transform: "scale(1) translateY(0)",
                          opacity: 1,
                        }}
                        className={`${JUNIOR_DIGIT_BOX_CLASS} @container/factortile flex aspect-square h-auto max-h-full w-full min-w-0 items-center justify-center overflow-hidden rounded-xl border border-cyan-300/60 shadow-md transition-all duration-500`}
                      >
                        <span
                          style={{ color: "#a5f3fc", fontFamily: "system-ui, sans-serif" }}
                          className="text-[clamp(0.75rem,58cqmin,1.875rem)] font-black leading-none"
                        >
                          {factor}
                        </span>
                      </div>
                    </div>
                  ))
                : null}
            </div>

            {factorTree.visible && factorTree.pairs.length > 0 ? (
              <div className="flex max-w-full shrink-0 flex-wrap justify-center gap-1.5 overflow-hidden">
                {factorTree.pairs.map((pair) => (
                  <span
                    key={pair}
                    className="max-w-full truncate rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2 py-0.5 text-[clamp(0.625rem,3.2cqi,0.75rem)] font-extrabold leading-tight text-cyan-100"
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
          className={`@container/factorpanel flex h-full min-h-[11rem] min-w-0 flex-col overflow-hidden rounded-xl border p-2 transition-all duration-500 @min-[36rem]/factorstage:min-h-0 ${
            multipleTower.visible
              ? "border-amber-400/45 bg-amber-950/20 shadow-[0_0_25px_rgba(251,191,36,0.12)]"
              : "border-slate-700/50 bg-slate-900/40 opacity-60"
          }`}
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="max-w-full rounded-lg bg-amber-400/20 px-2 py-1 text-[clamp(0.625rem,3.1cqi,0.75rem)] font-black uppercase leading-tight tracking-wide text-amber-300">
              Kat (Katlanan Kule)
            </span>
            <span className="max-w-full text-[clamp(0.625rem,2.8cqi,0.75rem)] font-bold leading-tight text-amber-200/80">
              Katlanarak Büyür (≥ Sayı)
            </span>
          </div>

          <div className="mt-1 flex min-h-0 min-w-0 flex-1 flex-col-reverse items-stretch justify-center gap-1 overflow-hidden">
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
                    ...TOWER_DIGIT,
                    transform: unlocked ? "scale(1) translateY(0)" : "scale(0.82) translateY(14px)",
                    opacity: unlocked ? 1 : 0.18,
                    transition: "all 520ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  className={`${JUNIOR_DIGIT_BOX_CLASS} ${widthClass} mx-auto flex min-h-0 min-w-0 flex-1 items-center justify-between gap-2 overflow-hidden rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-500/30 via-amber-400/25 to-orange-500/30 px-2 py-1 shadow-md`}
                >
                  <span className="min-w-0 truncate whitespace-nowrap text-[clamp(0.65rem,3.6cqi,0.875rem)] font-bold text-amber-200">
                    {multipleTower.base} × {item.step}
                  </span>
                  <span
                    data-junior-digit-box="tower"
                    style={{ color: "#ffffff", fontFamily: "system-ui, sans-serif" }}
                    className="shrink-0 text-[clamp(0.875rem,5.2cqi,1.5rem)] font-black leading-none"
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {multipleTower.comparisonLeft && multipleTower.comparisonRight ? (
        <div className="mt-2 grid shrink-0 grid-cols-1 gap-2 rounded-xl border border-emerald-400/40 bg-emerald-950/30 p-2 text-center @min-[36rem]/factorstage:grid-cols-2">
          <div className="min-w-0 break-words rounded-lg bg-cyan-500/15 px-2 py-1 text-[clamp(0.625rem,2.6cqi,0.75rem)] font-black leading-tight text-cyan-200">
            🧩 {multipleTower.comparisonLeft}
          </div>
          <div className="min-w-0 break-words rounded-lg bg-amber-500/15 px-2 py-1 text-[clamp(0.625rem,2.6cqi,0.75rem)] font-black leading-tight text-amber-200">
            🚀 {multipleTower.comparisonRight}
          </div>
        </div>
      ) : null}
    </div>
  );
}
