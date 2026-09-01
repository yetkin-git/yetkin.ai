"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { LessonMediaPlayer } from "@/components/academy/lesson-media-player";
import { LessonDialogueTranscript } from "@/components/academy/lesson-dialogue-transcript";
import { AcademyProgressBar } from "@/components/academy/progress-bar";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { parseAcademyLessonActText } from "@/lib/academy/lesson-body";
import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import {
  buildAcademyDialogueTimeline,
  parseDialogueLine,
} from "@/lib/academy/dialogue-timeline";
import { academyDialogueSpeakerDisplayName } from "@/lib/academy/curricula/types";
import {
  composeAcademyLessonBlocks,
  type AcademyLessonDiagramSlot,
  type AcademyLessonMicroVideoSlot,
} from "@/lib/academy/lesson-media";
import {
  canAdvanceAcademyPlayerLesson,
  nextAcademyPlayerLesson,
  prevAcademyPlayerLesson,
} from "@/lib/academy/lesson-advance";
import { parseRailClientJson } from "@/lib/ui/parse-rail-json";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import {
  academyLessonContentKind,
  academyLessonDurationMin,
  academyProgressPercent,
} from "@/lib/academy/lesson-meta";

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

function parseDialogueSpeakerLine(paragraph: string): { speaker: string; text: string } | null {
  const match = parseDialogueLine(paragraph);
  if (!match) {
    return null;
  }
  return { speaker: academyDialogueSpeakerDisplayName(match.speaker), text: match.text };
}

function textBlockIsDialogueOnly(text: string): boolean {
  const parsed = parseAcademyLessonActText(text);
  const body = parsed.body || (parsed.heading ? "" : text);
  const paragraphs = body
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (paragraphs.length === 0) {
    return Boolean(parsed.act === "warmup" || parsed.act === "problem" || parsed.act === "development" || parsed.act === "conclusion");
  }
  return paragraphs.every((paragraph) => parseDialogueLine(paragraph) != null);
}

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
      {paragraphs.map((paragraph, paragraphOffset) => {
        const dialogue = parseDialogueSpeakerLine(paragraph);
        if (dialogue) {
          return (
            <div
              key={`${paragraphOffset}:${dialogue.speaker}:${dialogue.text.slice(0, 24)}`}
              className="space-y-1"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                {dialogue.speaker}
              </p>
              <p className="text-[15px] leading-[1.7] text-[color-mix(in_srgb,var(--foreground)_92%,transparent)]">
                {dialogue.text}
              </p>
            </div>
          );
        }
        return (
          <p
            key={`${paragraphOffset}:${paragraph.slice(0, 24)}`}
            className="text-[15px] leading-[1.7] text-[color-mix(in_srgb,var(--foreground)_92%,transparent)]"
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

function LessonBodyBlocks({
  body,
  diagrams,
  skipCodeSources,
}: {
  body: string;
  diagrams?: readonly AcademyLessonDiagramSlot[];
  skipCodeSources?: ReadonlySet<string>;
}) {
  const visual = ACADEMY_SEN.visual;
  const blocks = composeAcademyLessonBlocks({ body, diagrams, microVideos: [] });
  const nodes = blocks.flatMap((block, index) => {
    const key = `${block.kind}:${index}`;
    if (block.kind === "text") {
      const parsed = parseAcademyLessonActText(block.text);
      if (parsed.act === "giris" || textBlockIsDialogueOnly(block.text)) {
        return [];
      }
      return [
        <LessonProse key={key} text={block.text} />,
      ];
    }
    if (block.kind === "diagram") {
      return [
        <figure key={key} className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            {visual.diagramEyebrow}
          </p>
          <img
            src={`/media/academy/diagrams/${block.diagramKey}.svg`}
            alt={block.title}
            className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--surface)]"
          />
          {block.caption ? (
            <figcaption className="text-[13px] text-[var(--muted)]">{block.caption}</figcaption>
          ) : null}
        </figure>,
      ];
    }
    if (block.kind === "params") {
      return [
        <div key={key} className="max-w-2xl space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            {visual.paramsEyebrow}
          </p>
          <dl className="space-y-1 rounded-xl border border-[var(--border)] px-4 py-3 text-[14px]">
            {block.rows.map((row) => (
              <div key={row.label} className="flex flex-wrap justify-between gap-2">
                <dt className="text-[var(--muted)]">{row.label}</dt>
                <dd className="font-medium text-[var(--foreground)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>,
      ];
    }
    if (block.kind === "steps") {
      return [
        <div key={key} className="max-w-2xl space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            {visual.stepsEyebrow}
          </p>
          <ol className="list-decimal space-y-1.5 pl-5 text-[15px] leading-6 text-[var(--foreground)]">
            {block.items.map((item, itemIndex) => (
              <li key={`${itemIndex}:${item.slice(0, 24)}`}>{item}</li>
            ))}
          </ol>
        </div>,
      ];
    }
    if (block.kind === "code") {
      if (skipCodeSources?.has(block.source)) {
        return [];
      }
      return [
        <div key={key} className="max-w-2xl space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            {visual.codeEyebrow}
          </p>
          <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_4%,var(--surface))] p-4 text-[13px] leading-6">
            <code>{block.source}</code>
          </pre>
        </div>,
      ];
    }
    if (block.kind === "exercise") {
      return [
        <div key={key} className="max-w-2xl space-y-2 rounded-xl border border-[var(--border)] px-4 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            {visual.challengeEyebrow}
          </p>
          <p className="text-[15px] leading-6 text-[var(--foreground)]">{block.prompt}</p>
        </div>,
      ];
    }
    return [];
  });
  if (nodes.length === 0) {
    return <p className="text-[15px] text-[var(--muted)]">{ACADEMY_SEN.player.openCta}</p>;
  }
  return <div className="academy-player-reading flex w-full flex-col gap-6">{nodes}</div>;
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
  const outline = ACADEMY_SEN.outline;
  const firstOpen = lessons.find((lesson) => lesson.open && !lesson.completed) ?? lessons[0];
  const [activeKey, setActiveKey] = useState(firstOpen?.key ?? lessons[0]?.key ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [dialoguePlaying, setDialoguePlaying] = useState(false);
  const [completedKeys, setCompletedKeys] = useState(
    () => new Set(lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.key)),
  );

  useEffect(() => {
    setCompletedKeys(new Set(lessons.filter((lesson) => lesson.completed).map((lesson) => lesson.key)));
  }, [lessons]);

  const active = lessons.find((lesson) => lesson.key === activeKey) ?? firstOpen;
  const examOpen = curriculumComplete && (workTasksComplete ?? curriculumComplete);
  const nextLesson = active ? nextAcademyPlayerLesson(lessons, active.key) : null;
  const prevLesson = active ? prevAcademyPlayerLesson(lessons, active.key) : null;
  const canAdvance = canAdvanceAcademyPlayerLesson(active ?? null, nextLesson);
  const canGoPrev = Boolean(prevLesson?.open);
  const canGoNext = Boolean(nextLesson && (nextLesson.open || canAdvance));
  const activeCompleted = active ? completedKeys.has(active.key) || active.completed : false;
  const doneCount = completedKeys.size;
  const percent = academyProgressPercent(doneCount, lessons.length);

  const activeTitle = active ? normalizeAcronyms(active.title) : "";
  const dialogueTimeline = useMemo(
    () => buildAcademyDialogueTimeline(active?.body ?? "", courseSlug),
    [active?.body, courseSlug],
  );

  useEffect(() => {
    setActiveTurnIndex(0);
    setDialoguePlaying(false);
  }, [activeKey]);

  function onDialogueEnded() {
    if (!active || pending) {
      return;
    }
    if (active.open && !activeCompleted) {
      void completeLesson(active.key);
      return;
    }
    if (nextLesson && canGoNext) {
      goToNextLesson(nextLesson.key);
    }
  }

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
    setCompletedKeys((current) => {
      const next = new Set(current);
      next.add(lessonKey);
      return next;
    });
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
    if (active.open && !activeCompleted) {
      void completeLesson(active.key);
      return;
    }
    if (nextLesson && canGoNext) {
      goToNextLesson(nextLesson.key);
    }
  }

  const primaryLabel = pending
    ? copy.completing
    : examOpen
      ? copy.examCta
      : active && active.open && !activeCompleted
        ? copy.completeCta
        : copy.nextLessonCta;
  const primaryDisabled = pending || (!examOpen && !(active?.open && !activeCompleted) && !canGoNext);

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
          const completed = completedKeys.has(lesson.key) || lesson.completed;
          const kind = academyLessonContentKind(lesson);
          const durationMin = academyLessonDurationMin(lesson);
          const kindLabel = kind === "video" ? outline.kindVideo : outline.kindDocument;
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
                      : completed
                        ? "bg-[var(--muted)]"
                        : "bg-transparent"
                  }`}
                />
                <span className="min-w-0 flex-1">
                  <span className={`block font-medium ${selected ? "text-white" : "text-[var(--foreground)]"}`}>
                    {lesson.order}. {normalizeAcronyms(lesson.title)}
                  </span>
                  <span className={`block text-[11px] ${selected ? "text-white/70" : "text-[var(--muted)]"}`}>
                    {kindLabel} · {outline.durationMin(durationMin)}
                    {completed ? ` · ${copy.alreadyDone}` : ""}
                  </span>
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
            <header className="space-y-3 px-1 pt-2 sm:px-0">
              <AcademyProgressBar value={percent} label={copy.progress(doneCount, lessons.length)} />
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
                key={active.key}
                courseSlug={courseSlug}
                lessonKey={active.key}
                lessonTitle={activeTitle}
                body={active.body}
                onActiveTurnChange={setActiveTurnIndex}
                onPlayingChange={setDialoguePlaying}
                onEnded={onDialogueEnded}
              />
            </div>
            <article className="academy-player-companion" data-academy-player-companion="">
              <section data-academy-lesson-description="">
                <p className="px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] sm:px-0">
                  {dialogueTimeline.turns.length > 0 ? copy.dialogueEyebrow : copy.descriptionEyebrow}
                </p>
                <div className="academy-player-reading-pane mt-4 px-1 sm:px-0" aria-live="polite" data-academy-lesson-body="">
                  {dialogueTimeline.turns.length > 0 ? (
                    <LessonDialogueTranscript
                      turns={dialogueTimeline.turns}
                      activeIndex={activeTurnIndex}
                      listening={dialoguePlaying}
                    />
                  ) : null}
                  <LessonBodyBlocks
                    body={active.body}
                    diagrams={active.diagrams}
                    skipCodeSources={
                      new Set(
                        dialogueTimeline.turns
                          .map((turn) => turn.code?.source)
                          .filter((source): source is string => Boolean(source)),
                      )
                    }
                  />
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
                    {primaryLabel}
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
