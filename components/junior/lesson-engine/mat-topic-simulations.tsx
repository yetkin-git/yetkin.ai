"use client";

import { useState, type ReactElement } from "react";
import { burstJuniorActivityConfetti } from "@/lib/junior/activity-confetti";
import {
  playApplauseSound,
  playOopsSound,
  primeActivityAudio,
} from "@/lib/junior/activity-sound";
import { markGameComplete, simModeToGameId } from "@/lib/junior/progress-tracker";

export type TopicSimProps = {
  profileId?: string;
  lessonKey?: string;
  onSuccess?: () => void;
};

const BASES = [2, 3, 4, 5] as const;
const EXPONENTS = [2, 3, 4] as const;

/**
 * `jr_06_mat-1` — Üslü İfadeler: Üs Kulesi Lab.
 * Taban ve üs seçilince bloklar katlanarak kule olur.
 * Doğru hesapta alkış, yanlış hesapta «Ooooo!».
 */
export function ExponentTowerSimulation({
  profileId = "",
  lessonKey = "jr_06_mat-1",
  onSuccess,
}: TopicSimProps): ReactElement {
  const [base, setBase] = useState<number>(2);
  const [exp, setExp] = useState<number>(3);
  const [guess, setGuess] = useState("");
  const [verdict, setVerdict] = useState<"idle" | "correct" | "trap">("idle");

  const powerValue = base ** exp;
  const trapValue = base * exp;
  const factors = Array.from({ length: exp }, () => base);
  const chainText = factors.join(" × ");

  function selectBase(next: number) {
    primeActivityAudio();
    setBase(next);
    setVerdict("idle");
    setGuess("");
  }

  function selectExp(next: number) {
    primeActivityAudio();
    setExp(next);
    setVerdict("idle");
    setGuess("");
  }

  function checkGuess(raw: string) {
    primeActivityAudio();
    const numeric = Number(raw.replace(/\s+/g, "").replace(",", "."));
    if (Number.isFinite(numeric) && numeric === powerValue) {
      setVerdict("correct");
      playApplauseSound();
      burstJuniorActivityConfetti("spark");
      const gameId = simModeToGameId("exponent-tower");
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
        onSuccess?.();
      }
      return;
    }
    setVerdict("trap");
    playOopsSound();
  }

  return (
    <div
      data-junior-sim-canvas="exponent-tower"
      data-junior-exp-tower=""
      data-junior-exp-power-value={powerValue}
      className="flex flex-col gap-3 rounded-2xl border-2 border-cyan-300 bg-gradient-to-b from-slate-900 via-slate-900 to-cyan-950 p-3 text-white shadow-inner sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-cyan-300">
          🗼 Üs Kulesi Lab · Üs Kulesi Simülasyonu
        </p>
        <p
          className={`rounded-full px-3 py-1 text-xs font-black ${
            verdict === "correct"
              ? "animate-badge-pop bg-emerald-500/25 text-emerald-200"
              : verdict === "trap"
                ? "animate-badge-pop bg-rose-500/25 text-rose-200"
                : "bg-white/10 text-cyan-100"
          }`}
          aria-live="polite"
        >
          {verdict === "correct"
            ? `Harika! ${base}^${exp} = ${chainText} = ${powerValue}`
            : verdict === "trap"
              ? `Ooooo! ${base} × ${exp} = ${trapValue} tuzaktır. Kuleyi katlayarak say.`
              : `${base}^${exp} kulesi kuruldu. Sonuç kaç?`}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div role="group" aria-label="Taban seçimi">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-cyan-200">
            Taban (Çarpılan Sayı)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BASES.map((b) => (
              <button
                key={b}
                type="button"
                data-junior-sim-exp-base={b}
                aria-pressed={base === b}
                onClick={() => selectBase(b)}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
                  base === b
                    ? "border-cyan-400 bg-cyan-500/30 text-white"
                    : "border-white/15 bg-white/5 text-cyan-100 hover:border-cyan-400/50"
                }`}
              >
                Taban {b}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label="Üs seçimi">
          <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-200">
            Üs / Kuvvet (Tekrar Sayısı)
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EXPONENTS.map((e) => (
              <button
                key={e}
                type="button"
                data-junior-sim-exp-power={e}
                aria-pressed={exp === e}
                onClick={() => selectExp(e)}
                className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
                  exp === e
                    ? "border-amber-400 bg-amber-400/30 text-white"
                    : "border-white/15 bg-white/5 text-amber-100 hover:border-amber-400/50"
                }`}
              >
                Üs {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex flex-col-reverse gap-1.5 rounded-2xl border border-cyan-400/30 bg-slate-950/60 p-3"
        aria-label="Katlanan üs kulesi"
      >
        {Array.from({ length: exp }, (_, floor) => {
          const value = base ** (floor + 1);
          const cells = Math.min(value, 8);
          return (
            <div key={`${base}-${exp}-${floor}`} className="flex flex-wrap items-center gap-2">
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: cells }, (_, block) => (
                  <span
                    key={block}
                    data-junior-exp-block=""
                    className="h-6 w-6 rounded-md border border-cyan-100/70 bg-gradient-to-b from-cyan-200 to-cyan-600 shadow-[0_0_10px_rgba(34,211,238,0.35)]"
                  />
                ))}
              </div>
              {value > cells ? (
                <span className="text-[11px] font-black text-cyan-100">+{value - cells}</span>
              ) : null}
              <span className="text-[11px] font-black text-amber-200">
                {base}
                <sup>{floor + 1}</sup> = {value}
              </span>
            </div>
          );
        })}
      </div>

      <form
        className="flex flex-wrap items-center justify-center gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          checkGuess(guess);
        }}
      >
        <label className="text-xs font-extrabold text-cyan-100" htmlFor="junior-exp-tower-guess">
          {base}
          <sup>{exp}</sup> = 
        </label>
        <input
          id="junior-exp-tower-guess"
          inputMode="numeric"
          value={guess}
          onChange={(event) => {
            setGuess(event.target.value);
            setVerdict("idle");
          }}
          data-junior-sim-exp-guess=""
          aria-label="Üs kulesinin sonucu"
          className="h-10 w-24 rounded-xl border-2 border-cyan-300/50 bg-slate-950 px-3 text-center text-sm font-black text-white outline-none"
          maxLength={8}
        />
        <button
          type="submit"
          data-junior-sim-exp-answer="correct"
          className="rounded-xl border-2 border-emerald-400 bg-emerald-500/25 px-4 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-500/40 sm:text-sm"
        >
          Kuleyi kontrol et
        </button>
        {powerValue !== trapValue ? (
          <button
            type="button"
            data-junior-sim-exp-answer="trap"
            onClick={() => checkGuess(String(trapValue))}
            className="rounded-xl border-2 border-rose-400/60 bg-rose-500/20 px-4 py-2 text-xs font-black text-rose-100 transition hover:bg-rose-500/35 sm:text-sm"
          >
            Tuzak: {base} × {exp}
          </button>
        ) : null}
      </form>
    </div>
  );
}

/** Önceki içe aktarma adı. Üretim bileşeni `ExponentTowerSimulation`. */
export const ExponentTowerSim = ExponentTowerSimulation;

const PRIORITY_CASES = [
  {
    id: "mul-first",
    expression: "6 + 2 × 4",
    correctStep: "Önce 2 × 4 = 8, sonra 6 + 8 = 14",
    trapStep: "Önce 6 + 2 = 8, sonra 8 × 4 = 32",
    rule: "Parantez yoksa çarpma toplamadan önce gelir!",
  },
  {
    id: "paren-first",
    expression: "(6 + 2) × 4",
    correctStep: "Önce parantez içi (6 + 2) = 8, sonra 8 × 4 = 32",
    trapStep: "Önce 2 × 4 = 8, sonra 6 + 8 = 14",
    rule: "Parantez içi her zaman çarpmanın önüne geçer!",
  },
  {
    id: "exp-div",
    expression: "2³ + 12 ÷ 3",
    correctStep: "Önce 2³ = 8 ve 12 ÷ 3 = 4, sonra 8 + 4 = 12",
    trapStep: "Önce 2 × 3 = 6 ve 6 + 12 = 18, sonra 18 ÷ 3 = 6",
    rule: "Önce üslü ifade, ardından bölme, en son toplama!",
  },
] as const;

/**
 * `jr_06_mat-2` — İşlem Önceliği: İşlem Sırası Robotu Simülasyonu
 */
export function OperationPrioritySim({
  profileId = "",
  lessonKey = "jr_06_mat-2",
  onSuccess,
}: TopicSimProps): ReactElement {
  const [caseIdx, setCaseIdx] = useState(0);
  const [verdict, setVerdict] = useState<"idle" | "correct" | "trap">("idle");
  const current = PRIORITY_CASES[caseIdx] ?? PRIORITY_CASES[0]!;

  function pickCase(idx: number) {
    primeActivityAudio();
    setCaseIdx(idx);
    setVerdict("idle");
  }

  function pickStep(kind: "correct" | "trap") {
    primeActivityAudio();
    setVerdict(kind);
    if (kind === "correct") {
      playApplauseSound();
      burstJuniorActivityConfetti("spark");
      const gameId = simModeToGameId("ops-priority");
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
        onSuccess?.();
      }
    } else {
      playOopsSound();
    }
  }

  return (
    <div
      data-junior-sim-canvas="ops-priority"
      className="flex flex-col gap-3 rounded-2xl border-2 border-violet-300 bg-gradient-to-b from-violet-50 via-white to-amber-50 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-violet-800">
          ⚙️ İşlem Önceliği Robotu (jr_06_mat-2)
        </p>
        <p
          className={`rounded-full px-3 py-1 text-xs font-black ${
            verdict === "correct"
              ? "animate-badge-pop bg-emerald-100 text-emerald-800"
              : verdict === "trap"
                ? "animate-badge-pop bg-rose-100 text-rose-800"
                : "bg-slate-100 text-slate-700"
          }`}
          aria-live="polite"
        >
          {verdict === "correct"
            ? `Doğru Sıra! ${current.rule}`
            : verdict === "trap"
              ? "Ooooo! Soldan sağa tuzak sırasına düştün."
              : "İfadeyi seç ve ilk adımı belirle"}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="İşlem ifadesi">
        {PRIORITY_CASES.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            data-junior-sim-priority-case={item.id}
            aria-pressed={caseIdx === idx}
            onClick={() => pickCase(idx)}
            className={`rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${
              caseIdx === idx
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-violet-200 bg-white text-violet-950 hover:border-violet-400"
            }`}
          >
            {item.expression}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-violet-200 bg-white p-3 text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Hedef İfade</p>
        <p className="mt-1 text-2xl font-black text-violet-950">{current.expression}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          data-junior-sim-priority-choice="correct"
          onClick={() => pickStep("correct")}
          className="rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-3 text-left text-xs font-extrabold text-emerald-950 transition hover:-translate-y-0.5 sm:text-sm"
        >
          🚀 {current.correctStep}
        </button>
        <button
          type="button"
          data-junior-sim-priority-choice="trap"
          onClick={() => pickStep("trap")}
          className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-3 text-left text-xs font-extrabold text-amber-950 transition hover:-translate-y-0.5 sm:text-sm"
        >
          ⚠️ {current.trapStep}
        </button>
      </div>
    </div>
  );
}

/**
 * `jr_06_mat-3` — Ortak Çarpan ve Dağılma: Dikdörtgen Bahçe Simülasyonu
 */
export function DistributeAreaSim({
  profileId = "",
  lessonKey = "jr_06_mat-3",
  onSuccess,
}: TopicSimProps): ReactElement {
  const [height, setHeight] = useState(6);
  const [leftW, setLeftW] = useState(5);
  const [rightW, setRightW] = useState(3);
  const [joined, setJoined] = useState(false);

  const leftArea = height * leftW;
  const rightArea = height * rightW;
  const totalArea = leftArea + rightArea;

  function verifySplit() {
    primeActivityAudio();
    setJoined(true);
    playApplauseSound();
    burstJuniorActivityConfetti("spark");
    const gameId = simModeToGameId("distribute-area");
    if (gameId) {
      markGameComplete(profileId, lessonKey, gameId);
      onSuccess?.();
    }
  }

  return (
    <div
      data-junior-sim-canvas="distribute-area"
      className="flex flex-col gap-3 rounded-2xl border-2 border-emerald-300 bg-gradient-to-b from-emerald-50 via-white to-cyan-50 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">
          📐 Dikdörtgen Bahçe Dağılma Simülasyonu (jr_06_mat-3)
        </p>
        <p className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900">
          {height} × ({leftW} + {rightW}) = ({height} × {leftW}) + ({height} × {rightW}) = {totalArea}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-extrabold text-slate-700">Ortak Kenar:</span>
          {[4, 5, 6].map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => {
                primeActivityAudio();
                setHeight(h);
                setJoined(false);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-black ${
                height === h
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              {h}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-extrabold text-slate-700">Sol En:</span>
          {[3, 5, 7].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                primeActivityAudio();
                setLeftW(w);
                setJoined(false);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-black ${
                leftW === w
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-extrabold text-slate-700">Sağ En:</span>
          {[2, 3, 4].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => {
                primeActivityAudio();
                setRightW(w);
                setJoined(false);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-black ${
                rightW === w
                  ? "border-amber-500 bg-amber-400 text-slate-950"
                  : "border-slate-200 bg-white text-slate-800"
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-white p-3">
        <div className="rounded-xl border-2 border-cyan-400 bg-cyan-50 p-3 text-center">
          <p className="text-xs font-bold text-cyan-900">1. Bahçe ({height} × {leftW})</p>
          <p className="mt-1 text-lg font-black text-cyan-950">{leftArea} br²</p>
        </div>
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-3 text-center">
          <p className="text-xs font-bold text-amber-900">2. Bahçe ({height} × {rightW})</p>
          <p className="mt-1 text-lg font-black text-amber-950">{rightArea} br²</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          data-junior-sim-distribute-verify=""
          onClick={verifySplit}
          className="rounded-xl border-2 border-emerald-600 bg-emerald-600 px-4 py-1.5 text-xs font-extrabold text-white transition hover:bg-emerald-700 sm:text-sm"
        >
          Bahçeleri Birleştir ve Doğrula
        </button>
        {joined ? (
          <span className="text-xs font-black text-emerald-800">
            ✓ Ortak çarpan {height} parantezinde toplam alan {totalArea} br²!
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * `jr_06_mat-4` — Doğal Sayı Problemleri: Adım Adım Problem Terazisi
 */
export function ProblemStepsSim({
  profileId = "",
  lessonKey = "jr_06_mat-4",
  onSuccess,
}: TopicSimProps): ReactElement {
  const [total, setTotal] = useState(36);
  const [boxCount, setBoxCount] = useState(4);
  const [checked, setChecked] = useState(false);

  const reserved = 12;
  const remaining = total - reserved;
  const perBox = Math.floor(remaining / boxCount);
  const leftover = remaining % boxCount;
  const exact = leftover === 0;

  function runSteps() {
    primeActivityAudio();
    setChecked(true);
    if (exact) {
      playApplauseSound();
      burstJuniorActivityConfetti("spark");
      const gameId = simModeToGameId("problem-steps");
      if (gameId) {
        markGameComplete(profileId, lessonKey, gameId);
        onSuccess?.();
      }
    } else {
      playOopsSound();
    }
  }

  return (
    <div
      data-junior-sim-canvas="problem-steps"
      className="flex flex-col gap-3 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 via-white to-orange-50 p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-amber-900">
          🧭 İki Adımlı Problem Terazisi (jr_06_mat-4)
        </p>
        <p className="rounded-full bg-white px-3 py-1 text-xs font-black text-amber-950">
          ({total} − {reserved}) ÷ {boxCount} = {perBox} {leftover > 0 ? `(Kalan ${leftover})` : "✓"}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-extrabold text-amber-950">Başlangıç Bilyesi:</span>
          {[36, 48, 60].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                primeActivityAudio();
                setTotal(n);
                setChecked(false);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-black ${
                total === n
                  ? "border-amber-600 bg-amber-500 text-white"
                  : "border-amber-200 bg-white text-amber-950"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-extrabold text-amber-950">Kutu Sayısı:</span>
          {[4, 5, 6, 8].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                primeActivityAudio();
                setBoxCount(b);
                setChecked(false);
              }}
              className={`rounded-lg border px-2.5 py-1 text-xs font-black ${
                boxCount === b
                  ? "border-orange-600 bg-orange-500 text-white"
                  : "border-orange-200 bg-white text-orange-950"
              }`}
            >
              {b} kutu
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-200 bg-white p-2.5">
          <p className="text-[11px] font-bold text-slate-500">1. Adım (Çıkarma)</p>
          <p className="text-sm font-black text-slate-900">
            {total} − {reserved} = {remaining} kalan bilye
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-white p-2.5">
          <p className="text-[11px] font-bold text-slate-500">2. Adım (Eşit Paylaşım)</p>
          <p className="text-sm font-black text-slate-900">
            {remaining} ÷ {boxCount} = kutu başına {perBox} bilye
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          data-junior-sim-problem-run=""
          onClick={runSteps}
          className="rounded-xl border-2 border-amber-600 bg-amber-500 px-4 py-1.5 text-xs font-extrabold text-white transition hover:bg-amber-600 sm:text-sm"
        >
          Adımları Çalıştır
        </button>
        {checked ? (
          <span className={`text-xs font-black ${exact ? "text-emerald-800" : "text-rose-700"}`}>
            {exact
              ? `✓ Eşit paylaştırıldı! Her kutuda ${perBox} bilye var.`
              : `✗ ${leftover} bilye dışarıda kaldı, başka kutu sayısı dene.`}
          </span>
        ) : null}
      </div>
    </div>
  );
}
