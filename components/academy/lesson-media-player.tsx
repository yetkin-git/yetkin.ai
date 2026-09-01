"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconPause, IconPlay, IconVolume, IconVolumeOff } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  activeAcademyDialogueTurnIndex,
  academyDialogueSpokenElapsedSec,
  academyFiveActHeading,
  buildAcademyDialogueTimeline,
} from "@/lib/academy/dialogue-timeline";
import { academyLessonAudioPublicPath, isAcademyLessonAudioSealed } from "@/lib/academy/lesson-audio";
import { formatAcademyCinemaClock } from "@/lib/academy/lesson-cinema";
import { shouldSealProgressAfterDialogueEnded } from "@/lib/academy/lesson-advance";

export function LessonMediaPlayer({
  courseSlug,
  lessonKey,
  lessonTitle,
  body,
  onActiveTurnChange,
  onPlayingChange,
  onEnded,
}: {
  courseSlug: string;
  lessonKey: string;
  lessonTitle: string;
  body: string;
  onActiveTurnChange?: (index: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onEnded?: () => void;
}) {
  const copy = ACADEMY_SEN.player;
  const listenCopy = ACADEMY_SEN.listen;
  const timeline = useMemo(() => buildAcademyDialogueTimeline(body, courseSlug), [body, courseSlug]);
  const audioSealed = isAcademyLessonAudioSealed(courseSlug, lessonKey);
  const audioSrc = useMemo(
    () => (audioSealed ? academyLessonAudioPublicPath(courseSlug, lessonKey) : undefined),
    [audioSealed, courseSlug, lessonKey],
  );
  const spokenDuration = timeline.spokenDuration;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clockRef = useRef({
    playing: false,
    elapsed: 0,
    lastStamp: 0,
    duration: spokenDuration,
    playbackStarted: false,
    sealed: false,
  });
  const pauseLockRef = useRef(false);
  const rafRef = useRef(0);
  const togglePlayRef = useRef<() => void>(() => undefined);
  const onEndedRef = useRef(onEnded);
  const onActiveTurnChangeRef = useRef(onActiveTurnChange);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(spokenDuration);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);

  onEndedRef.current = onEnded;
  onActiveTurnChangeRef.current = onActiveTurnChange;
  onPlayingChangeRef.current = onPlayingChange;

  const spokenElapsed = academyDialogueSpokenElapsedSec({
    currentTime: elapsed,
    audioDuration: audioReady ? duration : 0,
    spokenDuration,
  });
  const activeIndex = activeAcademyDialogueTurnIndex(timeline.turns, spokenElapsed);
  const activeTurn = timeline.turns[activeIndex] ?? null;

  useEffect(() => {
    onActiveTurnChangeRef.current?.(activeIndex);
  }, [activeIndex, lessonKey]);

  useEffect(() => {
    onPlayingChangeRef.current?.(playing);
  }, [playing]);

  useEffect(() => {
    pauseLockRef.current = true;
    clockRef.current = {
      playing: false,
      elapsed: 0,
      lastStamp: 0,
      duration: spokenDuration,
      playbackStarted: false,
      sealed: false,
    };
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setPlaying(false);
    setElapsed(0);
    setDuration(spokenDuration);
    setAudioReady(false);
    setAudioFailed(false);
  }, [audioSrc, lessonKey, spokenDuration]);

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
      const cap = clockRef.current.duration > 0 ? clockRef.current.duration : spokenDuration;
      const clamped = Math.max(0, Math.min(next, cap));
      clockRef.current.elapsed = clamped;
      setElapsed(clamped);
      const audio = audioRef.current;
      if (audioReady && audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime = clamped;
      }
      sealIfEnded(clamped, cap);
    },
    [audioReady, sealIfEnded, spokenDuration],
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
      const audio = audioRef.current;
      if (
        audioReady &&
        audio &&
        !audio.paused &&
        Number.isFinite(audio.currentTime) &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0
      ) {
        clock.duration = audio.duration;
        clock.elapsed = audio.currentTime;
        setDuration(audio.duration);
        setElapsed(audio.currentTime);
        if (sealIfEnded(audio.currentTime, audio.duration)) {
          rafRef.current = 0;
          return;
        }
      } else {
        const cap = clock.duration > 0 ? clock.duration : spokenDuration;
        const next = clock.elapsed + delta;
        if (sealIfEnded(next, cap)) {
          clock.elapsed = cap;
          rafRef.current = 0;
          return;
        }
        clock.elapsed = next;
        setElapsed(next);
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
  }, [audioReady, playing, sealIfEnded, spokenDuration]);

  const togglePlay = useCallback(() => {
    if (clockRef.current.playing || playing) {
      applyPauseLock();
      return;
    }
    const cap = clockRef.current.duration > 0 ? clockRef.current.duration : spokenDuration;
    pauseLockRef.current = false;
    if (elapsed >= cap && cap > 0) {
      clockRef.current.sealed = false;
      applyElapsed(0);
    }
    clockRef.current.playing = true;
    clockRef.current.playbackStarted = true;
    clockRef.current.lastStamp = 0;
    setPlaying(true);
    if (audioReady) {
      void audioRef.current?.play().catch(() => {
        setAudioReady(false);
      });
    }
  }, [applyElapsed, applyPauseLock, audioReady, elapsed, playing, spokenDuration]);

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
  const actHeading = academyFiveActHeading(activeTurn?.act ?? null);
  const preparing = audioSealed && !audioReady && !audioFailed;

  return (
    <section
      className="academy-dialogue-player"
      data-academy-dialogue-player=""
      data-academy-audio-ready={audioReady ? "true" : "false"}
    >
      {audioSrc ? (
      <audio
        ref={audioRef}
        preload="metadata"
        src={audioSrc}
        onCanPlay={() => {
          const audio = audioRef.current;
          if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
            clockRef.current.duration = audio.duration;
            setDuration(audio.duration);
            setAudioReady(true);
            setAudioFailed(false);
          }
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
            clockRef.current.duration = audio.duration;
            setDuration(audio.duration);
            setAudioReady(true);
            setAudioFailed(false);
          }
        }}
        onError={() => {
          setAudioReady(false);
          setAudioFailed(true);
          clockRef.current.duration = spokenDuration;
          setDuration(spokenDuration);
        }}
        onEnded={() => {
          const cap = clockRef.current.duration > 0 ? clockRef.current.duration : spokenDuration;
          clockRef.current.elapsed = cap;
          setElapsed(cap);
          sealIfEnded(cap, cap);
        }}
      />
      ) : null}
      <div className="academy-dialogue-stage">
        <p className="academy-dialogue-kicker">{copy.dialogueEyebrow}</p>
        {preparing ? (
          <div className="academy-dialogue-preparing" data-academy-audio-preparing="">
            <p className="academy-dialogue-preparing-title">{copy.audioPreparing}</p>
            <p className="academy-dialogue-preparing-lead">{copy.audioPreparingLead}</p>
          </div>
        ) : (
          <p className="academy-dialogue-title">{lessonTitle}</p>
        )}
        {activeTurn ? (
          <div
            className="academy-dialogue-current"
            data-academy-dialogue-turn={activeTurn.id}
            data-academy-dialogue-speaker={activeTurn.speaker}
          >
            {actHeading ? <p className="academy-dialogue-act">{actHeading}</p> : null}
            <p className="academy-dialogue-speaker">{activeTurn.displayName}</p>
            <p className="academy-dialogue-text">{activeTurn.text}</p>
          </div>
        ) : (
          <p className="academy-dialogue-text academy-dialogue-text--empty">{lessonTitle}</p>
        )}
      </div>
      <div className="academy-dialogue-controls" data-academy-dialogue-controls="">
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
