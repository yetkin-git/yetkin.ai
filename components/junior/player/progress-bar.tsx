"use client";

import type { JuniorPauseKind } from "@/lib/junior/player-clock";

export type JuniorProgressPause = {
  endMs: number;
  kind: JuniorPauseKind;
};

/**
 * Anlatım zaman çubuğu.
 * Yıldız durağı kaseti kesmez. Çocuk yıldıza dokunursa soru paneli açılır.
 * 📌 not ve 💡 dikkat durakları yalnız konum işaretidir; tıklanmaz ve panel açmaz.
 */
export function JuniorProgressBar({
  elapsedMs,
  durationMs,
  orientation = false,
  pauses = [],
  glowEndMs = null,
  rangeLabel,
  stepLabel,
  onScrubStart,
  onScrub,
  onScrubEnd,
  onOpenStar,
}: {
  elapsedMs: number;
  durationMs: number;
  orientation?: boolean;
  pauses?: readonly JuniorProgressPause[];
  /** Parıldayan yıldızın milisaniyesi. */
  glowEndMs?: number | null;
  rangeLabel: string;
  stepLabel: string;
  onScrubStart: () => void;
  onScrub: (ms: number) => void;
  onScrubEnd: () => void;
  onOpenStar?: (endMs: number) => void;
}) {
  const max = Math.max(1, Math.round(durationMs));
  const value = Math.min(max, Math.round(elapsedMs));
  const showPins = !orientation && durationMs > 0 && pauses.length > 0;

  return (
    <div className="flex items-center gap-2">
      <div className="relative min-w-0 flex-1" data-junior-pause-count={showPins ? pauses.length : 0}>
        {showPins
          ? pauses.map((pause) => {
              const ratio = Math.min(0.98, Math.max(0.02, pause.endMs / durationMs));
              const star = pause.kind === "turn";
              const glow = star && glowEndMs != null && Math.abs(glowEndMs - pause.endMs) < 80;
              if (!star) {
                return (
                  <span
                    key={`${pause.kind}:${pause.endMs}`}
                    data-junior-pause-pin=""
                    data-junior-pause-kind={pause.kind}
                    className="pointer-events-none absolute top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 select-none text-[13px] leading-none"
                    style={{ left: `${ratio * 100}%` }}
                    title={pause.kind === "attention" ? "Dikkat noktası" : "Burada not durağı var"}
                    aria-hidden="true"
                  >
                    {pause.kind === "attention" ? "💡" : "📌"}
                  </span>
                );
              }
              return (
                <button
                  key={`${pause.kind}:${pause.endMs}`}
                  type="button"
                  data-junior-pause-pin=""
                  data-junior-pause-kind={pause.kind}
                  data-junior-star-glow={glow ? "true" : "false"}
                  className={`absolute top-1/2 z-[2] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-[15px] leading-none ${
                    glow ? "junior-star-pulse" : ""
                  }`}
                  style={{ left: `${ratio * 100}%` }}
                  title="Küçük soruyu aç"
                  aria-label="Küçük soruyu aç"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onOpenStar?.(pause.endMs)}
                >
                  ⭐
                </button>
              );
            })
          : null}
        <input
          type="range"
          className="relative z-0 h-6 w-full cursor-pointer accent-[var(--safir)]"
          data-junior-player-progress=""
          min={0}
          max={max}
          step={1}
          value={value}
          aria-label="Anlatım ilerlemesi"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={`${rangeLabel}, ${stepLabel}`}
          disabled={orientation}
          onPointerDown={onScrubStart}
          onChange={(event) => {
            onScrubStart();
            onScrub(Number(event.target.value));
          }}
          onPointerUp={onScrubEnd}
          onKeyUp={onScrubEnd}
          onBlur={onScrubEnd}
        />
      </div>
      <span className="shrink-0 text-[11px] tabular-nums text-[var(--muted)]">{rangeLabel}</span>
    </div>
  );
}
