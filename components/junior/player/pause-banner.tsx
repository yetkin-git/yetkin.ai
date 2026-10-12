"use client";

import type { Ref } from "react";
import {
  JUNIOR_HARD_PAUSE_BUTTON,
  JUNIOR_THINK_HOLD_HINT,
  JUNIOR_TURN_CARD_KICKER,
  JUNIOR_TURN_CARD_TITLE,
  type JuniorPauseKind,
} from "@/lib/junior/player-clock";

/**
 * Sert durak alt şeridi.
 * Defter ve not durağında kaset bekler. Yıldız sorusu bu şeritte durmaz.
 */
export function JuniorPauseBanner({
  kind,
  buttonRef,
  onResume,
}: {
  kind: Exclude<JuniorPauseKind, "attention" | "turn">;
  buttonRef?: Ref<HTMLButtonElement>;
  onResume: () => void;
}) {
  return (
    <div
      role="region"
      aria-label="Notunu al"
      data-junior-pause-banner=""
      data-junior-think-hold=""
      data-junior-hard-pause={kind}
      className="flex items-center gap-3 rounded-xl border border-[#f6d98a] bg-[#fffbeb] px-3 py-2"
    >
      <span aria-hidden="true" className="shrink-0 text-lg leading-none">
        📌
      </span>
      <p className="min-w-0 flex-1 text-sm font-semibold leading-5 text-[var(--safir-deep)]">
        {JUNIOR_THINK_HOLD_HINT}
      </p>
      <button
        ref={buttonRef}
        type="button"
        className="shrink-0 cursor-pointer rounded-full bg-[var(--safir)] px-3 py-1.5 text-xs font-semibold text-white"
        onClick={onResume}
      >
        {JUNIOR_HARD_PAUSE_BUTTON}
      </button>
    </div>
  );
}

/** Yıldız durağında alt ikaz. Dokunulursa soru paneli açılır. Kaset akmaya devam eder. */
export function JuniorStarAlert({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      data-junior-star-alert=""
      className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-[#f6d98a] bg-[#fffbeb] px-3 py-2 text-left"
      onClick={onOpen}
    >
      <span aria-hidden="true" className="junior-star-glow inline-block shrink-0 text-lg leading-none">
        ⭐
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--safir)]">
          {JUNIOR_TURN_CARD_KICKER}
        </span>
        <span className="block text-sm font-semibold text-[var(--safir-deep)]">
          Yıldız durağı. Küçük soruyu açmak için dokun.
        </span>
      </span>
    </button>
  );
}

/** Çocuğun açtığı küçük soru. Anlatım bu panel açıkken de sürer. */
export function JuniorStarQuestion({
  question,
  onClose,
}: {
  question: string;
  onClose: () => void;
}) {
  return (
    <div
      role="region"
      aria-label={JUNIOR_TURN_CARD_TITLE}
      data-junior-star-question=""
      className="flex items-start gap-3 rounded-xl border border-[#f6d98a] bg-[#fffbeb] px-3 py-2"
    >
      <span aria-hidden="true" className="shrink-0 text-lg leading-none">
        ⭐
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--safir)]">
          {JUNIOR_TURN_CARD_KICKER}
        </p>
        <p className="text-sm font-semibold text-[var(--safir-deep)]">{JUNIOR_TURN_CARD_TITLE}</p>
        <p data-junior-micro-question="" className="text-xs leading-5 text-[var(--safir-deep)]">
          {question}
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 cursor-pointer rounded-full bg-[var(--safir)] px-3 py-1.5 text-xs font-semibold text-white"
        onClick={onClose}
      >
        Kapat
      </button>
    </div>
  );
}
