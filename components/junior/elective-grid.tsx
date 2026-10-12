import { LessonCover } from "@/components/junior/lesson-covers";
import { juniorOneSentence, juniorTopicToneClass } from "@/components/junior/visual-course-cards";
import { LinkButton } from "@/components/ui/link-button";
import { JUNIOR_ELECTIVE_DEVELOPING_LABEL, JUNIOR_ELECTIVE_SOON_LABEL } from "@/lib/junior/limits";
import { juniorTopicCardFace } from "@/lib/junior/topic-face";
import type { JuniorCourseShelf } from "@/lib/junior/types";

export function ElectiveGrid({ courses }: { courses: JuniorCourseShelf[] }) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-3 lg:grid-cols-4">
      {courses.map((course) => {
        const openerIndex = course.lessons.findIndex((lesson) => lesson.access === "free");
        const index = openerIndex >= 0 ? openerIndex : 0;
        const opener = course.lessons[index];
        const week = course.lessons.find((lesson) => lesson.thisWeek) ?? null;
        if (!opener) {
          return null;
        }
        const weekIsOpener = week?.key === opener.key;
        const developing = opener.status === "preparing";
        const face = juniorTopicCardFace(opener, index === 0);
        const locked = face.destination === "locked" || developing;
        return (
          <article
            key={course.slug}
            className="flex h-full flex-col gap-1 overflow-hidden rounded-xl border border-[var(--border)] bg-white"
          >
            <div className="aspect-[16/9] max-h-36 w-full overflow-hidden bg-[var(--surface-muted)] sm:max-h-40">
              <LessonCover
                lessonKey={opener.key}
                subject={course.subject}
                title={opener.title}
                grade={course.grade}
              />
            </div>
            <div className="grid gap-1 px-3 py-2">
            <p className="text-[11px] font-semibold text-[var(--muted)]">{course.subject}</p>
            <h3 className="text-sm font-semibold leading-5">{opener.title}</h3>
            {course.slug === "jr_06_ing" ? (
              <p className="text-xs leading-4 text-[var(--muted)]">
                Çekirdek ders 6. Sınıf İngilizce’dir. Bu kart geliştirme aşamasındadır ve paket fiyatına girmez.
              </p>
            ) : null}
            <span
              className={`inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${juniorTopicToneClass(developing ? "neutral" : face.tone)}`}
            >
              {developing ? `${JUNIOR_ELECTIVE_SOON_LABEL} · ${JUNIOR_ELECTIVE_DEVELOPING_LABEL}` : face.badge}
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
