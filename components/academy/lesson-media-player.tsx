"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  IconCaptions,
  IconMaximize,
  IconPause,
  IconPlay,
  IconVolume,
  IconVolumeOff,
} from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import {
  academyCinemaCanPlayNativeHls,
  academyCinemaDurationSec,
  formatAcademyCinemaClock,
  resolveAcademyCinemaSource,
} from "@/lib/academy/lesson-cinema";

export function LessonMediaPlayer({
  assetKey,
  videoTitle,
  durationSec,
}: {
  assetKey: string;
  videoTitle: string;
  durationSec: number;
}) {
  const copy = ACADEMY_SEN.player;
  const listenCopy = ACADEMY_SEN.listen;
  const source = useMemo(() => resolveAcademyCinemaSource(assetKey), [assetKey]);
  const visualDuration = academyCinemaDurationSec({
    spokenDuration: 0,
    microDurationSec: durationSec,
  });
  const frameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const posterRef = useRef<HTMLImageElement | null>(null);
  const clockRef = useRef({ playing: false, elapsed: 0, lastStamp: 0, duration: visualDuration });
  const pauseLockRef = useRef(false);
  const rafRef = useRef(0);
  const togglePlayRef = useRef<() => void>(() => undefined);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(visualDuration);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [kind, setKind] = useState(source.kind);

  useEffect(() => {
    pauseLockRef.current = true;
    clockRef.current = { playing: false, elapsed: 0, lastStamp: 0, duration: visualDuration };
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setPlaying(false);
    setElapsed(0);
    setDuration(visualDuration);
    setKind(source.kind);
  }, [assetKey, source.kind, visualDuration]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || (kind !== "html5" && kind !== "hls")) {
      return;
    }
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    video.removeAttribute("src");
    if (kind === "hls" && academyCinemaCanPlayNativeHls(video)) {
      video.src = source.hls;
      video.load();
      return;
    }
    const webm = document.createElement("source");
    webm.src = source.webm;
    webm.type = "video/webm";
    const mp4 = document.createElement("source");
    mp4.src = source.mp4;
    mp4.type = "video/mp4";
    video.appendChild(webm);
    video.appendChild(mp4);
    video.poster = source.poster;
    video.load();
  }, [kind, source.hls, source.mp4, source.poster, source.webm]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }
    video.volume = muted ? 0 : volume;
    video.muted = muted || volume === 0;
  }, [kind, muted, volume]);

  const applyElapsed = useCallback(
    (next: number) => {
      const cap = clockRef.current.duration > 0 ? clockRef.current.duration : visualDuration;
      const clamped = Math.max(0, Math.min(next, cap));
      clockRef.current.elapsed = clamped;
      setElapsed(clamped);
      const video = videoRef.current;
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = (clamped / cap) * video.duration;
      }
    },
    [visualDuration],
  );

  const applyPauseLock = useCallback(() => {
    pauseLockRef.current = true;
    clockRef.current.playing = false;
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    setPlaying(false);
    videoRef.current?.pause();
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
      const video = videoRef.current;
      if (video && !video.paused && Number.isFinite(video.currentTime) && Number.isFinite(video.duration) && video.duration > 0) {
        clock.duration = video.duration;
        clock.elapsed = video.currentTime;
        setDuration(video.duration);
        setElapsed(video.currentTime);
      } else if (video?.paused && pauseLockRef.current) {
        rafRef.current = 0;
        return;
      } else {
        const next = clock.elapsed + delta;
        if (next >= clock.duration) {
          clock.elapsed = clock.duration;
          clock.playing = false;
          pauseLockRef.current = true;
          setElapsed(clock.duration);
          setPlaying(false);
          video?.pause();
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
  }, [playing]);

  const togglePlay = useCallback(() => {
    if (clockRef.current.playing || playing) {
      applyPauseLock();
      return;
    }
    pauseLockRef.current = false;
    if (elapsed >= duration && duration > 0) {
      applyElapsed(0);
    }
    clockRef.current.playing = true;
    clockRef.current.lastStamp = 0;
    setPlaying(true);
    void videoRef.current?.play().catch(() => {
      setKind("canvas");
    });
  }, [applyElapsed, applyPauseLock, duration, elapsed, playing]);

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || kind !== "canvas") {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const ratio = window.devicePixelRatio || 1;
    const width = 1280;
    const height = 720;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    drawCinemaFrame(ctx, {
      width,
      height,
      title: videoTitle,
      poster: posterRef.current,
    });
  }, [elapsed, kind, videoTitle]);

  function onSeek(next: number) {
    const wasPlaying = clockRef.current.playing && !pauseLockRef.current;
    clockRef.current.playing = false;
    setPlaying(false);
    applyElapsed(next);
    if (wasPlaying) {
      pauseLockRef.current = false;
      clockRef.current.playing = true;
      clockRef.current.lastStamp = 0;
      setPlaying(true);
      void videoRef.current?.play().catch(() => undefined);
    }
  }

  function onFullscreen() {
    const node = frameRef.current;
    if (!node) {
      return;
    }
    if (document.fullscreenElement === node) {
      void document.exitFullscreen();
      return;
    }
    void node.requestFullscreen();
  }

  const caption = captionsOn ? videoTitle : "";
  const progressPct = duration > 0 ? Math.min(100, Math.max(0, (elapsed / duration) * 100)) : 0;

  return (
    <section
      ref={frameRef}
      className="academy-cinema"
      data-academy-player-cinema=""
      data-academy-cinema-kind={kind}
    >
      <div className="academy-cinema-stage">
        {kind === "canvas" ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={posterRef}
              src={source.loop || source.poster}
              alt=""
              className="academy-cinema-poster"
              onLoad={() => {
                setElapsed((current) => current);
              }}
            />
            <canvas ref={canvasRef} className="academy-cinema-canvas" data-academy-cinema-canvas="" />
          </>
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption -- altyazı overlay başlıktan basılır
          <video
            ref={videoRef}
            className="academy-cinema-video"
            playsInline
            poster={source.poster}
            onError={() => setKind("canvas")}
            onLoadedMetadata={() => {
              const video = videoRef.current;
              if (video && Number.isFinite(video.duration) && video.duration > 0) {
                clockRef.current.duration = video.duration;
                setDuration(video.duration);
              }
            }}
          />
        )}
        <p className="academy-cinema-kicker">{copy.cinemaEyebrow}</p>
        {caption ? (
          <p className="academy-cinema-caption" data-academy-cinema-caption="">
            {caption}
          </p>
        ) : null}
      </div>
      <div className="academy-cinema-controls" data-academy-cinema-controls="">
        <button
          type="button"
          className="academy-cinema-play"
          aria-label={playing ? listenCopy.pause : listenCopy.play}
          onClick={togglePlay}
        >
          {playing ? <IconPause className="h-4 w-4" /> : <IconPlay className="h-4 w-4" />}
        </button>
        <label className="academy-cinema-timeline">
          <span className="sr-only">{copy.cinemaTimeline}</span>
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
            onChange={(event) => {
              const next = Number(event.target.value);
              setVolume(next);
              setMuted(next === 0);
            }}
          />
        </label>
        <button
          type="button"
          className={`academy-cinema-icon${captionsOn ? " academy-cinema-icon--on" : ""}`}
          aria-pressed={captionsOn}
          aria-label={captionsOn ? copy.cinemaCaptionsOn : copy.cinemaCaptionsOff}
          onClick={() => setCaptionsOn((current) => !current)}
        >
          <IconCaptions className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="academy-cinema-icon"
          aria-label={copy.cinemaFullscreen}
          onClick={onFullscreen}
        >
          <IconMaximize className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

function drawCinemaFrame(
  ctx: CanvasRenderingContext2D,
  input: {
    width: number;
    height: number;
    title: string;
    poster: HTMLImageElement | null;
  },
) {
  const { width, height } = input;
  ctx.fillStyle = "#070b14";
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width * 0.5, height * 0.38, 40, width * 0.5, height * 0.4, width * 0.55);
  glow.addColorStop(0, "rgba(26, 140, 255, 0.18)");
  glow.addColorStop(1, "rgba(7, 11, 20, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  if (input.poster && input.poster.complete && input.poster.naturalWidth > 0) {
    const pw = input.poster.naturalWidth;
    const ph = input.poster.naturalHeight;
    const scale = Math.min((width * 0.72) / pw, (height * 0.58) / ph);
    const dw = pw * scale;
    const dh = ph * scale;
    ctx.drawImage(input.poster, (width - dw) / 2, height * 0.12, dw, dh);
  }

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "600 28px ui-sans-serif, system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillText(input.title.slice(0, 72), 48, height - 64);
}
