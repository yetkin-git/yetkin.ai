import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconBadge, IconBriefcase, IconEye, IconFolder } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import type { VisaScopeDoor } from "@/lib/career/visa-scope-board";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

const BENEFIT_COPY = {
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
} as const;

export function EmployerGateway({
  doors,
  publicTalentHref,
  proofCount,
}: {
  doors: readonly VisaScopeDoor[];
  publicTalentHref: string | null;
  proofCount: number;
}) {
  const copy = CAREER_SEN.gateway;
  const openCount = doors.filter((door) => door.open).length;
  const summary = [
    {
      id: "employer-network" as const,
      held: openCount > 0,
      href: publicTalentHref,
    },
    {
      id: "sealed-cv" as const,
      held: publicTalentHref != null,
      href: publicTalentHref,
    },
    {
      id: "project-proof" as const,
      held: proofCount > 0,
      href: publicTalentHref,
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{copy.eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--foreground)]">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.lead}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {summary.map((item) => {
          const meta = BENEFIT_COPY[item.id];
          const Icon = item.id === "employer-network" ? IconBriefcase : meta.icon;
          return (
            <li key={item.id}>
              <Card variant={item.held ? "featured" : "default"} title={meta.title} className="h-full shadow-sm">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Icon className="h-4 w-4 text-[var(--safir-deep)]" />
                  <Badge tone={item.held ? "emerald" : "neutral"}>
                    {item.held ? CAREER_SEN.scope.benefitReady : CAREER_SEN.scope.benefitLocked}
                  </Badge>
                </div>
                <p>{meta.body}</p>
                {item.held && item.href ? (
                  <div className="mt-4">
                    <LinkButton href={item.href as Route} variant="outline" size="sm">
                      {CAREER_SEN.scope.publicCardCta}
                    </LinkButton>
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
