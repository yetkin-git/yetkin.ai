"use client";

import { useEffect, useRef } from "react";
import {
  academyFiveActHeading,
  type TimedDialogueTurn,
} from "@/lib/academy/dialogue-timeline";

export function LessonDialogueTranscript({
  turns,
  activeIndex,
  listening,
}: {
  turns: readonly TimedDialogueTurn[];
  activeIndex: number;
  listening: boolean;
}) {
  const activeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  if (turns.length === 0) {
    return null;
  }

  return (
    <ol
      className="academy-dialogue-transcript space-y-5"
      data-academy-dialogue-transcript=""
      data-listening={listening ? "true" : "false"}
    >
      {turns.map((turn, index) => {
        const prevAct = index > 0 ? turns[index - 1]?.act : null;
        const actHeading =
          turn.act && turn.act !== prevAct ? academyFiveActHeading(turn.act) : null;
        const active = index === activeIndex;
        return (
          <li key={turn.id} className="space-y-3">
            {actHeading ? (
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                {actHeading}
              </p>
            ) : null}
            <article
              ref={active ? activeRef : undefined}
              className="academy-transcript-sentence space-y-1"
              data-academy-transcript-active={active ? "true" : undefined}
              data-academy-dialogue-speaker={turn.speaker}
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                {turn.displayName}
              </p>
              <p className="text-[15px] leading-[1.7] text-[color-mix(in_srgb,var(--foreground)_92%,transparent)]">
                {turn.text}
              </p>
            </article>
          </li>
        );
      })}
    </ol>
  );
}
