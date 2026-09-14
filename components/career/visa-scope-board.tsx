import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconBadge, IconEye, IconFolder } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { buildCareerVisaScopeBoard, type VisaScopeBenefitId } from "@/lib/career/visa-scope-board";
import type { LiveCareerStamp } from "@/lib/career/live";
import type { CareerPortfolioItemRecord } from "@/lib/career/types";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

const BENEFIT_META: Record<
  VisaScopeBenefitId,
  { title: string; body: string; icon: typeof IconEye }
> = {
  "employer-network": {
    title: CAREER_SEN.scope.benefitEmployer,
    body: CAREER_SEN.scope.benefitEmployerBody,
    icon: IconEye,
  },
  "sealed-cv": {
    title: CAREER_SEN.scope.benefitResume,
    body: CAREER_SEN.scope.benefitResumeBody,
    icon: IconBadge,
  },
  "project-proof": {
    title: CAREER_SEN.scope.benefitProof,
    body: CAREER_SEN.scope.benefitProofBody,
    icon: IconFolder,
  },
};

export function VisaScopeBoard({
  stamps,
  portfolio = [],
}: {
  stamps: readonly LiveCareerStamp[];
  portfolio?: readonly Pick<CareerPortfolioItemRecord, "visaStampId">[];
}) {
  const copy = CAREER_SEN.scope;
  const doors = buildCareerVisaScopeBoard(stamps, portfolio);

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
              <ul className="grid gap-3 sm:grid-cols-3">
                {door.benefits.map((benefit) => {
                  const meta = BENEFIT_META[benefit.id];
                  const Icon = meta.icon;
                  return (
                    <li
                      key={benefit.id}
                      className="rounded-xl border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] p-3"
                    >
                      <div className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--safir-deep)]" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--foreground)]">{meta.title}</p>
                          <Badge tone={benefit.held ? "emerald" : "neutral"} className="mt-1">
                            {benefit.held ? copy.benefitReady : copy.benefitLocked}
                          </Badge>
                          <p className="mt-2 text-xs leading-5">{meta.body}</p>
                          {benefit.held && benefit.href ? (
                            <div className="mt-2">
                              <LinkButton href={benefit.href as Route} variant="outline" size="sm">
                                {copy.publicCardCta}
                              </LinkButton>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <ul className="mt-4 space-y-2">
                {door.courses.map((course) => (
                  <li key={course.slug} className="flex flex-wrap items-center gap-2">
                    <LinkButton href={course.href as Route} variant="outline" size="sm">
                      {course.title}
                    </LinkButton>
                    <span className="text-xs text-[var(--muted)]">
                      {course.held ? copy.held : copy.examGate}
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
