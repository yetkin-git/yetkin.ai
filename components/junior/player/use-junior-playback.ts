"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  JUNIOR_STAR_PULSE_MS,
  juniorPlayerBeatIndex,
  juniorPlayerClampMs,
  juniorPlayerCueAt,
  juniorPlayerHasReachedEnd,
  juniorPlayerStepAnchors,
  juniorPlayerTimeline,
  juniorPlayerWindowIndex,
  juniorStarCrossings,
  juniorStarShouldGlow,
  scaleJuniorPlayerTimeline,
  type JuniorPlayerWindow,
} from "@/lib/junior/player-clock";
import { microLessonPlan, type MicroLessonPause } from "@/lib/junior/micro-lesson";
import { resumeCursor, type MicroProgressRecord } from "@/lib/junior/micro-progress";
import { primeJuniorHintAudio } from "@/lib/junior/hint-effect";
import {
  beginJuniorSpeech,
  endJuniorSpeech,
  juniorSpeechSessionCurrent,
  planJuniorSpeech,
  type JuniorSpeechPlayback,
} from "@/lib/junior/speech";
import {
  JUNIOR_BGM_AMBIENT_VOLUME,
  JUNIOR_BGM_SPEECH_VOLUME,
  juniorBgmSrc,
  juniorLessonAudioSrc,
  juniorLessonLocalLockedAudioPath,
} from "@/lib/junior/voice";

/**
 * Oynat, duraklat, baştan dinle ve sürüklenebilir saat.
 * Mühürlü çekirdek ders HTML5 kaset çalar. Kaset yoksa robot sese düşmez.
 * Seçmeli konuda kaset yoksa tarayıcı konuşması yedek kalır.
 * Cassette saati audio.currentTime'dır. Speech yolunda ilk speak tıklamanın içindedir.
 */
export function useJuniorPlayback({
  lessonKey,
  note,
  beatCount,
  stepCaptions = [],
  grantedAudioUrl = null,
  lockPublicMedia = false,
  resumeRecord = null,
  resumeReady = false,
  onHardPause,
  onHardResume,
}: {
  lessonKey: string;
  note: string;
  beatCount: number;
  /** `buildSteps` metinleri. Adım, bu cümlelerin startMs değerine kilitlenir. */
  stepCaptions?: readonly string[];
  /** Sunucunun verdiği adres. Kilitli derste kamu yolunun yerine geçer. */
  grantedAudioUrl?: string | null;
  /** Açıkken kamu ses yolu çağrılmaz. */
  lockPublicMedia?: boolean;
  /** Ertesi gün kalınan mikro-adım. Boş kayıt baştan açılır. */
  resumeRecord?: MicroProgressRecord | null;
  resumeReady?: boolean;
  onHardPause?: (pause: MicroLessonPause) => void;
  onHardResume?: (pause: MicroLessonPause) => void;
}) {
  const speechKey = lessonKey.trim() || "junior-player";
  const cassetteSrc = useMemo(() => {
    if (lockPublicMedia) {
      return grantedAudioUrl;
    }
    return juniorLessonAudioSrc(speechKey) ?? juniorLessonLocalLockedAudioPath(speechKey);
  }, [grantedAudioUrl, lockPublicMedia, speechKey]);
  const baseTimeline = useMemo(() => {
    const plan = planJuniorSpeech(speechKey, note);
    return juniorPlayerTimeline(note, plan.chunks, beatCount);
  }, [speechKey, note, beatCount]);

  const [cassetteDurationMs, setCassetteDurationMs] = useState(0);
  const [cassetteFailed, setCassetteFailed] = useState(false);
  const [voicePreparing, setVoicePreparing] = useState(false);
  const sealedVoice = Boolean(cassetteSrc);
  const useCassette = Boolean(cassetteSrc) && !cassetteFailed;

  const timeline = useMemo(() => {
    if (!useCassette || cassetteDurationMs <= 0) {
      return baseTimeline;
    }
    return scaleJuniorPlayerTimeline(baseTimeline, cassetteDurationMs);
  }, [baseTimeline, useCassette, cassetteDurationMs]);

  const [playing, setPlaying] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const [thinkHold, setThinkHold] = useState(false);
  const [pauseKind, setPauseKind] = useState<MicroLessonPause["kind"] | null>(null);
  const [holdCaption, setHoldCaption] = useState("");
  const [hintSuppressFromMs, setHintSuppressFromMs] = useState(0);
  const [hintSuppressUntilMs, setHintSuppressUntilMs] = useState(0);
  const [starGlowEndMs, setStarGlowEndMs] = useState<number | null>(null);

  const anchors = useMemo(
    () => (stepCaptions.length > 0 ? juniorPlayerStepAnchors(stepCaptions, timeline) : []),
    [stepCaptions, timeline],
  );
  const plan = useMemo(() => microLessonPlan(speechKey, timeline), [speechKey, timeline]);

  const playingRef = useRef(false);
  const scrubbingRef = useRef(false);
  const elapsedRef = useRef(0);
  const durationRef = useRef(timeline.durationMs);
  const windowsRef = useRef<readonly JuniorPlayerWindow[]>(timeline.windows);
  const noteRef = useRef(note);
  const lessonRef = useRef(speechKey);
  const playbackRef = useRef<JuniorSpeechPlayback | null>(null);
  const spokenIndex = useRef(0);
  const tokenRef = useRef(0);
  const frameRef = useRef(0);
  const voicedRef = useRef(false);
  const thinkHoldRef = useRef(false);
  const releasedThroughRef = useRef(-1);
  const starCursorRef = useRef(0);
  const starTimerRef = useRef(0);
  const starTokenRef = useRef(0);
  const pausesRef = useRef<readonly MicroLessonPause[]>(plan.pauses);
  const activePauseRef = useRef<MicroLessonPause | null>(null);
  const resumeAppliedRef = useRef("");
  const onHardPauseRef = useRef(onHardPause);
  const onHardResumeRef = useRef(onHardResume);
  const cassetteModeRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const bgmTokenRef = useRef(0);
  const bgmMutedRef = useRef(false);
  const bgmModeRef = useRef<"speech" | "ambient" | "off">("off");
  const [bgmMuted, setBgmMuted] = useState(false);

  playingRef.current = playing;
  durationRef.current = timeline.durationMs;
  windowsRef.current = timeline.windows;
  noteRef.current = note;
  lessonRef.current = speechKey;
  cassetteModeRef.current = useCassette;
  pausesRef.current = plan.pauses;
  onHardPauseRef.current = onHardPause;
  onHardResumeRef.current = onHardResume;

  useEffect(() => {
    releasedThroughRef.current = -1;
    starCursorRef.current = 0;
    starTokenRef.current += 1;
    window.clearTimeout(starTimerRef.current);
    thinkHoldRef.current = false;
    activePauseRef.current = null;
    resumeAppliedRef.current = "";
    setPauseKind(null);
    setThinkHold(false);
    setHoldCaption("");
    setHintSuppressFromMs(0);
    setHintSuppressUntilMs(0);
    setStarGlowEndMs(null);
  }, [speechKey, note]);

  useEffect(() => {
    setCassetteFailed(false);
    setVoicePreparing(false);
    setCassetteDurationMs(0);
    if (!cassetteSrc) {
      const previous = audioRef.current;
      if (previous) {
        previous.pause();
        previous.removeAttribute("src");
        previous.load();
      }
      audioRef.current = null;
      return;
    }
    const audio = new Audio(cassetteSrc);
    audio.preload = "metadata";
    audio.muted = false;
    audio.volume = 1;
    audioRef.current = audio;
    const onMeta = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setCassetteDurationMs(Math.round(audio.duration * 1000));
      }
    };
    const onError = () => {
      setCassetteFailed(true);
      setVoicePreparing(true);
    };
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("error", onError);
    audio.load();
    return () => {
      audio.pause();
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("error", onError);
      audio.removeAttribute("src");
      audio.load();
      if (audioRef.current === audio) {
        audioRef.current = null;
      }
    };
  }, [cassetteSrc]);

  useEffect(() => {
    const bgm = new Audio(juniorBgmSrc());
    bgm.preload = "auto";
    bgm.loop = true;
    bgm.muted = false;
    bgm.volume = JUNIOR_BGM_AMBIENT_VOLUME;
    bgmRef.current = bgm;
    return () => {
      bgm.pause();
      bgm.removeAttribute("src");
      bgm.load();
      if (bgmRef.current === bgm) {
        bgmRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      tokenRef.current += 1;
      window.cancelAnimationFrame(frameRef.current);
      audioRef.current?.pause();
      bgmRef.current?.pause();
      window.speechSynthesis?.cancel();
      endJuniorSpeech();
    };
  }, []);

  function stopCassette() {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
  }

  function silenceBgm() {
    bgmTokenRef.current += 1;
    const bgm = bgmRef.current;
    if (!bgm) {
      return;
    }
    bgm.pause();
    bgm.muted = true;
  }

  /** Durdur: fon müziği anlatımla birlikte susar. */
  function pauseBgm() {
    bgmModeRef.current = "off";
    silenceBgm();
  }

  useEffect(() => {
    if (!resumeReady || !resumeRecord) {
      return;
    }
    const resumeToken = `${speechKey}:boot`;
    if (resumeAppliedRef.current === resumeToken) {
      return;
    }
    if (useCassette && cassetteDurationMs <= 0 && !cassetteFailed) {
      return;
    }
    const cursor = resumeCursor(resumeRecord, plan.steps.length);
    if (cursor.done || (cursor.stepIndex <= 0 && !cursor.holding)) {
      resumeAppliedRef.current = resumeToken;
      return;
    }
    const step = plan.steps[cursor.stepIndex];
    if (!step) {
      resumeAppliedRef.current = resumeToken;
      return;
    }
    const pause = plan.pauses.find((row) => row.stepIndex === cursor.stepIndex);
    const at = cursor.holding && pause ? pause.endMs : step.startMs;
    resumeAppliedRef.current = resumeToken;
    elapsedRef.current = at;
    setElapsedMs(at);
    starCursorRef.current = at;
    releasedThroughRef.current = cursor.holding && pause && pause.kind !== "turn" ? pause.endMs - 1 : at;
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.currentTime = at / 1000;
      } catch {
        /* metadata henüz gelmemiş olabilir */
      }
    }
    if (cursor.holding && pause && pause.kind !== "turn") {
      thinkHoldRef.current = true;
      activePauseRef.current = pause;
      setPauseKind(pause.kind);
      setHoldCaption(pause.attentionText ?? "");
      setThinkHold(true);
      stopCassette();
      pauseBgm();
    }
  }, [resumeReady, resumeRecord, speechKey, useCassette, cassetteDurationMs, cassetteFailed, plan]);

  /**
   * BGM ikincil kanalı.
   * `speech`: anlatıcı altı duck. `ambient`: karar / anlatış — tam kapanmaz.
   * Kullanıcı müziği kapattıysa kanal suskun kalır.
   */
  function armBgm(mode: "speech" | "ambient") {
    const bgm = bgmRef.current;
    bgmModeRef.current = mode;
    if (!bgm) {
      return;
    }
    if (bgmMutedRef.current) {
      bgm.pause();
      bgm.muted = true;
      return;
    }
    const token = (bgmTokenRef.current += 1);
    bgm.muted = false;
    bgm.volume = mode === "speech" ? JUNIOR_BGM_SPEECH_VOLUME : JUNIOR_BGM_AMBIENT_VOLUME;
    if (bgm.paused) {
      void bgm.play().then(
        () => {
          if (token !== bgmTokenRef.current || bgmMutedRef.current) {
            bgm.pause();
            bgm.muted = true;
          }
        },
        () => undefined,
      );
    }
  }

  function toggleBgm() {
    const next = !bgmMutedRef.current;
    bgmMutedRef.current = next;
    setBgmMuted(next);
    if (next) {
      silenceBgm();
      return;
    }
    const mode = bgmModeRef.current;
    if (mode === "speech" || mode === "ambient") {
      armBgm(mode);
    }
  }

  /**
   * Anlatış / mikrofon öncesi kanal boşaltma.
   * Oynatılıyor veya duraklatılmış olsa da kaset + Web Speech düşer.
   * BGM kapanmaz — ambient hacimde akar (ortam buz gibi sessizleşmez).
   * elapsed korunur → `complete` (karar CTA / tell-guides) kapanmaz.
   */
  function stop() {
    tokenRef.current += 1;
    playingRef.current = false;
    scrubbingRef.current = false;
    window.cancelAnimationFrame(frameRef.current);
    stopCassette();
    armBgm("ambient");
    window.speechSynthesis?.cancel();
    endJuniorSpeech();
    playbackRef.current = null;
    voicedRef.current = false;
    setPlaying(false);
    setScrubbing(false);
    setElapsedMs(elapsedRef.current);
  }

  function finish(token: number) {
    if (token !== tokenRef.current) {
      return;
    }
    tokenRef.current += 1;
    playingRef.current = false;
    scrubbingRef.current = false;
    window.cancelAnimationFrame(frameRef.current);
    stopCassette();
    armBgm("ambient");
    elapsedRef.current = durationRef.current;
    setElapsedMs(durationRef.current);
    setPlaying(false);
    setScrubbing(false);
    window.speechSynthesis?.cancel();
    endJuniorSpeech();
  }

  function upcomingPause(ms: number): MicroLessonPause | null {
    let found: MicroLessonPause | null = null;
    for (const pause of pausesRef.current) {
      if (pause.kind === "turn") {
        continue;
      }
      if (pause.endMs <= releasedThroughRef.current + 30) {
        continue;
      }
      if (pause.endMs >= durationRef.current - 80) {
        continue;
      }
      if (ms + 30 >= pause.endMs && (!found || pause.endMs < found.endMs)) {
        found = pause;
      }
    }
    return found;
  }

  /**
   * Yıldız ikazı kaseti durdurmaz.
   * Geçilen yıldız parıldar; adım izi tamamlanır. Dokunuş soru panelini açar.
   */
  function noticeStar(ms: number) {
    const previous = starCursorRef.current;
    starCursorRef.current = ms;
    if (ms < previous) {
      starTokenRef.current += 1;
      window.clearTimeout(starTimerRef.current);
      setStarGlowEndMs(null);
      return;
    }
    if (thinkHoldRef.current) {
      return;
    }
    const crossed = juniorStarCrossings(pausesRef.current, previous, ms, durationRef.current);
    if (crossed.length === 0) {
      return;
    }
    const latest = crossed[crossed.length - 1];
    if (!latest) {
      return;
    }
    for (const pause of crossed) {
      onHardResumeRef.current?.(pause);
    }
    if (!juniorStarShouldGlow(latest.endMs, ms)) {
      return;
    }
    const token = (starTokenRef.current += 1);
    setStarGlowEndMs(latest.endMs);
    window.clearTimeout(starTimerRef.current);
    starTimerRef.current = window.setTimeout(() => {
      if (starTokenRef.current !== token) {
        return;
      }
      setStarGlowEndMs((current) => (current === latest.endMs ? null : current));
    }, JUNIOR_STAR_PULSE_MS);
  }

  function enterThinkHold(pause: MicroLessonPause) {
    if (thinkHoldRef.current) {
      return;
    }
    const at = pause.endMs;
    thinkHoldRef.current = true;
    activePauseRef.current = pause;
    tokenRef.current += 1;
    playingRef.current = false;
    window.cancelAnimationFrame(frameRef.current);
    stopCassette();
    const audio = audioRef.current;
    if (audio) {
      try {
        audio.currentTime = at / 1000;
      } catch {
        /* metadata henüz gelmemiş olabilir */
      }
    }
    window.speechSynthesis?.cancel();
    endJuniorSpeech();
    playbackRef.current = null;
    voicedRef.current = false;
    /** Hard pause: kaset ve fon müziği tamamen susar. Süre dolunca akış yok. */
    pauseBgm();
    elapsedRef.current = at;
    setElapsedMs(at);
    setPlaying(false);
    setPauseKind(pause.kind);
    setHoldCaption(pause.attentionText ?? "");
    setThinkHold(true);
    onHardPauseRef.current?.(pause);
  }

  function resumeThinkHold() {
    if (!thinkHoldRef.current) {
      return;
    }
    const pause = activePauseRef.current;
    if (pause) {
      releasedThroughRef.current = pause.endMs;
      onHardResumeRef.current?.(pause);
      if (pause.kind === "attention") {
        setHintSuppressFromMs(pause.endMs);
        setHintSuppressUntilMs(pause.attentionUntilMs ?? pause.endMs);
      }
    }
    thinkHoldRef.current = false;
    activePauseRef.current = null;
    setPauseKind(null);
    setHoldCaption("");
    setThinkHold(false);
    playFrom(elapsedRef.current);
  }

  function say(index: number, token: number) {
    const playback = playbackRef.current;
    const piece = windowsRef.current[index]?.text;
    const synth = window.speechSynthesis;
    if (!piece || !playback || !synth) {
      return;
    }
    if (token !== tokenRef.current || !juniorSpeechSessionCurrent(playback.sessionId)) {
      return;
    }
    const windowStart = windowsRef.current[index]?.startMs ?? 0;
    noticeStar(windowStart);
    const holdAt = upcomingPause(windowStart);
    if (holdAt) {
      enterThinkHold(holdAt);
      return;
    }
    spokenIndex.current = index;
    const utterance = new SpeechSynthesisUtterance(piece);
    utterance.lang = playback.lang;
    utterance.rate = playback.rate;
    utterance.onend = () => {
      if (token !== tokenRef.current) {
        return;
      }
      const end = windowsRef.current[index]?.endMs ?? durationRef.current;
      elapsedRef.current = end;
      setElapsedMs(end);
      noticeStar(end);
      const holdBoundary = upcomingPause(end);
      if (holdBoundary) {
        enterThinkHold(holdBoundary);
        return;
      }
      if (index + 1 >= windowsRef.current.length) {
        finish(token);
        return;
      }
      say(index + 1, token);
    };
    utterance.onerror = (event) => {
      if (token !== tokenRef.current) {
        return;
      }
      if (event.error === "interrupted" || event.error === "canceled") {
        return;
      }
      if (event.error === "not-allowed") {
        voicedRef.current = false;
        return;
      }
      const end = windowsRef.current[index]?.endMs ?? durationRef.current;
      elapsedRef.current = end;
      setElapsedMs(end);
      if (index + 1 >= windowsRef.current.length) {
        finish(token);
        return;
      }
      say(index + 1, token);
    };
    synth.speak(utterance);
  }

  function startRaf(token: number) {
    window.cancelAnimationFrame(frameRef.current);
    let last = performance.now();
    const tick = (now: number) => {
      if (token !== tokenRef.current) {
        return;
      }
      const delta = now - last;
      last = now;
      if (!scrubbingRef.current && playingRef.current) {
        if (cassetteModeRef.current) {
          const audio = audioRef.current;
          if (audio && !audio.paused) {
            const next = Math.min(durationRef.current, Math.round(audio.currentTime * 1000));
            noticeStar(next);
            const holdAt = upcomingPause(next);
            if (holdAt && !scrubbingRef.current) {
              enterThinkHold(holdAt);
              return;
            }
            elapsedRef.current = next;
            // Zero-delay: her RAF karesinde boya — 80ms tampon yok; cue + sahne aynı ms.
            setElapsedMs(next);
            // Transport bitişi: native ended veya süre sonu (son saniyeyi kesme).
            // Karar UI'sı ayrı: juniorPlayerHasReachedEnd (duration − 1 sn tolerans).
            if (audio.ended || next >= durationRef.current) {
              finish(token);
              return;
            }
          }
        } else {
          const windows = windowsRef.current;
          const duration = durationRef.current;
          const voiced = voicedRef.current;
          const index = voiced ? spokenIndex.current : juniorPlayerWindowIndex(elapsedRef.current, windows);
          const boundary = windows[index]?.endMs ?? duration;
          const hold =
            voiced && index < windows.length - 1 ? Math.max(windows[index]?.startMs ?? 0, boundary - 1) : boundary;
          const next = Math.min(hold, elapsedRef.current + delta);
          noticeStar(next);
          elapsedRef.current = next;
          setElapsedMs(next);
          if (!voiced && next >= duration) {
            finish(token);
            return;
          }
        }
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
  }

  function playSpeechFrom(ms: number) {
    primeJuniorHintAudio();
    const synth = window.speechSynthesis;
    const busy = Boolean(synth && (synth.speaking || synth.pending));
    const token = (tokenRef.current += 1);
    if (busy) {
      synth?.cancel();
    }
    stopCassette();
    armBgm("speech");
    const playback = beginJuniorSpeech(lessonRef.current, noteRef.current);
    playbackRef.current = playback;
    const windows = windowsRef.current;
    const voiced = Boolean(synth) && windows.length > 0;
    voicedRef.current = voiced;
    const index = juniorPlayerWindowIndex(ms, windows);
    const origin = voiced
      ? (windows[index]?.startMs ?? 0)
      : juniorPlayerClampMs(ms, durationRef.current);
    elapsedRef.current = origin;
    starCursorRef.current = origin;
    spokenIndex.current = index;
    scrubbingRef.current = false;
    playingRef.current = true;
    setScrubbing(false);
    setElapsedMs(origin);
    setPlaying(true);
    startRaf(token);
    if (!voiced) {
      return;
    }
    const launch = () => {
      if (token !== tokenRef.current) {
        return;
      }
      say(index, token);
    };
    if (busy) {
      window.setTimeout(launch, 40);
    } else {
      launch();
    }
  }

  function armCassetteChannel(audio: HTMLAudioElement) {
    audio.muted = false;
    audio.volume = 1;
  }

  function isGesturePlayBlock(error: unknown): boolean {
    if (!(error instanceof DOMException)) {
      return false;
    }
    return error.name === "NotAllowedError" || error.name === "AbortError";
  }

  function holdSealedVoice() {
    window.speechSynthesis?.cancel();
    endJuniorSpeech();
    playbackRef.current = null;
    voicedRef.current = false;
    playingRef.current = false;
    window.cancelAnimationFrame(frameRef.current);
    stopCassette();
    armBgm("ambient");
    setPlaying(false);
    setVoicePreparing(true);
  }

  function cassetteGaveUp(ms: number) {
    setCassetteFailed(true);
    if (sealedVoice) {
      holdSealedVoice();
      return;
    }
    setVoicePreparing(false);
    playSpeechFrom(ms);
  }

  function playCassetteFrom(ms: number) {
    primeJuniorHintAudio();
    const audio = audioRef.current;
    if (!audio || !cassetteModeRef.current) {
      cassetteGaveUp(ms);
      return;
    }
    window.speechSynthesis?.cancel();
    endJuniorSpeech();
    playbackRef.current = null;
    voicedRef.current = false;
    armCassetteChannel(audio);
    armBgm("speech");
    const token = (tokenRef.current += 1);
    const duration = durationRef.current > 0 ? durationRef.current : cassetteDurationMs;
    const origin = juniorPlayerClampMs(ms, duration > 0 ? duration : Number.POSITIVE_INFINITY);
    const seekSec = origin / 1000;
    elapsedRef.current = origin;
    starCursorRef.current = origin;
    spokenIndex.current = 0;
    scrubbingRef.current = false;
    playingRef.current = true;
    setScrubbing(false);
    setElapsedMs(origin);
    setPlaying(true);
    startRaf(token);
    const onEnded = () => {
      audio.removeEventListener("ended", onEnded);
      if (token !== tokenRef.current) {
        return;
      }
      finish(token);
    };
    audio.addEventListener("ended", onEnded);

    let launched = false;
    const launch = () => {
      if (launched || token !== tokenRef.current) {
        return;
      }
      launched = true;
      // play() tıklama yığını içinde kalmalı (Oynat / Baştan Dinle / Atla).
      void audio.play().then(
        () => {
          armCassetteChannel(audio);
          // Öğretmen tanıtımı kesilmesin: başa seek sonrası currentTime sapmasını düzelt.
          if (origin === 0 && audio.currentTime > 0.12) {
            try {
              audio.currentTime = 0;
            } catch {
              /* metadata henüz gelmemiş olabilir */
            }
          }
        },
        (error: unknown) => {
          audio.removeEventListener("ended", onEnded);
          if (token !== tokenRef.current) {
            return;
          }
          // Autoplay kilidi kaseti düşürmez; sonraki kullanıcı jesti MP3'ü yeniden dener.
          if (isGesturePlayBlock(error)) {
            playingRef.current = false;
            window.cancelAnimationFrame(frameRef.current);
            audio.pause();
            armBgm("ambient");
            setElapsedMs(elapsedRef.current);
            setPlaying(false);
            return;
          }
          cassetteGaveUp(ms);
        },
      );
    };

    try {
      if (Math.abs(audio.currentTime - seekSec) > 0.02) {
        const onSeeked = () => {
          audio.removeEventListener("seeked", onSeeked);
          launch();
        };
        audio.addEventListener("seeked", onSeeked);
        audio.currentTime = seekSec;
        // Bazı tarayıcılar seeked üretmez; jest zaman aşımında yine çal.
        window.setTimeout(() => {
          audio.removeEventListener("seeked", onSeeked);
          if (token === tokenRef.current && audio.paused && playingRef.current) {
            launch();
          }
        }, 120);
      } else {
        if (origin === 0) {
          audio.currentTime = 0;
        }
        launch();
      }
    } catch {
      cassetteGaveUp(ms);
    }
  }

  function playFrom(ms: number) {
    if (cassetteModeRef.current) {
      setVoicePreparing(false);
      playCassetteFrom(ms);
      return;
    }
    if (sealedVoice) {
      holdSealedVoice();
      return;
    }
    setVoicePreparing(false);
    playSpeechFrom(ms);
  }

  function toggle() {
    if (thinkHoldRef.current) {
      if (activePauseRef.current?.kind === "attention") {
        return;
      }
      resumeThinkHold();
      return;
    }
    if (playingRef.current) {
      tokenRef.current += 1;
      playingRef.current = false;
      window.cancelAnimationFrame(frameRef.current);
      stopCassette();
      pauseBgm();
      window.speechSynthesis?.cancel();
      setElapsedMs(elapsedRef.current);
      setPlaying(false);
      return;
    }
    const atEnd = elapsedRef.current >= durationRef.current - 40;
    playFrom(atEnd ? 0 : elapsedRef.current);
  }

  function replay() {
    releasedThroughRef.current = -1;
    starCursorRef.current = 0;
    starTokenRef.current += 1;
    window.clearTimeout(starTimerRef.current);
    setStarGlowEndMs(null);
    thinkHoldRef.current = false;
    activePauseRef.current = null;
    setPauseKind(null);
    setHoldCaption("");
    setHintSuppressFromMs(0);
    setHintSuppressUntilMs(0);
    setThinkHold(false);
    playFrom(0);
  }

  function beginScrub() {
    if (scrubbingRef.current) {
      return;
    }
    primeJuniorHintAudio();
    scrubbingRef.current = true;
    tokenRef.current += 1;
    window.cancelAnimationFrame(frameRef.current);
    stopCassette();
    armBgm("ambient");
    window.speechSynthesis?.cancel();
    setScrubbing(true);
  }

  function scrubTo(ms: number) {
    const next = juniorPlayerClampMs(ms, durationRef.current);
    elapsedRef.current = next;
    setElapsedMs(next);
    noticeStar(next);
    releasedThroughRef.current = Math.min(releasedThroughRef.current, next);
    const active = activePauseRef.current;
    if (active && next < active.endMs - 200 && thinkHoldRef.current) {
      thinkHoldRef.current = false;
      activePauseRef.current = null;
      setPauseKind(null);
      setHoldCaption("");
      setThinkHold(false);
    }
    if (next + 40 < hintSuppressFromMs) {
      setHintSuppressFromMs(0);
      setHintSuppressUntilMs(0);
    }
    if (cassetteModeRef.current) {
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = next / 1000;
        } catch {
          /* scrub sırasında metadata henüz gelmemiş olabilir */
        }
      }
    }
  }

  function endScrub() {
    if (!scrubbingRef.current) {
      return;
    }
    scrubbingRef.current = false;
    setScrubbing(false);
    if (playingRef.current) {
      playFrom(elapsedRef.current);
    }
  }

  const steps = Math.max(1, beatCount);
  // Karaoke altyazı + sahne beat + Ders Notu: tek cue kaydı — sıfır gecikme.
  const cue = juniorPlayerCueAt(elapsedMs, timeline);
  const activePiece = cue?.pieceIndex ?? -1;
  const liveCaption = cue?.text ?? "";
  const beat = juniorPlayerBeatIndex(
    elapsedMs,
    timeline.durationMs,
    steps,
    timeline.windows,
    activePiece,
    timeline.pieces.length,
    anchors,
  );
  // Karar butonları: Adım 12/12 değil; kaset %100 (ended | currentTime ≥ duration − 1).
  const audio = audioRef.current;
  const complete = juniorPlayerHasReachedEnd({
    ended: Boolean(audio?.ended),
    currentTimeSec: elapsedMs / 1000,
    durationSec: timeline.durationMs / 1000,
  });

  return {
    playing,
    scrubbing,
    elapsedMs,
    durationMs: timeline.durationMs,
    beat,
    activePiece,
    liveCaption,
    pieces: timeline.pieces,
    cassette: useCassette,
    voicePreparing,
    /** MP3/anlatım bitti — JuniorLessonDecision yalnız buna bağlıdır. */
    complete,
    /** Defter ve dikkat durağında kaset susar. Yıldız durağı bu kilidi açmaz. */
    thinkHold,
    /** Parıldayan yıldız. Yoksa null. Kaset bu değerde durmaz. */
    starGlowEndMs,
    pauseKind,
    /** Dikkat kartının sabit gövdesi. Canlı cümle kısa kalsa da kart bunu tutar. */
    holdCaption,
    /** Anladım'dan sonra aynı kart, özet cümlesine kadar yeniden açılmaz. */
    hintSuppressed: !thinkHold && elapsedMs >= hintSuppressFromMs && elapsedMs < hintSuppressUntilMs,
    microSteps: plan.steps,
    microPauses: plan.pauses,
    /** Mikrofon açılmadan önce kaset/Speech kanalını bırakır. */
    stop,
    toggle,
    bgmMuted,
    toggleBgm,
    replay,
    resumeThinkHold,
    beginScrub,
    scrubTo,
    endScrub,
  };
}
