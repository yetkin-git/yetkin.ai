"use client";

import { useDashboardPulse } from "@/components/dashboard/dashboard-pulse-provider";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import {
  resolveNextBestAction,
  type NextBestActionKind,
} from "@/lib/dashboard/next-best-action";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

function nextBestCopy(
  kind: NextBestActionKind,
  copy: typeof SEN_VOICE.dashboard,
): { body: string; cta: string } {
  const nba = copy.nextBestAction;
  switch (kind) {
    case "freelancer_work":
      return { body: nba.freelancerWork.body, cta: nba.freelancerWork.cta };
    case "freelancer_open":
      return { body: nba.freelancerOpen.body, cta: nba.freelancerOpen.cta };
    case "career_visa":
      return { body: nba.careerVisa.body, cta: nba.careerVisa.cta };
    case "academy_continue":
      return { body: nba.academyContinue.body, cta: nba.academyContinue.cta };
    default:
      return { body: copy.featured, cta: nba.fallback.cta };
  }
}

export function NextBestActionCard() {
  const pulse = useDashboardPulse();
  const action = resolveNextBestAction(pulse);
  const copy = SEN_VOICE.dashboard;
  const personalized = nextBestCopy(action.kind, copy);

  return (
    <Card variant="featured" className="!px-4 !py-3" bodyClassName="text-[var(--foreground)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--safir-deep)]">
            {copy.nextBestAction.eyebrow}
          </p>
          <p className="text-pretty text-sm text-[var(--foreground)]">{personalized.body}</p>
        </div>
        <LinkButton href={action.href} variant="primary" size="sm" className="shrink-0 self-start sm:self-center">
          {personalized.cta}
        </LinkButton>
      </div>
    </Card>
  );
}
