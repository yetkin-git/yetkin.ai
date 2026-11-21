import { LinkButton } from "@/components/ui/link-button";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { PathwayMasterySeal } from "@/components/academy/pathway-mastery-seal";
import type { AcademyPathwayMasteryView } from "@/lib/academy/level-pathway";

export function AcademyProgressionBridge({
  nextTitle,
  nextHref,
  mastery,
}: {
  nextTitle?: string | null;
  nextHref?: string | null;
  mastery?: AcademyPathwayMasteryView | null;
}) {
  const copy = ACADEMY_SEN.bridge;
  if (mastery) {
    return (
      <div className="space-y-3 rounded-xl border border-[var(--gold)] p-4">
        <p className="text-sm text-[var(--foreground)]">{copy.masteryLead}</p>
        <PathwayMasterySeal mastery={mastery} compact boundToHolder={false} />
      </div>
    );
  }
  if (!nextTitle || !nextHref) {
    return null;
  }
  return (
    <div className="space-y-3 rounded-xl border border-[var(--safir-soft)] p-4">
      <p className="text-sm text-[var(--foreground)]">{copy.lead}</p>
      <LinkButton href={nextHref} size="sm">
        {copy.cta(nextTitle)}
      </LinkButton>
    </div>
  );
}
