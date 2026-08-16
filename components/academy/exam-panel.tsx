"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AcademyExamPublicQuestion } from "@/lib/academy/types";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export function ExamPanel({
  courseId,
  examTitle,
  passScore,
  questions,
}: {
  courseId: string;
  examTitle: string;
  passScore: number;
  questions: AcademyExamPublicQuestion[];
}) {
  const router = useRouter();
  const [choices, setChoices] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{
    passed: boolean;
    score: number;
    certificateHash: string | null;
  } | null>(null);

  async function onSubmit() {
    setPending(true);
    setError(null);
    const answers = questions.map((question) => ({
      questionId: question.id,
      choiceIndex: choices[question.id] ?? -1,
    }));
    if (answers.some((answer) => answer.choiceIndex < 0)) {
      setPending(false);
      setError(ACADEMY_SEN.exam.unanswered);
      return;
    }
    const response = await fetch(`/api/academy/courses/${courseId}/exam`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      passed?: boolean;
      score?: number;
      certificate?: { certificateHash?: string | null; serialKey?: string };
    };
    setPending(false);
    if (!body.ok || body.score == null || body.passed == null) {
      setError(body.error ?? ACADEMY_SEN.exam.failClosed);
      return;
    }
    const certificateHash = body.certificate?.certificateHash ?? body.certificate?.serialKey ?? null;
    setResult({ passed: body.passed, score: body.score, certificateHash });
    if (body.passed) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold">{examTitle}</p>
        <p className="text-xs text-[var(--muted)]">{ACADEMY_SEN.exam.barajHint(passScore)}</p>
        <p className="mt-1 text-xs text-[var(--muted)]">{ACADEMY_SEN.exam.retryHint}</p>
      </div>
      <ol className="space-y-4">
        {questions.map((question, index) => (
          <li key={question.id} className="space-y-2">
            <p className="text-sm font-medium">
              {index + 1}. {question.prompt}
            </p>
            <div className="grid gap-2">
              {question.choices.map((choice, choiceIndex) => (
                <label
                  key={`${question.id}-${choiceIndex}`}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name={question.id}
                    checked={choices[question.id] === choiceIndex}
                    onChange={() => setChoices((current) => ({ ...current, [question.id]: choiceIndex }))}
                  />
                  {choice}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <Button type="button" onClick={() => void onSubmit()} disabled={pending}>
        {pending ? ACADEMY_SEN.exam.pending : ACADEMY_SEN.exam.submit}
      </Button>
      {error ? (
        <p aria-live="assertive" className="text-sm text-[var(--rose)]">
          {error}
        </p>
      ) : null}
      {result ? (
        <div aria-live="polite" className="space-y-2">
          <p className={result.passed ? "text-sm text-[var(--emerald)]" : "text-sm text-[var(--rose)]"}>
            {result.passed ? ACADEMY_SEN.exam.passed(result.score) : ACADEMY_SEN.exam.failed(result.score)}
          </p>
          {result.passed && result.certificateHash ? (
            <p className="break-all font-mono text-xs text-[var(--muted)]">
              {ACADEMY_SEN.certificates.hashLabel}: {result.certificateHash}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
