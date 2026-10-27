"use client";

import type { ReactElement } from "react";
import type { SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";

const HIGHLIGHT_STYLES = {
  cyan: {
    border: "border-cyan-300",
    bg: "from-cyan-400/35 to-cyan-600/25",
    text: "text-cyan-100",
    ring: "#22d3ee",
  },
  amber: {
    border: "border-amber-300",
    bg: "from-amber-400/35 to-amber-600/25",
    text: "text-amber-100",
    ring: "#fbbf24",
  },
  emerald: {
    border: "border-emerald-300",
    bg: "from-emerald-400/35 to-emerald-600/25",
    text: "text-emerald-100",
    ring: "#34d399",
  },
  rose: {
    border: "border-rose-300",
    bg: "from-rose-400/35 to-rose-600/25",
    text: "text-rose-100",
    ring: "#fb7185",
  },
} as const;

const VERDICT_FADE_IN = "junior-verdict-fade-in 480ms ease-out both";

/**
 * 3B Dokunsal Basamak Karosu (`DigitTile`) + Büyüteç ve Spotlight Dimming
 */
function DigitTile(props: {
  digit: string;
  placeLabel: string;
  isHighlighted: boolean;
  isDimmed: boolean;
  color: "cyan" | "amber" | "emerald" | "rose";
  showMagnifier: boolean;
}): ReactElement {
  const { digit, placeLabel, isHighlighted, isDimmed, color, showMagnifier } = props;
  const palette = HIGHLIGHT_STYLES[color];

  return (
    <div
      style={{
        opacity: isDimmed ? 0.25 : 1,
        // Vurgu: scale/translateY yok — üst kenar pasif karo ile milimetrik hizada kalır
        boxShadow: isHighlighted
          ? `inset 0 0 24px ${palette.ring}66, inset 0 0 0 2px ${palette.ring}, 0 8px 18px rgba(2, 6, 23, 0.55)`
          : "0 8px 18px rgba(2, 6, 23, 0.55)",
        transition:
          "opacity 480ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 480ms cubic-bezier(0.34, 1.56, 0.64, 1), border-color 480ms cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      className={`@container/tile relative flex min-h-0 w-full max-w-[14rem] flex-1 flex-col items-center justify-center self-stretch overflow-hidden rounded-3xl border-2 px-2 ${
        isHighlighted
          ? `${palette.border} bg-gradient-to-b ${palette.bg}`
          : "border-slate-600/70 bg-gradient-to-b from-slate-800 to-slate-900"
      }`}
    >
      {/* Üst parlama şeridi */}
      <div className="pointer-events-none absolute inset-x-2 top-1.5 h-2 rounded-full bg-white/15" />

      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300/80 sm:text-xs">
        {placeLabel}
      </span>
      <span
        className={`mt-1 text-[clamp(2rem,46cqh,7.5rem)] font-black leading-none tracking-tight ${
          isHighlighted ? palette.text : "text-white"
        }`}
      >
        {digit}
      </span>

      {/* Dedektif Büyüteci — karo alt-sağında; üst kural rozetleriyle çakışmaz */}
      {showMagnifier ? (
        <div
          className="pointer-events-none absolute bottom-1.5 right-1.5 z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 bg-slate-950/85 shadow-xl sm:h-11 sm:w-11"
          style={{
            animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          }}
        >
          <svg viewBox="0 0 32 32" className="h-6 w-6 sm:h-7 sm:w-7">
            <circle
              cx={13}
              cy={13}
              r={8}
              fill="rgba(34,211,238,0.22)"
              stroke={palette.ring}
              strokeWidth={2.6}
            />
            <line
              x1={19}
              y1={19}
              x2={27}
              y2={27}
              stroke="#fde68a"
              strokeWidth={3.4}
              strokeLinecap="round"
            />
          </svg>
        </div>
      ) : null}
    </div>
  );
}

function placeLabelFor(digits: readonly string[], index: number): string {
  if (digits.length === 3) {
    return (["Yüzler", "Onlar", "Birler"] as const)[index] ?? `${index + 1}. Basamak`;
  }
  if (digits.length === 2) {
    return index === 0 ? "Onlar" : "Birler";
  }
  return `${digits.length - index}. Basamak`;
}

export function DetectiveBoardStage(props: { state: SceneGraphState }): ReactElement {
  const { state } = props;
  const { layout, ruleBadges, detective, callout } = state;

  if (layout === "trap-vs-truth") {
    const revealed = detective.revealed === true;
    const digits = revealed ? detective.digits : [];
    const ones = digits[digits.length - 1] ?? "";
    const sumDigits = revealed ? (detective.digitSum?.digits ?? digits.map((digit) => Number(digit))) : [];
    const sum = revealed
      ? (detective.digitSum?.sum ?? sumDigits.reduce((total, digit) => total + digit, 0))
      : 0;
    const expression = revealed
      ? detective.digitSum?.expression || (digits.length > 0 ? `${digits.join(" + ")} = ${sum}` : "")
      : "";
    const divisibleByTwo = ["0", "2", "4", "6", "8"].includes(ones);
    const divisibleByThree = sum > 0 && sum % 3 === 0;
    return (
      <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden p-3 sm:p-4">
        <style>{`
          @keyframes junior-verdict-fade-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-1 items-stretch gap-2">
          <div className="flex min-h-0 flex-col rounded-xl border border-emerald-400/40 bg-emerald-950/25 p-3">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-emerald-400/20 px-2.5 py-1 text-xs font-black text-emerald-300">
                2, 5 ve 10 KURALI
              </span>
              <span className="text-xs font-bold text-emerald-200">Sadece Son Rakam!</span>
            </div>
            <div className="mt-2 flex min-h-0 flex-1 items-stretch justify-center gap-3">
              {digits.map((digit, index) => {
                const isOnes = index === digits.length - 1;
                return (
                  <DigitTile
                    key={`${detective.value}-trap-${index}-${digit}`}
                    digit={digit}
                    placeLabel={placeLabelFor(digits, index)}
                    isHighlighted={isOnes}
                    isDimmed={!isOnes}
                    color="emerald"
                    showMagnifier={isOnes}
                  />
                );
              })}
            </div>
            {revealed ? (
              <p
                style={{ animation: VERDICT_FADE_IN }}
                className="mt-3 text-center text-xs font-extrabold text-emerald-200"
              >
                {divisibleByTwo
                  ? `✓ ${detective.value} sayısının sonu ${ones} (Çift) → 2'ye Tam Bölünür!`
                  : `✗ ${detective.value} sayısının sonu ${ones} → 2'ye Bölünmez!`}
              </p>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col rounded-xl border border-rose-400/40 bg-rose-950/25 p-3">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-rose-400/20 px-2.5 py-1 text-xs font-black text-rose-300">
                3 ve 9 KURALI TUZAĞI
              </span>
              <span className="text-xs font-bold text-rose-200">Son Rakama Aldanma!</span>
            </div>
            <div className="mt-2 flex min-h-0 flex-1 items-center justify-center gap-2 sm:gap-3">
              {sumDigits.map((digit, index) => (
                <div key={`${detective.value}-sum-${index}`} className="flex items-center gap-2 sm:gap-3">
                  {index > 0 ? (
                    <span className="text-2xl font-black text-amber-300 sm:text-3xl">+</span>
                  ) : null}
                  <div className="flex aspect-square h-[68%] w-auto items-center justify-center rounded-xl border border-amber-300/60 bg-slate-900 px-3 text-4xl font-black text-amber-200 sm:text-5xl">
                    {digit}
                  </div>
                </div>
              ))}
              {revealed ? (
                <>
                  <span className="text-2xl font-black text-amber-300 sm:text-3xl">=</span>
                  <div className="flex aspect-square h-[68%] w-auto items-center justify-center rounded-xl border-2 border-rose-400 bg-rose-500/25 px-3 text-4xl font-black text-rose-200 shadow-lg sm:text-5xl">
                    {sum}
                  </div>
                </>
              ) : null}
            </div>
            {revealed ? (
              <p
                style={{ animation: VERDICT_FADE_IN }}
                className="mt-4 text-center text-xs font-extrabold text-rose-200"
              >
                {expression ? <span className="sr-only">{expression}</span> : null}
                {divisibleByThree
                  ? `✓ Toplam ${sum} → ${detective.value} sayısı 3'e Bölünür!`
                  : `✗ Toplam ${sum} (3'ün katı değil) → ${detective.value} sayısı 3'e Bölünmez!`}
              </p>
            ) : null}
          </div>
        </div>

        {callout ? (
          <div
            style={{ animation: VERDICT_FADE_IN }}
            className="mt-3 flex items-center gap-3 rounded-xl border border-amber-300/50 bg-amber-400/20 px-4 py-2.5 text-amber-100 shadow-lg"
          >
            <span className="shrink-0 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black text-slate-950">
              {callout.badge}
            </span>
            <p className="text-xs font-extrabold sm:text-sm">{callout.text}</p>
          </div>
        ) : null}
      </div>
    );
  }

  const digits = detective.digits;
  const isDigitSumMode = layout === "detective-digit-sum" || Boolean(detective.digitSum?.active);
  const hasVerdict = detective.verdicts.length > 0;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden p-1.5 sm:p-2">
      <style>{`
        @keyframes junior-verdict-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* Kural rozetleri — tuval üstüne tek satır organik şerit (wrap yok → dikey yığılmaz) */}
      {ruleBadges.length > 0 ? (
        <div
          data-junior-rule-badges=""
          className="pointer-events-none absolute inset-x-1.5 top-1 z-20 flex flex-nowrap items-center gap-1 overflow-x-auto sm:inset-x-2 sm:top-1.5 sm:gap-1.5"
        >
          {ruleBadges.map((badge) => (
            <span
              key={badge}
              className="shrink-0 rounded-full border border-cyan-400/30 bg-slate-950/75 px-1.5 py-0.5 text-[9px] font-extrabold leading-none whitespace-nowrap text-cyan-200/95 backdrop-blur-[2px] sm:px-2 sm:text-[10px]"
            >
              {badge}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={`grid min-h-0 flex-1 grid-rows-1 items-stretch gap-2 sm:gap-3 ${
          ruleBadges.length > 0 ? "pt-5 sm:pt-6" : ""
        } ${hasVerdict ? "grid-cols-2" : "grid-cols-1"}`}
      >
        {/* SOL/ORTA: BASAMAK KAROLARI VE BÜYÜTEÇ / TOPLAMA ANİMASYONU */}
        <div className="relative z-0 flex h-full min-h-0 flex-col items-center justify-center">
          <div className="flex h-full min-h-0 w-full items-stretch justify-center gap-2 overflow-hidden sm:gap-4">
            {digits.map((digit, idx) => {
              const isOnes = idx === digits.length - 1;
              const isLastTwo = idx >= digits.length - 2;
              const placeLabel = placeLabelFor(digits, idx);
              const highlightLastTwo = detective.highlightedTarget === "last-two";
              const isHighlighted = isDigitSumMode
                ? Boolean(detective.digitSum?.active)
                : highlightLastTwo
                  ? isLastTwo
                  : Boolean(detective.highlightedTarget === "ones" && isOnes);
              const isDimmed =
                !isDigitSumMode &&
                Boolean(detective.dimOthers && (highlightLastTwo ? !isLastTwo : !isOnes));
              const color = detective.highlightColor ?? (isDigitSumMode ? "amber" : "cyan");
              const showMagnifier =
                !isDigitSumMode &&
                Boolean(detective.magnifyingGlass && (highlightLastTwo ? isLastTwo : isOnes));

              return (
                <DigitTile
                  key={`${detective.value}-${idx}-${digit}`}
                  digit={digit}
                  placeLabel={placeLabel}
                  isHighlighted={isHighlighted}
                  isDimmed={isDimmed}
                  color={color}
                  showMagnifier={showMagnifier}
                />
              );
            })}
          </div>

          {/* Rakam Toplama Dedektifi Animasyon Bandı (3 ve 9 Kuralları) */}
          {detective.digitSum?.active ? (
            <div
              style={{
                transition: "all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                animation: VERDICT_FADE_IN,
              }}
              className="mt-3.5 flex items-center gap-3 rounded-2xl border border-amber-300/50 bg-amber-500/15 px-5 py-2.5 shadow-lg"
            >
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200">
                Rakamlar Toplamı:
              </span>
              <span className="text-lg font-black text-white">
                {detective.digitSum.expression}
              </span>
              <span className="rounded-lg bg-emerald-400/25 px-2.5 py-0.5 text-xs font-black text-emerald-200">
                {detective.digitSum.sum % 9 === 0
                  ? "9'un Katı ✓"
                  : detective.digitSum.sum % 3 === 0
                    ? "3'ün Katı ✓"
                    : "3'ün katı değil"}
              </span>
            </div>
          ) : null}
        </div>

        {/* SAĞ: DEDEKTİF KARAR DAMGALARI — yalnızca STAMP_VERDICT sonrası */}
        {hasVerdict ? (
          <div
            style={{ animation: VERDICT_FADE_IN }}
            className="flex h-full min-h-0 flex-col justify-center gap-2"
          >
            <div className="text-xs font-black uppercase tracking-wider text-slate-300">
              Dedektif Karar Panosu{detective.value > 0 ? ` (${detective.value} Sayısı)` : ""}
            </div>

            {detective.verdicts.map((v) => (
              <div
                key={`${v.rule}-${v.label}`}
                style={{
                  transition: "all 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-black shadow-md sm:text-sm ${
                  v.pass
                    ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-100"
                    : "border-rose-400/60 bg-rose-500/20 text-rose-100"
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                    v.pass
                      ? "bg-emerald-400 text-slate-950"
                      : "bg-rose-400 text-slate-950"
                  }`}
                >
                  :{v.rule}
                </span>
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
