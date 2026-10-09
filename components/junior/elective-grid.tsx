import { LessonCover } from "@/components/junior/lesson-covers";
import { juniorOneSentence, juniorTopicToneClass } from "@/components/junior/visual-course-cards";
import { LinkButton } from "@/components/ui/link-button";
import { juniorTopicCardFace } from "@/lib/junior/topic-face";
import type { JuniorCourseShelf } from "@/lib/junior/types";

export function ElectiveGrid({ courses }: { courses: JuniorCourseShelf[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
        const locked = face.destination === "locked";
        return (
          <article
            key={course.slug}
            className="flex h-full flex-col gap-1 overflow-hidden rounded-xl border border-[var(--border)] bg-white"
          >
            <div className="aspect-video w-full overflow-hidden bg-[var(--surface-muted)]">
              <LessonCover
                lessonKey={opener.key}
                subject={course.subject}
                title={opener.title}
                grade={course.grade}
              />
            </div>
            <div className="grid gap-1 px-3 py-2">
            {course.slug === "jr_06_ing" ? (
              <span className="inline-flex w-fit max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--safir)_35%,var(--border))] bg-[var(--safir-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--safir-deep)]">
                {course.title}
              </span>
            ) : (
              <p className="text-[11px] font-semibold text-[var(--muted)]">{course.subject}</p>
            )}
            <h3 className="text-sm font-semibold leading-5">
              {course.slug === "jr_06_ing" ? course.title : opener.title}
            </h3>
            {course.slug === "jr_06_ing" ? <p className="text-xs leading-4">{opener.title}</p> : null}
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
            <p className="line-clamp-2 flex-1 text-xs leading-4 text-[var(--muted)]">
              {juniorOneSentence(opener.teaser)}
            </p>
            </div>
            {!locked && face.action ? (
              <div className="px-3 pb-2">
                <LinkButton
                  href={`/junior/ders/${opener.key}`}
                  size="sm"
                  variant={opener.status !== "done" ? "primary" : "outline"}
                  className="w-full"
                >
                  {face.action}
                </LinkButton>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
