"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { IconChevronDown } from "@/components/ui/icons";
import { LessonMediaPlayer } from "@/components/academy/lesson-media-player";
import { LessonDialogueTranscript } from "@/components/academy/lesson-dialogue-transcript";
import { LessonSyntaxCode } from "@/components/academy/lesson-syntax-code";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { ACADEMY_FIVE_ACT_HEADINGS, parseAcademyLessonActText } from "@/lib/academy/lesson-body";
import { normalizeAcronyms } from "@/lib/academy/acronym-normalizer";
import {
  buildAcademyDialogueTimeline,
  parseDialogueLine,
  type TimedDialogueTurn,
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
  academyLessonKindLabel,
  academyLessonMediaMeta,
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
  if (
    parsed.act === "warmup" ||
    parsed.act === "problem" ||
    parsed.act === "development" ||
    parsed.act === "conclusion"
  ) {
    return true;
  }
  const body = parsed.body || (parsed.heading ? "" : text);
  const paragraphs = body
    .split(/\n\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  if (paragraphs.length === 0) {
    return false;
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

type LessonCodeSnippet = {
  language: string;
  source: string;
};

function uniqueLessonCodes(
  turns: readonly TimedDialogueTurn[],
  bodyCodes: readonly LessonCodeSnippet[],
): LessonCodeSnippet[] {
  const seen = new Set<string>();
  const out: LessonCodeSnippet[] = [];
  function push(snippet: LessonCodeSnippet) {
    const source = snippet.source.trim();
    if (!source || seen.has(source)) {
      return;
    }
    seen.add(source);
    out.push({ language: snippet.language, source });
  }
  for (const turn of turns) {
    if (turn.code) {
      push({ language: turn.code.language, source: turn.code.source });
    }
  }
  for (const snippet of bodyCodes) {
    push(snippet);
  }
  return out;
}

type SurfaceDiagram = {
  diagramKey: string;
  title: string;
  caption: string;
};

function splitAcademyPlayerSurface({
  body,
  diagrams,
  microVideos,
}: {
  body: string;
  diagrams?: readonly AcademyLessonDiagramSlot[];
  microVideos?: readonly AcademyLessonMicroVideoSlot[];
}): {
  codes: LessonCodeSnippet[];
  quizPrompt: string | null;
  notes: ReactNode[];
  diagrams: SurfaceDiagram[];
  visualKey: string | null;
} {
  const visual = ACADEMY_SEN.visual;
  const blocks = composeAcademyLessonBlocks({ body, diagrams, microVideos });
  const codes: LessonCodeSnippet[] = [];
  const stageDiagrams: SurfaceDiagram[] = [];
  const notes: ReactNode[] = [];
  let quizPrompt: string | null = null;
  let visualKey: string | null = null;
  for (const [index, block] of blocks.entries()) {
    const key = `${block.kind}:${index}`;
    if (block.kind === "text") {
      const parsed = parseAcademyLessonActText(block.text);
      if (
        parsed.act === "giris" ||
        parsed.act === "assessment" ||
        textBlockIsDialogueOnly(block.text)
      ) {
        continue;
      }
      notes.push(<LessonProse key={key} text={block.text} />);
      continue;
    }
    if (block.kind === "micro-video") {
      visualKey = block.assetKey;
      continue;
    }
    if (block.kind === "diagram") {
      stageDiagrams.push({
        diagramKey: block.diagramKey,
        title: block.title,
        caption: block.caption,
      });
      continue;
    }
    if (block.kind === "params") {
      notes.push(
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
      );
      continue;
    }
    if (block.kind === "steps") {
      notes.push(
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
      );
      continue;
    }
    if (block.kind === "code") {
      codes.push({ language: block.language, source: block.source });
      continue;
    }
    if (block.kind === "exercise") {
      quizPrompt = block.prompt;
    }
  }
  return { codes, quizPrompt, notes, diagrams: stageDiagrams, visualKey };
}

function LessonWidescreenStage({
  code,
  diagram,
  visualKey,
  label,
}: {
  code: LessonCodeSnippet | null;
  diagram: SurfaceDiagram | null;
  visualKey: string | null;
  label: string;
}) {
  return (
    <div className="academy-player-widescreen" data-academy-player-stage="">
      <span className="sr-only">{label}</span>
      {code ? (
        <pre
          className="academy-player-widescreen-code"
          data-academy-code-viewer=""
          data-academy-code-active="true"
        >
          <LessonSyntaxCode language={code.language} source={code.source} />
        </pre>
      ) : diagram ? (
        <figure className="academy-player-widescreen-visual">
          <img
            src={`/media/academy/diagrams/${diagram.diagramKey}.svg`}
            alt={diagram.title}
          />
        </figure>
      ) : visualKey ? (
        <figure className="academy-player-widescreen-visual">
          <img src={`/media/academy/micro/${visualKey}.poster.svg`} alt="" />
        </figure>
      ) : (
        <div className="academy-player-widescreen-empty" />
      )}
    </div>
  );
}

function LessonQuizPanel({ prompt }: { prompt: string }) {
  return (
    <section className="academy-player-quiz" data-academy-quiz-panel="">
      <p className="px-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)] sm:px-0">
        {ACADEMY_FIVE_ACT_HEADINGS.assessment}
      </p>
      <div className="academy-player-quiz-scroll mt-2 rounded-xl border border-[var(--border)] px-4 py-3">
        <p className="whitespace-pre-wrap text-[15px] leading-6 text-[var(--foreground)]">{prompt}</p>
      </div>
    </section>
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

  const activeTitle = active ? normalizeAcronyms(active.title) : "";
  const dialogueTimeline = useMemo(
    () => buildAcademyDialogueTimeline(active?.body ?? "", courseSlug),
    [active?.body, courseSlug],
  );
  const surface = useMemo(
    () =>
      splitAcademyPlayerSurface({
        body: active?.body ?? "",
        diagrams: active?.diagrams,
        microVideos: active?.microVideos,
      }),
    [active?.body, active?.diagrams, active?.microVideos],
  );
  const lessonCodes = useMemo(
    () => uniqueLessonCodes(dialogueTimeline.turns, surface.codes),
    [dialogueTimeline.turns, surface.codes],
  );
  const stagedCode = useMemo(() => {
    for (let index = activeTurnIndex; index >= 0; index -= 1) {
      const snippet = dialogueTimeline.turns[index]?.code;
      if (snippet?.source.trim()) {
        return { language: snippet.language, source: snippet.source };
      }
    }
    return lessonCodes[0] ?? null;
  }, [activeTurnIndex, dialogueTimeline.turns, lessonCodes]);
  const showNotes =
    dialogueTimeline.turns.length > 0 || surface.notes.length > 0 || Boolean(surface.quizPrompt);

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
      className="academy-player-rail flex min-h-0 flex-col overflow-hidden max-lg:max-h-28"
      data-academy-player-playlist=""
    >
      <p className="shrink-0 px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
        {copy.playlistLabel}
      </p>
      <ol
        className="flex min-h-0 gap-2 overflow-x-auto overscroll-contain pr-1 lg:flex-1 lg:flex-col lg:space-y-1.5 lg:gap-0 lg:overflow-y-auto"
        aria-label={copy.playlistLabel}
      >
        {lessons.map((lesson) => {
          const selected = lesson.key === active?.key;
          const completed = completedKeys.has(lesson.key) || lesson.completed;
          const media = academyLessonMediaMeta({ ...lesson, courseSlug });
          const kindLabel = academyLessonKindLabel(media.kind, outline);
          return (
            <li key={lesson.key} className="max-lg:min-w-[16rem] max-lg:shrink-0">
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
                    {kindLabel} · {outline.durationMin(media.durationMin)}
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
      className="academy-player-shell grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] gap-2 overflow-hidden lg:grid-cols-[minmax(0,1fr)_19rem] lg:grid-rows-[minmax(0,1fr)] lg:gap-5"
      data-academy-player="standard"
      data-academy-player-layout="fit-screen"
    >
      {active ? (
        <>
          <div className="academy-player-main relative flex min-h-0 min-w-0 flex-col gap-2 overflow-hidden lg:col-start-1">
            <header className="shrink-0 px-1 sm:px-0">
              <h2 className="truncate text-[1.125rem] font-semibold tracking-[-0.032em] text-[var(--foreground)] sm:text-[1.375rem] sm:leading-[1.2]">
                {activeTitle}
              </h2>
            </header>
            <div className="academy-player-focus flex min-h-0 flex-1 flex-col">
              <div className="academy-player-cinema" data-academy-player-canvas="">
                <LessonWidescreenStage
                  code={stagedCode}
                  diagram={surface.diagrams[0] ?? null}
                  visualKey={surface.visualKey}
                  label={copy.codeViewerLabel}
                />
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
            </div>
            {showNotes ? (
              <details
                key={active.key}
                className="academy-player-notes shrink-0"
                data-academy-player-companion=""
                data-academy-lesson-notes=""
              >
                <summary className="academy-player-notes-summary">
                  <span>{copy.notesLabel}</span>
                  <IconChevronDown className="academy-player-notes-chevron h-4 w-4 shrink-0" />
                </summary>
                <div
                  className="academy-player-notes-body academy-player-reading-pane"
                  aria-live="polite"
                  data-academy-lesson-body=""
                >
                  {dialogueTimeline.turns.length > 0 ? (
                    <LessonDialogueTranscript
                      turns={dialogueTimeline.turns}
                      activeIndex={activeTurnIndex}
                      listening={dialoguePlaying}
                    />
                  ) : null}
                  {surface.notes.length > 0 ? (
                    <div className="academy-player-reading mt-5 flex w-full flex-col gap-6">
                      {surface.notes}
                    </div>
                  ) : null}
                  {surface.quizPrompt ? <LessonQuizPanel prompt={surface.quizPrompt} /> : null}
                </div>
              </details>
            ) : null}
            <div
              className="academy-player-dock academy-player-action-bar shrink-0 px-1 py-2 sm:px-0"
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
