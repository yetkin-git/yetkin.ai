"use client";

import { juniorHintTitle, type JuniorHintKind } from "@/lib/junior/content-rules";
import { playJuniorHintEffect, primeJuniorHintAudio } from "@/lib/junior/hint-effect";

export function JuniorHintBox({ kind, body }: { kind: JuniorHintKind; body: string }) {
  const title = juniorHintTitle(kind);
  const tone =
    kind === "gold"
      ? "border-[#f6d98a] bg-[#fffbeb]"
      : "border-[#bae6fd] bg-[#f0f9ff]";

  return (
    <div role="note" aria-label={title} data-junior-hint={kind} className={`rounded-lg border px-2 py-1 ${tone}`}>
      <p className="text-xs font-semibold text-[var(--safir-deep)]">{title}</p>
      {body ? <p className="mt-0.5 text-xs leading-4">{body}</p> : null}
      <button
        type="button"
        className="mt-1 text-xs font-semibold text-[var(--safir)] underline"
        onClick={() => {
          primeJuniorHintAudio();
          playJuniorHintEffect("grasped");
        }}
      >
        Anladım!
      </button>
    </div>
  );
}
