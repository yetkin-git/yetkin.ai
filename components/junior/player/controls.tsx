"use client";

import { Button } from "@/components/ui/button";
import { juniorPlayerRangeLabel, juniorPlayerStepLabel } from "@/lib/junior/player-clock";

export function JuniorPlayerControls({
  playing,
  scrubbing,
  elapsedMs,
  durationMs,
  beat,
  beatCount,
  onToggle,
  onReplay,
  onScrubStart,
  onScrub,
  onScrubEnd,
  orientation = false,
  captionsVisible = false,
  onToggleCaptions,
}: {
  playing: boolean;
  scrubbing: boolean;
  elapsedMs: number;
  durationMs: number;
  beat: number;
  beatCount: number;
  onToggle: () => void;
  onReplay: () => void;
  onScrubStart: () => void;
  onScrub: (ms: number) => void;
  onScrubEnd: () => void;
  /** Adım 0. Isınma kaseti sürerken anlatım çubuğu kilitli kalır. */
  orientation?: boolean;
  /** Canlı altyazı bandı — varsayılan kapalı; CC ile açılır. */
  captionsVisible?: boolean;
  onToggleCaptions?: () => void;
}) {
  const max = Math.max(1, Math.round(durationMs));
  const value = Math.min(max, Math.round(elapsedMs));
  const stepLabel = orientation ? "Adım 0" : juniorPlayerStepLabel(beat, beatCount);
  const rangeLabel = orientation ? "Isınma" : juniorPlayerRangeLabel(elapsedMs, durationMs);

  return (
    <div
      className="flex flex-col gap-1"
      data-junior-player-controls=""
      data-junior-orientation={orientation ? "true" : undefined}
      data-scrubbing={scrubbing ? "true" : undefined}
      data-junior-captions={captionsVisible ? "on" : "off"}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Button
          type="button"
          size="sm"
          variant={playing ? "outline" : "primary"}
          aria-pressed={playing}
          aria-label={playing ? "Durdur" : "Oynat"}
          disabled={orientation}
          onClick={onToggle}
        >
          {playing ? "Durdur" : "Oynat"}
        </Button>
        <Button type="button" size="sm" variant="outline" aria-label="Baştan dinle" disabled={orientation} onClick={onReplay}>
          Baştan Dinle
        </Button>
        {onToggleCaptions ? (
          <Button
            type="button"
            size="sm"
            variant={captionsVisible ? "primary" : "outline"}
            aria-pressed={captionsVisible}
            aria-label={captionsVisible ? "Altyazıyı gizle" : "Altyazıyı göster"}
            data-junior-captions-toggle=""
            data-on={captionsVisible ? "true" : "false"}
            onClick={onToggleCaptions}
          >
            CC
          </Button>
        ) : null}
        <span className="ml-auto text-xs font-semibold text-[var(--safir-deep)]">{stepLabel}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="h-6 min-w-0 flex-1 cursor-pointer accent-[var(--safir)]"
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
        <span className="shrink-0 text-[11px] tabular-nums text-[var(--muted)]">{rangeLabel}</span>
      </div>
    </div>
  );
}
