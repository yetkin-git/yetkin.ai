"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { JUNIOR_WARMUP_FAILSAFE_MS, JUNIOR_WARMUP_MAX_SEC } from "@/lib/junior/warmup";

type FinishKind = "ended" | "skip" | "error";

/**
 * Adım 0. Çekirdek ders açılınca ısınma kasetini oynatır.
 * Bitiş ve Atla yumuşak geçişe gider. Yükleme hatası hata yazmadan sahneyi açar.
 */
export function JuniorWarmupCassette({
  src,
  fading,
  onEnded,
  onSkip,
  onError,
}: {
  src: string;
  fading: boolean;
  onEnded: () => void;
  onSkip: () => void;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const done = useRef(false);
  const endedRef = useRef(onEnded);
  const skipRef = useRef(onSkip);
  const errorRef = useRef(onError);
  const [needsTap, setNeedsTap] = useState(false);
  endedRef.current = onEnded;
  skipRef.current = onSkip;
  errorRef.current = onError;

  const finish = useCallback((kind: FinishKind) => {
    if (done.current) {
      return;
    }
    done.current = true;
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    if (kind === "ended") {
      endedRef.current();
      return;
    }
    if (kind === "skip") {
      skipRef.current();
      return;
    }
    errorRef.current();
  }, []);

  useEffect(() => {
    done.current = false;
    setNeedsTap(false);
    const video = videoRef.current;
    if (!video) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish("skip");
      return;
    }
    let alive = true;
    const watchdog = window.setTimeout(() => finish("error"), JUNIOR_WARMUP_FAILSAFE_MS);
    const boot = async () => {
      try {
        video.muted = false;
        await video.play();
      } catch {
        if (!alive || done.current) {
          return;
        }
        try {
          video.muted = true;
          await video.play();
        } catch {
          if (alive && !done.current) {
            setNeedsTap(true);
          }
        }
      }
    };
    void boot();
    return () => {
      alive = false;
      window.clearTimeout(watchdog);
      video.pause();
    };
  }, [src, finish]);

  return (
    <div
      className={`absolute inset-0 z-10 bg-black transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      data-junior-warmup="cassette"
      data-junior-warmup-fading={fading ? "true" : "false"}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        src={src}
        playsInline
        preload="auto"
        aria-label="Ders ısınması"
        data-junior-warmup-src={src}
        onEnded={() => finish("ended")}
        onError={() => finish("error")}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime >= JUNIOR_WARMUP_MAX_SEC + 0.2) {
            finish("ended");
          }
        }}
      />
      {needsTap ? (
        <Button
          type="button"
          size="sm"
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          onClick={() => {
            const video = videoRef.current;
            if (!video || done.current) {
              return;
            }
            video.muted = false;
            void video.play().then(
              () => setNeedsTap(false),
              () => setNeedsTap(true),
            );
          }}
        >
          İzle
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="absolute bottom-3 right-3 z-20"
        aria-label="Isınmayı atla"
        onClick={() => finish("skip")}
      >
        Atla
      </Button>
    </div>
  );
}
