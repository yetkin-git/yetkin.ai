"use client";

import { Button } from "@/components/ui/button";
import { JuniorProgressBar, type JuniorProgressPause } from "@/components/junior/player/progress-bar";
import { juniorPlayerRangeLabel, juniorPlayerStepLabel } from "@/lib/junior/player-clock";

export type { JuniorProgressPause };

export function JuniorPlayerControls({
  playing,
  scrubbing,
  elapsedMs,
  durationMs,
  beat,
  beatCount,
  onToggle,
  onReplay,
  onStep,
  onScrubStart,
  onScrub,
  onScrubEnd,
  orientation = false,
  captionsVisible = false,
  onToggleCaptions,
  bgmMuted = false,
  onToggleBgm,
  fullscreen = false,
  onToggleFullscreen,
  pauses = [],
  starGlowEndMs = null,
  onOpenStar,
}: {
  playing: boolean;
  scrubbing: boolean;
  elapsedMs: number;
  durationMs: number;
  beat: number;
  beatCount: number;
  onToggle: () => void;
  onReplay: () => void;
  /** −1 önceki adım, +1 sonraki adım. Çapa yoksa etiket yerinde kalır. */
  onStep?: (delta: -1 | 1) => void;
  onScrubStart: () => void;
  onScrub: (ms: number) => void;
  onScrubEnd: () => void;
  /** Adım 0. Isınma kaseti sürerken anlatım çubuğu kilitli kalır. */
  orientation?: boolean;
  /** Canlı altyazı bandı — varsayılan kapalı; CC ile açılır. */
  captionsVisible?: boolean;
  onToggleCaptions?: () => void;
  /** Fon müziği kapalıyken doğru. */
  bgmMuted?: boolean;
  onToggleBgm?: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  /** Zaman çubuğundaki duraklar. Çocuk noktaya gelmeden yıldız veya pini görür. */
  pauses?: readonly JuniorProgressPause[];
  /** Parıldayan yıldız. */
  starGlowEndMs?: number | null;
  onOpenStar?: (endMs: number) => void;
}) {
  const stepLabel = orientation ? "Adım 0" : juniorPlayerStepLabel(beat, beatCount);
  const rangeLabel = orientation ? "Isınma" : juniorPlayerRangeLabel(elapsedMs, durationMs);
  const showPins = !orientation && durationMs > 0 && pauses.length > 0;

  return (
    <div
      className="flex flex-col gap-1"
      data-junior-player-controls=""
      data-junior-orientation={orientation ? "true" : undefined}
      data-scrubbing={scrubbing ? "true" : undefined}
      data-junior-captions={captionsVisible ? "on" : "off"}
      data-junior-pause-count={showPins ? pauses.length : 0}
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
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Önceki adım"
          data-junior-step-prev=""
          disabled={orientation || !onStep || beat <= 0}
          onClick={() => onStep?.(-1)}
        >
          Önceki adım
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          aria-label="Sonraki adım"
          data-junior-step-next=""
          disabled={orientation || !onStep || beat >= beatCount - 1}
          onClick={() => onStep?.(1)}
        >
          Sonraki adım
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
        {onToggleBgm ? (
          <Button
            type="button"
            size="sm"
            variant={bgmMuted ? "outline" : "primary"}
            aria-pressed={!bgmMuted}
            aria-label={bgmMuted ? "Arka plan müziğini aç" : "Arka plan müziğini kapat"}
            data-junior-bgm-toggle=""
            data-bgm={bgmMuted ? "muted" : "on"}
            onClick={onToggleBgm}
          >
            {bgmMuted ? "Müzik kapalı" : "Müzik açık"}
          </Button>
        ) : null}
        {onToggleFullscreen ? (
          <Button
            type="button"
            size="sm"
            variant={fullscreen ? "primary" : "outline"}
            aria-pressed={fullscreen}
            aria-label={fullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            title="Tam ekran (F)"
            data-junior-fullscreen-toggle=""
            onClick={onToggleFullscreen}
          >
            {fullscreen ? "Tam ekrandan çık" : "Tam Ekran"}
          </Button>
        ) : null}
        <span className="ml-auto text-xs font-semibold text-[var(--safir-deep)]">{stepLabel}</span>
      </div>
      <JuniorProgressBar
        elapsedMs={elapsedMs}
        durationMs={durationMs}
        orientation={orientation}
        pauses={pauses}
        glowEndMs={starGlowEndMs}
        rangeLabel={rangeLabel}
        stepLabel={stepLabel}
        onScrubStart={onScrubStart}
        onScrub={onScrub}
        onScrubEnd={onScrubEnd}
        onOpenStar={onOpenStar}
      />
    </div>
  );
}
