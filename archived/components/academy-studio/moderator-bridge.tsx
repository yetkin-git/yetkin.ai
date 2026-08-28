"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ACADEMY_MODERATOR } from "@/lib/academy/instructors";
import type {
  AcademyModeratorBridgeDecision,
  AcademyModeratorBridgeLogEntry,
  AcademyModeratorBridgePayload,
} from "@/archived/lib/academy-studio/moderator-bridge";

export function AcademyModeratorBridge({
  payload,
  log,
  instructorName,
  settling = false,
  onDecide,
}: {
  payload: AcademyModeratorBridgePayload;
  log: readonly AcademyModeratorBridgeLogEntry[];
  instructorName: string;
  settling?: boolean;
  onDecide: (decision: AcademyModeratorBridgeDecision, note?: string) => void;
}) {
  const copy = ACADEMY_SEN.moderatorBridge;
  const [note, setNote] = useState("");

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center"
      data-academy-moderator-bridge=""
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={copy.eyebrow}
        className="max-h-[85vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl border border-[var(--safir-soft)] bg-[var(--surface)] p-4"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
          {copy.eyebrow}
        </p>
        <p className="text-xs text-[var(--muted)]">{copy.nextLead(payload.nextTitle)}</p>

        <figure className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
          <figcaption className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
            {ACADEMY_MODERATOR.title}
          </figcaption>
          <p className="mt-1 text-sm leading-6 text-[var(--foreground)]">{payload.message}</p>
        </figure>

        {log.length > 0 ? (
          <div className="space-y-2" data-academy-moderator-bridge-log="">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.logEyebrow}
            </p>
            <ol className="max-h-36 space-y-2 overflow-y-auto">
              {log.map((entry) => (
                <li
                  key={entry.id}
                  className={`rounded-xl border px-3 py-2 text-xs leading-5 ${
                    entry.speaker === "moderator"
                      ? "border-[var(--border)] bg-[var(--surface-muted)]"
                      : entry.speaker === "instructor"
                        ? "border-[var(--safir-soft)] bg-[var(--safir-soft)]"
                        : "border-[var(--border)]"
                  }`}
                >
                  <span className="block font-medium text-[var(--foreground)]">
                    {entry.speaker === "moderator"
                      ? ACADEMY_MODERATOR.title
                      : entry.speaker === "instructor"
                        ? `Eğitmen ${instructorName}`
                        : "Pekiştirme"}
                  </span>
                  <span className="text-[var(--muted)]">{entry.text}</span>
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        {settling ? (
          <p className="text-xs text-[var(--emerald)]">{copy.confirmedHint}</p>
        ) : (
          <>
            <label className="block space-y-1">
              <span className="text-xs text-[var(--muted)]">{copy.replyLabel}</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={copy.replyPlaceholder}
                rows={2}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="min-h-11"
                onClick={() => onDecide(note.trim() ? "reinforce" : "confirm", note.trim() || undefined)}
              >
                {note.trim() ? copy.reinforceCta : copy.confirmCta}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="min-h-11"
                onClick={() => onDecide("skip")}
              >
                {copy.skipCta}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
