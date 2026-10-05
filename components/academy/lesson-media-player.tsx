"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { IconPause, IconPlay, IconVolume, IconVolumeOff } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyAudioGrantApiPath } from "@/lib/academy/lesson-audio-grant-path";
import {
  academyLessonAudioPlaybackSrc,
  academyLessonBedIsHardMixed,
  academyLessonBedPlaybackSrc,
  academyPlayerClockDurationSec,
  academySealedAudioDurationSec,
  isAcademyLessonAudioSealed,
  isAcademyLessonBedSealed,
} from "@/lib/academy/lesson-audio";
import {
  academyBedDuckGain,
  academyBedSpeechGainForLesson,
  academyBedOutroTailSec,
  academyBedSpeechEndSec,
  academyOutroBreathFadeGain,
  academyPlayerOutroTailSec,
  ACADEMY_BED_BREATH_DB,
  ACADEMY_BED_INTRO_SEC,
  ACADEMY_BED_OUTRO_HOLD_SEC,
  ACADEMY_BED_SPEECH_DB,
  ACADEMY_OUTRO_BREATH_MS,
} from "@/lib/academy/lesson-bed-duck";
import { loadAcademySealedAudioTimings } from "@/lib/academy/lesson-audio-timings";
import { formatAcademyCinemaClock } from "@/lib/academy/lesson-cinema";
import {
  academyLessonAudioEndedIsComplete,
  academyLessonFalseEndSeekSec,
  academyLessonSealMayNotify,
  academyOutroBreathRemainMs,
  hasAcademyOutroBreathElapsed,
} from "@/lib/academy/lesson-advance";

export function LessonMediaPlayer({
  courseSlug,
  lessonKey,
  lessonTitle,
  autoStart = false,
  onSpokenElapsedChange,
  onPlayingChange,
  onEnded,
  audioSrcOverride,
  bedSrcOverride,
  sealedDurationSecOverride,
  grantedSrc,
  grantedBedSrc,
}: {
  courseSlug: string;
  lessonKey: string;
  lessonTitle: string;
  autoStart?: boolean;
  onSpokenElapsedChange?: (elapsedSec: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onEnded?: (endedLessonKey: string) => void;
  /**
   * Hazırlık şeridi (Ders 0) geçidi — mühür listesine girmeden açık ses adresi.
   * Mühürlü derslerde tanımsız bırakılır; davranış değişmez.
   */
  audioSrcOverride?: string | null;
  bedSrcOverride?: string | null;
  sealedDurationSecOverride?: number | null;
  /** Sayfa imzalı adresi verir. Doluysa oturum grant kapısı çağrılmaz. */
  grantedSrc?: string | null;
  grantedBedSrc?: string | null;
}) {
  const copy = ACADEMY_SEN.player;
  const listenCopy = ACADEMY_SEN.listen;
  const audioSealed = isAcademyLessonAudioSealed(courseSlug, lessonKey);
  const bedHardMixed = academyLessonBedIsHardMixed(lessonKey);
  const bedSealed = isAcademyLessonBedSealed(courseSlug, lessonKey) && !bedHardMixed;
  const playbackCandidate = useMemo(
    () =>
      audioSrcOverride?.trim() ||
      (audioSealed ? academyLessonAudioPlaybackSrc(courseSlug, lessonKey) : undefined),
    [audioSealed, audioSrcOverride, courseSlug, lessonKey],
  );
  const bedCandidate = useMemo(
    () =>
      bedHardMixed
        ? undefined
        : bedSrcOverride?.trim() ||
          (bedSealed ? academyLessonBedPlaybackSrc(courseSlug, lessonKey) : undefined),
    [bedHardMixed, bedSealed, bedSrcOverride, courseSlug, lessonKey],
  );
  const [audioSrc, setAudioSrc] = useState<string | undefined>();
  const [bedSrc, setBedSrc] = useState<string | undefined>();
  const [grantDenied, setGrantDenied] = useState(false);

  useEffect(() => {
    if (grantedSrc) {
      setAudioSrc(grantedSrc);
      setBedSrc(grantedBedSrc?.trim() || undefined);
      setGrantDenied(false);
      return;
    }
    if (!playbackCandidate && !bedCandidate) {
      setAudioSrc(undefined);
      setBedSrc(undefined);
      setGrantDenied(false);
      return;
    }
    const controller = new AbortController();
    setGrantDenied(false);
    void (async () => {
      try {
        const response = await fetch(academyAudioGrantApiPath(courseSlug, lessonKey), {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) {
          setAudioSrc(undefined);
          setBedSrc(undefined);
          setGrantDenied(true);
          return;
        }
        const body = (await response.json()) as {
          data?: { src?: string; bedSrc?: string | null };
        };
        setAudioSrc(body.data?.src);
        setBedSrc(bedHardMixed ? undefined : (body.data?.bedSrc ?? undefined));
        setGrantDenied(!body.data?.src);
      } catch {
        if (!controller.signal.aborted) {
          setAudioSrc(undefined);
          setBedSrc(undefined);
          setGrantDenied(true);
        }
      }
    })();
    return () => controller.abort();
  }, [bedCandidate, bedHardMixed, courseSlug, grantedBedSrc, grantedSrc, lessonKey, playbackCandidate]);
  const bedPieces = useMemo(
    () => loadAcademySealedAudioTimings(lessonKey)?.pieces ?? [],
    [lessonKey],
  );
  const bedSpeechGain = useMemo(() => academyBedSpeechGainForLesson(lessonKey), [lessonKey]);
  const sealedSpeechSec =
    sealedDurationSecOverride != null && sealedDurationSecOverride > 0
      ? sealedDurationSecOverride
      : academySealedAudioDurationSec(courseSlug, lessonKey);
  const sealedDuration = sealedSpeechSec + (bedHardMixed ? ACADEMY_BED_INTRO_SEC : 0);
  const brandedOutroTail = academyBedOutroTailSec(lessonKey);
  const outroTail = academyPlayerOutroTailSec(lessonKey);
  const fallbackDuration = sealedDuration + outroTail;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bedRef = useRef<HTMLAudioElement | null>(null);
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
  const autoStartTriedRef = useRef(false);
  const audioGestureUnlockedRef = useRef(false);
  const outroEndTimerRef = useRef(0);
  const outroBreathFromRef = useRef<number | null>(null);
  const outroBreathFromGainRef = useRef(0);
  const outroBreathStartedAtMsRef = useRef(0);
  const onEndedRef = useRef(onEnded);
  const lessonKeyRef = useRef(lessonKey);
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
        spokenDuration: 0,
        outroTailSec: outroTail,
      }),
    [outroTail, sealedDuration],
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
  lessonKeyRef.current = lessonKey;
  onSpokenElapsedChangeRef.current = onSpokenElapsedChange;
  onPlayingChangeRef.current = onPlayingChange;

  const notifyEnded = useCallback(() => {
    onEndedRef.current?.(lessonKeyRef.current);
  }, []);

  const pushSpokenClock = useCallback((time: number) => {
    if (!Number.isFinite(time) || time < 0) {
      return;
    }
    onSpokenElapsedChangeRef.current?.(time);
  }, []);

  useEffect(() => {
    onSpokenElapsedChangeRef.current?.(elapsed);
  }, [elapsed, lessonKey]);

  useEffect(() => {
    onPlayingChangeRef.current?.(playing);
  }, [playing]);

  useEffect(() => {
    pauseLockRef.current = true;
    falseEndRetryRef.current = false;
    autoStartTriedRef.current = false;
    audioGestureUnlockedRef.current = false;
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
    if (outroEndTimerRef.current) {
      window.clearTimeout(outroEndTimerRef.current);
      outroEndTimerRef.current = 0;
    }
    outroBreathFromRef.current = null;
    outroBreathFromGainRef.current = 0;
    outroBreathStartedAtMsRef.current = 0;
    setPlaying(false);
    setElapsed(0);
    setDuration(fallbackDuration);
    setAudioReady(false);
    setAudioFailed(false);
    const audio = audioRef.current;
    if (audio && audioSrc) {
      audio.load();
    }
    const bed = bedRef.current;
    if (bed && bedSrc) {
      bed.load();
    }
  }, [audioSrc, bedSrc, fallbackDuration, lessonKey]);

  const intoOutroBreathMs = useCallback(() => {
    if (outroBreathStartedAtMsRef.current > 0) {
      return Math.max(0, performance.now() - outroBreathStartedAtMsRef.current);
    }
    const speechEnd = academyBedSpeechEndSec(bedPieces) + (bedHardMixed ? ACADEMY_BED_INTRO_SEC : 0);
    const elapsedSec = clockRef.current.elapsed;
    if (speechEnd > 0 && elapsedSec >= speechEnd) {
      return Math.max(0, (elapsedSec - speechEnd) * 1000);
    }
    return 0;
  }, [bedHardMixed, bedPieces]);

  const markOutroBreath = useCallback(
    (fromElapsed: number) => {
      if (outroBreathStartedAtMsRef.current > 0) {
        return;
      }
      outroBreathStartedAtMsRef.current = performance.now();
      outroBreathFromRef.current = fromElapsed;
      outroBreathFromGainRef.current = academyBedDuckGain(fromElapsed, bedPieces, bedSpeechGain);
    },
    [bedPieces, bedSpeechGain],
  );

  const resolveBedGain = useCallback(
    (elapsedSec: number) => {
      const startedAt = outroBreathFromRef.current;
      if (startedAt != null) {
        return academyOutroBreathFadeGain(intoOutroBreathMs() / 1000, outroBreathFromGainRef.current);
      }
      const speechEnd = academyBedSpeechEndSec(bedPieces) + (bedHardMixed ? ACADEMY_BED_INTRO_SEC : 0);
      if (speechEnd > 0 && elapsedSec >= speechEnd) {
        return academyOutroBreathFadeGain(
          elapsedSec - speechEnd,
          academyBedDuckGain(speechEnd, bedPieces, bedSpeechGain),
        );
      }
      return academyBedDuckGain(elapsedSec, bedPieces, bedSpeechGain);
    },
    [bedHardMixed, bedPieces, bedSpeechGain, intoOutroBreathMs],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const onClock = () => {
      if (pauseLockRef.current) {
        return;
      }
      if (!(Number.isFinite(audio.currentTime) && audio.currentTime >= 0)) {
        return;
      }
      if (audio.ended) {
        return;
      }
      clockRef.current.lastAudioTime = audio.currentTime;
      clockRef.current.elapsed = audio.currentTime;
      clockRef.current.stallMs = 0;
      pushSpokenClock(audio.currentTime);
      setElapsed((current) => (Math.abs(current - audio.currentTime) >= 0.05 ? audio.currentTime : current));
    };
    audio.addEventListener("timeupdate", onClock);
    audio.addEventListener("seeked", onClock);
    audio.addEventListener("playing", onClock);
    return () => {
      audio.removeEventListener("timeupdate", onClock);
      audio.removeEventListener("seeked", onClock);
      audio.removeEventListener("playing", onClock);
    };
  }, [audioSrc, fallbackDuration, markOutroBreath, pushSpokenClock]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.volume = muted ? 0 : volume;
    audio.muted = muted || volume === 0;
    const bed = bedRef.current;
    if (bed) {
      const duck = resolveBedGain(clockRef.current.elapsed);
      bed.volume = muted ? 0 : volume * duck;
      bed.muted = muted || volume === 0;
    }
  }, [muted, resolveBedGain, volume]);

  const applyBedDuck = useCallback(
    (elapsedSec: number, shouldPlay: boolean) => {
      const bed = bedRef.current;
      if (!bed || !bedSrc) {
        return;
      }
      const duck = resolveBedGain(elapsedSec);
      bed.volume = muted ? 0 : volume * duck;
      bed.muted = muted || volume === 0;
      if (shouldPlay && !pauseLockRef.current) {
        if (bed.paused) {
          void bed.play().catch(() => undefined);
        }
        return;
      }
      if (!bed.paused) {
        bed.pause();
      }
    },
    [bedSrc, muted, resolveBedGain, volume],
  );

  const sealIfEnded = useCallback((nextElapsed: number, cap: number, forceBreath = false) => {
    const clock = clockRef.current;
    const audio = audioRef.current;
    const waitMs = Math.max(ACADEMY_OUTRO_BREATH_MS, Math.round(outroTail * 1000));
    const reportedTime = audio && Number.isFinite(audio.currentTime) ? audio.currentTime : nextElapsed;
    const mayNotify = academyLessonSealMayNotify({
      audioEnded: audio?.ended === true,
      currentTime: reportedTime,
      sealedDurationSec: sealedDuration,
      forceBreath,
      clockElapsedSec: nextElapsed,
      clockDurationSec: cap,
      playbackStarted: clock.playbackStarted,
    });
    if (!mayNotify || (!forceBreath && !hasAcademyOutroBreathElapsed(intoOutroBreathMs(), waitMs))) {
      return false;
    }
    if (clock.sealed) {
      return true;
    }
    clock.sealed = true;
    clock.playing = false;
    pauseLockRef.current = true;
    if (outroEndTimerRef.current) {
      window.clearTimeout(outroEndTimerRef.current);
      outroEndTimerRef.current = 0;
    }
    setPlaying(false);
    setElapsed(cap);
    audioRef.current?.pause();
    applyBedDuck(cap, false);
    notifyEnded();
    return true;
  }, [applyBedDuck, intoOutroBreathMs, notifyEnded, outroTail, sealedDuration]);

  const armOutroEndTimeout = useCallback(
    (fromElapsed: number, cap: number) => {
      markOutroBreath(fromElapsed);
      if (outroEndTimerRef.current) {
        window.clearTimeout(outroEndTimerRef.current);
      }
      const remainMs = academyOutroBreathRemainMs({
        elapsedSec: fromElapsed,
        durationSec: cap,
        intoBreathMs: intoOutroBreathMs(),
        breathMs: Math.max(ACADEMY_OUTRO_BREATH_MS, Math.round(outroTail * 1000)),
      });
      outroEndTimerRef.current = window.setTimeout(() => {
        outroEndTimerRef.current = 0;
        const nextCap = clockRef.current.duration > 0 ? clockRef.current.duration : cap;
        clockRef.current.elapsed = nextCap;
        setElapsed(nextCap);
        pushSpokenClock(nextCap);
        applyBedDuck(nextCap, false);
        sealIfEnded(nextCap, nextCap, true);
      }, remainMs);
    },
    [applyBedDuck, intoOutroBreathMs, markOutroBreath, outroTail, pushSpokenClock, sealIfEnded],
  );

  const applyElapsed = useCallback(
    (next: number) => {
      const cap = clockRef.current.duration > 0 ? clockRef.current.duration : fallbackDuration;
      const clamped = Math.max(0, Math.min(next, cap));
      const speechEnd = academyBedSpeechEndSec(bedPieces) + (bedHardMixed ? ACADEMY_BED_INTRO_SEC : 0);
      if (clamped + 0.05 < (speechEnd > 0 ? speechEnd : cap)) {
        outroBreathFromRef.current = null;
        outroBreathFromGainRef.current = 0;
        outroBreathStartedAtMsRef.current = 0;
        if (outroEndTimerRef.current) {
          window.clearTimeout(outroEndTimerRef.current);
          outroEndTimerRef.current = 0;
        }
      }
      clockRef.current.elapsed = clamped;
      clockRef.current.lastAudioTime = clamped;
      clockRef.current.stallMs = 0;
      setElapsed(clamped);
      pushSpokenClock(clamped);
      applyBedDuck(clamped, clockRef.current.playing && !pauseLockRef.current);
      const audio = audioRef.current;
      if (audioReady && audio) {
        const audioCap = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : clamped;
        audio.currentTime = Math.min(clamped, audioCap);
      }
      const audioEnded = audio?.ended === true;
      if (audioEnded && !sealIfEnded(clamped, cap) && clamped >= cap && cap > 0) {
        armOutroEndTimeout(clamped, cap);
      }
    },
    [applyBedDuck, armOutroEndTimeout, audioReady, bedHardMixed, bedPieces, fallbackDuration, pushSpokenClock, sealIfEnded],
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
    applyBedDuck(clockRef.current.elapsed, false);
  }, [applyBedDuck]);

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
      if (audioReady && audio && audio.ended) {
        markOutroBreath(clock.elapsed);
        const next = Math.min(clock.elapsed + delta, cap);
        clock.elapsed = next;
        setElapsed((current) => (Math.abs(current - next) >= 0.05 ? next : current));
        pushSpokenClock(next);
        applyBedDuck(next, true);
        if (sealIfEnded(next, cap)) {
          rafRef.current = 0;
          return;
        }
        if (outroEndTimerRef.current === 0) {
          armOutroEndTimeout(next, cap);
        }
        rafRef.current = window.requestAnimationFrame(tick);
        return;
      }
      if (audioReady && audio && Number.isFinite(audio.currentTime)) {
        commitDuration(audio.duration);
        const reported = audio.currentTime;
        clock.stallMs = 0;
        clock.lastAudioTime = reported;
        clock.elapsed = reported;
        setElapsed((current) => (Math.abs(current - reported) >= 0.05 ? reported : current));
      }
      pushSpokenClock(clock.elapsed);
      applyBedDuck(clock.elapsed, true);
      rafRef.current = window.requestAnimationFrame(tick);
    };
    clockRef.current.playing = true;
    clockRef.current.lastStamp = 0;
    applyBedDuck(clockRef.current.elapsed, true);
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    };
  }, [applyBedDuck, armOutroEndTimeout, audioReady, commitDuration, fallbackDuration, markOutroBreath, playing, pushSpokenClock, sealIfEnded]);

  useEffect(() => {
    return () => {
      if (outroEndTimerRef.current) {
        window.clearTimeout(outroEndTimerRef.current);
        outroEndTimerRef.current = 0;
      }
    };
  }, [lessonKey]);

  const playSealedAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) {
      return;
    }
    void audio.play().then(() => {
      setAudioReady(true);
      setAudioFailed(false);
    }).catch(() => undefined);
  }, [audioSrc]);

  const togglePlay = useCallback(() => {
    if (clockRef.current.playing || playing) {
      applyPauseLock();
      return;
    }
    const cap = clockRef.current.duration > 0 ? clockRef.current.duration : fallbackDuration;
    pauseLockRef.current = false;
    audioGestureUnlockedRef.current = true;
    if (elapsed >= cap && cap > 0) {
      clockRef.current.sealed = false;
      falseEndRetryRef.current = false;
      outroBreathFromRef.current = null;
      outroBreathFromGainRef.current = 0;
      outroBreathStartedAtMsRef.current = 0;
      if (outroEndTimerRef.current) {
        window.clearTimeout(outroEndTimerRef.current);
        outroEndTimerRef.current = 0;
      }
      applyElapsed(0);
    }
    clockRef.current.playing = true;
    clockRef.current.playbackStarted = true;
    clockRef.current.lastStamp = 0;
    clockRef.current.stallMs = 0;
    setPlaying(true);
    applyBedDuck(clockRef.current.elapsed, true);
    playSealedAudio();
  }, [applyBedDuck, applyElapsed, applyPauseLock, elapsed, fallbackDuration, playSealedAudio, playing]);

  togglePlayRef.current = togglePlay;

  useEffect(() => {
    function unlockFromGesture() {
      if (audioGestureUnlockedRef.current) {
        return;
      }
      const audio = audioRef.current;
      if (!audio || !audioSrc) {
        return;
      }
      audioGestureUnlockedRef.current = true;
      if (clockRef.current.playing && !pauseLockRef.current) {
        playSealedAudio();
        return;
      }
      const stamp = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const wasMuted = audio.muted;
      audio.muted = true;
      void audio.play().then(() => {
        if (clockRef.current.playing && !pauseLockRef.current) {
          audio.muted = wasMuted;
          return;
        }
        audio.pause();
        audio.muted = wasMuted;
        if (Number.isFinite(stamp)) {
          audio.currentTime = stamp;
        }
      }).catch(() => {
        audio.muted = wasMuted;
      });
    }
    window.addEventListener("pointerdown", unlockFromGesture);
    window.addEventListener("keydown", unlockFromGesture);
    return () => {
      window.removeEventListener("pointerdown", unlockFromGesture);
      window.removeEventListener("keydown", unlockFromGesture);
    };
  }, [audioSrc, playSealedAudio]);

  useEffect(() => {
    if (!autoStart || autoStartTriedRef.current) {
      return;
    }
    if (!audioReady && !audioFailed) {
      return;
    }
    autoStartTriedRef.current = true;
    if (audioFailed || clockRef.current.playing) {
      return;
    }
    togglePlayRef.current();
  }, [audioFailed, audioReady, autoStart, lessonKey]);

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
      playSealedAudio();
    }
  }

  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;
  const hasAudioSrc = audioSrc != null && audioSrc.length > 0;
  const preparing = hasAudioSrc && !audioReady && !audioFailed;
  const audioFailedNotice = grantDenied
    ? listenCopy.failTextMode
    : hasAudioSrc && audioFailed
      ? listenCopy.failVoiceBinding
      : null;
  const speechEndSec = (bedPieces.at(-1)?.end ?? 0) + (bedHardMixed ? ACADEMY_BED_INTRO_SEC : 0);
  const intoOutro = elapsed - speechEndSec;
  const bedOutro =
    bedSrc &&
    ((outroBreathFromRef.current != null && intoOutroBreathMs() < Math.max(ACADEMY_OUTRO_BREATH_MS, outroTail * 1000)) ||
      (speechEndSec > 0 && elapsed >= speechEndSec && intoOutro < outroTail))
      ? brandedOutroTail > 0 && intoOutro < ACADEMY_BED_OUTRO_HOLD_SEC && intoOutroBreathMs() < ACADEMY_OUTRO_BREATH_MS
        ? "peak"
        : "fade"
      : undefined;

  return (
    <section
      className="academy-dialogue-player academy-player-audio-bar"
      data-academy-dialogue-player=""
      data-academy-audio-ready={audioReady ? "true" : "false"}
      data-academy-audio-preparing={preparing ? "true" : undefined}
      data-academy-clock="currentTime"
      data-academy-bed={bedSrc ? "lyria" : undefined}
      data-academy-bed-outro={bedOutro}
      aria-label={lessonTitle}
      aria-busy={preparing}
    >
      {audioFailedNotice ? (
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
        data-academy-audio-src={audioSrc}
        onTimeUpdate={() => {
          const audio = audioRef.current;
          if (!audio || pauseLockRef.current) {
            return;
          }
          commitDuration(audio.duration);
          if (!(Number.isFinite(audio.currentTime) && audio.currentTime >= 0)) {
            return;
          }
          if (audio.ended) {
            return;
          }
          clockRef.current.lastAudioTime = audio.currentTime;
          clockRef.current.elapsed = audio.currentTime;
          clockRef.current.stallMs = 0;
          setElapsed(audio.currentTime);
          pushSpokenClock(audio.currentTime);
          applyBedDuck(audio.currentTime, clockRef.current.playing && !pauseLockRef.current);
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
          if (clockRef.current.playing && !pauseLockRef.current && audio.paused) {
            playSealedAudio();
          }
        }}
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (!audio) {
            return;
          }
          commitDuration(audio.duration);
          setAudioReady(true);
          setAudioFailed(false);
          if (clockRef.current.playing && !pauseLockRef.current && audio.paused) {
            playSealedAudio();
          }
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
          const complete = academyLessonAudioEndedIsComplete({
            ended: true,
            currentTime: reported,
            sealedDurationSec: sealedDuration,
          });
          if (!complete) {
            const fileDuration = audio && Number.isFinite(audio.duration) ? audio.duration : 0;
            const seekSec = academyLessonFalseEndSeekSec({
              reportedSec: reported,
              fileDurationSec: fileDuration,
              alreadyRetried: falseEndRetryRef.current,
            });
            if (seekSec != null && audio) {
              falseEndRetryRef.current = true;
              pauseLockRef.current = false;
              clockRef.current.playing = true;
              clockRef.current.sealed = false;
              audio.currentTime = seekSec;
              void audio.play().catch(() => undefined);
              setPlaying(true);
              return;
            }
          }
          clockRef.current.elapsed = Math.max(clockRef.current.elapsed, reported);
          applyBedDuck(clockRef.current.elapsed, true);
          armOutroEndTimeout(clockRef.current.elapsed, cap);
        }}
      >
        <source src={audioSrc} type="audio/mpeg" />
      </audio>
      ) : null}
      {bedSrc && !bedHardMixed ? (
        <audio
          key={bedSrc}
          ref={bedRef}
          preload="auto"
          src={bedSrc}
          loop
          aria-hidden
          data-academy-bed-audio="lyria"
          data-academy-bed-speech-db={ACADEMY_BED_SPEECH_DB}
          data-academy-bed-breath-db={ACADEMY_BED_BREATH_DB}
        >
          <source src={bedSrc} type="audio/mpeg" />
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
