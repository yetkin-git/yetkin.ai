"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export type CurriculumPlayerLesson = {
  key: string;
  order: number;
  title: string;
  body: string;
  completed: boolean;
  open: boolean;
};

export function CurriculumPlayer({
  courseId,
  courseSlug,
  lessons,
  completedCount,
  totalCount,
  curriculumComplete,
}: {
  courseId: string;
  courseSlug: string;
  lessons: CurriculumPlayerLesson[];
  completedCount: number;
  totalCount: number;
  curriculumComplete: boolean;
}) {
  const router = useRouter();
  const copy = ACADEMY_SEN.player;
  const firstOpen = lessons.find((lesson) => lesson.open && !lesson.completed) ?? lessons[0];
  const [activeKey, setActiveKey] = useState(firstOpen?.key ?? lessons[0]?.key ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const active = lessons.find((lesson) => lesson.key === activeKey) ?? firstOpen;

  async function onComplete(lessonKey: string) {
    setPending(true);
    setError(null);
    const response = await fetch(`/api/academy/courses/${courseId}/curriculum`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonKey }),
    });
    const body = (await response.json()) as {
      ok: boolean;
      error?: string;
      player?: { curriculumComplete?: boolean; nextLessonKey?: string | null };
    };
    setPending(false);
    if (!body.ok) {
      setError(body.error ?? copy.completeFail);
      return;
    }
    if (body.player?.nextLessonKey) {
      setActiveKey(body.player.nextLessonKey);
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <ol className="space-y-2">
        {lessons.map((lesson) => {
          const selected = lesson.key === active?.key;
          return (
            <li key={lesson.key}>
              <button
                type="button"
                disabled={!lesson.open}
                onClick={() => setActiveKey(lesson.key)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                  selected
                    ? "border-[var(--safir)] bg-[var(--safir-soft)] text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)]"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span className="block font-medium text-[var(--foreground)]">
                  {lesson.order}. {lesson.title}
                </span>
                <span className="text-xs">
                  {lesson.completed ? copy.alreadyDone : lesson.open ? copy.nextHint : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="space-y-4">
        <p className="text-xs text-[var(--muted)]">{copy.progress(completedCount, totalCount)}</p>
        {active ? (
          <>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{active.title}</h2>
            <p className="whitespace-pre-wrap leading-6 text-[var(--muted)]">{active.body}</p>
            {active.completed ? (
              <p className="text-sm text-[var(--emerald)]">{copy.alreadyDone}</p>
            ) : active.open ? (
              <Button
                type="button"
                onClick={() => void onComplete(active.key)}
                disabled={pending}
              >
                {pending ? copy.completing : copy.completeCta}
              </Button>
            ) : null}
          </>
        ) : null}
        {curriculumComplete ? (
          <div className="space-y-3 rounded-xl border border-[var(--safir-soft)] p-4">
            <p className="text-sm text-[var(--foreground)]">{copy.examReady}</p>
            <LinkButton href={`/academy/${courseSlug}`} size="sm">
              {copy.examCta}
            </LinkButton>
          </div>
        ) : null}
        {error ? (
          <p aria-live="assertive" className="text-sm text-[var(--rose)]">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
