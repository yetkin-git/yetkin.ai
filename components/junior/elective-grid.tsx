import Link from "next/link";
import { LessonCover } from "@/components/junior/lesson-covers";
import {
  JUNIOR_LESSON_CARD_SHELL,
  JUNIOR_LESSON_CARD_STATIC,
  JUNIOR_LESSON_COVER_FRAME,
  juniorOneSentence,
  juniorTopicToneClass,
} from "@/components/junior/visual-course-cards";
import { buttonClassName } from "@/components/ui/button";
import { JUNIOR_ELECTIVE_PREVIEW_BADGE } from "@/lib/junior/limits";
import { juniorTopicCardFace } from "@/lib/junior/topic-face";
import type { JuniorCourseShelf } from "@/lib/junior/types";

export function ElectiveGrid({
  courses,
  audit = false,
}: {
  courses: JuniorCourseShelf[];
  /** Super Admin veya denetçi. Kilitli ve taslak kartın incele düğmesi yalnız bu oturumda basılır. */
  audit?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 pb-3 md:grid-cols-3 lg:grid-cols-4">
      {courses.map((course) => {
        const openerIndex = course.lessons.findIndex((lesson) => lesson.access === "free");
        const index = openerIndex >= 0 ? openerIndex : 0;
        const opener = course.lessons[index];
        const week = course.lessons.find((lesson) => lesson.thisWeek) ?? null;
        if (!opener) {
          return null;
        }
        const weekIsOpener = week?.key === opener.key;
        const face = juniorTopicCardFace(opener, index === 0);
        const locked = face.destination !== "lesson" || opener.status === "preparing" || !face.action;
        const actionLabel = locked && audit ? "Admin İncele" : !locked && face.action ? face.action : null;
        const actionVariant = locked && audit ? "outline" : opener.status !== "done" ? "primary" : "outline";
        const body = (
          <>
            <div className={JUNIOR_LESSON_COVER_FRAME}>
              <LessonCover
                lessonKey={opener.key}
                subject={course.subject}
                title={opener.title}
                grade={course.grade}
              />
            </div>
            <div className={`grid min-h-0 gap-0.5 px-3 pt-1 ${actionLabel ? "" : "pb-2"}`}>
              <p className="text-[11px] font-semibold leading-4 text-[var(--muted)]">{course.subject}</p>
              <span
                data-junior-elective-preview-badge=""
                className="inline-flex w-fit items-center rounded-full bg-[var(--amber-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--amber)]"
              >
                {JUNIOR_ELECTIVE_PREVIEW_BADGE}
              </span>
              <h3 className="line-clamp-2 text-sm font-semibold leading-tight">{opener.title}</h3>
              {opener.shortTopicLabel ? (
                <p className="text-[11px] font-semibold leading-4 text-[var(--amber)]" data-junior-short-topic="">
                  {opener.shortTopicLabel}
                </p>
              ) : null}
              {course.slug === "jr_06_ing" ? (
                <p data-junior-elective-package-excluded="" className="text-xs leading-snug text-[var(--muted)]">
                  Bu kart paket vaadine girmez. Çekirdek İngilizce, 6. Sınıf İngilizce dersidir.
                </p>
              ) : null}
              <span
                className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${juniorTopicToneClass(face.tone)}`}
              >
                {face.badge}
              </span>
              {week && opener.status !== "preparing" ? (
                <p className="text-[11px] font-semibold leading-4 text-[var(--safir-deep)]">
                  {weekIsOpener ? "Bu Haftanın Konusu" : `Bu Haftanın Konusu: ${week.title}`}
                </p>
              ) : null}
              <p className="line-clamp-2 text-xs leading-snug text-[var(--muted)]">
                {juniorOneSentence(opener.teaser)}
              </p>
            </div>
            {actionLabel ? (
              <div className="mt-auto shrink-0 px-3 pb-2 pt-1">
                <span
                  data-junior-card-action=""
                  className={buttonClassName(actionVariant, "sm", "pointer-events-none w-full")}
                >
                  {actionLabel}
                </span>
              </div>
            ) : null}
          </>
        );
        if (actionLabel) {
          return (
            <Link key={course.slug} href={`/junior/ders/${opener.key}`} className={JUNIOR_LESSON_CARD_SHELL}>
              {body}
            </Link>
          );
        }
        return (
          <article key={course.slug} className={JUNIOR_LESSON_CARD_STATIC}>
            {body}
          </article>
        );
      })}
    </div>
  );
}
