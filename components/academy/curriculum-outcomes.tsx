import { Card } from "@/components/ui/card";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyLearningOutcomesForSlug } from "@/lib/academy/learning-outcomes";

export function CurriculumOutcomes({ slug }: { slug: string }) {
  const copy = ACADEMY_SEN.outcomes;
  const items = academyLearningOutcomesForSlug(slug);
  return (
    <Card eyebrow={copy.eyebrow} title={copy.title} variant="featured">
      {items.length === 0 ? (
        <p>{copy.empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-6 text-[var(--foreground)]">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--safir)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
