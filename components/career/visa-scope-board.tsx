import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";
import { buildCareerVisaScopeBoard } from "@/lib/career/visa-scope-board";
import type { CareerVisaStampRecord } from "@/lib/career/types";

export function VisaScopeBoard({ stamps }: { stamps: readonly CareerVisaStampRecord[] }) {
  const copy = CAREER_SEN.scope;
  const doors = buildCareerVisaScopeBoard(stamps);

  return (
    <Card eyebrow={copy.eyebrow} title={copy.title} className="shadow-sm">
      <p className="text-sm leading-6 text-[var(--muted)]">{copy.lead}</p>
      <ul className="mt-4 space-y-4">
        {doors.map((door) => (
          <li
            key={door.pathwayId}
            className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-3 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[var(--foreground)]">{door.pathwayTitle}</p>
              <Badge tone={door.open ? "emerald" : "neutral"}>
                {door.open ? copy.open : copy.closed}
              </Badge>
            </div>
            <ul className="mt-2 space-y-1.5">
              {door.courses.map((course) => (
                <li
                  key={course.slug}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className={course.held ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                    {course.title}
                  </span>
                  {course.held ? (
                    <Badge tone="safir">{copy.open}</Badge>
                  ) : (
                    <LinkButton href={course.href} variant="outline" size="sm">
                      {copy.missingCta}
                    </LinkButton>
                  )}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <LinkButton href="/freelancer" variant="secondary" size="sm">
          {copy.freelancerCta}
        </LinkButton>
      </div>
    </Card>
  );
}
