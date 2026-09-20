"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { copyTextToClipboard } from "@/components/auth/copy-text";
import { academyPromptCueStart, academyPromptConsoleFootnote, academyPromptTypedText } from "@/lib/academy/prompt-console";

export function LessonPromptConsole({
  prompt,
  currentTime,
  lessonKey,
  cueIndex,
}: {
  prompt: string;
  currentTime?: number;
  lessonKey: string;
  cueIndex: number;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const cueStart = useMemo(() => academyPromptCueStart(lessonKey, cueIndex), [lessonKey, cueIndex]);
  const footnote = useMemo(() => academyPromptConsoleFootnote(lessonKey), [lessonKey]);
  const typed = academyPromptTypedText({
    prompt,
    currentTime,
    cueStart,
    reducedMotion,
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setExpanded(false);
    setNeedsExpand(false);
  }, [prompt, lessonKey, cueIndex]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      return;
    }
    const syncOverflow = () => {
      if (expanded) {
        return;
      }
      setNeedsExpand(el.scrollHeight > el.clientHeight + 1);
    };
    syncOverflow();
    const observer = new ResizeObserver(syncOverflow);
    observer.observe(el);
    const inner = el.firstElementChild;
    if (inner) {
      observer.observe(inner);
    }
    return () => observer.disconnect();
  }, [typed.visible, expanded]);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) {
      return;
    }
    if (!typed.done) {
      el.scrollTop = el.scrollHeight;
      return;
    }
    el.scrollTop = 0;
  }, [typed.visible, typed.done]);

  return (
    <section
      className="academy-prompt-console"
      data-academy-prompt-console=""
      data-academy-prompt-done={typed.done ? "true" : undefined}
      data-expanded={expanded ? "true" : undefined}
      data-overflow={needsExpand ? "true" : undefined}
      aria-label="Yapay zekâ istemi"
    >
      <header className="academy-prompt-console-bar">
        <div className="academy-prompt-console-identity">
          <span className="academy-prompt-console-lights" aria-hidden>
            <i />
            <i />
            <i />
          </span>
          <span className="academy-prompt-console-title">Prompt Terminali</span>
          <span className="academy-prompt-console-hint">Hazır istem · kendi işine uyarla</span>
        </div>
        <div className="academy-prompt-console-actions">
          {needsExpand ? (
            <button
              type="button"
              className="academy-prompt-console-expand"
              data-academy-prompt-expand=""
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              {expanded ? "Daralt" : "Tamamını gör"}
            </button>
          ) : null}
          <button
            type="button"
            className="academy-prompt-console-copy"
            data-academy-prompt-copy=""
            onClick={() => {
              void copyTextToClipboard(prompt).then((ok) => {
                if (ok) {
                  setCopied(true);
                }
              });
            }}
          >
            {copied ? "Kopyalandı" : "Kopyala"}
          </button>
        </div>
      </header>
      <div
        ref={viewportRef}
        className="academy-prompt-console-viewport custom-scrollbar"
        data-academy-prompt-viewport=""
        tabIndex={0}
        role="region"
        aria-label="İstem metni"
      >
        <pre className="academy-prompt-console-body" data-academy-prompt-text="">
          <code>
            {typed.visible}
            {typed.done ? null : <span className="academy-prompt-console-caret" aria-hidden />}
          </code>
        </pre>
      </div>
      {footnote ? (
        <p className="academy-prompt-console-footnote" data-academy-prompt-footnote="">
          {footnote}
        </p>
      ) : null}
    </section>
  );
}
