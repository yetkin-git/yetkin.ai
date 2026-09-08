"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { LESSON_PRACTICE } from "@/lib/academy/lesson-practice";
import { academyLessonAudioPlaybackSrc } from "@/lib/academy/lesson-audio";
import {
  academyDialogueSpokenElapsedSec,
  buildAcademyDialogueTimeline,
  buildAcademyTeleprompterCues,
} from "@/lib/academy/dialogue-timeline";
import { getOrCreateAcademyAudioGainBoost } from "@/lib/academy/audio-gain";
import { ACADEMY_GEMINI_TTS_SLOT } from "@/lib/academy/lesson-tts-slot";
import { resolveAcademyLessonAudioUrl } from "@/lib/academy/lesson-playback";
import { chunkAcademyWebSpeechText, prepareAcademyWebSpeechText } from "@/lib/academy/web-speech";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { LessonTeleprompter } from "./lesson-teleprompter";
import { AcademyPracticePanel } from "./academy-practice-panel";

interface SectionMeta {
  sectionNumber: number;
  title: string;
  targetDurationMinutes: number;
  pedagogicalObjective: string;
  contentMarkdown: string;
  src: string;
}

export type CourseAudioPreviewSection = {
  sectionNumber: number;
  title: string;
  targetDurationMinutes?: number;
  pedagogicalObjective?: string;
  contentMarkdown?: string;
  audioUrl?: string;
};

function CoursePodcastPanel({
  courseSlug,
  audioUrl,
  lessonTitle,
  spokenText,
}: {
  courseSlug?: string;
  audioUrl?: string;
  lessonTitle: string;
  spokenText?: string;
}) {
  const src = resolveAcademyLessonAudioUrl(audioUrl, courseSlug);
  const listenCopy = ACADEMY_SEN.listen;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechIndexRef = useRef(0);
  const speechCancelledRef = useRef(false);
  const utteranceHoldRef = useRef<SpeechSynthesisUtterance[]>([]);
  const speakTimerRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [speechActive, setSpeechActive] = useState(false);
  const [writtenMode, setWrittenMode] = useState(false);
  const speechChunks = useMemo(
    () => chunkAcademyWebSpeechText(spokenText ?? lessonTitle),
    [spokenText, lessonTitle],
  );
  const writtenBody = useMemo(
    () => prepareAcademyWebSpeechText(spokenText ?? lessonTitle),
    [spokenText, lessonTitle],
  );

  const stopWebSpeech = useCallback(() => {
    speechCancelledRef.current = true;
    if (speakTimerRef.current) {
      window.clearTimeout(speakTimerRef.current);
      speakTimerRef.current = 0;
    }
    utteranceHoldRef.current = [];
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeechActive(false);
  }, []);

  useEffect(() => {
    setAudioError(false);
    setIsPlaying(false);
    setCurrentTime(0);
    stopWebSpeech();
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.load();
  }, [src, lessonTitle, spokenText, stopWebSpeech]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return () => {
        stopWebSpeech();
      };
    }
    const synth = window.speechSynthesis;
    const warmVoices = () => {
      synth.getVoices();
    };
    warmVoices();
    synth.addEventListener("voiceschanged", warmVoices);
    return () => {
      synth.removeEventListener("voiceschanged", warmVoices);
      stopWebSpeech();
    };
  }, [stopWebSpeech]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || audioError) {
      return;
    }
    stopWebSpeech();
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    const boost = getOrCreateAcademyAudioGainBoost(audio);
    void boost?.resume();
    void audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setAudioError(false);
      })
      .catch(() => {
        setIsPlaying(false);
        setAudioError(true);
      });
  };

  const speakFrom = useCallback(
    (index: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        return;
      }
      if (speechCancelledRef.current || index >= speechChunks.length) {
        utteranceHoldRef.current = [];
        setSpeechActive(false);
        return;
      }
      speechIndexRef.current = index;
      const utterance = new SpeechSynthesisUtterance(speechChunks[index]!);
      utteranceHoldRef.current = [utterance];
      utterance.lang = "tr-TR";
      utterance.rate = 1;
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("tr"));
      if (trVoice) {
        utterance.voice = trVoice;
      }
      utterance.onend = () => {
        if (speechCancelledRef.current) {
          return;
        }
        speakTimerRef.current = window.setTimeout(() => speakFrom(index + 1), 50);
      };
      utterance.onerror = (event) => {
        if (speechCancelledRef.current) {
          return;
        }
        const reason = "error" in event ? String((event as SpeechSynthesisErrorEvent).error) : "";
        if (reason === "interrupted" || reason === "canceled") {
          return;
        }
        speakTimerRef.current = window.setTimeout(() => speakFrom(index + 1), 50);
      };
      window.speechSynthesis.speak(utterance);
    },
    [speechChunks],
  );

  const toggleWebSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setWrittenMode(true);
      return;
    }
    if (speechActive) {
      stopWebSpeech();
      return;
    }
    if (speechChunks.length === 0) {
      setWrittenMode(true);
      return;
    }
    const audio = audioRef.current;
    if (audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
    speechCancelledRef.current = false;
    setWrittenMode(true);
    setSpeechActive(true);
    window.speechSynthesis.cancel();
    window.speechSynthesis.getVoices();
    speakTimerRef.current = window.setTimeout(() => speakFrom(0), 80);
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeDuration = duration > 0 ? duration : 0;
  const progressPercent = activeDuration > 0 ? Math.min(100, Math.max(0, (currentTime / activeDuration) * 100)) : 0;

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-[var(--shadow-card)] sm:p-5"
      data-academy-podcast=""
      data-academy-tts-slot={ACADEMY_GEMINI_TTS_SLOT.id}
      data-academy-tts-enabled={ACADEMY_GEMINI_TTS_SLOT.enabled ? "true" : "false"}
      aria-label="Dersi Sesli Dinle (Podcast Modu)"
    >
      {src ? (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={() => {
            const audio = audioRef.current;
            if (!audio) return;
            if (Number.isFinite(audio.currentTime)) setCurrentTime(audio.currentTime);
            if (Number.isFinite(audio.duration) && audio.duration > 0) setDuration(audio.duration);
          }}
          onLoadedMetadata={() => {
            const audio = audioRef.current;
            if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
              setDuration(audio.duration);
              setAudioError(false);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setAudioError(true);
            setIsPlaying(false);
          }}
        >
          <source src={src} type="audio/wav" />
        </audio>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
            Dersi Sesli Dinle (Podcast Modu)
          </p>
          <p className="mt-1 truncate text-[15px] font-semibold text-slate-900">{lessonTitle}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            {src
              ? "Aşama 1 demo sesi. HTML5 oynatıcı süre çubuğuyla çalar; paralı TTS çağrısı yoktur."
              : "Bu ders için stüdyo sesi henüz bağlanmadı. Tam metni yazılı okuyabilir veya tarayıcıda sırayla dinleyebilirsin."}
          </p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700">
          {src ? "Demo ses" : "Yazılı / tarayıcı"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {src ? (
          <>
            <button
              type="button"
              onClick={togglePlay}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--safir)] text-white shadow-sm transition hover:brightness-110"
              aria-label={isPlaying ? "Durdur" : "Oynat"}
            >
              {isPlaying ? (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <div className="relative min-w-[12rem] flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-[var(--safir)]" style={{ width: `${progressPercent}%` }} />
              </div>
              <input
                type="range"
                min={0}
                max={activeDuration || 1}
                step={0.1}
                value={currentTime}
                onChange={(event) => {
                  const audio = audioRef.current;
                  const next = Number(event.target.value);
                  if (audio) audio.currentTime = next;
                  setCurrentTime(next);
                }}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Ses konumu"
              />
            </div>
            <span className="font-mono text-[12px] tabular-nums text-slate-700">
              {formatTime(currentTime)} / {formatTime(activeDuration)}
            </span>
          </>
        ) : null}
        <button
          type="button"
          onClick={toggleWebSpeech}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-800 hover:bg-slate-50"
          data-academy-browser-read=""
        >
          {speechActive ? listenCopy.browserReadStop : listenCopy.browserRead}
        </button>
        <button
          type="button"
          onClick={() => setWrittenMode((current) => !current)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-800 hover:bg-slate-50"
          data-academy-written-reading-toggle=""
        >
          {writtenMode ? listenCopy.writtenModeClose : listenCopy.writtenMode}
        </button>
      </div>

      {writtenMode ? (
        <div
          className="mt-4 max-h-[22rem] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-800"
          data-academy-written-reading=""
          role="region"
          aria-label={listenCopy.writtenMode}
        >
          <p className="mb-2 text-[12px] leading-relaxed text-slate-600">{listenCopy.writtenModeLead}</p>
          <p className="whitespace-pre-wrap text-slate-800">{writtenBody || listenCopy.failEmpty}</p>
        </div>
      ) : null}

      {src ? null : (
        <p
          className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[13px] leading-relaxed text-slate-700"
          role="status"
          data-academy-audio-absent=""
        >
          Bu dersin stüdyo ses kaydı henüz yerleştirilmedi. Kayıt bağlandığında podcast oynatıcı
          burada otomatik açılır; ders anlatımı metni aşağıda tam olarak okunabilir ve ücretsiz
          &quot;Tarayıcıda oku&quot; düğmesi şimdiden çalışır.
        </p>
      )}

      {audioError ? (
        <p className="mt-3 text-[13px] text-slate-700" role="status">
          Yerel demo ses yüklenemedi. Yazılı Okuma Modu veya tarayıcı okumasını kullanabilirsin.
        </p>
      ) : null}
    </section>
  );
}

export function CourseAudioPreview({
  courseSlug,
  initialSection = 1,
  sections: sectionInput = [],
  variant = "studio",
  audioUrl,
  lessonTitle,
  spokenText,
}: {
  courseSlug: string;
  initialSection?: number;
  sections?: readonly CourseAudioPreviewSection[];
  variant?: "studio" | "podcast";
  audioUrl?: string;
  lessonTitle?: string;
  spokenText?: string;
}) {
  if (variant === "podcast") {
    return (
      <CoursePodcastPanel
        courseSlug={courseSlug}
        audioUrl={audioUrl}
        lessonTitle={lessonTitle ?? "Ders anlatımı"}
        spokenText={spokenText}
      />
    );
  }
  return (
    <CourseStudioAudioPreview
      courseSlug={courseSlug}
      initialSection={initialSection}
      sectionInput={sectionInput}
    />
  );
}

function CourseStudioAudioPreview({
  courseSlug,
  initialSection = 1,
  sectionInput = [],
}: {
  courseSlug: string;
  initialSection?: number;
  sectionInput?: readonly CourseAudioPreviewSection[];
}) {
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isAudioEnded, setIsAudioEnded] = useState(false);
  const [isStickyPlayerVisible, setIsStickyPlayerVisible] = useState(false);
  const [completedSections, setCompletedSections] = useState<Set<number>>(() => new Set());
  const [activeTabMobile, setActiveTabMobile] = useState<"video" | "playlist" | "practice">("video");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const sections: SectionMeta[] = sectionInput.map((s) => ({
    sectionNumber: s.sectionNumber,
    title: s.title,
    targetDurationMinutes: s.targetDurationMinutes ?? 8,
    pedagogicalObjective: s.pedagogicalObjective ?? "",
    contentMarkdown: s.contentMarkdown ?? "",
    src: s.audioUrl ?? academyLessonAudioPlaybackSrc(courseSlug, `${courseSlug}-${s.sectionNumber}`),
  }));

  const currentSection =
    sections.find((s) => s.sectionNumber === activeSection) ?? sections[0];
  const audioSrc = currentSection?.src ?? "";
  const currentPractice = LESSON_PRACTICE[`${courseSlug}-${activeSection}`];

  // Observe player header to show/hide sticky mini player on scroll
  useEffect(() => {
    const el = playerContainerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setIsStickyPlayerVisible(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Audio source change effect
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError(false);
    setIsAudioEnded(false);
    audio.load();
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioSrc]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Eğer ses bittiyse veya sona çok yakınsa başa sarıp başlat
      const isAtEnd = isAudioEnded || (duration > 0 && currentTime >= duration - 0.5);
      if (isAtEnd) {
        audio.currentTime = 0;
        setCurrentTime(0);
        setIsAudioEnded(false);
      }
      const boost = getOrCreateAcademyAudioGainBoost(audio);
      void boost?.resume();
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(false);
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const cur = audio.currentTime;
    const dur = audio.duration;
    if (Number.isFinite(cur) && cur >= 0) {
      setCurrentTime(cur);
    }
    if (Number.isFinite(dur) && dur > 0 && Math.abs(dur - duration) > 0.5) {
      setDuration(dur);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const dur = audio.duration;
    if (Number.isFinite(dur) && dur > 0) {
      setDuration(dur);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    const audio = audioRef.current;
    if (!audio) return;
    setIsAudioEnded(false);
    audio.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const target = Math.min(Math.max(audio.currentTime + seconds, 0), effectiveDuration);
    audio.currentTime = target;
    setCurrentTime(target);
  };

  const handleSpeedChange = (rate: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);
    const boost = getOrCreateAcademyAudioGainBoost(audio);
    boost?.setGain(1, nextMuted);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const boost = getOrCreateAcademyAudioGainBoost(audio);
    boost?.setGain(1, isMuted);
  }, [isMuted, audioSrc]);

  const handleEnded = () => {
    setIsPlaying(false);
    setIsAudioEnded(true);
    // Mark section as completed
    setCompletedSections((prev) => {
      const next = new Set(prev);
      next.add(activeSection);
      return next;
    });
  };

  const toggleCompleted = (sectionNum: number) => {
    setCompletedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionNum)) {
        next.delete(sectionNum);
      } else {
        next.add(sectionNum);
      }
      return next;
    });
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const scrollToTop = () => {
    playerContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToSection = (secNum: number) => {
    if (secNum < 1 || secNum > sections.length) return;
    setActiveSection(secNum);
    scrollToTop();
  };

  // Buttery-smooth 60fps clock for teleprompter and scrubber progression
  useEffect(() => {
    if (!isPlaying) return;
    let rafId = 0;
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused && Number.isFinite(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
        if (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration !== duration) {
          setDuration(audio.duration);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, duration]);

  const timeline = useMemo(
    () => buildAcademyDialogueTimeline(currentSection?.contentMarkdown ?? "", courseSlug),
    [currentSection?.contentMarkdown, courseSlug],
  );

  const cues = useMemo(
    () => buildAcademyTeleprompterCues(timeline.turns),
    [timeline.turns],
  );

  const effectiveDuration =
    duration > 0
      ? duration
      : timeline.spokenDuration > 0
        ? timeline.spokenDuration
        : (currentSection?.targetDurationMinutes ?? 8) * 60;

  // Saf ve ucuz hesap: manuel memo yerine düz türetme — React Compiler'ın
  // `preserve-manual-memoization` kuralı, memoize edilmemiş `effectiveDuration`
  // bağımlılığını koruyamadığı için burada useMemo kullanılmaz.
  const spokenElapsed = academyDialogueSpokenElapsedSec({
    currentTime,
    audioDuration: effectiveDuration,
    spokenDuration: timeline.spokenDuration,
  });

  const activeDuration = duration > 0 ? duration : effectiveDuration;
  const progressPercent = activeDuration > 0 ? Math.min(100, Math.max(0, (currentTime / activeDuration) * 100)) : 0;
  const isCurrentCompleted = completedSections.has(activeSection);

  if (!currentSection) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-6 text-sm text-white/70">
        Bu kurs için yayınlanmış sesli bölüm yok.
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" id="academy-course-viewer">
      {/* HTML5 Audio Elementi (Arka planda çalışır) */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleLoadedMetadata}
        onCanPlay={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setAudioError(true)}
        preload="metadata"
      >
        <source src={audioSrc} type="audio/wav" />
      </audio>

      {/* MOBİL GÖRÜNÜM SEKMELERİ (lg altı ekranlar için) */}
      <div className="flex rounded-xl border border-white/[0.08] bg-slate-900/40 p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setActiveTabMobile("video")}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all ${
            activeTabMobile === "video"
              ? "bg-[var(--safir)] text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          🎬 Ders & Oynatıcı
        </button>
        <button
          type="button"
          onClick={() => setActiveTabMobile("playlist")}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all ${
            activeTabMobile === "playlist"
              ? "bg-[var(--safir)] text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          📋 Oynatma Listesi ({completedSections.size}/6)
        </button>
        <button
          type="button"
          onClick={() => setActiveTabMobile("practice")}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-semibold transition-all ${
            activeTabMobile === "practice"
              ? "bg-[var(--safir)] text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          ⚡ İstem Paneli
        </button>
      </div>

      {/* YOUTUBE 2 SÜTUNLU YERLEŞİM: %70 SOL KOLON / %30 SAĞ KOLON */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] xl:gap-10">
        
        {/* ======================================================== */}
        {/* SOL ANA KOLON (%70 GENİŞLİK - OYNATICI + ANLATIM METNİ)  */}
        {/* ======================================================== */}
        <div
          className={`min-w-0 space-y-6 ${
            activeTabMobile !== "video" ? "hidden lg:block" : "block"
          }`}
        >
          {/* 1. ÜSTTE TEMİZ, ODAKLANMIŞ MEDYA OYNATICISI (CINEMATIC PLAYER) */}
          <div
            ref={playerContainerRef}
            className="group relative flex aspect-video min-h-[260px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950 shadow-2xl sm:min-h-[340px] md:min-h-[400px] lg:min-h-[420px]"
          >
            {/* Oynatıcı Sinematik Arka Plan Işığı */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/90 via-slate-950/95 to-black" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60" />

            {/* A. Üst Bilgi Rozetleri Şeridi */}
            <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] bg-slate-950/80 px-4 py-2.5 backdrop-blur-md sm:px-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--safir)]/40 bg-[var(--safir)]/15 px-3 py-1 text-xs font-semibold text-[var(--safir)] backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-[var(--safir)] animate-pulse" />
                  Bölüm {activeSection} / {sections.length}
                </span>
                <span className="hidden rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-sm sm:inline-block">
                  Masterclass Stüdyo Kaydı
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isPlaying ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Ses Çalınıyor
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-400 backdrop-blur-sm">
                    Ders Okuma Alanı
                  </span>
                )}
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-sm">
                  ⏱️ ~{currentSection.targetDurationMinutes} Dk
                </span>
              </div>
            </div>

            {/* B. Sahne Ortası: Tek Dikey Akış Düz Markdown Okuma Alanı */}
            <div className="relative z-10 flex min-h-0 flex-1 w-full flex-col overflow-hidden select-text">
              {/* Tek Dikey Akışta Kullanıcının Kendi Hızıyla Okuyabildiği Düz Markdown Okuma Alanı */}
              <div className="relative z-10 flex min-h-0 flex-1 w-full flex-col overflow-hidden">
                <LessonTeleprompter
                  cues={cues}
                  elapsedSec={spokenElapsed}
                  currentTime={currentTime}
                  playing={isPlaying}
                />
              </div>
            </div>

            {/* Ses Hata Uyarısı */}
            {audioError ? (
              <div className="relative z-10 mx-4 mb-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-center text-xs text-amber-200">
                ℹ️ Bu bölümün stüdyo ses kaydı hazırlanmaktadır. Aşağıdaki ders anlatımı ve alıştırma paneli tam olarak çalışır durumdadır.
              </div>
            ) : null}

            {/* C. Alt Kontrol Şeridi (YouTube Tarzı Scrubber & Kontroller) */}
            <div className="relative z-10 border-t border-white/[0.08] bg-slate-950/80 px-4 py-3 backdrop-blur-md sm:px-6">
              {/* İnteraktif İlerleme Çubuğu (Scrubber) */}
              <div className="relative mb-2.5 flex items-center">
                <div className="relative h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-white/20 transition-all group-hover:h-2">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full bg-[var(--safir)] transition-[width] duration-75"
                    style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={activeDuration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  aria-label="Ses akış konumu"
                />
              </div>

              {/* Düğmeler ve Zaman Göstergesi */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Oynat/Durdur/Tekrar Dinle */}
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 active:scale-95"
                    aria-label={isAudioEnded ? "Tekrar Dinle" : isPlaying ? "Durdur" : "Oynat"}
                    title={isAudioEnded ? "Tekrar Dinle" : isPlaying ? "Durdur" : "Oynat"}
                  >
                    {isAudioEnded ? (
                      <svg className="h-4 w-4 fill-none stroke-current stroke-[2]" viewBox="0 0 24 24">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </svg>
                    ) : isPlaying ? (
                      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="ml-0.5 h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* 10 Saniye Geri */}
                  <button
                    type="button"
                    onClick={() => handleSkip(-10)}
                    className="rounded-lg p-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    title="10 Saniye Geri Sar"
                  >
                    ↺ 10s
                  </button>

                  {/* 10 Saniye İleri */}
                  <button
                    type="button"
                    onClick={() => handleSkip(10)}
                    className="rounded-lg p-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    title="10 Saniye İleri Sar"
                  >
                    10s ↻
                  </button>

                  {/* Süre Göstergesi */}
                  <span className="font-mono text-xs font-medium text-slate-300">
                    <span className="font-semibold text-white">{formatTime(currentTime)}</span>
                    <span className="mx-1 text-slate-500">/</span>
                    <span>{formatTime(activeDuration)}</span>
                  </span>
                </div>

                {/* Sağ Kontroller: Hız & Ses */}
                <div className="flex items-center gap-3">
                  {/* Sessize Alma */}
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-xs text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
                  >
                    {isMuted ? "🔇" : "🔊"}
                  </button>

                  {/* Hız Butonları */}
                  <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
                    {[1, 1.25, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => handleSpeedChange(rate)}
                        className={`rounded px-2 py-0.5 font-mono text-[11px] font-semibold transition-all ${
                          playbackRate === rate
                            ? "bg-[var(--safir)] text-white shadow-sm"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DERS BAŞLIĞI VE ÖZET — tek akış; metin teleprompter'da (çift tekrar yok) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--safir)]">
                Bölüm {currentSection.sectionNumber} / {sections.length} · Müfredat Dersi
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                  Eğitmen: Gözde
                </span>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-slate-400">
                  ~{currentSection.targetDurationMinutes} Dk
                </span>
              </div>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {currentSection.title}
            </h1>

            {currentSection.pedagogicalObjective ? (
              <div className="rounded-2xl border border-white/[0.06] bg-slate-900/30 p-4 sm:p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--safir)]/20 text-xs text-[var(--safir)]">
                    ●
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Bölümün Pedagojik Hedefi
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-200">
                      {currentSection.pedagogicalObjective}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* 3. DERS GEÇİŞ VE TAMAMLAMA KONTROLLERİ */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.08] pt-6">
            <button
              type="button"
              disabled={activeSection <= 1}
              onClick={() => goToSection(activeSection - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>← Önceki Bölüm</span>
            </button>

            <button
              type="button"
              onClick={() => toggleCompleted(activeSection)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all active:scale-95 ${
                isCurrentCompleted
                  ? "border border-emerald-500/40 bg-emerald-950/30 text-emerald-300"
                  : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{isCurrentCompleted ? "✓ Bu Bölüm Tamamlandı" : "Bölümü Tamamlandı Olarak İşaretle"}</span>
            </button>

            <button
              type="button"
              disabled={activeSection >= sections.length}
              onClick={() => goToSection(activeSection + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--safir)] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[var(--safir)]/25 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span>Sonraki Bölüm (Bölüm {activeSection + 1}) →</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SAĞ KOLON (%30 GENİŞLİK - OYNATMA LİSTESİ + İSTEM PANELİ)*/}
        {/* ======================================================== */}
        <div
          className={`min-w-0 space-y-6 ${
            activeTabMobile === "video" ? "hidden lg:block" : "block"
          }`}
        >
          {/* 1. ÜSTTE 6 BÖLÜMÜN LİSTE HALİ (PLAYLIST) */}
          {(activeTabMobile === "playlist" || activeTabMobile === "video") ? (
            <div className="rounded-2xl border border-white/10 bg-[#07090e] p-4 shadow-2xl backdrop-blur-md sm:p-5 bg-gradient-to-b from-[#0a0d16] via-[#07090e] to-[#040508]">
              {/* Oynatma Listesi Başlığı */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-sm font-bold tracking-wide text-white">
                    Müfredat Oynatma Listesi
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    6 Bölüm · Toplam 51 Dk Masterclass
                  </p>
                </div>
                <span className="rounded-full border border-[var(--safir)]/40 bg-[var(--safir)]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--safir)]">
                  {completedSections.size} / {sections.length} Tamamlandı
                </span>
              </div>

              {/* İlerleme Çizgisi */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-gradient-to-r from-[var(--safir)] to-emerald-400 shadow-[0_0_8px_var(--safir)] transition-all duration-300"
                  style={{
                    width: `${(completedSections.size / sections.length) * 100}%`,
                  }}
                />
              </div>

              {/* 6 Bölüm Listesi */}
              <ol className="mt-3.5 space-y-2" aria-label="Ders Bölümleri">
                {sections.map((section) => {
                  const isActive = section.sectionNumber === activeSection;
                  const isDone = completedSections.has(section.sectionNumber);

                  return (
                    <li key={section.sectionNumber}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveSection(section.sectionNumber);
                          scrollToTop();
                        }}
                        className={`group flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left transition-all ${
                          isActive
                            ? "border-2 border-[var(--safir)] bg-gradient-to-r from-[var(--safir)]/30 via-[var(--safir)]/15 to-[#0e1424] text-white shadow-xl shadow-[var(--safir)]/25 ring-1 ring-[var(--safir)]/50 scale-[1.01]"
                            : "border border-white/[0.06] bg-[#0c101a] text-slate-300 hover:border-white/15 hover:bg-[#131826] hover:text-white"
                        }`}
                      >
                        {/* Numara & Başlık */}
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                              isActive
                                ? "bg-[var(--safir)] text-white shadow-[0_0_12px_var(--safir)]"
                                : isDone
                                ? "border border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                                : "border border-white/10 bg-white/5 text-slate-400 group-hover:text-white"
                            }`}
                          >
                            {isDone ? "✓" : section.sectionNumber}
                          </span>

                          <div className="min-w-0 flex-1">
                            <span
                              className={`line-clamp-1 block text-xs transition-colors ${
                                isActive ? "font-bold text-white" : "font-medium text-slate-200 group-hover:text-white"
                              }`}
                            >
                              {section.title}
                            </span>
                            <span className="block text-[10px] text-slate-400">
                              ⏱️ ~{section.targetDurationMinutes} Dk
                            </span>
                          </div>
                        </div>

                        {/* Rozetler / Durum */}
                        <div className="flex shrink-0 items-center gap-1.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--safir)]/60 bg-[var(--safir)]/30 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--safir)] animate-pulse" />
                              Şimdi
                            </span>
                          ) : isDone ? (
                            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              Bitti
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : null}

          {/* 2. ALTINDA AKTİF BÖLÜMÜN "İSTEM & ALIŞTIRMA PANELİ" (PRACTICE CONSOLE) */}
          {(activeTabMobile === "practice" || activeTabMobile === "video") ? (
            <div className="sticky top-6">
              <AcademyPracticePanel
                sectionNumber={activeSection}
                practice={currentPractice}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* 3. SABİT (STICKY) MİNİ OYNATICI - KULLANICI AŞAĞI KAYDIRDIĞINDA AKTİF OLUR */}
      {isStickyPlayerVisible ? (
        <div className="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--safir)]/50 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md">
            {/* Oynat/Durdur Butonu */}
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--safir)] text-white shadow-md transition-transform active:scale-95"
              aria-label={isPlaying ? "Durdur" : "Oynat"}
            >
              {isPlaying ? (
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="ml-0.5 h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Bölüm Başlığı & İlerleme */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="truncate font-semibold text-white">
                  Bölüm {activeSection}: {currentSection.title}
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  {formatTime(currentTime)} / {formatTime(effectiveDuration)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={effectiveDuration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-[var(--safir)]"
                aria-label="Hızlı Konum"
              />
            </div>

            {/* Başa Dön / Oynatıcıya Odaklan */}
            <button
              type="button"
              onClick={scrollToTop}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              title="Oynatıcıya ve Başa Dön"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
