"use client";

import type { JuniorPauseKind } from "@/lib/junior/player-clock";

export type JuniorProgressPause = {
  endMs: number;
  kind: JuniorPauseKind;
};

/**
 * Anlatım zaman çubuğu.
 * Yıldız, dikkat ve not işaretleri kaseti kesmez.
 * Çocuk işarete dokunursa bilgi veya soru kutusu açılır.
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
              const glyph = pause.kind === "attention" ? "💡" : pause.kind === "notebook" ? "📌" : "⭐";
              const label =
                pause.kind === "attention"
                  ? "Dikkat noktasını aç"
                  : pause.kind === "notebook"
                    ? "Not durağını aç"
                    : "Küçük soruyu aç";
              return (
                <button
                  key={`${pause.kind}:${pause.endMs}`}
                  type="button"
                  data-junior-pause-pin=""
                  data-junior-pause-kind={pause.kind}
                  data-junior-star-glow={star ? (glow ? "true" : "false") : undefined}
                  className={`absolute top-1/2 z-[2] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 leading-none ${
                    star ? "text-[15px]" : "text-[13px]"
                  } ${glow ? "junior-star-pulse" : ""}`}
                  style={{ left: `${ratio * 100}%` }}
                  title={pause.kind === "attention" ? "Dikkat noktası" : label}
                  aria-label={label}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() => onOpenStar?.(pause.endMs)}
                >
                  {glyph}
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
