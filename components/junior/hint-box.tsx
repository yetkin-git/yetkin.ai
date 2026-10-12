"use client";

import type { Ref } from "react";
import { juniorHintTitle, type JuniorHintKind } from "@/lib/junior/content-rules";
import { playJuniorHintEffect, primeJuniorHintAudio } from "@/lib/junior/hint-effect";
import { JUNIOR_ATTENTION_BUTTON } from "@/lib/junior/player-clock";

export function JuniorHintBox({
  kind,
  body,
  holding = false,
  buttonRef,
  onAcknowledge,
}: {
  kind: JuniorHintKind;
  body: string;
  /** Kaset bu kartta duruyorsa düğme akışı açar. */
  holding?: boolean;
  buttonRef?: Ref<HTMLButtonElement>;
  onAcknowledge?: () => void;
}) {
  const title = juniorHintTitle(kind);
  const tone =
    kind === "gold"
      ? "border-[#f6d98a] bg-[#fffbeb]"
      : "border-[#bae6fd] bg-[#f0f9ff]";

  return (
    <div
      role="note"
      aria-label={title}
      data-junior-hint={kind}
      data-junior-attention-hold={holding ? "true" : undefined}
      className={`rounded-lg border px-2 py-1 ${tone}`}
    >
      <p className="text-xs font-semibold text-[var(--safir-deep)]">{title}</p>
      {body ? <p className="mt-0.5 text-xs leading-4">{body}</p> : null}
      <button
        ref={buttonRef}
        type="button"
        className="mt-2 cursor-pointer rounded-full bg-[var(--safir)] px-3 py-1.5 text-xs font-semibold text-white"
        onClick={() => {
          primeJuniorHintAudio();
          playJuniorHintEffect("grasped");
          onAcknowledge?.();
        }}
      >
        {JUNIOR_ATTENTION_BUTTON}
      </button>
    </div>
  );
}
