"use client";

import { useEffect, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { ExamPanel } from "@/components/academy/exam-panel";
import { IconClose } from "@/components/ui/icons";
import type { AcademyExamPublicQuestion } from "@/lib/academy/types";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailSession } from "@/lib/ui/rail-session-client-fetch";

type OpenSitting = {
  examTitle: string;
  passScore: number;
  questions: AcademyExamPublicQuestion[];
  sessionToken: string;
  expiresAtMs: number;
  proofLessonKey: string | null;
};

/**
 * Katalog / kurs detayında sınav tuzağı yok:
 * ExamPanel ve 30 dk timer yalnız açık CTA tıklanınca mount olur.
 * Focus Chamber açıkken vatandaş "Sınavdan vazgeç" ile dürüstçe çıkar;
 * JTI tüketilmez, attempt yazılmaz — süre jetonu istemcide düşer.
 */
export function ExamStartGate({
  courseId,
  courseTitle,
  examTitle,
  passScore,
  durationMs,
  holderName,
  instructorName,
  nextCourseTitle,
  nextCourseHref,
}: {
  courseId: string;
  courseTitle?: string;
  examTitle: string;
  passScore: number;
  durationMs: number;
  holderName?: string;
  instructorName?: string;
  nextCourseTitle?: string | null;
  nextCourseHref?: string | null;
}) {
  const copy = ACADEMY_SEN.exam;
  const titleId = useId();
  const minutes = Math.max(1, Math.round(durationMs / 60_000));
  const [sitting, setSitting] = useState<OpenSitting | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function abandonSitting() {
    setSitting(null);
    setError(null);
  }

  useEffect(() => {
    if (!sitting) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sitting]);

  useEffect(() => {
    if (!sitting) {
      return;
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setSitting(null);
        setError(null);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sitting]);

  async function onStart() {
    setPending(true);
    setError(null);
    const response = await fetch(
      `/api/academy/courses/${courseId}/exam`,
      await withRailSession({ method: "GET" }),
    );
    const parsed = parseRailClientJson<{
      exam?: { title?: string; passScore?: number };
      questions?: AcademyExamPublicQuestion[];
      sessionToken?: string;
      expiresAt?: string;
      proofLessonKey?: string | null;
    }>(await response.json());
    setPending(false);
    if (
      !parsed.ok ||
      !parsed.data.questions ||
      !parsed.data.sessionToken ||
      !parsed.data.expiresAt ||
      parsed.data.exam?.passScore == null
    ) {
      setError(parsed.ok ? copy.startFail : parsed.error);
      return;
    }
    setSitting({
      examTitle: parsed.data.exam?.title ?? examTitle,
      passScore: parsed.data.exam.passScore,
      questions: parsed.data.questions,
      sessionToken: parsed.data.sessionToken,
      expiresAtMs: new Date(parsed.data.expiresAt).getTime(),
      proofLessonKey: parsed.data.proofLessonKey ?? null,
    });
  }

  if (sitting) {
    return (
      <div
        className="fixed inset-0 z-40 overflow-y-auto bg-[color-mix(in_srgb,var(--surface-ink)_62%,transparent)] p-4 backdrop-blur-[2px] sm:p-8"
        data-academy-focus-chamber=""
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-label={copy.focusLabel}
          className="mx-auto max-w-3xl space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="pt-1 text-xs text-slate-600">{copy.abandonLead}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={abandonSitting}
              data-academy-exam-exit=""
              aria-label={copy.exitCta}
            >
              <IconClose className="h-3.5 w-3.5" />
              {copy.exitCta}
            </Button>
          </div>
          <h2 id={titleId} className="sr-only">
            {sitting.examTitle}
          </h2>
          <ExamPanel
            courseId={courseId}
            courseTitle={courseTitle}
            examTitle={sitting.examTitle}
            passScore={sitting.passScore}
            questions={sitting.questions}
            sessionToken={sitting.sessionToken}
            expiresAtMs={sitting.expiresAtMs}
            proofLessonKey={sitting.proofLessonKey}
            holderName={holderName}
            instructorName={instructorName}
            nextCourseTitle={nextCourseTitle}
            nextCourseHref={nextCourseHref}
            onAbandon={abandonSitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="academy-exam-chamber space-y-4 rounded-[var(--radius-card)] border p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
        {copy.chamberEyebrow}
      </p>
      <p className="text-base text-slate-600">{copy.startLead(minutes, passScore)}</p>
      <Button type="button" onClick={() => void onStart()} disabled={pending} size="lg" className="min-h-11">
        {pending ? copy.starting : copy.startCta(minutes, passScore)}
      </Button>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
