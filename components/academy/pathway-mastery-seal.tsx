import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { IconBadge } from "@/components/ui/icons";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";
import { academyProofHashPreview, academyVerifyPath } from "@/lib/academy/lesson-note-paths";
import type { AcademyPathwayMasteryView } from "@/lib/academy/level-pathway";

export function PathwayMasterySeal({
  mastery,
  compact = false,
  boundToHolder = false,
  showVerify = true,
}: {
  mastery: AcademyPathwayMasteryView;
  compact?: boolean;
  boundToHolder?: boolean;
  showVerify?: boolean;
}) {
  const copy = ACADEMY_SEN.verify;
  return (
    <div className="space-y-2 rounded-xl border border-[var(--gold)] bg-[var(--gold-soft)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <IconBadge className="text-[var(--gold)]" />
        <Badge tone="gold">{copy.masteryTitle}</Badge>
      </div>
      {compact ? null : (
        <p className="text-sm text-[var(--foreground)]">
          {boundToHolder ? copy.masteryBody : copy.masteryPublicBody}
        </p>
      )}
      <p className="text-xs text-[var(--muted)]">
        {copy.pathwayLabel}: {mastery.pathwayTitle}
      </p>
      <p className="break-all font-mono text-xs text-[var(--foreground)]">
        {copy.masteryHashLabel}: {academyProofHashPreview(mastery.masteryHash)}
      </p>
      {showVerify ? (
        <LinkButton href={academyVerifyPath(mastery.masteryHash)} variant="outline" size="sm">
          {ACADEMY_SEN.certificates.verifyCta}
        </LinkButton>
      ) : null}
    </div>
  );
}
