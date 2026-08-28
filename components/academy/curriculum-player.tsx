"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { LessonMediaPlayer } from "@/components/academy/lesson-media-player";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { parseAcademyLessonActText } from "@/lib/academy/lesson-body";
import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import type { AcademyLessonDiagramSlot, AcademyLessonMicroVideoSlot } from "@/lib/academy/lesson-media";
import {
  canAdvanceAcademyPlayerLesson,
  nextAcademyPlayerLesson,
  prevAcademyPlayerLesson,
} from "@/lib/academy/lesson-advance";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import { academyLessonResourceItems, academyLessonShortSummary } from "@/lib/academy/lesson-description";

export type CurriculumPlayerLesson = {
  key: string;
  order: number;
  title: string;
  body: string;
  completed: boolean;
  open: boolean;
  contentVersion?: string;
  completedAt?: Date | string | null;
  diagrams?: readonly AcademyLessonDiagramSlot[];
  microVideos?: readonly AcademyLessonMicroVideoSlot[];
};

function LessonProse({ text }: { text: string }) {
  const parsed = parseAcademyLessonActText(text);
  const body = parsed.body || (parsed.heading ? "" : text);
  const paragraphs = body
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return (
    <div className="academy-stage-prose w-full max-w-2xl space-y-5">
      {parsed.heading ? (
        <h3 className="text-[1.0625rem] font-semibold tracking-[-0.022em] text-[var(--foreground)]">
          {parsed.heading}
        </h3>
      ) : null}
      {paragraphs.map((paragraph, paragraphOffset) => (
        <p
          key={`${paragraphOffset}:${paragraph.slice(0, 24)}`}
          className="text-[15px] leading-[1.7] text-[color-mix(in_srgb,var(--foreground)_92%,transparent)]"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

export function CurriculumPlayer({
  courseId,
  courseSlug,
  lessons,
  curriculumComplete,
  workTasksComplete,
}: {
  courseId: string;
  courseSlug: string;
  lessons: CurriculumPlayerLesson[];
  curriculumComplete: boolean;
  workTasksComplete?: boolean;
}) {
  const router = useRouter();
  const copy = ACADEMY_SEN.player;
  const firstOpen = lessons.find((lesson) => lesson.open && !lesson.completed) ?? lessons[0];
  const [activeKey, setActiveKey] = useState(firstOpen?.key ?? lessons[0]?.key ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const active = lessons.find((lesson) => lesson.key === activeKey) ?? firstOpen;
  const examOpen = curriculumComplete && (workTasksComplete ?? curriculumComplete);
  const nextLesson = active ? nextAcademyPlayerLesson(lessons, active.key) : null;
  const prevLesson = active ? prevAcademyPlayerLesson(lessons, active.key) : null;
  const canAdvance = canAdvanceAcademyPlayerLesson(active ?? null, nextLesson);
  const canGoPrev = Boolean(prevLesson?.open);
  const canGoNext = Boolean(nextLesson && (nextLesson.open || canAdvance));

  const micro = active?.microVideos?.[0];
  const activeTitle = active ? normalizeAcronyms(active.title) : "";
  const lessonSummary = active ? academyLessonShortSummary(active.body) : "";
  const lessonResources = useMemo(
    () =>
      academyLessonResourceItems({
        diagrams: active?.diagrams,
        hasLab: false,
      }),
    [active?.diagrams],
  );

  function goToNextLesson(lessonKey: string) {
    setError(null);
    setActiveKey(lessonKey);
  }

  async function completeLesson(lessonKey: string): Promise<{ ok: boolean; nextLessonKey: string | null }> {
    setPending(true);
    setError(null);
    const response = await fetch(
      `/api/academy/courses/${courseId}/curriculum`,
      withRailApiVersion({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lessonKey }),
      }),
    );
    const parsed = parseRailClientJson<{
      player?: { curriculumComplete?: boolean; nextLessonKey?: string | null };
    }>(await response.json());
    setPending(false);
    if (!parsed.ok) {
      setError(parsed.error || copy.completeFail);
      return { ok: false, nextLessonKey: null };
    }
    const nextKey = parsed.data.player?.nextLessonKey ?? null;
    if (nextKey) {
      goToNextLesson(nextKey);
    }
    router.refresh();
    return { ok: true, nextLessonKey: nextKey };
  }

  function onPrevLesson() {
    if (!prevLesson?.open) {
      return;
    }
    setError(null);
    setActiveKey(prevLesson.key);
  }

  function onNextOrComplete() {
    if (!active) {
      return;
    }
    if (active.open && !active.completed) {
      void completeLesson(active.key);
      return;
    }
    if (nextLesson && canGoNext) {
      goToNextLesson(nextLesson.key);
    }
  }

  const primaryDisabled = pending || (!examOpen && !(active?.open && !active.completed) && !canGoNext);

  const playlist = (
    <aside
      className="academy-player-rail flex h-auto min-h-full flex-col lg:sticky lg:top-20 lg:self-start"
      data-academy-player-playlist=""
    >
      <p className="shrink-0 px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
        {copy.playlistLabel}
      </p>
      <ol className="space-y-1.5 pr-1" aria-label={copy.playlistLabel}>
        {lessons.map((lesson) => {
          const selected = lesson.key === active?.key;
          return (
            <li key={lesson.key}>
              <button
                type="button"
                disabled={!lesson.open}
                aria-current={selected ? "true" : undefined}
                onClick={() => {
                  if (lesson.key === active?.key) {
                    return;
                  }
                  setError(null);
                  setActiveKey(lesson.key);
                }}
                className={`academy-player-rail-item flex w-full items-center gap-2.5 rounded-[0.9rem] px-3.5 py-2.5 text-left text-[13px] leading-snug tracking-[-0.014em] ${
                  selected ? "academy-player-rail-item--active" : "text-[var(--muted)]"
                } disabled:cursor-not-allowed disabled:opacity-45`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    selected
                      ? "bg-[var(--safir)] shadow-[0_0_10px_var(--safir)]"
                      : lesson.completed
                        ? "bg-[var(--muted)]"
                        : "bg-transparent"
                  }`}
                />
                <span className={`block min-w-0 font-medium ${selected ? "text-white" : "text-[var(--foreground)]"}`}>
                  {lesson.order}. {normalizeAcronyms(lesson.title)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );

  return (
    <div
      className="academy-player-shell grid h-auto grid-cols-1 gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-10"
      data-academy-player="standard"
      data-academy-player-layout="player"
    >
      {active ? (
        <>
          <div className="academy-player-main relative flex h-auto min-w-0 flex-col gap-6 lg:col-start-1">
            <header className="px-1 pt-2 sm:px-0">
              <h2 className="text-[1.375rem] font-semibold tracking-[-0.032em] text-[var(--foreground)] sm:text-[1.75rem] sm:leading-[1.15]">
                {activeTitle}
              </h2>
            </header>
            <div
              className="academy-player-canvas"
              data-academy-player-canvas=""
              data-academy-player-sticky=""
            >
              <LessonMediaPlayer
                assetKey={micro?.assetKey ?? active.diagrams?.[0]?.diagramKey ?? active.key}
                videoTitle={micro?.title ?? activeTitle}
                durationSec={micro?.durationSec ?? 8}
              />
            </div>
            <article className="academy-player-companion" data-academy-player-companion="">
              <section data-academy-lesson-description="">
                <p className="px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] sm:px-0">
                  {copy.descriptionEyebrow}
                </p>
                <div className="academy-player-reading-pane mt-4 px-1 sm:px-0" aria-live="polite">
                  <div className="academy-player-reading flex w-full flex-col gap-6">
                    {lessonSummary ? (
                      <LessonProse text={lessonSummary} />
                    ) : (
                      <p className="text-[15px] text-[var(--muted)]">{copy.openCta}</p>
                    )}
                    {lessonResources.length > 0 ? (
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                          {copy.resourcesEyebrow}
                        </p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-6 text-[var(--foreground)]">
                          {lessonResources.map((resource) => (
                            <li key={resource.id}>{resource.label}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </div>
              </section>
            </article>
            <div
              className="academy-player-dock academy-player-action-bar mt-4 shrink-0 px-1 py-3 sm:px-0"
              data-academy-player-dock=""
            >
              <div className="academy-player-dock-inner flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="min-h-10 rounded-full px-4 text-[13px] font-medium"
                  data-academy-prev-lesson-cta=""
                  onClick={onPrevLesson}
                  disabled={!canGoPrev || pending}
                >
                  {copy.prevLessonCta}
                </Button>
                {examOpen ? (
                  <LinkButton
                    href={`/academy/${courseSlug}`}
                    size="sm"
                    className="min-h-10 rounded-full px-5 text-[13px]"
                    data-academy-next-lesson-cta=""
                  >
                    {copy.examCta}
                  </LinkButton>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    className="min-h-10 rounded-full px-5 text-[13px]"
                    data-academy-next-lesson-cta=""
                    onClick={onNextOrComplete}
                    disabled={primaryDisabled}
                  >
                    {pending ? copy.completing : copy.nextOrCompleteCta}
                  </Button>
                )}
              </div>
              {error ? (
                <p aria-live="assertive" className="mt-2 text-xs text-[var(--rose)]">
                  {error}
                </p>
              ) : null}
            </div>
          </div>
          {playlist}
        </>
      ) : (
        <p className="text-[15px] text-[var(--muted)]">{copy.openCta}</p>
      )}
    </div>
  );
}
