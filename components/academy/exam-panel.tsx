"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { useActionBridge } from "@/components/ui/action-bridge";
import { CertificateSeal } from "@/components/academy/certificate-seal";
import { ProofOfWorkCard } from "@/components/academy/proof-of-work-card";
import { AcademyProgressionBridge } from "@/components/academy/progression-bridge";
import { InteractiveTask } from "@/components/academy/interactive-task";
import type { AcademyExamPublicQuestion } from "@/lib/academy/types";
import type { AcademyProofSubmission } from "@/lib/academy/proof-of-work";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { UX_SEN } from "@/lib/copy/sen-voice/ux";
import { formatAcademyExamRemaining } from "@/lib/academy/exam-duration";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailSession } from "@/lib/ui/rail-session-client-fetch";
import type { AcademyPathwayMasteryView } from "@/lib/academy/level-pathway";

export function ExamPanel({
  courseId,
  courseTitle,
  examTitle,
  passScore,
  questions,
  sessionToken,
  expiresAtMs,
  proofLessonKey = null,
  eyebrow,
  lead,
  holderName,
  instructorName,
  curriculumProofHash,
  nextCourseTitle,
  nextCourseHref,
  pathwayMastery,
  onAbandon,
}: {
  courseId: string;
  courseTitle?: string;
  examTitle: string;
  passScore: number;
  questions: AcademyExamPublicQuestion[];
  sessionToken: string;
  expiresAtMs?: number;
  proofLessonKey?: string | null;
  eyebrow?: string;
  lead?: string;
  holderName?: string;
  instructorName?: string;
  curriculumProofHash?: string | null;
  nextCourseTitle?: string | null;
  nextCourseHref?: string | null;
  pathwayMastery?: AcademyPathwayMasteryView | null;
  /** Focus Chamber: oturumu iptal et; JTI tüketilmez. */
  onAbandon?: () => void;
}) {
  const router = useRouter();
  const { push } = useActionBridge();
  const copy = ACADEMY_SEN.exam;
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [proof, setProof] = useState<AcademyProofSubmission | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [timedOut, setTimedOut] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    certificateHash: string | null;
  } | null>(null);

  useEffect(() => {
    if (expiresAtMs == null || !Number.isFinite(expiresAtMs)) {
      return;
    }
    const timer = window.setInterval(() => {
      const current = Date.now();
      setNowMs(current);
      if (current >= expiresAtMs) {
        setTimedOut(true);
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [expiresAtMs]);

  const remaining = expiresAtMs ? Math.max(0, expiresAtMs - nowMs) : null;
  const clock = remaining == null ? null : formatAcademyExamRemaining(remaining);
  const urgency =
    remaining == null
      ? "calm"
      : remaining <= 60_000
        ? "rose"
        : remaining <= 5 * 60_000
          ? "amber"
          : "calm";
  const answeredCount = useMemo(
    () => questions.filter((question) => choices[question.id] != null).length,
    [choices, questions],
  );
  const activeQuestion = questions[stepIndex] ?? questions[0];
  const isLastStep = stepIndex >= questions.length - 1;

  async function onSubmit() {
    setPending(true);
    setError(null);
    const unanswered = questions.some((question) => choices[question.id] == null);
    if (!timedOut && unanswered) {
      setPending(false);
      setError(copy.unanswered);
      return;
    }
    if (!timedOut && proofLessonKey && !proof) {
      setPending(false);
      setError(copy.workProofMissing);
      return;
    }
    const answers = questions
      .filter((question) => choices[question.id] != null)
      .map((question) => ({
        questionId: question.id,
        choiceIndex: choices[question.id]!,
      }));
    const response = await fetch(
      `/api/academy/courses/${courseId}/exam`,
      await withRailSession({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          answers,
          sessionToken,
          timedOut,
          proof: proof ?? undefined,
        }),
      }),
    );
    const parsed = parseRailClientJson<{
      passed?: boolean;
      score?: number;
      certificate?: { certificateHash?: string | null; serialKey?: string };
    }>(await response.json());
    setPending(false);
    if (!parsed.ok || parsed.data.score == null || parsed.data.passed == null) {
      setError(parsed.ok ? copy.failClosed : parsed.error);
      return;
    }
    const certificateHash =
      parsed.data.certificate?.certificateHash ?? parsed.data.certificate?.serialKey ?? null;
    setResult({ passed: parsed.data.passed, score: parsed.data.score, certificateHash });
    if (parsed.data.passed) {
      push({
        title: UX_SEN.bridge.examPassed.title,
        body: UX_SEN.bridge.examPassed.body,
        href: certificateHash
          ? `/academy/dogrula/${certificateHash}`
          : UX_SEN.bridge.examHref,
        cta: UX_SEN.bridge.examPassed.cta,
        tone: "emerald",
        ttlMs: 14_000,
      });
      router.refresh();
    }
  }

  if (result?.passed) {
    return (
      <div
        className="academy-exam-chamber academy-exam-diploma-reveal space-y-5 rounded-[var(--radius-card)] border p-6 sm:p-8"
        data-academy-exam-chamber="diploma"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--safir-deep)]">
          {copy.chamberEyebrow}
        </p>
        <p className="font-serif text-2xl text-[var(--foreground)]">{copy.diplomaReveal}</p>
        <p className="text-sm text-[var(--emerald)]">{copy.passed(result.score)}</p>
        <CertificateSeal
          variant="diploma"
          hash={result.certificateHash ?? ""}
          score={result.score}
          holderName={holderName}
          courseTitle={courseTitle}
          instructorName={instructorName}
          verifyHref={
            result.certificateHash ? `/academy/dogrula/${result.certificateHash}` : UX_SEN.bridge.examHref
          }
        />
        {curriculumProofHash && courseTitle && instructorName ? (
          <ProofOfWorkCard
            model={{
              lessonTitle: courseTitle,
              courseTitle,
              instructorName,
              proofOfWorkHash: curriculumProofHash,
              kind: "curriculum",
            }}
          />
        ) : null}
        <div className="flex flex-wrap gap-3">
          <LinkButton
            href={
              result.certificateHash
                ? `/academy/dogrula/${result.certificateHash}`
                : UX_SEN.bridge.examHref
            }
            size="sm"
          >
            {copy.viewCertificate}
          </LinkButton>
          <LinkButton href={UX_SEN.bridge.examCareerHref} size="sm" variant="outline">
            {copy.careerVisa}
          </LinkButton>
          {onAbandon ? (
            <Button type="button" variant="ghost" size="sm" onClick={onAbandon} className="min-h-11">
              {copy.exitCta}
            </Button>
          ) : null}
        </div>
        <AcademyProgressionBridge
          nextTitle={nextCourseTitle}
          nextHref={nextCourseHref}
          mastery={pathwayMastery}
        />
      </div>
    );
  }

  return (
    <div
      className="academy-exam-chamber space-y-5 rounded-[var(--radius-card)] border p-6 sm:p-8"
      data-academy-exam-chamber="focus"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--safir-deep)]">
            {eyebrow ?? copy.chamberEyebrow}
          </p>
          <p className="mt-1 font-semibold text-[var(--foreground)]">{examTitle}</p>
          {lead ? <p className="mt-1 text-sm text-[var(--muted)]">{lead}</p> : null}
          <p className="text-xs text-[var(--muted)]">{copy.barajHint(passScore)}</p>
          {proofLessonKey ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{copy.workProofLead}</p>
          ) : null}
          {result && !result.passed ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{copy.retryHint}</p>
          ) : null}
        </div>
        {clock ? (
          <div className="shrink-0 text-right">
            <p
              role="timer"
              aria-live="off"
              data-urgency={urgency}
              className={`academy-exam-timer text-2xl font-semibold tabular-nums ${
                urgency === "calm" ? "text-[var(--muted)]" : ""
              }`}
            >
              {clock.mm}:{clock.ss}
            </p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {copy.remaining(clock.mm, clock.ss)}
            </p>
          </div>
        ) : null}
      </div>

      {timedOut ? <p className="text-xs text-[var(--amber)]">{copy.timedOut}</p> : null}

      <ol className="flex flex-wrap gap-2" aria-label={copy.stepOf(stepIndex + 1, questions.length)}>
        {questions.map((question, index) => {
          const answered = choices[question.id] != null;
          const active = index === stepIndex;
          return (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => setStepIndex(index)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-xs font-medium tabular-nums ${
                  active
                    ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--safir-deep)]"
                    : answered
                      ? "border-[color-mix(in_srgb,var(--safir)_40%,var(--border))] text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted)]"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {index + 1}
              </button>
            </li>
          );
        })}
      </ol>
      <p className="text-xs text-[var(--muted)]">
        {copy.stepOf(stepIndex + 1, questions.length)} · {answeredCount}/{questions.length}
      </p>

      {proofLessonKey ? (
        <InteractiveTask
          lessonKey={proofLessonKey}
          disabled={timedOut}
          onSealed={(sealed) => setProof(sealed)}
        />
      ) : null}

      {activeQuestion ? (
        <div className="space-y-3" key={activeQuestion.id}>
          <p className="text-base font-medium text-[var(--foreground)]">
            {stepIndex + 1}. {activeQuestion.prompt}
          </p>
          <div className="grid gap-2" role="radiogroup" aria-label={activeQuestion.prompt}>
            {activeQuestion.choices.map((choice, choiceIndex) => {
              const selected = choices[activeQuestion.id] === choiceIndex;
              return (
                <label
                  key={`${activeQuestion.id}-${choiceIndex}`}
                  data-selected={selected ? "true" : "false"}
                  className="academy-exam-choice flex cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3 text-sm transition-[border-color,background,box-shadow]"
                >
                  <input
                    type="radio"
                    name={activeQuestion.id}
                    checked={selected}
                    onChange={() =>
                      setChoices((current) => ({ ...current, [activeQuestion.id]: choiceIndex }))
                    }
                    disabled={timedOut}
                    className="accent-[var(--safir)]"
                  />
                  {choice}
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          disabled={stepIndex <= 0}
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
        >
          {copy.prevQuestion}
        </Button>
        {!isLastStep ? (
          <Button
            type="button"
            size="sm"
            className="min-h-11"
            onClick={() => setStepIndex((value) => Math.min(questions.length - 1, value + 1))}
          >
            {copy.nextQuestion}
          </Button>
        ) : (
          <Button type="button" onClick={() => void onSubmit()} disabled={pending} className="min-h-11">
            {pending ? copy.pending : copy.submit}
          </Button>
        )}
        {onAbandon ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-11"
            onClick={onAbandon}
            data-academy-exam-abandon=""
          >
            {copy.abandonCta}
          </Button>
        ) : null}
      </div>

      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      {result && !result.passed ? (
        <div aria-live="polite" className="space-y-3">
          <p className="text-sm text-[var(--rose)]">{copy.failed(result.score)}</p>
          <Button type="button" onClick={() => void onSubmit()} disabled={pending} className="min-h-11">
            {pending ? copy.pending : copy.submit}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
