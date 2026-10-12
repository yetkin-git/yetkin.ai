"use client";

import { useEffect, useState, type ReactNode } from "react";

type PlateMode = "video" | "image" | "vector";

function initialMode(videoSrc: string | null, imageSrc: string | null): PlateMode {
  if (videoSrc) {
    return "video";
  }
  if (imageSrc) {
    return "image";
  }
  return "vector";
}

/**
 * Öğretim adımında sözsüz mp4 varsa video, yoksa jpg, ikisi de yoksa vektör.
 * Öğretmen sesi ayrı MP3’tedir; video sessiz döner. Dosya 404 olursa bir alt kata düşer.
 * Özet kartı bu bileşene girmez.
 */
export function JuniorScenePlate({
  videoSrc,
  imageSrc,
  children,
}: {
  videoSrc: string | null;
  imageSrc: string | null;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<PlateMode>(() => initialMode(videoSrc, imageSrc));

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce && videoSrc) {
      setMode(imageSrc ? "image" : "vector");
      return;
    }
    setMode(initialMode(videoSrc, imageSrc));
  }, [videoSrc, imageSrc]);

  return (
    <div
      className="pointer-events-none absolute inset-0 h-full w-full"
      data-junior-scene-media={mode}
      data-junior-scene-video={videoSrc ?? undefined}
      data-junior-scene-image={imageSrc ?? undefined}
    >
      {children}
      {mode === "video" && videoSrc ? (
        <video
          key={videoSrc}
          src={videoSrc}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          autoPlay
          loop
          preload="metadata"
          aria-hidden
          data-junior-scene-video-src={videoSrc}
          onError={() => setMode(imageSrc ? "image" : "vector")}
        />
      ) : null}
      {mode === "image" && imageSrc ? (
        <img
          key={imageSrc}
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          data-junior-scene-image-src={imageSrc}
          onError={() => setMode("vector")}
        />
      ) : null}
    </div>
  );
}
