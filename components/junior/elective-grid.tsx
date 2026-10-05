import { juniorOneSentence } from "@/components/junior/visual-course-cards";
import { LinkButton } from "@/components/ui/link-button";
import type { JuniorCourseShelf } from "@/lib/junior/types";

export function ElectiveGrid({ courses }: { courses: JuniorCourseShelf[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const opener = course.lessons.find((lesson) => lesson.access === "free") ?? course.lessons[0];
        const week = course.lessons.find((lesson) => lesson.thisWeek) ?? null;
        if (!opener) {
          return null;
        }
        const weekIsOpener = week?.key === opener.key;
        return (
          <article
            key={course.slug}
            className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-white p-4"
          >
            {course.slug === "jr_06_ing" ? (
              <span className="inline-flex w-fit max-w-full items-center rounded-full border border-[color-mix(in_srgb,var(--safir)_35%,var(--border))] bg-[var(--safir-soft)] px-2.5 py-1 text-xs font-semibold text-[var(--safir-deep)]">
                {course.title}
              </span>
            ) : (
              <p className="text-xs font-semibold text-[var(--muted)]">{course.subject}</p>
            )}
            <h3 className="mt-1 font-semibold leading-6">
              {course.slug === "jr_06_ing" ? course.title : opener.title}
            </h3>
            {course.slug === "jr_06_ing" ? (
              <p className="mt-1 text-sm leading-6">{opener.title}</p>
            ) : null}
            {week ? (
              <p className="mt-2 text-xs font-semibold text-[var(--safir-deep)]">
                {weekIsOpener ? "Bu Haftanın Konusu" : `Bu Haftanın Konusu: ${week.title}`}
              </p>
            ) : null}
            <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">{juniorOneSentence(opener.teaser)}</p>
            <div className="mt-3">
              <LinkButton href={`/junior/ders/${opener.key}`} size="sm" className="w-full">
                Ücretsiz Başla
              </LinkButton>
            </div>
          </article>
        );
      })}
    </div>
  );
}
