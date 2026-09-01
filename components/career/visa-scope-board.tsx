import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { buildCareerVisaScopeBoard } from "@/lib/career/visa-scope-board";
import type { LiveCareerStamp } from "@/lib/career/live";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

export function VisaScopeBoard({ stamps }: { stamps: readonly LiveCareerStamp[] }) {
  const copy = CAREER_SEN.scope;
  const doors = buildCareerVisaScopeBoard(stamps);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{copy.eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--foreground)]">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.lead}</p>
      </div>
      <ul className="grid gap-4">
        {doors.map((door) => (
          <li key={door.pathwayId}>
            <Card variant="default" title={door.pathwayTitle} className="shadow-sm">
              <div className="mb-3">
                <Badge tone={door.open ? "emerald" : "neutral"}>{door.open ? copy.open : copy.closed}</Badge>
              </div>
              <ul className="space-y-2">
                {door.courses.map((course) => (
                  <li key={course.slug} className="flex flex-wrap items-center gap-2">
                    <LinkButton href={course.href} variant="outline" size="sm">
                      {course.title}
                    </LinkButton>
                    <span className="text-xs text-[var(--muted)]">
                      {course.held ? copy.held : copy.missing}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
