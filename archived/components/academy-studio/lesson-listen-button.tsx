"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPause, IconPlay } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import {
  ACADEMY_LESSON_LISTEN_ENABLED,
  ACADEMY_LESSON_LISTEN_PLAYBACK_RATE,
  ACADEMY_LESSON_LISTEN_PREPARING_TIMEOUT_MS,
  ACADEMY_LISTEN_AUDIO_URL_HEADER,
  ACADEMY_LISTEN_CACHE_HEADER,
  ACADEMY_LISTEN_FALLBACK_HEADER,
  ACADEMY_LISTEN_FRAMING_HEADER,
  ACADEMY_LISTEN_FRAMING_WAV_U32BE,
  ACADEMY_LISTEN_SPEAKERS_HEADER,
  ACADEMY_LISTEN_TEXT_DURATION_HEADER,
  academyLessonListenPath,
  academyListenPlaybackRateForSpeaker,
  academyListenReadingDurationSec,
  concatPcmWavBytes,
  getAcademyListenClientCachedAudio,
  isAcademyListenAbortError,
  isAcademyListenFallbackFullAudio,
  isAcademyListenFallbackHeader,
  iterateAcademyListenWavFrames,
  parseAcademyListenSpeakersHeader,
  parseAcademyListenTextDurationHeader,
  setAcademyListenClientCachedAudio,
  type AcademyStudioSpeechSpeaker,
} from "@/archived/lib/academy-studio/lesson-listen";
import {
  academyListenWebSpeechScript,
  academyWebSpeechSliceFromOffset,
  canUseAcademyWebSpeech,
  pickAcademyWebSpeechVoice,
  splitAcademyWebSpeechChunks,
} from "@/archived/lib/academy-studio/lesson-listen-web-speech";
import type { AcademyInstructor } from "@/lib/academy/instructors";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { isAcademyModeratorPolicyReject } from "@/archived/lib/academy-studio/moderation";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";

export type ListenPhase = "idle" | "preparing" | "playing" | "paused" | "ended";

export type LessonListenSource = "lesson" | "studio";

export type LessonListenPlayback = {
  phase: ListenPhase;
  currentTime: number;
  duration: number;
  generation: number;
  source: LessonListenSource;
  fallback: boolean;
  /** Gerçek WAV/URL bağlı veya istemci önbelleğinde hazır. Metin saati sahte medya değildir. */
  hasAudio: boolean;
  seekGeneration: number;
  cardIndex: number;
  cardCount: number;
};

export type LessonListenStudioRequest = {
  id: number;
  beat: "repeat" | "live-ask" | "live-exhausted";
  sectionKey: "giris" | "syntax" | "mantik" | "uygulama";
  question?: string;
};

export type LessonListenCinemaCommand = {
  generation: number;
  action: "play" | "pause" | "resume" | "replay" | "seek";
  seekTo?: number;
};

function audioDuration(audio: HTMLAudioElement | null): number {
  if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return 0;
  }
  return audio.duration;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer as ArrayBuffer;
}

function clientCacheHasRealAudio(
  cached: ReturnType<typeof getAcademyListenClientCachedAudio>,
): boolean {
  if (!cached || cached.fallback) {
    return false;
  }
  return Boolean(cached.audioUrl) || cached.wav.byteLength > 0;
}

/**
 * "Dersi Dinle" — Gemini TTS / Supabase mühürlü stüdyo sesi.
 * Inline ders belgesi: gerçek WAV/URL yoksa oynatıcı çubuğu basılmaz.
 * Kota / 400 / 503 / AbortError düşüşünde stüdyo WAV yoksa Web Speech hoparlörü basılır.
 * Metin modu uyarısı ActionBridge'e basılmaz — tek yutak anne dock'tur.
 */
export function LessonListenButton({
  courseId,
  lessonKey,
  instructorName,
  instructor = null,
  lessonTitle = "",
  lessonBody = "",
  courseSlug = "",
  onPlaybackChange,
  autoStart = false,
  replayRequestId = 0,
  startRequestId = 0,
  studioRequest = null,
  onStudioFail,
  variant = "default",
  cinemaControl = null,
  cinemaVolume,
  cinemaMuted,
  storyboardCardIndex = 0,
  storyboardCardCount = 0,
  storyboardSpokenText = "",
  storyboardHoldQueue = false,
  playSpokenPartIndex = null,
  onStoryboardCardEnded,
}: {
  courseId: string;
  lessonKey: string;
  instructorName: string;
  instructor?: AcademyInstructor | null;
  lessonTitle?: string;
  lessonBody?: string;
  courseSlug?: string;
  onPlaybackChange?: (playback: LessonListenPlayback) => void;
  /** Ders değişince (otomatik/manuel sıradaki) sesi başlat. */
  autoStart?: boolean;
  /** Ebeveyn "Tekrar Dinle" — ended sonrası aynı gövdeyi başa sarar. */
  replayRequestId?: number;
  /** Üst "Derse başla" — idle/paused yayını açar. */
  startRequestId?: number;
  /** Bölüm bazlı Tekrar Et / canlı soru overlay. Ders önbelleğini ezmez. */
  studioRequest?: LessonListenStudioRequest | null;
  /** Canlı soru gümrüğü 400 — ebeveyn hakkı iade eder. */
  onStudioFail?: (error: string, request: LessonListenStudioRequest) => void;
  /** Sahne alt kenarı — tek satır transport, kart yok. inline = başlık Play. cinema = gizli ses motoru. */
  variant?: "default" | "overlay" | "inline" | "cinema";
  /** Sinema kontrol barı — play/pause/seek ses motoruna bağlanır. */
  cinemaControl?: LessonListenCinemaCommand | null;
  cinemaVolume?: number;
  cinemaMuted?: boolean;
  /** Storyboard — mevcut kart (0 tabanlı). */
  storyboardCardIndex?: number;
  storyboardCardCount?: number;
  /** Aktif kartın konuşma metni — okuma modu kart süresidir, kaset değil. */
  storyboardSpokenText?: string;
  /** true: parça bitince kuyruk otomatik ilerlemez; ebeveyn kart olayını bekler. */
  storyboardHoldQueue?: boolean;
  /** Ebeveynin istediği TTS parça indeksi. null = görsel kart, ses yok. */
  playSpokenPartIndex?: number | null;
  onStoryboardCardEnded?: () => void;
}) {
  void instructor;
  const copy = ACADEMY_SEN.listen;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const phaseRef = useRef<ListenPhase>("idle");
  const lastTimeEmitRef = useRef(0);
  const endedArmedRef = useRef(false);
  const partQueueRef = useRef<Uint8Array[]>([]);
  const partIndexRef = useRef(0);
  const partDurationsRef = useRef<number[]>([]);
  const partSpeakersRef = useRef<AcademyStudioSpeechSpeaker[]>([]);
  const streamPendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const textDurationRef = useRef(0);
  const fallbackRef = useRef(false);
  const textClockRef = useRef<number | null>(null);
  const textElapsedRef = useRef(0);
  const textClockStartedAtRef = useRef(0);
  const seekGenerationRef = useRef(0);
  const lessonKeyRef = useRef(lessonKey);
  const prevStartRequestId = useRef(startRequestId);
  const prevReplayRequestId = useRef(replayRequestId);
  const onPlaybackChangeRef = useRef(onPlaybackChange);
  const onStudioFailRef = useRef(onStudioFail);
  const onStoryboardCardEndedRef = useRef(onStoryboardCardEnded);
  const storyboardHoldQueueRef = useRef(storyboardHoldQueue);
  const playSpokenPartIndexRef = useRef(playSpokenPartIndex);
  const storyboardCardIndexRef = useRef(storyboardCardIndex);
  const storyboardCardCountRef = useRef(storyboardCardCount);
  const startListenRef = useRef<() => Promise<void>>(async () => undefined);
  const playQueuedPartRef = useRef<(index: number) => Promise<void>>(async () => undefined);
  const onReplayRef = useRef<() => Promise<void>>(async () => undefined);
  const onStopRef = useRef<() => void>(() => undefined);
  const onResumeRef = useRef<() => Promise<void>>(async () => undefined);
  const prevCinemaGen = useRef(0);
  const startStudioRef = useRef<(request: LessonListenStudioRequest) => Promise<void>>(
    async () => undefined,
  );
  onPlaybackChangeRef.current = onPlaybackChange;
  onStudioFailRef.current = onStudioFail;
  onStoryboardCardEndedRef.current = onStoryboardCardEnded;
  storyboardHoldQueueRef.current = storyboardHoldQueue;
  playSpokenPartIndexRef.current = playSpokenPartIndex;
  storyboardCardIndexRef.current = storyboardCardIndex;
  storyboardCardCountRef.current = storyboardCardCount;
  lessonKeyRef.current = lessonKey;
  const [phase, setPhase] = useState<ListenPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [hasReadyAudio, setHasReadyAudio] = useState(false);
  const hasReadyAudioRef = useRef(false);
  const [textUiElapsed, setTextUiElapsed] = useState(0);
  const [source, setSource] = useState<LessonListenSource>("lesson");
  const [, setTransportClock] = useState({ currentTime: 0, duration: 0 });
  const sourceRef = useRef<LessonListenSource>("lesson");
  const volumeRef = useRef(1);
  const mutedRef = useRef(false);
  const seekToRef = useRef<(seconds: number) => void>(() => undefined);
  const webSpeechActiveRef = useRef(false);
  const webSpeechGenRef = useRef(0);
  const pauseLockRef = useRef(false);
  const mediaSwapRef = useRef(false);
  const [webSpeechActive, setWebSpeechActive] = useState(false);
  if (!pauseLockRef.current) {
    phaseRef.current = phase;
  }
  sourceRef.current = source;

  function applyVolumeTo(audio: HTMLAudioElement | null) {
    if (!audio) {
      return;
    }
    audio.muted = mutedRef.current;
    audio.volume = mutedRef.current ? 0 : volumeRef.current;
  }

  function applyListenMeta(headers: Headers) {
    const textDuration = parseAcademyListenTextDurationHeader(
      headers.get(ACADEMY_LISTEN_TEXT_DURATION_HEADER),
    );
    if (textDuration > 0) {
      textDurationRef.current = textDuration;
    }
  }

  function readingDurationSec(): number {
    if (storyboardSpokenText.trim()) {
      const cardDuration = academyListenReadingDurationSec(storyboardSpokenText);
      return cardDuration > 0 ? cardDuration : 1;
    }
    if (textDurationRef.current > 0) {
      return textDurationRef.current;
    }
    const fromBody = academyListenReadingDurationSec(lessonBody);
    return fromBody > 0 ? fromBody : 1;
  }

  function clearTextClock() {
    if (textClockRef.current != null) {
      window.clearInterval(textClockRef.current);
      textClockRef.current = null;
    }
  }

  function snapshotTextElapsed(seconds: number) {
    const duration = readingDurationSec();
    const clamped = Math.max(0, Math.min(seconds, duration > 0 ? duration : seconds));
    textElapsedRef.current = clamped;
    setTextUiElapsed(clamped);
    return clamped;
  }

  function startTextClock(fromSec = 0) {
    if (pauseLockRef.current) {
      return;
    }
    clearTextClock();
    fallbackRef.current = true;
    const duration = readingDurationSec();
    textDurationRef.current = duration;
    const start = snapshotTextElapsed(fromSec);
    textClockStartedAtRef.current = performance.now() - start * 1000;
    textClockRef.current = window.setInterval(() => {
      if (pauseLockRef.current || phaseRef.current !== "playing") {
        clearTextClock();
        return;
      }
      const elapsed = snapshotTextElapsed((performance.now() - textClockStartedAtRef.current) / 1000);
      emitPlayback("playing");
      if (elapsed >= duration) {
        clearTextClock();
        endedArmedRef.current = false;
        if (storyboardHoldQueueRef.current && sourceRef.current === "lesson") {
          finishHeldStoryboardCard();
          return;
        }
        setPhase("ended");
        phaseRef.current = "ended";
        emitPlayback("ended");
      }
    }, 200);
  }

  function cancelWebSpeechQueue() {
    if (typeof window === "undefined") {
      return;
    }
    const synth = window.speechSynthesis;
    if (!synth) {
      return;
    }
    try {
      synth.pause();
    } catch {
      /* Absolute Pause Lock: Chrome pause() sessizce düşebilir */
    }
    try {
      synth.cancel();
    } catch {
      /* cancel kuyruğu boşsa throw etmez; yine de kilitle */
    }
  }

  function freezeWebSpeech() {
    webSpeechGenRef.current += 1;
    cancelWebSpeechQueue();
  }

  function disarmWebSpeech() {
    webSpeechGenRef.current += 1;
    webSpeechActiveRef.current = false;
    setWebSpeechActive(false);
    cancelWebSpeechQueue();
  }

  function startWebSpeechClock(fromSec = 0) {
    if (pauseLockRef.current) {
      return;
    }
    clearTextClock();
    fallbackRef.current = false;
    const duration = readingDurationSec();
    textDurationRef.current = duration;
    const start = snapshotTextElapsed(fromSec);
    textClockStartedAtRef.current = performance.now() - start * 1000;
    textClockRef.current = window.setInterval(() => {
      if (pauseLockRef.current || phaseRef.current !== "playing") {
        clearTextClock();
        return;
      }
      const elapsed = snapshotTextElapsed((performance.now() - textClockStartedAtRef.current) / 1000);
      emitPlayback("playing");
      if (elapsed >= duration) {
        clearTextClock();
        endedArmedRef.current = false;
        disarmWebSpeech();
        if (storyboardHoldQueueRef.current && sourceRef.current === "lesson") {
          finishHeldStoryboardCard();
          return;
        }
        setPhase("ended");
        phaseRef.current = "ended";
        emitPlayback("ended");
      }
    }, 200);
  }

  function startWebSpeechPlayback(fromSec = 0): boolean {
    if (pauseLockRef.current || !canUseAcademyWebSpeech()) {
      return false;
    }
    const script = academyListenWebSpeechScript(lessonTitle, lessonBody, courseSlug);
    const remaining = academyWebSpeechSliceFromOffset(script, fromSec, readingDurationSec());
    const chunks = splitAcademyWebSpeechChunks(remaining);
    if (chunks.length === 0) {
      return false;
    }
    cancelWebSpeechQueue();
    const generation = webSpeechGenRef.current + 1;
    webSpeechGenRef.current = generation;
    webSpeechActiveRef.current = true;
    setWebSpeechActive(true);
    fallbackRef.current = false;
    markReadyAudio(true);
    setTextMode(false);
    setError(null);
    startWebSpeechClock(fromSec);
    const synth = window.speechSynthesis;
    const voice = pickAcademyWebSpeechVoice(synth.getVoices());
    const volume = mutedRef.current ? 0 : volumeRef.current;
    let index = 0;
    const speakNext = () => {
      if (
        pauseLockRef.current ||
        webSpeechGenRef.current !== generation ||
        !webSpeechActiveRef.current ||
        phaseRef.current !== "playing"
      ) {
        return;
      }
      const chunk = chunks[index];
      if (!chunk) {
        return;
      }
      index += 1;
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = "tr-TR";
      utterance.rate = ACADEMY_LESSON_LISTEN_PLAYBACK_RATE;
      utterance.volume = volume;
      if (voice && "voiceURI" in voice) {
        utterance.voice = voice as SpeechSynthesisVoice;
      }
      utterance.onend = () => {
        if (pauseLockRef.current || webSpeechGenRef.current !== generation) {
          return;
        }
        speakNext();
      };
      utterance.onerror = () => {
        if (pauseLockRef.current || webSpeechGenRef.current !== generation) {
          return;
        }
        speakNext();
      };
      synth.speak(utterance);
    };
    speakNext();
    if (pauseLockRef.current) {
      freezeWebSpeech();
      return true;
    }
    phaseRef.current = "playing";
    setPhase("playing");
    emitPlayback("playing");
    return true;
  }

  function storeClientCache(wav: Uint8Array) {
    setAcademyListenClientCachedAudio(courseId, lessonKey, wav, {
      textDurationSec: textDurationRef.current,
      fallback: fallbackRef.current,
    });
  }

  function cumulativeElapsed(): number {
    if (fallbackRef.current || webSpeechActiveRef.current) {
      return textElapsedRef.current;
    }
    const previous = partDurationsRef.current
      .slice(0, partIndexRef.current)
      .reduce((sum, value) => sum + value, 0);
    return previous + (audioRef.current?.currentTime ?? 0);
  }

  function cumulativeDuration(): number {
    if (fallbackRef.current || webSpeechActiveRef.current) {
      return readingDurationSec();
    }
    if (textDurationRef.current > 0 && partDurationsRef.current.length === 0) {
      return textDurationRef.current;
    }
    const known = partDurationsRef.current.reduce((sum, value) => sum + value, 0);
    if (known > 0) {
      return known;
    }
    return audioDuration(audioRef.current);
  }

  function markReadyAudio(ready: boolean) {
    hasReadyAudioRef.current = ready;
    setHasReadyAudio(ready);
  }

  function emitPlayback(nextPhase: ListenPhase, nextSource: LessonListenSource = sourceRef.current) {
    const currentTime = cumulativeElapsed();
    const duration = cumulativeDuration();
    setTransportClock({ currentTime, duration });
    onPlaybackChangeRef.current?.({
      phase: nextPhase,
      currentTime,
      duration,
      generation: generationRef.current,
      source: nextSource,
      fallback: fallbackRef.current && !webSpeechActiveRef.current,
      hasAudio: hasReadyAudioRef.current && (!fallbackRef.current || webSpeechActiveRef.current),
      seekGeneration: seekGenerationRef.current,
      cardIndex: storyboardCardIndex,
      cardCount: storyboardCardCount,
    });
  }

  function finishHeldStoryboardCard() {
    const wanted = playSpokenPartIndexRef.current;
    if (wanted != null && partIndexRef.current !== wanted && !fallbackRef.current) {
      return;
    }
    onStoryboardCardEndedRef.current?.();
    const lastCard =
      storyboardCardCountRef.current > 0 &&
      storyboardCardIndexRef.current >= storyboardCardCountRef.current - 1;
    if (lastCard) {
      setPhase("ended");
      phaseRef.current = "ended";
      emitPlayback("ended");
    }
  }

  function tryPlayHeldStoryboardPart(): boolean {
    if (!storyboardHoldQueueRef.current || sourceRef.current !== "lesson") {
      return false;
    }
    if (fallbackRef.current) {
      return false;
    }
    const wanted = playSpokenPartIndexRef.current;
    if (wanted == null) {
      return false;
    }
    if (!partQueueRef.current[wanted]) {
      return false;
    }
    const audio = audioRef.current;
    const alreadyPlaying =
      partIndexRef.current === wanted &&
      phaseRef.current === "playing" &&
      Boolean(audio && !audio.ended);
    if (alreadyPlaying) {
      return true;
    }
    void playQueuedPartRef.current(wanted);
    return true;
  }

  function revokeObjectUrl() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }

  function failListen(message: string, options?: { textMode?: boolean }) {
    streamPendingRef.current = false;
    if (options?.textMode) {
      beginTextPlayback(message);
      return;
    }
    phaseRef.current = "idle";
    setPhase("idle");
    setError(message);
  }

  function failStudioPreparing(request?: LessonListenStudioRequest) {
    const message = copy.studioPreparing;
    beginTextPlayback(message, request);
  }

  function beginTextPlayback(message: string, request?: LessonListenStudioRequest, fromSec?: number) {
    if (pauseLockRef.current) {
      return;
    }
    abortRef.current?.abort();
    abortRef.current = null;
    const elapsed = fromSec ?? (fallbackRef.current || webSpeechActiveRef.current ? textElapsedRef.current : cumulativeElapsed());
    stopPlayback({ preserveTextDuration: true });
    revokeObjectUrl();
    streamPendingRef.current = false;
    if (startWebSpeechPlayback(elapsed)) {
      if (request) {
        onStudioFailRef.current?.(message, request);
      }
      return;
    }
    if (variant === "inline" || variant === "cinema") {
      fallbackRef.current = false;
      disarmWebSpeech();
      stopPlayback();
      revokeObjectUrl();
      streamPendingRef.current = false;
      markReadyAudio(false);
      setTextMode(false);
      setError(message);
      phaseRef.current = "idle";
      setPhase("idle");
      emitPlayback("idle");
      if (request) {
        onStudioFailRef.current?.(message, request);
      }
      return;
    }
    fallbackRef.current = true;
    stopPlayback({ preserveTextDuration: true });
    revokeObjectUrl();
    streamPendingRef.current = false;
    fallbackRef.current = true;
    markReadyAudio(false);
    setTextMode(true);
    setError(null);
    phaseRef.current = "playing";
    setPhase("playing");
    startTextClock(elapsed);
    emitPlayback("playing");
    if (request) {
      onStudioFailRef.current?.(message, request);
    }
  }

  function continueInTextMode() {
    beginTextPlayback(copy.failQuota);
  }

  function stopPlayback(opts?: { preserveTextDuration?: boolean }) {
    endedArmedRef.current = false;
    streamPendingRef.current = false;
    partQueueRef.current = [];
    partIndexRef.current = 0;
    partDurationsRef.current = [];
    partSpeakersRef.current = [];
    if (!opts?.preserveTextDuration) {
      textDurationRef.current = 0;
      textElapsedRef.current = 0;
      setTextUiElapsed(0);
      fallbackRef.current = false;
      clearTextClock();
      disarmWebSpeech();
    }
    abortRef.current?.abort();
    abortRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
  }

  function resetAudioState() {
    generationRef.current += 1;
    lastTimeEmitRef.current = 0;
    pauseLockRef.current = false;
    phaseRef.current = "idle";
    setPhase("idle");
    setError(null);
    setTextMode(false);
    markReadyAudio(false);
    setTextUiElapsed(0);
    setSource("lesson");
    sourceRef.current = "lesson";
    fallbackRef.current = false;
    seekGenerationRef.current = 0;
    clearTextClock();
    disarmWebSpeech();
    stopPlayback();
    revokeObjectUrl();
    setTransportClock({ currentTime: 0, duration: 0 });
    onPlaybackChangeRef.current?.({
      phase: "idle",
      currentTime: 0,
      duration: 0,
      generation: generationRef.current,
      source: "lesson",
      fallback: false,
      hasAudio: false,
      seekGeneration: seekGenerationRef.current,
      cardIndex: storyboardCardIndexRef.current,
      cardCount: storyboardCardCountRef.current,
    });
  }

  function attachWav(bytes: Uint8Array): boolean {
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }
    revokeObjectUrl();
    const url = URL.createObjectURL(new Blob([toArrayBuffer(bytes)], { type: "audio/wav" }));
    objectUrlRef.current = url;
    mediaSwapRef.current = true;
    audio.src = url;
    applyVolumeTo(audio);
    return true;
  }

  function playbackRateForPart(index: number): number {
    const speaker = partSpeakersRef.current[index];
    if (speaker) {
      return academyListenPlaybackRateForSpeaker(speaker);
    }
    return ACADEMY_LESSON_LISTEN_PLAYBACK_RATE;
  }

  function attachRemoteUrl(url: string): boolean {
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }
    revokeObjectUrl();
    mediaSwapRef.current = true;
    audio.src = url;
    applyVolumeTo(audio);
    return true;
  }

  async function playRemoteUrl(url: string): Promise<boolean> {
    disarmWebSpeech();
    if (!attachRemoteUrl(url)) {
      return false;
    }
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }
    if (pauseLockRef.current) {
      audio.pause();
      return false;
    }
    endedArmedRef.current = true;
    try {
      audio.playbackRate = ACADEMY_LESSON_LISTEN_PLAYBACK_RATE;
      await audio.play();
      if (pauseLockRef.current) {
        audio.pause();
        return false;
      }
      setError(null);
      markReadyAudio(true);
      setPhase("playing");
      phaseRef.current = "playing";
      return true;
    } catch {
      endedArmedRef.current = false;
      beginTextPlayback(copy.failQuota);
      return false;
    }
  }

  async function playWav(bytes: Uint8Array, partIndex = partIndexRef.current): Promise<boolean> {
    disarmWebSpeech();
    if (!attachWav(bytes)) {
      return false;
    }
    const audio = audioRef.current;
    if (!audio) {
      return false;
    }
    if (pauseLockRef.current) {
      audio.pause();
      return false;
    }
    endedArmedRef.current = true;
    try {
      audio.playbackRate = playbackRateForPart(partIndex);
      await audio.play();
      if (pauseLockRef.current) {
        audio.pause();
        return false;
      }
      setError(null);
      markReadyAudio(true);
      setPhase("playing");
      phaseRef.current = "playing";
      return true;
    } catch {
      endedArmedRef.current = false;
      beginTextPlayback(copy.failQuota);
      return false;
    }
  }

  async function playQueuedPart(index: number): Promise<void> {
    const part = partQueueRef.current[index];
    if (!part) {
      if (storyboardHoldQueueRef.current) {
        return;
      }
      if (!streamPendingRef.current) {
        setPhase("ended");
      }
      return;
    }
    partIndexRef.current = index;
    await playWav(part, index);
  }

  function rejectMockStudioAudio(audioSec: number, isFull: boolean): boolean {
    const textSec = textDurationRef.current;
    if (isFull && isAcademyListenFallbackFullAudio(audioSec, textSec)) {
      beginTextPlayback(copy.failQuota, undefined, cumulativeElapsed());
      return true;
    }
    return false;
  }

  useEffect(() => {
    emitPlayback(phase);
  }, [phase]);

  useEffect(() => {
    if (phase !== "preparing") {
      return;
    }
    const timer = window.setTimeout(() => {
      if (phaseRef.current !== "preparing") {
        return;
      }
      abortRef.current?.abort();
      abortRef.current = null;
      failListen(copy.failTimeout, { textMode: true });
    }, ACADEMY_LESSON_LISTEN_PREPARING_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    resetAudioState();
    const cached = getAcademyListenClientCachedAudio(courseId, lessonKey);
    if (clientCacheHasRealAudio(cached)) {
      markReadyAudio(true);
      onPlaybackChangeRef.current?.({
        phase: "idle",
        currentTime: 0,
        duration: cached?.textDurationSec ?? 0,
        generation: generationRef.current,
        source: "lesson",
        fallback: false,
        hasAudio: true,
        seekGeneration: seekGenerationRef.current,
        cardIndex: storyboardCardIndexRef.current,
        cardCount: storyboardCardCountRef.current,
      });
    }
    return () => {
      resetAudioState();
    };
  }, [courseId, lessonKey]);

  async function startListen() {
    if (!ACADEMY_LESSON_LISTEN_ENABLED || phaseRef.current === "preparing") {
      return;
    }
    pauseLockRef.current = false;
    const requestedKey = lessonKey;
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    function stale(): boolean {
      return generationRef.current !== generation || lessonKeyRef.current !== requestedKey;
    }
    setError(null);
    setTextMode(false);
    fallbackRef.current = false;
    clearTextClock();
    stopPlayback();
    revokeObjectUrl();
    setSource("lesson");
    sourceRef.current = "lesson";

    const cached = getAcademyListenClientCachedAudio(courseId, requestedKey);
    if (cached?.textDurationSec) {
      textDurationRef.current = cached.textDurationSec;
    }
    if (cached && !cached.fallback && cached.audioUrl) {
      await playRemoteUrl(cached.audioUrl);
      return;
    }
    if (cached && !cached.fallback && cached.wav.byteLength) {
      partQueueRef.current = [cached.wav];
      partIndexRef.current = 0;
      partDurationsRef.current = [];
      partSpeakersRef.current = [];
      await playWav(cached.wav, 0);
      return;
    }

    setPhase("preparing");
    phaseRef.current = "preparing";
    const controller = new AbortController();
    abortRef.current = controller;
    if (variant === "cinema" || variant === "inline") {
      startWebSpeechPlayback(0);
    }
    const killFetch = window.setTimeout(() => {
      if (controller.signal.aborted) {
        return;
      }
      if (audioRef.current?.src) {
        return;
      }
      controller.abort();
    }, ACADEMY_LESSON_LISTEN_PREPARING_TIMEOUT_MS);
    try {
      const response = await fetch(
        academyLessonListenPath(courseId),
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/octet-stream" },
          body: JSON.stringify({ lessonKey: requestedKey }),
          signal: controller.signal,
        }),
      );
      if (stale()) {
        return;
      }
      const contentType = response.headers.get("content-type") ?? "";
      const framing = response.headers.get(ACADEMY_LISTEN_FRAMING_HEADER);
      const speakers = parseAcademyListenSpeakersHeader(
        response.headers.get(ACADEMY_LISTEN_SPEAKERS_HEADER),
      );
      const fallbackMode = response.headers.get(ACADEMY_LISTEN_FALLBACK_HEADER);
      const remoteUrl = response.headers.get(ACADEMY_LISTEN_AUDIO_URL_HEADER)?.trim();
      applyListenMeta(response.headers);
      if (isAcademyListenFallbackHeader(fallbackMode) || response.status === 503) {
        beginTextPlayback(copy.failQuota);
        controller.abort();
        abortRef.current = null;
        return;
      }
      if (remoteUrl && response.ok) {
        setError(null);
        setAcademyListenClientCachedAudio(courseId, requestedKey, new Uint8Array(0), {
          textDurationSec: textDurationRef.current,
          fallback: false,
          audioUrl: remoteUrl,
        });
        await playRemoteUrl(remoteUrl);
        return;
      }
      if (!response.ok) {
        const envelope = contentType.includes("json")
          ? await readCitizenEnvelope(response)
          : { ok: false as const, status: response.status, error: undefined, body: {} };
        if (stale()) {
          return;
        }
        if (response.status === 503) {
          failStudioPreparing();
          return;
        }
        failListen(envelope.error || copy.fail, { textMode: true });
        return;
      }
      if (contentType.startsWith("audio/") || response.headers.get(ACADEMY_LISTEN_CACHE_HEADER) === "hit") {
        const blob = await response.blob();
        if (stale()) {
          return;
        }
        const bytes = new Uint8Array(await blob.arrayBuffer());
        if (stale()) {
          return;
        }
        setAcademyListenClientCachedAudio(courseId, requestedKey, bytes, {
          textDurationSec: textDurationRef.current,
          fallback: false,
        });
        partQueueRef.current = [bytes];
        partIndexRef.current = 0;
        partSpeakersRef.current = speakers.length === 1 ? speakers : [];
        await playWav(bytes, 0);
        return;
      }
      if (!response.body || framing !== ACADEMY_LISTEN_FRAMING_WAV_U32BE) {
        failListen(copy.fail, { textMode: true });
        return;
      }
      streamPendingRef.current = true;
      partQueueRef.current = [];
      partIndexRef.current = 0;
      partDurationsRef.current = [];
      partSpeakersRef.current = speakers;
      let started = false;
      for await (const part of iterateAcademyListenWavFrames(response.body)) {
        if (stale() || controller.signal.aborted) {
          if (stale()) {
            return;
          }
          if (phaseRef.current === "preparing") {
            failListen(copy.failTimeout, { textMode: true });
          }
          return;
        }
        partQueueRef.current.push(part);
        if (pauseLockRef.current) {
          continue;
        }
        if (!started) {
          started = true;
          const wanted = storyboardHoldQueueRef.current
            ? playSpokenPartIndexRef.current
            : 0;
          if (wanted == null) {
            continue;
          }
          if (wanted === 0 || partQueueRef.current[wanted]) {
            await playQueuedPart(wanted);
          }
        } else if (storyboardHoldQueueRef.current) {
          tryPlayHeldStoryboardPart();
        } else {
          const audio = audioRef.current;
          const waiting =
            Boolean(audio?.ended) && partIndexRef.current === partQueueRef.current.length - 2;
          if (waiting) {
            await playQueuedPart(partIndexRef.current + 1);
          }
        }
      }
      if (stale()) {
        return;
      }
      streamPendingRef.current = false;
      if (partQueueRef.current.length === 0) {
        failStudioPreparing();
        return;
      }
      const audioSec = cumulativeDuration();
      if (isAcademyListenFallbackFullAudio(audioSec, readingDurationSec())) {
        beginTextPlayback(copy.failQuota, undefined, cumulativeElapsed());
        return;
      }
      const full = concatPcmWavBytes(partQueueRef.current);
      storeClientCache(full);
      if (storyboardHoldQueueRef.current) {
        tryPlayHeldStoryboardPart();
        return;
      }
      const audio = audioRef.current;
      if (audio?.ended && partIndexRef.current >= partQueueRef.current.length - 1) {
        setPhase("ended");
      }
    } catch (error) {
      if (stale() || controller.signal.aborted) {
        if (stale()) {
          return;
        }
        if (webSpeechActiveRef.current && phaseRef.current === "playing") {
          return;
        }
        if (phaseRef.current === "preparing") {
          failListen(copy.failTimeout, { textMode: true });
        }
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (isAcademyListenAbortError(error) || /ConnectTimeoutError|UND_ERR_CONNECT_TIMEOUT|connect timeout|the operation was aborted|aborted/i.test(
          message,
        )
      ) {
        if (webSpeechActiveRef.current && phaseRef.current === "playing") {
          return;
        }
        failStudioPreparing();
        return;
      }
      if (
        error instanceof TypeError ||
        /failed to fetch|networkerror|load failed/i.test(message)
      ) {
        failListen(UX_SEN.http.network, { textMode: true });
        return;
      }
      failStudioPreparing();
    } finally {
      window.clearTimeout(killFetch);
    }
  }

  async function startStudio(request: LessonListenStudioRequest) {
    if (!ACADEMY_LESSON_LISTEN_ENABLED || phaseRef.current === "preparing") {
      return;
    }
    generationRef.current += 1;
    setError(null);
    stopPlayback();
    revokeObjectUrl();
    setSource("studio");
    sourceRef.current = "studio";
    setPhase("preparing");
    phaseRef.current = "preparing";
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch(
        academyLessonListenPath(courseId),
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json", accept: "application/octet-stream" },
          body: JSON.stringify({
            lessonKey,
            studioBeat: request.beat,
            sectionKey: request.sectionKey,
            question: request.question,
          }),
          signal: controller.signal,
        }),
      );
      const contentType = response.headers.get("content-type") ?? "";
      const framing = response.headers.get(ACADEMY_LISTEN_FRAMING_HEADER);
      const speakers = parseAcademyListenSpeakersHeader(
        response.headers.get(ACADEMY_LISTEN_SPEAKERS_HEADER),
      );
      applyListenMeta(response.headers);
      const remoteUrl = response.headers.get(ACADEMY_LISTEN_AUDIO_URL_HEADER)?.trim();
      if (
        isAcademyListenFallbackHeader(response.headers.get(ACADEMY_LISTEN_FALLBACK_HEADER)) ||
        response.status === 503
      ) {
        failStudioPreparing(request);
        controller.abort();
        abortRef.current = null;
        return;
      }
      if (remoteUrl && response.ok) {
        setError(null);
        await playRemoteUrl(remoteUrl);
        return;
      }
      if (!response.ok) {
        const envelope = contentType.includes("json")
          ? await readCitizenEnvelope(response)
          : { ok: false as const, status: response.status, error: undefined, body: {} };
        if (response.status === 503) {
          failStudioPreparing(request);
          return;
        }
        setPhase("idle");
        const message = envelope.error || copy.fail;
        onStudioFailRef.current?.(message, request);
        if (!isAcademyModeratorPolicyReject(message)) {
          setError(message);
        }
        return;
      }
      if (contentType.startsWith("audio/") || response.headers.get(ACADEMY_LISTEN_CACHE_HEADER) === "hit") {
        const blob = await response.blob();
        const bytes = new Uint8Array(await blob.arrayBuffer());
        partQueueRef.current = [bytes];
        partIndexRef.current = 0;
        partSpeakersRef.current = speakers.length === 1 ? speakers : [];
        await playWav(bytes, 0);
        return;
      }
      if (!response.body || framing !== ACADEMY_LISTEN_FRAMING_WAV_U32BE) {
        failListen(copy.fail, { textMode: true });
        return;
      }
      streamPendingRef.current = true;
      partQueueRef.current = [];
      partIndexRef.current = 0;
      partDurationsRef.current = [];
      partSpeakersRef.current = speakers;
      let started = false;
      for await (const part of iterateAcademyListenWavFrames(response.body)) {
        if (controller.signal.aborted) {
          if (phaseRef.current === "preparing") {
            failListen(copy.failTimeout, { textMode: true });
          }
          return;
        }
        partQueueRef.current.push(part);
        if (pauseLockRef.current) {
          continue;
        }
        if (!started) {
          started = true;
          await playQueuedPart(0);
        } else {
          const audio = audioRef.current;
          const waiting =
            Boolean(audio?.ended) && partIndexRef.current === partQueueRef.current.length - 2;
          if (waiting) {
            await playQueuedPart(partIndexRef.current + 1);
          }
        }
      }
      streamPendingRef.current = false;
      if (partQueueRef.current.length === 0) {
        failStudioPreparing(request);
      }
    } catch (error) {
      if (controller.signal.aborted) {
        if (phaseRef.current === "preparing") {
          failListen(copy.failTimeout, { textMode: true });
        }
        return;
      }
      const message = error instanceof Error ? error.message : String(error);
      if (
        /ConnectTimeoutError|UND_ERR_CONNECT_TIMEOUT|connect timeout/i.test(message)
      ) {
        failStudioPreparing(request);
        return;
      }
      if (
        error instanceof TypeError ||
        /failed to fetch|networkerror|load failed/i.test(message)
      ) {
        failListen(UX_SEN.http.network, { textMode: true });
        return;
      }
      failStudioPreparing(request);
    }
  }

  function lockAbsolutePause() {
    pauseLockRef.current = true;
    endedArmedRef.current = false;
    if (webSpeechActiveRef.current || fallbackRef.current || textClockRef.current != null) {
      if (phaseRef.current === "playing" || textClockStartedAtRef.current > 0) {
        snapshotTextElapsed((performance.now() - textClockStartedAtRef.current) / 1000);
      }
    }
    clearTextClock();
    freezeWebSpeech();
    const audio = audioRef.current;
    if (audio && !audio.paused) {
      audio.pause();
    }
    phaseRef.current = "paused";
    setPhase("paused");
    emitPlayback("paused");
  }

  function onStop() {
    lockAbsolutePause();
  }

  async function onReplay() {
    pauseLockRef.current = false;
    setSource("lesson");
    sourceRef.current = "lesson";
    if (webSpeechActiveRef.current) {
      startWebSpeechPlayback(0);
      return;
    }
    const cached = getAcademyListenClientCachedAudio(courseId, lessonKey);
    if (fallbackRef.current || cached?.fallback) {
      beginTextPlayback(copy.failQuota, undefined, 0);
      return;
    }
    if (cached?.audioUrl) {
      generationRef.current += 1;
      if (cached.textDurationSec > 0) {
        textDurationRef.current = cached.textDurationSec;
      }
      await playRemoteUrl(cached.audioUrl);
      return;
    }
    if (cached?.wav.byteLength) {
      generationRef.current += 1;
      if (cached.textDurationSec > 0) {
        textDurationRef.current = cached.textDurationSec;
      }
      partQueueRef.current = [cached.wav];
      partIndexRef.current = 0;
      partDurationsRef.current = [];
      partSpeakersRef.current = [];
      await playWav(cached.wav, 0);
      return;
    }
    const audio = audioRef.current;
    if (!audio?.src) {
      await startListen();
      return;
    }
    generationRef.current += 1;
    partIndexRef.current = 0;
    audio.currentTime = 0;
    endedArmedRef.current = true;
    try {
      audio.playbackRate = playbackRateForPart(0);
      await audio.play();
      if (pauseLockRef.current) {
        audio.pause();
        return;
      }
      setError(null);
      setPhase("playing");
      phaseRef.current = "playing";
    } catch {
      endedArmedRef.current = false;
      setPhase("paused");
    }
  }

  async function onResume() {
    pauseLockRef.current = false;
    if (webSpeechActiveRef.current) {
      startWebSpeechPlayback(textElapsedRef.current);
      return;
    }
    if (fallbackRef.current) {
      phaseRef.current = "playing";
      setPhase("playing");
      startTextClock(textElapsedRef.current);
      emitPlayback("playing");
      return;
    }
    const audio = audioRef.current;
    if (!audio?.src) {
      await startListen();
      return;
    }
    endedArmedRef.current = true;
    try {
      audio.playbackRate = playbackRateForPart(partIndexRef.current);
      await audio.play();
      if (pauseLockRef.current) {
        audio.pause();
        return;
      }
      setError(null);
      setPhase("playing");
      phaseRef.current = "playing";
    } catch {
      endedArmedRef.current = false;
      pauseLockRef.current = true;
      setPhase("paused");
    }
  }

  function seekTo(seconds: number) {
    const duration = cumulativeDuration();
    if (!(duration > 0) || phaseRef.current === "preparing") {
      return;
    }
    const target = Math.max(0, Math.min(seconds, duration));
    seekGenerationRef.current += 1;
    if (webSpeechActiveRef.current) {
      const wasPlaying = phaseRef.current === "playing";
      snapshotTextElapsed(target);
      if (target >= duration) {
        clearTextClock();
        disarmWebSpeech();
        phaseRef.current = "ended";
        setPhase("ended");
        emitPlayback("ended");
        return;
      }
      if (wasPlaying) {
        startWebSpeechPlayback(target);
        return;
      }
      if (phaseRef.current === "ended") {
        phaseRef.current = "paused";
        setPhase("paused");
      }
      emitPlayback(phaseRef.current);
      return;
    }
    if (fallbackRef.current) {
      const wasPlaying = phaseRef.current === "playing";
      snapshotTextElapsed(target);
      if (target >= duration) {
        clearTextClock();
        phaseRef.current = "ended";
        setPhase("ended");
        emitPlayback("ended");
        return;
      }
      if (wasPlaying) {
        startTextClock(target);
        emitPlayback("playing");
        return;
      }
      if (phaseRef.current === "ended") {
        phaseRef.current = "paused";
        setPhase("paused");
      }
      emitPlayback(phaseRef.current);
      return;
    }
    const parts = partDurationsRef.current;
    if (parts.length > 1) {
      let acc = 0;
      let index = 0;
      for (let i = 0; i < parts.length; i++) {
        const partDuration = parts[i] ?? 0;
        if (target <= acc + partDuration || i === parts.length - 1) {
          index = i;
          break;
        }
        acc += partDuration;
      }
      const offset = Math.max(0, target - acc);
      const resume = phaseRef.current === "playing";
      void (async () => {
        if (index !== partIndexRef.current) {
          await playQueuedPart(index);
          if (!resume) {
            audioRef.current?.pause();
          }
        }
        const audio = audioRef.current;
        if (audio) {
          audio.currentTime = offset;
          applyVolumeTo(audio);
        }
        emitPlayback(phaseRef.current);
      })();
      return;
    }
    const audio = audioRef.current;
    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = target;
      if (phaseRef.current === "ended" && target < duration) {
        phaseRef.current = "paused";
        setPhase("paused");
      }
      emitPlayback(phaseRef.current);
    }
  }

  startListenRef.current = startListen;
  playQueuedPartRef.current = playQueuedPart;
  onReplayRef.current = onReplay;
  onStopRef.current = onStop;
  onResumeRef.current = onResume;
  startStudioRef.current = startStudio;
  seekToRef.current = seekTo;

  function togglePlay() {
    if (pauseLockRef.current || phaseRef.current === "paused") {
      pauseLockRef.current = false;
      void onResumeRef.current();
      return;
    }
    if (phaseRef.current === "ended") {
      pauseLockRef.current = false;
      void onReplayRef.current();
      return;
    }
    if (phaseRef.current === "playing" || phaseRef.current === "preparing") {
      lockAbsolutePause();
      return;
    }
    pauseLockRef.current = false;
    void startListenRef.current();
  }

  useEffect(() => {
    if (!autoStart) {
      return;
    }
    void startListenRef.current();
  }, [lessonKey, autoStart]);

  useEffect(() => {
    if (replayRequestId <= 0 || replayRequestId === prevReplayRequestId.current) {
      prevReplayRequestId.current = replayRequestId;
      return;
    }
    prevReplayRequestId.current = replayRequestId;
    void onReplayRef.current();
  }, [replayRequestId]);

  useEffect(() => {
    if (startRequestId <= 0 || startRequestId === prevStartRequestId.current) {
      prevStartRequestId.current = startRequestId;
      return;
    }
    prevStartRequestId.current = startRequestId;
    if (phaseRef.current === "paused") {
      void onResume();
      return;
    }
    void startListenRef.current();
  }, [startRequestId]);

  useEffect(() => {
    if (cinemaVolume == null && cinemaMuted == null) {
      return;
    }
    if (typeof cinemaVolume === "number" && Number.isFinite(cinemaVolume)) {
      volumeRef.current = Math.max(0, Math.min(1, cinemaVolume));
    }
    if (typeof cinemaMuted === "boolean") {
      mutedRef.current = cinemaMuted;
    }
    applyVolumeTo(audioRef.current);
  }, [cinemaMuted, cinemaVolume]);

  useEffect(() => {
    if (!cinemaControl || cinemaControl.generation <= 0) {
      return;
    }
    if (cinemaControl.generation === prevCinemaGen.current) {
      return;
    }
    prevCinemaGen.current = cinemaControl.generation;
    const action = cinemaControl.action;
    if (action === "pause") {
      onStopRef.current();
      return;
    }
    if (action === "seek") {
      if (typeof cinemaControl.seekTo === "number") {
        seekToRef.current(cinemaControl.seekTo);
      }
      return;
    }
    if (action === "resume") {
      void onResumeRef.current();
      return;
    }
    if (action === "replay") {
      void onReplayRef.current();
      return;
    }
    if (phaseRef.current === "paused") {
      void onResumeRef.current();
      return;
    }
    if (phaseRef.current === "ended") {
      void onReplayRef.current();
      return;
    }
    void startListenRef.current();
  }, [cinemaControl]);

  useEffect(() => {
    if (!studioRequest || studioRequest.id <= 0) {
      return;
    }
    void startStudioRef.current(studioRequest);
  }, [studioRequest]);

  useEffect(() => {
    if (!storyboardHoldQueue) {
      return;
    }
    if (sourceRef.current !== "lesson") {
      return;
    }
    const listenLive =
      phaseRef.current === "playing" ||
      phaseRef.current === "paused" ||
      phaseRef.current === "ended" ||
      phaseRef.current === "preparing" ||
      fallbackRef.current;
    if (!listenLive) {
      return;
    }
    if (playSpokenPartIndex == null) {
      endedArmedRef.current = false;
      clearTextClock();
      const audio = audioRef.current;
      if (audio && !audio.ended) {
        audio.pause();
      }
      return;
    }
    if (fallbackRef.current) {
      phaseRef.current = "playing";
      setPhase("playing");
      startTextClock(0);
      emitPlayback("playing");
      return;
    }
    if (tryPlayHeldStoryboardPart()) {
      return;
    }
    if (partQueueRef.current.length === 0) {
      return;
    }
    if (!streamPendingRef.current) {
      phaseRef.current = "playing";
      setPhase("playing");
      startTextClock(0);
      emitPlayback("playing");
    }
  }, [playSpokenPartIndex, storyboardHoldQueue]);

  const cardCurrent = storyboardCardCount > 0 ? storyboardCardIndex + 1 : 0;
  const cardProgressRatio =
    storyboardCardCount > 0 ? Math.min(1, cardCurrent / storyboardCardCount) : 0;
  const dockVisible = phase === "playing" || phase === "paused" || phase === "ended" || phase === "preparing";
  const readingModeLabel = copy.readingMode;

  useEffect(() => {
    if (variant === "inline" || variant === "cinema" || !dockVisible) {
      document.body.removeAttribute("data-academy-listen-dock");
      return;
    }
    document.body.setAttribute("data-academy-listen-dock", "1");
    return () => {
      document.body.removeAttribute("data-academy-listen-dock");
    };
  }, [dockVisible, variant]);

  const primaryLabel =
    phase === "preparing"
      ? copy.preparing
      : phase === "playing"
        ? copy.playing(instructorName)
        : phase === "paused" || phase === "ended"
          ? copy.replay
          : copy.cta;
  const primaryDisabled = phase === "preparing" || phase === "playing";
  const showWave = phase === "preparing" || phase === "playing";

  const overlay = variant === "overlay";
  const inline = variant === "inline";
  const cinema = variant === "cinema";
  const transportBtn = overlay
    ? "min-h-9 shrink-0 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
    : "min-h-11 shrink-0";
  const transportPlayLabel =
    phase === "preparing"
      ? copy.preparing
      : phase === "playing"
        ? copy.pause
        : phase === "paused"
          ? copy.play
          : phase === "ended"
            ? copy.replay
            : copy.cta;
  const showInlinePlay =
    inline && ACADEMY_LESSON_LISTEN_ENABLED && hasReadyAudio && !textMode;

  return (
    <div
      className={
        inline || cinema
          ? showInlinePlay
            ? "academy-listen-play-only"
            : "contents"
          : `w-full min-w-0 ${overlay ? "space-y-1" : "space-y-2"}`
      }
      data-academy-listen-studio=""
      data-academy-listen-variant={variant}
      data-academy-listen-ready={hasReadyAudio && !textMode ? "true" : "false"}
      data-academy-listen-web-speech={webSpeechActive ? "true" : "false"}
    >
      <audio
        ref={audioRef}
        hidden
        preload="none"
        onEnded={() => {
          if (pauseLockRef.current || fallbackRef.current || !endedArmedRef.current) {
            return;
          }
          endedArmedRef.current = false;
          if (storyboardHoldQueueRef.current && sourceRef.current === "lesson") {
            finishHeldStoryboardCard();
            return;
          }
          const next = partIndexRef.current + 1;
          if (next < partQueueRef.current.length) {
            void playQueuedPart(next);
            return;
          }
          if (streamPendingRef.current) {
            return;
          }
          setPhase("ended");
        }}
        onLoadedMetadata={() => {
          if (fallbackRef.current) {
            return;
          }
          const duration = audioDuration(audioRef.current);
          if (duration > 0) {
            partDurationsRef.current[partIndexRef.current] = duration;
          }
          const full = partQueueRef.current.length <= 1 && !streamPendingRef.current;
          if (rejectMockStudioAudio(duration, full)) {
            return;
          }
          emitPlayback(phaseRef.current);
        }}
        onTimeUpdate={() => {
          if (pauseLockRef.current || fallbackRef.current || phaseRef.current !== "playing") {
            return;
          }
          const now = performance.now();
          if (now - lastTimeEmitRef.current < 200) {
            return;
          }
          lastTimeEmitRef.current = now;
          emitPlayback(phaseRef.current);
        }}
        onPause={() => {
          if (fallbackRef.current) {
            return;
          }
          if (mediaSwapRef.current) {
            mediaSwapRef.current = false;
            return;
          }
          const audio = audioRef.current;
          if (!audio || audio.ended) {
            return;
          }
          pauseLockRef.current = true;
          phaseRef.current = "paused";
          clearTextClock();
          freezeWebSpeech();
          setPhase("paused");
          emitPlayback("paused");
        }}
        onPlay={() => {
          if (fallbackRef.current) {
            return;
          }
          mediaSwapRef.current = false;
          if (pauseLockRef.current) {
            audioRef.current?.pause();
            return;
          }
          setError(null);
          phaseRef.current = "playing";
          setPhase("playing");
        }}
      />
      {cinema ? null : overlay ? (
        <>
          {error && !textMode ? (
            <p
              role="status"
              aria-live="polite"
              data-academy-listen-studio-notice=""
              className="rounded-xl border border-white/20 bg-black/65 px-3 py-2 text-xs text-white"
            >
              {error}
            </p>
          ) : null}
          <div
            data-academy-listen-dock-bar=""
            data-academy-listen-minimal=""
            className="flex w-full min-w-0 flex-nowrap items-center gap-3"
            role="region"
            aria-label={copy.dock}
          >
          {phase === "idle" || phase === "preparing" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={`${transportBtn} min-h-11 px-4 text-sm font-semibold`}
              disabled={!ACADEMY_LESSON_LISTEN_ENABLED || primaryDisabled}
              aria-busy={phase === "preparing"}
              onClick={() => void startListen()}
            >
              {primaryLabel}
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className={`${transportBtn} min-h-11 min-w-[5.5rem] px-4 text-sm font-semibold`}
              onClick={() => togglePlay()}
            >
              {phase === "playing" ? copy.pause : copy.play}
            </Button>
          )}
          <div
            className="flex min-w-0 flex-1 items-center gap-2 text-xs text-white/80"
            data-academy-storyboard-progress={`${cardCurrent}/${storyboardCardCount}`}
          >
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={Math.max(1, storyboardCardCount)}
              aria-valuenow={cardCurrent}
              aria-label={copy.cardProgress(cardCurrent, storyboardCardCount)}
              className="h-1.5 w-full overflow-hidden rounded-full bg-white/20"
            >
              <div
                className="h-full bg-[var(--safir)]"
                style={{ width: `${Math.round(cardProgressRatio * 100)}%` }}
              />
            </div>
            <span className="shrink-0 tabular-nums text-[11px] text-white/75">
              {copy.cardProgress(cardCurrent, storyboardCardCount)}
            </span>
          </div>
          <span className="sr-only">{Math.round(cardProgressRatio * 100)}%</span>
        </div>
        </>
      ) : inline ? (
        showInlinePlay ? (
          <div
            className="academy-listen-transport"
            data-academy-listen-transport=""
            data-academy-listen-minimal=""
            role="region"
            aria-label={copy.cta}
          >
            <button
              type="button"
              className="academy-listen-bar-play academy-player-play"
              disabled={phase === "preparing"}
              aria-busy={phase === "preparing"}
              aria-label={copy.cta}
              onClick={() => togglePlay()}
            >
              {phase === "playing" ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
              <span className="sr-only">{transportPlayLabel}</span>
            </button>
          </div>
        ) : null
      ) : (
        <>
          <div className="academy-listen-cockpit flex w-full min-w-0 flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {copy.eyebrow(instructorName)}
              </p>
              {showWave ? (
                <span
                  className="academy-listen-waveform"
                  data-phase={phase === "preparing" ? "preparing" : "playing"}
                  aria-hidden
                >
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                disabled={!ACADEMY_LESSON_LISTEN_ENABLED || primaryDisabled}
                aria-busy={phase === "preparing"}
                onClick={() => {
                  if (phase === "paused" || phase === "ended") {
                    void onReplay();
                    return;
                  }
                  void startListen();
                }}
              >
                {primaryLabel}
              </Button>
              {phase === "playing" ? (
                <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={onStop}>
                  {copy.stop}
                </Button>
              ) : null}
            </div>
          </div>
          {dockVisible ? (
            <div
              data-academy-listen-dock-bar=""
              className="relative z-10 w-full border-t border-[var(--border)] bg-[var(--surface-muted)]/90 px-3 py-2"
              role="region"
              aria-label={copy.dock}
            >
              <div className="flex max-w-none flex-nowrap items-center gap-2 sm:flex-wrap sm:gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="min-h-11 shrink-0"
                  disabled={phase === "preparing"}
                  onClick={() => togglePlay()}
                >
                  {phase === "playing" ? copy.pause : copy.play}
                </Button>
                <div
                  className="flex min-w-0 flex-1 items-center gap-2 text-xs text-[var(--muted)]"
                  data-academy-storyboard-progress={`${cardCurrent}/${storyboardCardCount}`}
                >
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={Math.max(1, storyboardCardCount)}
                    aria-valuenow={cardCurrent}
                    aria-label={copy.cardProgress(cardCurrent, storyboardCardCount)}
                    className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]"
                  >
                    <div
                      className="h-full bg-[var(--safir)]"
                      style={{ width: `${Math.round(cardProgressRatio * 100)}%` }}
                    />
                  </div>
                  <span className="shrink-0 tabular-nums">
                    {copy.cardProgress(cardCurrent, storyboardCardCount)}
                  </span>
                </div>
                <span className="sr-only">{Math.round(cardProgressRatio * 100)}%</span>
              </div>
              {textMode ? (
                <p
                  role="status"
                  aria-live="polite"
                  data-academy-listen-reading-mode=""
                  className="mt-2 text-xs text-[var(--muted)]"
                >
                  {readingModeLabel}
                </p>
              ) : null}
            </div>
          ) : null}
        </>
      )}
      {(error || textMode) && !dockVisible && !overlay && !inline ? (
        <div className="flex flex-wrap items-center gap-2" data-academy-listen-error="">
          {error ? (
            <p aria-live="assertive" className="text-xs text-[var(--rose)]" data-academy-listen-studio-notice="">
              {error}
            </p>
          ) : (
            <p className="text-xs text-[var(--muted)]">{readingModeLabel}</p>
          )}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="min-h-9"
            onClick={() => continueInTextMode()}
          >
            {copy.failTextMode}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="min-h-9"
            onClick={() => {
              setTextMode(false);
              setError(null);
              void startListen();
            }}
          >
            {copy.reload}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
