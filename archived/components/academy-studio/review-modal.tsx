"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCitizenWriteFeedback } from "@/components/ui/use-citizen-write-feedback";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { isAcademyCitizenTextClean } from "@/archived/lib/academy-studio/moderation";
import { readCitizenEnvelope } from "@/lib/kernel/http/citizen-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { IconClose } from "@/components/ui/icons";

export function AcademyReviewModal({
  open,
  courseId,
  lessonKey,
  curriculumComplete,
  onClose,
}: {
  open: boolean;
  courseId: string;
  lessonKey: string | null;
  curriculumComplete: boolean;
  onClose: () => void;
}) {
  const copy = ACADEMY_SEN.review;
  const titleId = useId();
  const report = useCitizenWriteFeedback();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function onSave() {
    setPending(true);
    setError(null);
    if (!isAcademyCitizenTextClean(comment)) {
      setPending(false);
      setError(copy.policyReject);
      return;
    }
    try {
      const response = await fetch(
        "/api/academy/reviews",
        withRailApiVersion({
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            courseId,
            lessonKey: lessonKey ?? undefined,
            stars,
            comment,
          }),
        }),
      );
      const envelope = await readCitizenEnvelope(response);
      setPending(false);
      if (!envelope.ok) {
        setError(report(envelope.status, envelope.error, copy.fail));
        return;
      }
      const review = envelope.body.review;
      const text =
        review && typeof review === "object" && "moderatorReply" in review
          ? typeof review.moderatorReply === "string"
            ? review.moderatorReply
            : null
          : null;
      setReply(text);
    } catch {
      setPending(false);
      setError(UX_SEN.http.network);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-[color-mix(in_srgb,var(--surface-ink)_45%,transparent)] p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md space-y-4 rounded-2xl border border-[var(--safir-soft)] bg-[var(--surface)] p-5 shadow-[0_18px_48px_rgba(15,23,42,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
              {copy.title}
            </p>
            <h2 id={titleId} className="mt-1 text-base font-semibold text-[var(--foreground)]">
              {curriculumComplete ? copy.courseLead : copy.lead}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-[var(--muted)]" aria-label={copy.skip}>
            <IconClose />
          </button>
        </div>
        {reply ? (
          <div className="space-y-2 rounded-xl border border-[var(--safir-soft)] bg-[var(--safir-soft)] p-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--safir-deep)]">
              {copy.replyEyebrow}
            </p>
            <p className="text-sm leading-6 text-[var(--foreground)]">{reply}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1" role="radiogroup" aria-label={copy.stars(stars)}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={stars === value}
                  onClick={() => setStars(value)}
                  className={`h-9 w-9 rounded-full text-sm font-semibold ${
                    value <= stars
                      ? "bg-[var(--gold-soft)] text-[var(--gold)]"
                      : "bg-[var(--surface-muted)] text-[var(--muted)]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <label className="block space-y-1 text-sm text-[var(--foreground)]">
              <span>{copy.commentLabel}</span>
              <Textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={copy.commentPlaceholder}
                rows={3}
                maxLength={800}
              />
            </label>
          </>
        )}
        {error ? (
          <p aria-live="assertive" className="text-sm text-[var(--rose)]">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {reply ? (
            <Button type="button" size="sm" onClick={onClose}>
              {copy.saved}
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={() => void onSave()} disabled={pending}>
              {pending ? copy.pending : copy.save}
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {copy.skip}
          </Button>
        </div>
      </div>
    </div>
  );
}
