import { Card } from "@/components/ui/card";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import type { AcademyCurriculumOutlineItem } from "@/lib/academy/curriculum";

export function CurriculumOutline({
  lessons,
  passScore,
}: {
  lessons: readonly AcademyCurriculumOutlineItem[];
  passScore: number;
}) {
  const copy = ACADEMY_SEN.outline;
  return (
    <Card eyebrow={copy.eyebrow} title={copy.title} variant="featured">
      {lessons.length === 0 ? (
        <p>{copy.empty}</p>
      ) : (
        <ol className="space-y-2">
          {lessons.map((lesson) => (
            <li
              key={`${lesson.order}-${lesson.title}`}
              className="flex gap-3 text-sm text-[var(--foreground)]"
            >
              <span className="mt-0.5 inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-[var(--safir-soft)] text-xs font-semibold text-[var(--safir-deep)]">
                {lesson.order}
              </span>
              <span className="leading-6">{lesson.title}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-sm text-[var(--foreground)]">{copy.exam(passScore)}</p>
      <p className="mt-2 text-sm text-[var(--foreground)]">{copy.visaPromise}</p>
      <p className="mt-2 text-xs text-[var(--muted)]">{copy.lockedHint}</p>
    </Card>
  );
}
