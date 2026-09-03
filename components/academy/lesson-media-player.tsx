"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconPause, IconPlay, IconVolume, IconVolumeOff } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  activeAcademyDialogueTurnIndex,
  academyDialogueSpokenElapsedSec,
  buildAcademyDialogueTimeline,
} from "@/lib/academy/dialogue-timeline";
import { academyLessonAudioPlaybackSrc, academyPlayerClockDurationSec, academySealedAudioDurationSec, isAcademyLessonAudioSealed } from "@/lib/academy/lesson-audio";
import { formatAcademyCinemaClock } from "@/lib/academy/lesson-cinema";
import { shouldSealProgressAfterDialogueEnded } from "@/lib/academy/lesson-advance";

export function LessonMediaPlayer({
  courseSlug,
  lessonKey,
  lessonTitle,
  body,
  onActiveTurnChange,
  onSpokenElapsedChange,
  onPlayingChange,
  onEnded,
}: {
  courseSlug: string;
  lessonKey: string;
  lessonTitle: string;
  body: string;
  onActiveTurnChange?: (index: number) => void;
  onSpokenElapsedChange?: (elapsedSec: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onEnded?: () => void;
}) {
  const copy = ACADEMY_SEN.player;
  const listenCopy = ACADEMY_SEN.listen;
  const timeline = useMemo(() => buildAcademyDialogueTimeline(body, courseSlug), [body, courseSlug]);
  const audioSealed = isAcademyLessonAudioSealed(courseSlug, lessonKey);
  const audioSrc = useMemo(
    () => (audioSealed ? academyLessonAudioPlaybackSrc(courseSlug, lessonKey) : undefined),
    [audioSealed, courseSlug, lessonKey],
  );
  const spokenDuration = timeline.spokenDuration;
  const sealedDuration = academySealedAudioDurationSec(courseSlug, lessonKey);
  const fallbackDuration = sealedDuration || spokenDuration;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clockRef = useRef({
    playing: false,
    elapsed: 0,
    lastStamp: 0,
    duration: fallbackDuration,
    playbackStarted: false,
    sealed: false,
    lastAudioTime: 0,
    stallMs: 0,
  });
  const pauseLockRef = useRef(false);
  const falseEndRetryRef = useRef(false);
  const rafRef = useRef(0);
  const togglePlayRef = useRef<() => void>(() => undefined);
  const onEndedRef = useRef(onEnded);
  const onActiveTurnChangeRef = useRef(onActiveTurnChange);
  const onSpokenElapsedChangeRef = useRef(onSpokenElapsedChange);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  const resolveClockDuration = useCallback(
    (audioDuration: number) =>
      academyPlayerClockDurationSec({
        audioDuration,
        sealedDuration,
        spokenDuration,
      }),
    [sealedDuration, spokenDuration],
  );

  const commitDuration = useCallback(
    (audioDuration: number) => {
      const next = resolveClockDuration(audioDuration);
      if (!(next > 0)) {
        return next;
      }
      if (clockRef.current.duration !== next) {
        clockRef.current.duration = next;
      }
      setDuration((current) => (current !== next ? next : current));
      return next;
    },
    [resolveClockDuration],
  );
  onEndedRef.current = onEnded;
  onActiveTurnChangeRef.current = onActiveTurnChange;
  onSpokenElapsedChangeRef.current = onSpokenElapsedChange;
  onPlayingChangeRef.current = onPlayingChange;

  const spokenElapsed = academyDialogueSpokenElapsedSec({
    currentTime: elapsed,
    audioDuration: audioReady ? duration : 0,
    spokenDuration,
  });
  const activeIndex = activeAcademyDialogueTurnIndex(timeline.turns, spokenElapsed);

  useEffect(() => {
    onActiveTurnChangeRef.current?.(activeIndex);
  }, [activeIndex, lessonKey]);

  useEffect(() => {
    onSpokenElapsedChangeRef.current?.(spokenElapsed);
  }, [spokenElapsed, lessonKey]);

  useEffect(() => {
    onPlayingChangeRef.current?.(playing);
  }, [playing]);

  useEffect(() => {
    pauseLockRef.current = true;
    falseEndRetryRef.current = false;
    clockRef.current = {
      playing: false,
      elapsed: 0,
      lastStamp: 0,
      duration: fallbackDuration,
      playbackStarted: false,
      sealed: false,
      lastAudioTime: 0,
      stallMs: 0,
    };
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setPlaying(false);
    setElapsed(0);
    setDuration(fallbackDuration);
    setAudioReady(false);
    setAudioFailed(false);
    const audio = audioRef.current;
    if (audio && audioSrc) {
      audio.load();
    }
  }, [audioSrc, fallbackDuration, lessonKey]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.volume = muted ? 0 : volume;
    audio.muted = muted || volume === 0;
  }, [muted, volume]);

  const sealIfEnded = useCallback((nextElapsed: number, cap: number) => {
    const clock = clockRef.current;
    if (
      !shouldSealProgressAfterDialogueEnded({
        playbackStarted: clock.playbackStarted,
        reachedEnd: cap > 0 && nextElapsed >= cap,
      })
    ) {
      return false;
    }
    if (clock.sealed) {
      return true;
    }
    clock.sealed = true;
    clock.playing = false;
    pauseLockRef.current = true;
    setPlaying(false);
    setElapsed(cap);
    audioRef.current?.pause();
    onEndedRef.current?.();
    return true;
  }, []);

  const applyElapsed = useCallback(
    (next: number) => {
      const cap = clockRef.current.duration > 0 ? clockRef.current.duration : fallbackDuration;
      const clamped = Math.max(0, Math.min(next, cap));
      clockRef.current.elapsed = clamped;
      clockRef.current.lastAudioTime = clamped;
      clockRef.current.stallMs = 0;
      setElapsed(clamped);
      const audio = audioRef.current;
      if (audioReady && audio) {
        audio.currentTime = clamped;
      }
      sealIfEnded(clamped, cap);
    },
    [audioReady, fallbackDuration, sealIfEnded],
  );

  const applyPauseLock = useCallback(() => {
    pauseLockRef.current = true;
    clockRef.current.playing = false;
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setPlaying(false);
    audioRef.current?.pause();
  }, []);

  useEffect(() => {
    if (!playing || pauseLockRef.current) {
      return;
    }
    const tick = (stamp: number) => {
      const clock = clockRef.current;
      if (pauseLockRef.current || !clock.playing) {
        rafRef.current = 0;
        return;
      }
      if (clock.lastStamp === 0) {
        clock.lastStamp = stamp;
      }
      const delta = (stamp - clock.lastStamp) / 1000;
      clock.lastStamp = stamp;
      const cap = clock.duration > 0 ? clock.duration : fallbackDuration;
      const audio = audioRef.current;
      if (audioReady && audio && Number.isFinite(audio.currentTime)) {
        commitDuration(audio.duration);
        const reported = audio.currentTime;
        const stalled =
          !audio.paused &&
          Math.abs(reported - clock.lastAudioTime) < 0.04 &&
          reported + 0.35 < cap;
        if (stalled) {
          clock.stallMs += delta * 1000;
          const next = Math.min(clock.elapsed + delta, cap);
          clock.elapsed = next;
        setElapsed((current) => (Math.abs(current - next) >= 0.05 ? next : current));
          if (clock.stallMs > 280 && Number.isFinite(audio.duration) && reported + 0.2 < cap) {
            audio.currentTime = Math.min(reported + 0.12, cap);
          }
        } else {
          clock.stallMs = 0;
          clock.lastAudioTime = reported;
          clock.elapsed = reported;
          setElapsed((current) => (Math.abs(current - reported) >= 0.05 ? reported : current));
        }
        if (sealIfEnded(clock.elapsed, cap)) {
          rafRef.current = 0;
          return;
        }
      } else {
        const next = clock.elapsed + delta;
        if (sealIfEnded(next, cap)) {
          clock.elapsed = cap;
          rafRef.current = 0;
          return;
        }
        clock.elapsed = next;
        setElapsed((current) => (Math.abs(current - next) >= 0.05 ? next : current));
      }
      rafRef.current = window.requestAnimationFrame(tick);
    };
    clockRef.current.playing = true;
    clockRef.current.lastStamp = 0;
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [audioReady, commitDuration, fallbackDuration, playing, sealIfEnded]);

  const togglePlay = useCallback(() => {
    if (clockRef.current.playing || playing) {
      applyPauseLock();
      return;
    }
    const cap = clockRef.current.duration > 0 ? clockRef.current.duration : fallbackDuration;
    pauseLockRef.current = false;
    if (elapsed >= cap && cap > 0) {
      clockRef.current.sealed = false;
      falseEndRetryRef.current = false;
      applyElapsed(0);
    }
    clockRef.current.playing = true;
    clockRef.current.playbackStarted = true;
    clockRef.current.lastStamp = 0;
    clockRef.current.stallMs = 0;
    setPlaying(true);
    if (audioReady) {
      void audioRef.current?.play().catch(() => {
        setAudioReady(false);
      });
    }
  }, [applyElapsed, applyPauseLock, audioReady, elapsed, fallbackDuration, playing]);

  togglePlayRef.current = togglePlay;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" && event.key !== " ") {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement) {
        if (target.closest("input, textarea, select, [contenteditable='true']")) {
          return;
        }
        if (target.closest("button, [role='button']")) {
          return;
        }
      }
      event.preventDefault();
      togglePlayRef.current();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  function onSeek(next: number) {
    const wasPlaying = clockRef.current.playing && !pauseLockRef.current;
    clockRef.current.playing = false;
    setPlaying(false);
    applyElapsed(next);
    if (wasPlaying) {
      pauseLockRef.current = false;
      clockRef.current.playing = true;
      clockRef.current.playbackStarted = true;
      clockRef.current.lastStamp = 0;
      setPlaying(true);
      if (audioReady) {
        void audioRef.current?.play().catch(() => undefined);
      }
    }
  }

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;
  const preparing = audioSealed && !audioReady && !audioFailed;
  const quotaWaiting = !audioSealed;
  const audioFailedNotice = audioSealed && audioFailed ? listenCopy.failVoiceBinding : null;

  return (
    <section
      className="academy-dialogue-player academy-player-audio-bar"
      data-academy-dialogue-player=""
      data-academy-audio-ready={audioReady ? "true" : "false"}
      data-academy-audio-preparing={preparing ? "true" : undefined}
      data-academy-audio-pending={quotaWaiting ? "true" : undefined}
      aria-label={lessonTitle}
      aria-busy={preparing}
    >
      {quotaWaiting ? (
        <aside
          className="academy-player-quota-card"
          role="status"
          data-academy-audio-pending-notice=""
          data-academy-quota-waiting=""
        >
          <p className="academy-player-quota-card-title">{listenCopy.quotaWaitingTitle}</p>
          <p className="academy-player-quota-card-body">{listenCopy.quotaWaitingBody}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Bu derste teleprompter ve görsel kod akışı devrededir; adımları yazılı ve etkileşimli olarak takip edebilirsin.
          </p>
        </aside>
      ) : audioFailedNotice ? (
        <p className="academy-player-audio-pending" role="status" data-academy-audio-pending-notice="">
          {audioFailedNotice}
        </p>
      ) : null}
      {audioSrc ? (
      <audio
        key={audioSrc}
        ref={audioRef}
        preload="auto"
        src={audioSrc}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio || pauseLockRef.current) {
            return;
          }
          const resolved = commitDuration(audio.duration);
          if (!(Number.isFinite(audio.currentTime) && audio.currentTime >= 0)) {
            return;
          }
          const cap = resolved > 0 ? resolved : clockRef.current.duration;
          const frozen =
            clockRef.current.playing &&
            clockRef.current.elapsed > audio.currentTime + 0.08 &&
            audio.currentTime + 0.35 < cap &&
            Math.abs(audio.currentTime - clockRef.current.lastAudioTime) < 0.04;
          if (frozen) {
            return;
          }
          clockRef.current.lastAudioTime = audio.currentTime;
          clockRef.current.elapsed = audio.currentTime;
          clockRef.current.stallMs = 0;
          setElapsed(audio.currentTime);
          setAudioReady(true);
          setAudioFailed(false);
        }}
        onDurationChange={() => {
          const audio = audioRef.current;
          if (!audio) {
            return;
          }
          commitDuration(audio.duration);
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setAudioReady(true);
            setAudioFailed(false);
          }
        }}
        onCanPlay={() => {
          const audio = audioRef.current;
          if (!audio) {
            return;
          }
          commitDuration(audio.duration);
          setAudioReady(true);
          setAudioFailed(false);
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (!audio) {
            return;
          }
          commitDuration(audio.duration);
          setAudioReady(true);
          setAudioFailed(false);
        }}
        onError={() => {
          setAudioReady(false);
          setAudioFailed(true);
          clockRef.current.duration = fallbackDuration;
          setDuration(fallbackDuration);
        }}
        onEnded={() => {
          const cap = clockRef.current.duration > 0 ? clockRef.current.duration : fallbackDuration;
          const audio = audioRef.current;
          const reported = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : clockRef.current.elapsed;
          if (
            !falseEndRetryRef.current &&
            cap > 150 &&
            reported > 90 &&
            reported < 125 &&
            reported < cap * 0.85
          ) {
            falseEndRetryRef.current = true;
            pauseLockRef.current = false;
            clockRef.current.playing = true;
            clockRef.current.sealed = false;
            if (audio) {
              audio.currentTime = Math.min(reported + 0.2, cap);
              void audio.play().catch(() => undefined);
            }
            setPlaying(true);
            return;
          }
          clockRef.current.elapsed = cap;
          setElapsed(cap);
          sealIfEnded(cap, cap);
        }}
      >
        <source src={audioSrc} type="audio/wav" />
      </audio>
      ) : null}
      <div className="academy-dialogue-controls academy-player-audio-controls" data-academy-dialogue-controls="">
        <button
          type="button"
          className="academy-cinema-play"
          aria-label={playing ? listenCopy.pause : listenCopy.play}
          onClick={togglePlay}
        >
          {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
        </button>
        <label className="academy-cinema-timeline">
          <span className="sr-only">{copy.audioTimeline}</span>
          <input
            type="range"
            min={0}
            max={Math.max(duration, 0.1)}
            step={0.1}
            value={elapsed}
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={elapsed}
            style={{ ["--cinema-progress" as string]: `${progressPct}%` }}
            onChange={(event) => onSeek(Number(event.target.value))}
          />
        </label>
        <span className="academy-cinema-time tabular-nums">
          {formatAcademyCinemaClock(elapsed)} / {formatAcademyCinemaClock(duration)}
        </span>
        <button
          type="button"
          className="academy-cinema-icon"
          aria-label={muted ? listenCopy.unmute : listenCopy.mute}
          onClick={() => setMuted((current) => !current)}
          disabled={preparing}
        >
          {muted || volume === 0 ? <IconVolumeOff className="h-4 w-4" /> : <IconVolume className="h-4 w-4" />}
        </button>
        <label className="academy-cinema-volume">
          <span className="sr-only">{listenCopy.volume}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            disabled={preparing}
            onChange={(event) => {
              const next = Number(event.target.value);
              setVolume(next);
              setMuted(next === 0);
            }}
          />
        </label>
      </div>
    </section>
  );
}
