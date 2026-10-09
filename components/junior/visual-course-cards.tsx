"use client";

import { useState } from "react";
import { LessonCover } from "@/components/junior/lesson-covers";
import { PackageInfoModal } from "@/components/junior/package-info-modal";
import { IconLock } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { juniorTopicCardFace, type JuniorTopicCardTone } from "@/lib/junior/topic-face";
import type { JuniorCourseShelf, JuniorLessonCard } from "@/lib/junior/types";
import { juniorShelfWeekHeading } from "@/lib/junior/week";

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
}: {
  courses: JuniorCourseShelf[];
  checkoutHref: string;
  priceLabel?: string | null;
}) {
  const grouped = courses.length > 1;
  const [packageOpen, setPackageOpen] = useState(false);

  return (
    <div className="grid gap-3">
      {courses.map((course) => (
        <section key={course.slug} className="grid gap-1.5" aria-label={course.subject}>
          {grouped ? <h2 className="text-sm font-semibold tracking-tight">{course.subject}</h2> : null}
          <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {course.lessons.map((lesson, index) => {
              const face = juniorTopicCardFace(lesson, index === 0);
              const locked = face.destination === "locked";
              if (locked) {
                return (
                  <li key={lesson.key}>
                    <button
                      type="button"
                      className="flex h-full w-full flex-col gap-1.5 overflow-hidden rounded-xl border border-[var(--border)] bg-white text-left transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--safir)]"
                      aria-haspopup="dialog"
                      onClick={() => setPackageOpen(true)}
                    >
                      <div className="aspect-video w-full overflow-hidden bg-[var(--surface-muted)]">
                        <LessonCover
                          lessonKey={lesson.key}
                          subject={course.subject}
                          title={lesson.title}
                          grade={course.grade}
                        />
                      </div>
                      <div className="flex items-start justify-between gap-3 px-3 py-2">
                        <div className="min-w-0 grid gap-1.5">
                          <h3 className="text-sm font-semibold leading-5 text-[var(--foreground)]">
                            {juniorShelfWeekHeading(index + 1, lesson.title)}
                          </h3>
                          <TopicStatusBadges lesson={lesson} opener={index === 0} />
                          <p className="line-clamp-2 text-xs leading-4 text-[var(--muted)]">
                            {juniorOneSentence(lesson.teaser)}
                          </p>
                        </div>
                        <LockedFaceMark badge={face.badge} />
                      </div>
                    </button>
                  </li>
                );
              }
              return (
                <li key={lesson.key}>
                  <article className="flex h-full flex-col gap-1.5 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                    <div className="aspect-video w-full overflow-hidden bg-[var(--surface-muted)]">
                      <LessonCover
                        lessonKey={lesson.key}
                        subject={course.subject}
                        title={lesson.title}
                        grade={course.grade}
                      />
                    </div>
                    <div className="grid gap-1.5 px-3 pt-2">
                      <h3 className="text-sm font-semibold leading-5">
                        {juniorShelfWeekHeading(index + 1, lesson.title)}
                      </h3>
                      <TopicStatusBadges lesson={lesson} opener={index === 0} />
                      <p className="line-clamp-2 text-xs leading-4 text-[var(--muted)]">
                        {juniorOneSentence(lesson.teaser)}
                      </p>
                    </div>
                    {face.action ? (
                      <div className="px-3 pb-2">
                        <LinkButton
                          href={`/junior/ders/${lesson.key}`}
                          size="sm"
                          variant={lesson.status !== "done" ? "primary" : "outline"}
                          className="w-full"
                        >
                          {face.action}
                        </LinkButton>
                      </div>
                    ) : null}
                  </article>
                </li>
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
      />
    </div>
  );
}
