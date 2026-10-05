import { LinkButton } from "@/components/ui/link-button";
import { LessonCover, SubjectMark } from "@/components/junior/lesson-covers";
import type { JuniorCourseShelf } from "@/lib/junior/types";

/** Kartta tek cümle kalır. Devamı ders sayfasındadır. */
export function juniorOneSentence(text: string): string {
  const match = text.match(/^[\s\S]*?[.!?](?=\s|$)/u);
  return (match?.[0] ?? text).trim();
}

export function VisualCourseCards({ courses }: { courses: JuniorCourseShelf[] }) {
  return (
    <div className="grid gap-8">
      {courses.map((course) => (
        <section key={course.slug} className="grid gap-3">
          <div className="flex items-center gap-3">
            <SubjectMark subject={course.subject} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                {course.subject}
              </p>
              <h2 className="text-lg font-semibold">{course.title}</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {course.lessons.map((lesson) => (
              <article
                key={lesson.key}
                className="flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-white shadow-[var(--shadow-card)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <LessonCover lessonKey={lesson.key} subject={course.subject} />
                  {lesson.thisWeek ? (
                    <span className="absolute left-3 top-3 rounded-full bg-[var(--safir)] px-3 py-1 text-xs font-semibold text-white">
                      Bu Haftanın Konusu
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold">{lesson.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-[var(--muted)]">
                    {juniorOneSentence(lesson.teaser)}
                  </p>
                  <div className="mt-4">
                    {lesson.access === "free" ? (
                      <LinkButton href={`/junior/ders/${lesson.key}`} size="sm" className="w-full">
                        Ücretsiz Başla
                      </LinkButton>
                    ) : (
                      <LinkButton href={`/junior/ders/${lesson.key}`} variant="outline" size="sm" className="w-full">
                        Kilitli konu
                      </LinkButton>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
