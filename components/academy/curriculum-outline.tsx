import { Card } from "@/components/ui/card";
import { AcademyProgressBar } from "@/components/academy/progress-bar";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type { AcademySyllabus } from "@/lib/academy/curriculum-syllabus";
import { academyProgressPercent } from "@/lib/academy/lesson-meta";

export function CurriculumOutline({
  syllabus,
  passScore,
  completedKeys = [],
  showProgress = false,
}: {
  syllabus: AcademySyllabus;
  passScore: number;
  completedKeys?: readonly string[];
  showProgress?: boolean;
}) {
  const copy = ACADEMY_SEN.outline;
  const done = new Set(completedKeys);
  const completedCount = syllabus.lessons.filter((lesson) => done.has(lesson.key)).length;
  const percent = academyProgressPercent(completedCount, syllabus.lessonCount);

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title} variant="featured">
      {syllabus.lessonCount === 0 ? (
        <p>{copy.empty}</p>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-[var(--foreground)]">
            {copy.totalMeta(syllabus.lessonCount, syllabus.durationMin)}
          </p>
          {showProgress ? (
            <AcademyProgressBar value={percent} label={ACADEMY_SEN.player.progress(completedCount, syllabus.lessonCount)} />
          ) : null}
          {syllabus.modules.map((module) => (
            <section key={module.id} className="space-y-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">{module.title}</h3>
                <p className="text-xs text-[var(--muted)]">
                  {copy.moduleMeta(module.lessons.length, module.durationMin)}
                </p>
              </div>
              <ol className="space-y-1.5">
                {module.lessons.map((lesson) => {
                  const completed = done.has(lesson.key);
                  const kindLabel = lesson.kind === "video" ? copy.kindVideo : copy.kindDocument;
                  return (
                    <li
                      key={lesson.key}
                      className="flex items-start gap-3 rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--foreground)]"
                    >
                      <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-[var(--safir-soft)] text-xs font-semibold text-[var(--safir-deep)]">
                        {lesson.order}
                      </span>
                      <span className="min-w-0 flex-1 leading-6">
                        <span className="block font-medium">{lesson.title}</span>
                        <span className="mt-0.5 block text-xs text-[var(--muted)]">
                          {kindLabel} · {copy.durationMin(lesson.durationMin)}
                          {completed ? ` · ${copy.completed}` : null}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
      <p className="mt-4 text-sm text-[var(--foreground)]">{copy.exam(passScore)}</p>
      {!showProgress ? <p className="mt-2 text-xs text-[var(--muted)]">{copy.lockedHint}</p> : null}
    </Card>
  );
}
