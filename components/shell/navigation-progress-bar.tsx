"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isAppRouterNavigationFetch,
  resolveClickAnchor,
  shouldHideNavigationProgress,
  shouldStartProgressFromClick,
} from "@/lib/ui/navigation-progress";

type Phase = "idle" | "running" | "finishing";

const FINISH_HOLD_MS = 160;
const FINISH_FADE_MS = 220;
const STALL_TIMEOUT_MS = 10_000;

export function NavigationProgressBar() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const completeRef = useRef<() => void>(() => undefined);
  const hidden = shouldHideNavigationProgress(pathname);

  useEffect(() => {
    const phaseRef = { current: "idle" as Phase };
    let inflight = 0;
    let finishTimer: ReturnType<typeof setTimeout> | null = null;
    let stallTimer: ReturnType<typeof setTimeout> | null = null;

    const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const clearStall = () => {
      if (stallTimer !== null) {
        clearTimeout(stallTimer);
        stallTimer = null;
      }
    };

    const clearFinish = () => {
      if (finishTimer !== null) {
        clearTimeout(finishTimer);
        finishTimer = null;
      }
    };

    const start = () => {
      if (shouldHideNavigationProgress(window.location.pathname)) {
        return;
      }
      if (phaseRef.current === "running") {
        return;
      }
      clearFinish();
      clearStall();
      phaseRef.current = "running";
      setPhase("running");
      stallTimer = setTimeout(() => {
        completeRef.current();
      }, STALL_TIMEOUT_MS);
    };

    const complete = () => {
      if (phaseRef.current !== "running") {
        return;
      }
      clearStall();
      phaseRef.current = "finishing";
      setPhase("finishing");
      const fadeMs = reducedMotion() ? 80 : FINISH_HOLD_MS + FINISH_FADE_MS;
      finishTimer = setTimeout(() => {
        phaseRef.current = "idle";
        inflight = 0;
        setPhase("idle");
        finishTimer = null;
      }, fadeMs);
    };

    completeRef.current = complete;

    const onClick = (event: MouseEvent) => {
      const anchor = resolveClickAnchor(event.target);
      if (!shouldStartProgressFromClick(event, anchor, window.location.href)) {
        return;
      }
      start();
    };

    const onPopState = () => {
      start();
    };

    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const navigation = isAppRouterNavigationFetch(input, init);
      if (navigation) {
        inflight += 1;
        start();
      }
      const pending = nativeFetch(input, init);
      if (navigation) {
        const settle = () => {
          inflight = Math.max(0, inflight - 1);
          if (inflight === 0) {
            complete();
          }
        };
        pending.then(settle, settle);
      }
      return pending;
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);

    return () => {
      clearStall();
      clearFinish();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.fetch = nativeFetch;
    };
  }, []);

  useEffect(() => {
    completeRef.current();
  }, [pathname]);

  if (hidden) {
    return null;
  }

  return (
    <div
      className="nav-progress-root pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-[3px]"
      data-state={phase}
      data-mode="indeterminate"
      aria-hidden="true"
    >
      <div className="nav-progress-fill" />
    </div>
  );
}
