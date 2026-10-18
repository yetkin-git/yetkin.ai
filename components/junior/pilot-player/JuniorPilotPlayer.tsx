"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { JuniorLessonDecision } from "@/components/junior/player/lesson-decision";
import { DetectiveBoardStage } from "@/components/junior/pilot-player/DetectiveBoardStage";
import { FactorMultipleStage } from "@/components/junior/pilot-player/FactorMultipleStage";
import { GraphicOpStage } from "@/components/junior/pilot-player/GraphicOpStage";
import { MarbleTrayStage } from "@/components/junior/pilot-player/MarbleTrayStage";
import { SummaryPromptStage } from "@/components/junior/pilot-player/SummaryPromptStage";
import { lockTimelineToExactAudioMs } from "@/lib/junior/pilot-engine/pcm-cue-aligner";
import { isJuniorGraphClockLesson } from "@/lib/junior/pilot-engine/playback-key";
import type { TimelineJSON } from "@/lib/junior/pilot-engine/schema";
import { reduceSceneState, type SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";
import {
  resolveStickyFrame,
  sceneHasRenderableContent,
} from "@/lib/junior/pilot-engine/sticky-frame";
import { juniorLessonAudioSrc } from "@/lib/junior/voice";

/** Soğuk açılış / seek boşluğu — zifiri siyah yerine yumuşak tutucu plaka. */
function AmbientHoldPlate(): ReactElement {
  return (
    <div
      data-junior-ambient-hold=""
      className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-xl"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, rgba(34,211,238,0.14) 0%, rgba(15,23,42,0.92) 55%, rgba(11,17,32,1) 100%)",
      }}
    >
      <div className="pointer-events-none absolute inset-6 rounded-2xl border border-cyan-400/20 bg-slate-900/35 shadow-[inset_0_0_40px_rgba(34,211,238,0.08)]" />
      <div className="relative flex flex-col items-center gap-2 px-6 text-center">
        <span className="h-2 w-16 rounded-full bg-cyan-400/40" />
        <span className="text-xs font-bold tracking-wide text-slate-400/90">Sahne hazırlanıyor</span>
      </div>
    </div>
  );
}

function PilotStageCanvas(props: {
  state: SceneGraphState;
  currentTimeMs: number;
}): ReactElement {
  const { state, currentTimeMs } = props;
  if (!sceneHasRenderableContent(state)) {
    return <AmbientHoldPlate />;
  }
  if (state.layout === "marble-tray") {
    return <MarbleTrayStage state={state} />;
  }
  if (state.layout === "factor-vs-multiple") {
    return <FactorMultipleStage state={state} currentTimeMs={currentTimeMs} />;
  }
  if (
    state.layout === "prime-factor-tree" ||
    state.layout === "common-divisor" ||
    state.layout === "circle-measure" ||
    state.layout === "habitat" ||
    state.layout === "fuel" ||
    state.layout === "fraction" ||
    state.layout === "number-line" ||
    state.layout === "angle" ||
    state.layout === "area" ||
    state.layout === "force" ||
    state.layout === "speed"
  ) {
    return <GraphicOpStage state={state} currentTimeMs={currentTimeMs} />;
  }
  if (state.layout === "summary-board") {
    return <SummaryPromptStage state={state} />;
  }
  return <DetectiveBoardStage state={state} />;
}

export type JuniorPilotPlayerProps = {
  timeline: TimelineJSON;
  grantedAudioUrl?: string | null;
  fill?: boolean;
  onBindStop?: (stop: () => void) => void;
  onPlaybackComplete?: (complete: boolean) => void;
  onReadyToTell?: () => void;
  /**
   * Warmup kaseti oynarken (gate === "cassette") anlatıcı PCM kilitlenir.
   * Fade/scene sırasında false kalır — finish() 0 ms'den başlatabilir.
   */
  narrationHold?: boolean;
  /** Warmup oryantasyonu süresince kullanıcı oynat/seek kontrolü kapalı. */
  controlsLocked?: boolean;
  /** Warmup finish → anlatıyı timeline 0 ms'den başlatmak için bağlanır. */
  onBindStartNarration?: (start: () => void) => void;
  /** Bitmiş cue indeksleri (currentTime ≥ endMs). LocalStorage ilerleme yüzdesi için. */
  onWatchedCuesChange?: (watchedIndices: readonly number[]) => void;
};

function formatClockMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function JuniorPilotPlayer(props: JuniorPilotPlayerProps): ReactElement {
  const {
    timeline,
    grantedAudioUrl,
    fill = false,
    onBindStop,
    onPlaybackComplete,
    onReadyToTell,
    narrationHold = false,
    controlsLocked = false,
    onBindStartNarration,
    onWatchedCuesChange,
  } = props;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stageContainerRef = useRef<HTMLDivElement | null>(null);

  const [clock, setClock] = useState(timeline);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [durationMs, setDurationMs] = useState(timeline.audio.durationMs);
  const [playing, setPlaying] = useState(false);
  const [complete, setComplete] = useState(false);
  const [decisionTaken, setDecisionTaken] = useState(false);
  /** Canlı altyazı bandı. Varsayılan açık; CC düğmesi kapatınca sahne ferahlar. */
  const [captionsOpen, setCaptionsOpen] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  /** Son dolu sahne karesi — SET_STAGE boşluğu boyunca asılı kalır (ref: 60 FPS setState yok). */
  const heldSceneRef = useRef<SceneGraphState | null>(null);
  /** Manuel clear / timeline değişiminde sticky re-render tetikler. */
  const [stickyEpoch, setStickyEpoch] = useState(0);

  const versionedPublicSrc = juniorLessonAudioSrc(clock.lessonKey);
  const audioSrc = grantedAudioUrl?.trim() || versionedPublicSrc || "";
  const teacherName = clock.teacher.name.trim();
  const teacherInitial = teacherName.slice(0, 1).toLocaleUpperCase("tr-TR");

  useEffect(() => {
    setClock(timeline);
    setDurationMs(timeline.audio.durationMs);
    setCurrentTimeMs(0);
    heldSceneRef.current = null;
    setStickyEpoch((n) => n + 1);
  }, [timeline]);

  const sceneState = useMemo(
    () => reduceSceneState(clock, currentTimeMs),
    [clock, currentTimeMs],
  );

  const stickyFrame = useMemo(() => {
    void stickyEpoch;
    const resolved = resolveStickyFrame(sceneState, heldSceneRef.current);
    if (resolved.nextHeld !== heldSceneRef.current) {
      heldSceneRef.current = resolved.nextHeld;
    }
    return resolved;
  }, [sceneState, stickyEpoch]);

  const displayScene = stickyFrame.display;
  const stickyHold = stickyFrame.sticky;
  const stageTimeMs = stickyHold ? displayScene.elapsedMs : currentTimeMs;

  const clearStickyHold = useCallback(() => {
    heldSceneRef.current = null;
    setStickyEpoch((n) => n + 1);
  }, []);

  // 60 FPS deterministik rAF saat döngüsü
  useEffect(() => {
    if (!playing) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const audio = audioRef.current;
      if (audio) {
        const ms = Math.round(audio.currentTime * 1000);
        setCurrentTimeMs(ms);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [playing]);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    onBindStop?.(stopPlayback);
  }, [onBindStop, stopPlayback]);

  useEffect(() => {
    onPlaybackComplete?.(complete);
  }, [complete, onPlaybackComplete]);

  // Pre-roll kaseti bitmeden PCM anlatıcı arkada başlamasın.
  useEffect(() => {
    if (!narrationHold) {
      return;
    }
    stopPlayback();
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
    }
    setCurrentTimeMs(0);
  }, [narrationHold, stopPlayback]);

  const seekToMs = useCallback(
    (targetMs: number, opts?: { force?: boolean; clearSticky?: boolean }) => {
      if (controlsLocked && !opts?.force) {
        return;
      }
      if (opts?.clearSticky !== false) {
        clearStickyHold();
      }
      const clamped = Math.max(0, Math.min(durationMs, targetMs));
      setCurrentTimeMs(clamped);
      if (clamped < durationMs - 250) {
        setComplete(false);
      }
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = clamped / 1000;
      }
    },
    [clearStickyHold, controlsLocked, durationMs],
  );

  const startNarration = useCallback(() => {
    clearStickyHold();
    seekToMs(0, { force: true, clearSticky: false });
    setComplete(false);
    setDecisionTaken(false);
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  }, [clearStickyHold, seekToMs]);

  useEffect(() => {
    onBindStartNarration?.(startNarration);
  }, [onBindStartNarration, startNarration]);

  const togglePlay = useCallback(() => {
    if (controlsLocked || narrationHold) {
      return;
    }
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      if (complete) {
        audio.currentTime = 0;
        setCurrentTimeMs(0);
        setComplete(false);
        setDecisionTaken(false);
      }
      void audio.play().then(() => {
        setPlaying(true);
      }).catch(() => {
        setPlaying(false);
      });
    } else {
      audio.pause();
      setPlaying(false);
    }
  }, [complete, controlsLocked, narrationHold]);

  const stepCue = useCallback(
    (delta: number) => {
      if (controlsLocked || narrationHold) {
        return;
      }
      const nextIdx = Math.max(
        0,
        Math.min(clock.cues.length - 1, sceneState.activeCueIndex + delta),
      );
      const cue = clock.cues[nextIdx];
      if (cue) {
        seekToMs(cue.startMs + 20);
      }
    },
    [clock.cues, controlsLocked, narrationHold, sceneState.activeCueIndex, seekToMs],
  );

  const replayFromStart = useCallback(() => {
    if (controlsLocked || narrationHold) {
      return;
    }
    clearStickyHold();
    seekToMs(0, { clearSticky: false });
    setComplete(false);
    setDecisionTaken(false);
    const audio = audioRef.current;
    if (audio) {
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [clearStickyHold, controlsLocked, narrationHold, seekToMs]);

  const toggleFullscreen = useCallback(() => {
    const node = stageContainerRef.current;
    if (!node) {
      return;
    }
    if (document.fullscreenElement === node) {
      void document.exitFullscreen();
      return;
    }
    void node.requestFullscreen().catch(() => undefined);
  }, []);

  useEffect(() => {
    function onFsChange() {
      setFullscreen(document.fullscreenElement === stageContainerRef.current);
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const activeCue = sceneState.activeCue;
  const progressRatio = durationMs > 0 ? Math.min(1, currentTimeMs / durationMs) : 0;

  // İzlenen sahne indeksleri → `% Kaç Bitirdim?` LocalStorage izi
  useEffect(() => {
    if (!onWatchedCuesChange) {
      return;
    }
    if (complete) {
      onWatchedCuesChange(clock.cues.map((_, index) => index));
      return;
    }
    const watched = clock.cues
      .map((cue, index) => (currentTimeMs >= cue.endMs ? index : -1))
      .filter((index) => index >= 0);
    onWatchedCuesChange(watched);
  }, [clock.cues, complete, currentTimeMs, onWatchedCuesChange]);

  /** Selim Öğretmen paneli aktif sahne bağlamını dinler (`junior:live-tutor-scene`). */
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.dispatchEvent(
      new CustomEvent("junior:live-tutor-scene", {
        detail: {
          lessonKey: clock.lessonKey,
          cueIndex: sceneState.activeCueIndex,
          title: sceneState.title ?? "",
          subtitle: sceneState.subtitle ?? "",
        },
      }),
    );
  }, [
    clock.lessonKey,
    sceneState.activeCueIndex,
    sceneState.subtitle,
    sceneState.title,
  ]);

  return (
    <div
      className={`relative flex min-h-0 w-full flex-1 flex-col ${fill ? "h-full" : "h-auto"}`}
      data-junior-focus-player=""
      data-junior-pilot-v2={clock.lessonKey}
      data-junior-zero-scroll={fill ? "true" : undefined}
      data-junior-captions={captionsOpen ? "on" : "off"}
    >
      {/* Gizli HTML5 Ses Motoru (48 kHz Mastering, atempo=JUNIOR_BAKE_ATEMPO / 0.94) */}
      <audio
        ref={audioRef}
        className="pointer-events-none absolute h-px w-px opacity-0"
        src={audioSrc || undefined}
        preload="auto"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (!Number.isFinite(d) || d <= 0) {
            return;
          }
          const exactMs = Math.round(d * 1000);
          if (isJuniorGraphClockLesson(timeline.lessonKey)) {
            setClock(lockTimelineToExactAudioMs(timeline, exactMs));
          }
          setDurationMs(exactMs);
        }}
        onTimeUpdate={(e) => {
          setCurrentTimeMs(Math.round(e.currentTarget.currentTime * 1000));
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setCurrentTimeMs(durationMs);
          setComplete(true);
        }}
      />

      <div
        ref={stageContainerRef}
        className={`flex w-full max-w-none flex-col overflow-hidden border border-slate-700/80 bg-[#0b1120] text-white shadow-2xl ${
          fullscreen
            ? "h-screen w-screen max-h-none rounded-none"
            : "h-full min-h-0 flex-1 rounded-2xl"
        }`}
        data-junior-cinema-stage=""
        data-junior-stage-stack="flex"
        data-junior-fullscreen={fullscreen ? "true" : "false"}
      >
        {/* 1) Üst chrome: öğretmen + kompakt bölüm şeridi (tek satır) */}
        <div className="flex shrink-0 items-center gap-1.5 overflow-hidden border-b border-slate-800/80 bg-slate-950/80 px-2 py-0.5 sm:px-2.5">
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-[10px] font-black text-slate-950 shadow sm:h-6 sm:w-6 sm:text-xs">
              {teacherInitial}
            </span>
            <span className="hidden text-[10px] font-black tracking-wide text-cyan-300 sm:inline sm:text-[11px]">
              {teacherName}
            </span>
          </div>

          {/* 5 Bölüm (Chapter) — minimalist hap şerit */}
          <ol
            data-junior-micro-steps=""
            className="scrollbar-none flex min-w-0 flex-1 flex-nowrap items-center gap-0.5 overflow-x-auto"
          >
            {clock.chapters.map((ch, idx) => {
              const isCurrent = sceneState.activeChapterId === ch.id;
              const isDone = currentTimeMs >= ch.endMs || complete;
              return (
                <li key={ch.id} className="shrink-0">
                  <button
                    type="button"
                    data-junior-micro-step={idx}
                    data-junior-micro-done={isDone ? "true" : "false"}
                    disabled={controlsLocked || narrationHold}
                    onClick={() => seekToMs(ch.startMs + 10)}
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-extrabold leading-none transition-all disabled:opacity-40 sm:px-2 sm:text-[11px] ${
                      isCurrent
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-100 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                        : isDone
                          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
                          : "border-slate-700/80 bg-slate-900/70 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    <span>{isDone ? "✓" : `${idx + 1}.`}</span>
                    <span className="whitespace-nowrap">{ch.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* 2) Sahne tuvali — kalan yüksekliği doldurur, dışarı taşmaz */}
        <div
          className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-2 pt-0.5 sm:px-3"
          data-junior-cinema-board=""
          data-junior-clean-stage={captionsOpen ? undefined : "true"}
          data-junior-step-art={sceneState.activeCueIndex}
        >
          {/* Sahne başlığı + ipucu tek satır; sayaç sağda kompakt */}
          <div className="mb-0.5 flex shrink-0 items-baseline justify-between gap-2">
            <h3 className="min-w-0 truncate text-xs font-black tracking-tight text-white sm:text-sm">
              {sceneState.title}
              {sceneState.subtitle ? (
                <span className="ml-1.5 font-semibold text-cyan-300/85">
                  · {sceneState.subtitle}
                </span>
              ) : null}
            </h3>
            <span className="shrink-0 rounded-md border border-slate-700/80 bg-slate-900/80 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-slate-400">
              {sceneState.activeCueIndex + 1}/{clock.cues.length}
            </span>
          </div>

          {/* Aktif sahne — sticky hold: boş SET_STAGE aralığında son dolu kare asılı kalır. */}
          <div
            className="relative min-h-0 w-full flex-1"
            data-junior-stage-canvas=""
            data-junior-sticky-frame={stickyHold ? "true" : "false"}
            data-junior-sticky-layout={displayScene.layout}
          >
            <div
              className={`absolute inset-0 transition-opacity duration-300 ease-out ${
                stickyHold ? "opacity-95" : "opacity-100"
              }`}
            >
              <PilotStageCanvas state={displayScene} currentTimeMs={stageTimeMs} />
            </div>
          </div>

          {/* Bitiş Karar Overlay (Sıra Sende / Tekrar Dinle) */}
          {complete && !decisionTaken ? (
            <JuniorLessonDecision
              onTell={() => {
                stopPlayback();
                setDecisionTaken(true);
                onReadyToTell?.();
              }}
              onReplay={replayFromStart}
            />
          ) : null}
        </div>

        {/* 3) Altyazı — iki satırlık sabit bant; kart içinde kaymaz */}
        <div
          className="shrink-0 overflow-hidden border-t border-slate-800 bg-slate-950/95 px-3"
          data-junior-caption-rail=""
        >
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              captionsOpen && activeCue ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              {activeCue ? (
                <div
                  data-junior-live-caption=""
                  aria-live={captionsOpen ? "polite" : "off"}
                  aria-hidden={captionsOpen ? undefined : true}
                  className="mt-2 line-clamp-2 min-h-[2.75rem] rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-1.5 text-center text-xs font-medium leading-5 text-slate-200 sm:text-sm sm:leading-6"
                >
                  {(activeCue.words ?? []).map((w, idx) => {
                    const isActiveWord = idx === sceneState.activeWordIndex;
                    const isPastWord =
                      sceneState.activeWordIndex >= 0 && idx < sceneState.activeWordIndex;
                    return (
                      <span
                        key={`${activeCue.id}-w-${idx}`}
                        data-junior-caption-word={isActiveWord ? "active" : isPastWord ? "past" : "future"}
                        className={`inline-block box-border rounded px-1 py-0 font-medium transition-colors duration-150 ${
                          isActiveWord
                            ? "bg-amber-400/30 text-amber-300"
                            : isPastWord
                              ? "bg-transparent text-white"
                              : "bg-transparent text-slate-300"
                        }`}
                      >
                        {w.word}{" "}
                      </span>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* 4) Alt kontrol şeridi — kartın dibine sabit, kırpılmaz */}
        <div
          className="flex shrink-0 flex-col gap-1.5 bg-slate-950/95 px-3 pt-1.5 pb-2.5"
          data-junior-control-bar=""
        >
          <div className="flex shrink-0 items-center gap-3">
            <span className="w-11 text-right font-mono text-xs font-bold text-slate-300">
              {formatClockMs(currentTimeMs)}
            </span>

            <div className="relative flex-1">
              <input
                type="range"
                min={0}
                max={durationMs}
                value={currentTimeMs}
                aria-label="Ders zaman çubuğu"
                disabled={controlsLocked || narrationHold}
                onChange={(e) => seekToMs(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              />
              <div
                className="pointer-events-none absolute left-0 top-1/2 h-2 -translate-y-1/2 rounded-l-lg bg-gradient-to-r from-cyan-400 to-emerald-400"
                style={{ width: `${(progressRatio * 100).toFixed(2)}%` }}
              />
            </div>

            <span className="w-11 font-mono text-xs font-bold text-slate-400">
              {formatClockMs(durationMs)}
            </span>
          </div>

          {/* Kontrol Düğmeleri */}
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="scrollbar-none flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={togglePlay}
                disabled={controlsLocked || narrationHold}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-cyan-400 px-4 py-1.5 text-xs font-black text-slate-950 shadow hover:bg-cyan-300 disabled:opacity-40"
              >
                <span>{playing ? "⏸ Duraklat" : complete ? "↻ Tekrar Dinle" : "▶ Oynat"}</span>
              </button>

              <button
                type="button"
                onClick={() => setCaptionsOpen((open) => !open)}
                aria-pressed={captionsOpen}
                aria-label={captionsOpen ? "Altyazıyı kapat" : "Altyazıyı aç"}
                data-junior-captions-toggle=""
                data-on={captionsOpen ? "true" : "false"}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black transition-colors ${
                  captionsOpen
                    ? "border-amber-300 bg-amber-400 text-slate-950 shadow"
                    : "border-slate-600 bg-slate-900 text-slate-200 hover:border-slate-400"
                }`}
              >
                <span className="rounded bg-slate-950/20 px-1 py-0.5 tracking-wide">CC</span>
                {captionsOpen ? "Altyazı Açık" : "Altyazı Kapalı"}
              </button>

              <button
                type="button"
                onClick={() => stepCue(-1)}
                disabled={controlsLocked || narrationHold || sceneState.activeCueIndex <= 0}
                className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-500 disabled:opacity-40"
              >
                ◀ Önceki Sahne
              </button>

              <button
                type="button"
                onClick={() => stepCue(1)}
                disabled={
                  controlsLocked ||
                  narrationHold ||
                  sceneState.activeCueIndex >= clock.cues.length - 1
                }
                className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-slate-500 disabled:opacity-40"
              >
                Sonraki Sahne ▶
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                className="shrink-0 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-bold text-slate-300 hover:border-slate-500"
              >
                {fullscreen ? "Küçült" : "Tam Ekran"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
