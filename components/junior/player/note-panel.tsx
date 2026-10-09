"use client";

import { useEffect, useRef } from "react";
import type { JuniorPlayerPiece } from "@/lib/junior/player-clock";

export function JuniorNotePanel({
  note,
  pieces,
  activeIndex,
  armed,
}: {
  note: string;
  pieces: readonly JuniorPlayerPiece[];
  activeIndex: number;
  armed: boolean;
}) {
  const activeRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!armed || activeIndex < 0) {
      return;
    }
    const node = activeRef.current;
    const scroller = node?.closest("[data-junior-note-scroll]");
    if (!node || !(scroller instanceof HTMLElement)) {
      return;
    }
    const nodeRect = node.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    if (nodeRect.top < box.top) {
      scroller.scrollTop -= box.top - nodeRect.top;
    } else if (nodeRect.bottom > box.bottom) {
      scroller.scrollTop += nodeRect.bottom - box.bottom;
    }
  }, [activeIndex, armed]);

  if (pieces.length === 0) {
    return (
      <p data-junior-note-scroll="" className="mt-1 min-h-0 flex-1 overflow-y-auto whitespace-pre-line text-sm leading-5">{note}</p>
    );
  }

  const last = pieces[pieces.length - 1];

  return (
    <p data-junior-note-scroll="" className="mt-1 min-h-0 flex-1 overflow-y-auto whitespace-pre-line text-sm leading-5">
      {pieces.map((piece, index) => {
        const prev = index > 0 ? pieces[index - 1] : undefined;
        const gap = note.slice(prev ? prev.end : 0, piece.start);
        const active = armed && index === activeIndex;
        return (
          <span key={`${piece.start}-${piece.end}`}>
            {gap}
            <span
              ref={active ? activeRef : undefined}
              data-junior-note-span={index}
              data-active={active ? "true" : undefined}
              aria-current={active ? "true" : undefined}
              className={
                active
                  ? "box-decoration-clone rounded-sm bg-[#fef3c7] px-0.5 text-[#1e3a8a]"
                  : undefined
              }
            >
              {piece.text}
            </span>
          </span>
        );
      })}
      {last ? note.slice(last.end) : null}
    </p>
  );
}
