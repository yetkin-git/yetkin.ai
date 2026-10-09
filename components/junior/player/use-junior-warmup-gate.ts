"use client";

import { useEffect, useRef, useState } from "react";
import { JUNIOR_WARMUP_FADE_MS, juniorWarmupSrc } from "@/lib/junior/warmup";

export type JuniorWarmupGate = "cassette" | "fade" | "scene";

/**
 * Adım 0 kaseti biter veya atlanırsa sahne belirir ve 1. adımın anlatımı açılır.
 * Dosya hatasında geçiş beklenmez; sahne olduğu yerde, sessizce durur.
 */
export function useJuniorWarmupGate(lessonKey: string, startNarration: () => void) {
  const src = juniorWarmupSrc(lessonKey);
  const startRef = useRef(startNarration);
  const settled = useRef(!src);
  const timer = useRef(0);
  const [gate, setGate] = useState<JuniorWarmupGate>(src ? "cassette" : "scene");
  startRef.current = startNarration;

  useEffect(() => {
    const next = juniorWarmupSrc(lessonKey);
    settled.current = !next;
    setGate(next ? "cassette" : "scene");
    return () => window.clearTimeout(timer.current);
  }, [lessonKey]);

  function finish(mode: "play" | "still") {
    if (settled.current) {
      return;
    }
    settled.current = true;
    window.clearTimeout(timer.current);
    if (mode === "still") {
      setGate("scene");
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setGate("scene");
      startRef.current();
      return;
    }
    setGate("fade");
    startRef.current();
    timer.current = window.setTimeout(() => setGate("scene"), JUNIOR_WARMUP_FADE_MS);
  }

  return {
    src,
    gate,
    orienting: gate !== "scene",
    onEnded: () => finish("play"),
    onSkip: () => finish("play"),
    onError: () => finish("still"),
  };
}
