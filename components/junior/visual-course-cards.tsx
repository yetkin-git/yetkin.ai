"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { LessonCover } from "@/components/junior/lesson-covers";
import { JuniorLessonCompletionBar } from "@/components/junior/lesson-completion-bar";
import { PackageInfoModal } from "@/components/junior/package-info-modal";
import { buttonClassName, type ButtonVariant } from "@/components/ui/button";
import { IconLock } from "@/components/ui/icons";
import { juniorTopicCardFace, type JuniorTopicCardTone } from "@/lib/junior/topic-face";
import { juniorShelfJumpTargets, juniorWeekJumpTargets, type JuniorShelfJump } from "@/lib/junior/units";
import type { JuniorCourseShelf, JuniorLessonCard } from "@/lib/junior/types";

/** Kartta tek cümle kalır. Devamı ders sayfasındadır. */
export function juniorOneSentence(text: string): string {
  const match = text.match(/^[\s\S]*?[.!?](?=\s|$)/u);
  return (match?.[0] ?? text).trim();
}

const TONE_CLASS: Record<JuniorTopicCardTone, string> = {
  emerald: "bg-[var(--emerald-soft)] text-[var(--emerald)]",
  amber: "bg-[var(--amber-soft)] text-[var(--amber)]",
  safir: "bg-[var(--safir-soft)] text-[var(--safir-deep)]",
  neutral: "border border-[var(--border-strong)] bg-[var(--surface-muted)] text-[var(--muted)]",
};

export function juniorTopicToneClass(tone: JuniorTopicCardTone): string {
  return TONE_CLASS[tone];
}

function lessonHeading(lesson: JuniorLessonCard): string {
  return lesson.weekHeading ?? lesson.title;
}

/** Kart altındaki küçük etiket: arşiv ya da ücretsiz ilk ders. İkisi aynı anda yoktur. */
function lessonSubLabel(lesson: JuniorLessonCard): string | null {
  return lesson.archiveLabel ?? lesson.starterLabel ?? null;
}

function CurriculumMark({ label }: { label: string | undefined }) {
  if (!label) {
    return null;
  }
  return (
    <p className="text-[11px] font-semibold text-[var(--amber)]" data-junior-curriculum-label="">
      {label}
    </p>
  );
}

/** Kapak 8/3: 4 sütunda ~92px. 2/1 kapak 1366×640 pencerede düğmeyi ekran altına itiyordu. */
export const JUNIOR_LESSON_COVER_FRAME =
  "aspect-[8/3] max-h-24 w-full shrink-0 overflow-hidden bg-[var(--surface-muted)]";
const CARD_GRID = "grid grid-cols-1 gap-2 pb-3 md:grid-cols-3 lg:grid-cols-4";
/** Açık ders ve kilit penceresi: kartın her yeri tıklanır, hover kalkışı gölgeyi taşır. */
export const JUNIOR_LESSON_CARD_SHELL =
  "flex h-full min-h-0 w-full cursor-pointer flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white text-left transition duration-150 hover:-translate-y-0.5 hover:border-[var(--safir)] hover:shadow-[var(--shadow-lift)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--safir)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";
export const JUNIOR_LESSON_CARD_STATIC =
  "flex h-full min-h-0 w-full flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white";
const CARD_COPY = "grid min-h-0 gap-0.5 px-3 pt-1";

function CardAction({ label, variant }: { label: string; variant: ButtonVariant }) {
  return (
    <div className="mt-auto shrink-0 px-3 pb-2 pt-1">
      <span data-junior-card-action="" className={buttonClassName(variant, "sm", "pointer-events-none w-full")}>
        {label}
      </span>
    </div>
  );
}

function scrollToJump(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function orderedJumps(targets: readonly JuniorShelfJump[], archiveLast: boolean): JuniorShelfJump[] {
  return [...targets].sort((left, right) => {
    if (archiveLast) {
      const leftArchive = left.id.includes("-archive-");
      const rightArchive = right.id.includes("-archive-");
      if (leftArchive !== rightArchive) {
        return leftArchive ? 1 : -1;
      }
    }
    const leftNum = Number(left.chip.match(/(\d+)/u)?.[1] ?? "0");
    const rightNum = Number(right.chip.match(/(\d+)/u)?.[1] ?? "0");
    return leftNum - rightNum;
  });
}

function JumpBar({
  label,
  targets,
  archiveLast = false,
}: {
  label: string;
  targets: readonly JuniorShelfJump[];
  archiveLast?: boolean;
}) {
  const chips = orderedJumps(targets, archiveLast);
  if (chips.length < 2) {
    return null;
  }
  return (
    <nav aria-label={label} className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((target) => (
        <button
          key={target.id}
          type="button"
          title={target.heading}
          onClick={() => scrollToJump(target.id)}
          className="shrink-0 rounded-full border border-[var(--border-strong)] bg-white px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] hover:border-[var(--safir)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--safir)]"
        >
          {target.chip}
        </button>
      ))}
    </nav>
  );
}

function TopicStatusBadges({ lesson, opener }: { lesson: JuniorLessonCard; opener: boolean }) {
  const face = juniorTopicCardFace(lesson, opener);
  if (face.destination === "locked") {
    return lesson.thisWeek ? (
      <span className="inline-flex w-fit items-center rounded-full bg-[var(--safir)] px-2 py-0.5 text-[11px] font-semibold text-white">
        Bu Haftanın Konusu
      </span>
    ) : null;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {lesson.thisWeek ? (
        <span className="inline-flex w-fit items-center rounded-full bg-[var(--safir)] px-2 py-0.5 text-[11px] font-semibold text-white">
          Bu Haftanın Konusu
        </span>
      ) : null}
      <span
        className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${juniorTopicToneClass(face.tone)}`}
      >
        {face.badge}
      </span>
    </div>
  );
}

function LockedFaceMark({ badge }: { badge: string }) {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5" aria-label={badge}>
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)]">
        <IconLock className="h-4 w-4" />
      </span>
      <span
        className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${juniorTopicToneClass("neutral")}`}
      >
        {badge}
      </span>
    </div>
  );
}

export function VisualCourseCards({
  courses,
  checkoutHref,
  priceLabel = null,
  checkoutOpen = true,
  profileId = "",
}: {
  courses: JuniorCourseShelf[];
  checkoutHref: string;
  priceLabel?: string | null;
  checkoutOpen?: boolean;
  /** LocalStorage ilerleme yüzdesi için aktif profil. */
  profileId?: string;
}) {
  const grouped = courses.length > 1;
  const [packageOpen, setPackageOpen] = useState(false);

  return (
    <div className="grid gap-3">
      {courses.map((course) => (
        <section key={course.slug} className="grid gap-1.5" aria-label={course.subject}>
          {grouped || course.outcomeTotal ? (
            <div className="grid gap-0.5">
              {grouped ? <h2 className="text-sm font-semibold tracking-tight">{course.subject}</h2> : null}
              {course.outcomeTotal ? (
                <p className="text-xs text-[var(--muted)]">
                  Yazılan çıktı {course.outcomeWritten}/{course.outcomeTotal}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="sticky top-0 z-20 grid gap-1.5 bg-[var(--background)]/95 py-1 backdrop-blur-sm">
            <JumpBar
              label={`${course.subject} üniteleri`}
              targets={juniorShelfJumpTargets(course.slug, course.lessons)}
              archiveLast
            />
            <JumpBar label={`${course.subject} haftaları`} targets={juniorWeekJumpTargets(course.slug, course.lessons)} />
          </div>
          <ol className={CARD_GRID}>
            {course.lessons.map((lesson, index) => {
              const face = juniorTopicCardFace(lesson, index === 0);
              const preparing = lesson.status === "preparing";
              const locked = face.destination === "locked" && !preparing;
              const section = juniorShelfJumpTargets(course.slug, course.lessons).find(
                (jump) => jump.lessonKey === lesson.key,
              );
              const week = juniorWeekJumpTargets(course.slug, course.lessons).find(
                (jump) => jump.lessonKey === lesson.key,
              );
              const cover = (
                <div className={JUNIOR_LESSON_COVER_FRAME}>
                  <LessonCover
                    lessonKey={lesson.key}
                    subject={course.subject}
                    title={lesson.title}
                    grade={course.grade}
                  />
                </div>
              );
              const sectionHead = section ? (
                <li id={section.id} className="col-span-full scroll-mt-28">
                  <h3 className="pt-1 text-xs font-semibold tracking-tight text-[var(--safir-deep)]">
                    {section.heading}
                  </h3>
                </li>
              ) : null;
              if (locked) {
                return (
                  <Fragment key={lesson.key}>
                    {sectionHead}
                    <li id={week?.id} className={week ? "scroll-mt-28" : undefined}>
                    <button
                      type="button"
                      className={JUNIOR_LESSON_CARD_SHELL}
                      aria-haspopup="dialog"
                      onClick={() => setPackageOpen(true)}
                    >
                      {cover}
                      <div className="flex min-h-0 items-start justify-between gap-2 px-3 py-1">
                        <div className="grid min-w-0 gap-0.5">
                          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[var(--foreground)]">
                            {lessonHeading(lesson)}
                          </h3>
                          {lessonSubLabel(lesson) ? (
                            <p className="text-[11px] font-semibold text-[var(--muted)]">{lessonSubLabel(lesson)}</p>
                          ) : null}
                          <CurriculumMark label={lesson.curriculumLabel} />
                          {lesson.shortTopicLabel ? (
                            <p className="text-[11px] font-semibold text-[var(--amber)]" data-junior-short-topic="">
                              {lesson.shortTopicLabel}
                            </p>
                          ) : null}
                          <TopicStatusBadges lesson={lesson} opener={index === 0} />
                          <p className="line-clamp-2 text-xs leading-snug text-[var(--muted)]">
                            {juniorOneSentence(lesson.teaser)}
                          </p>
                        </div>
                        <LockedFaceMark badge={face.badge} />
                      </div>
                    </button>
                    </li>
                  </Fragment>
                );
              }
              return (
                <Fragment key={lesson.key}>
                  {sectionHead}
                  <li id={week?.id} className={week ? "scroll-mt-28" : undefined}>
                  {face.action ? (
                    <Link href={`/junior/ders/${lesson.key}`} className={JUNIOR_LESSON_CARD_SHELL}>
                      {cover}
                      <div className={CARD_COPY}>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{lessonHeading(lesson)}</h3>
                        {lessonSubLabel(lesson) ? (
                          <p className="text-[11px] font-semibold leading-4 text-[var(--muted)]">{lessonSubLabel(lesson)}</p>
                        ) : null}
                        <CurriculumMark label={lesson.curriculumLabel} />
                        {lesson.shortTopicLabel ? (
                          <p className="text-[11px] font-semibold leading-4 text-[var(--amber)]" data-junior-short-topic="">
                            {lesson.shortTopicLabel}
                          </p>
                        ) : null}
                        <TopicStatusBadges lesson={lesson} opener={index === 0} />
                        <p className="line-clamp-2 text-xs leading-snug text-[var(--muted)]">
                          {juniorOneSentence(lesson.teaser)}
                        </p>
                        <JuniorLessonCompletionBar
                          profileId={profileId}
                          lessonKey={lesson.key}
                          compact
                        />
                      </div>
                      <CardAction
                        label={face.action}
                        variant={lesson.status !== "done" ? "primary" : "outline"}
                      />
                    </Link>
                  ) : (
                    <article className={JUNIOR_LESSON_CARD_STATIC}>
                      {cover}
                      <div className={`${CARD_COPY} pb-2`}>
                        <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{lessonHeading(lesson)}</h3>
                        {lessonSubLabel(lesson) ? (
                          <p className="text-[11px] font-semibold leading-4 text-[var(--muted)]">{lessonSubLabel(lesson)}</p>
                        ) : null}
                        <CurriculumMark label={lesson.curriculumLabel} />
                        {lesson.shortTopicLabel ? (
                          <p className="text-[11px] font-semibold leading-4 text-[var(--amber)]" data-junior-short-topic="">
                            {lesson.shortTopicLabel}
                          </p>
                        ) : null}
                        <TopicStatusBadges lesson={lesson} opener={index === 0} />
                        <p className="line-clamp-2 text-xs leading-snug text-[var(--muted)]">
                          {juniorOneSentence(lesson.teaser)}
                        </p>
                        <JuniorLessonCompletionBar profileId={profileId} lessonKey={lesson.key} compact />
                      </div>
                    </article>
                  )}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </section>
      ))}
      <PackageInfoModal
        open={packageOpen}
        onClose={() => setPackageOpen(false)}
        checkoutHref={checkoutHref}
        priceLabel={priceLabel}
        checkoutOpen={checkoutOpen}
      />
    </div>
  );
}
