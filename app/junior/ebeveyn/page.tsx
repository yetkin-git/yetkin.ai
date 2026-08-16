import { GuardianWardPanel } from "@/components/junior/guardian-ward-panel";
import { loadGuardianWards } from "@/lib/junior/load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { GuardianShieldBanner } from "@/components/theme/room-chrome";
import { IconShield } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function JuniorParentPage() {
  const session = await requirePageSession();
  const wards = await loadGuardianWards(session.id);
  const copy = SEN_VOICE.junior.parent;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/junior" variant="outline" size="sm">
            {copy.backCta}
          </LinkButton>
        }
      />
      <GuardianShieldBanner title={copy.shieldTitle}>
        <span className="inline-flex items-center gap-2">
          <IconShield className="h-4 w-4 text-[var(--safir-deep)]" />
          {copy.shieldBody}
        </span>
      </GuardianShieldBanner>
      {wards === null ? (
        <Card variant="glass">{copy.unbound}</Card>
      ) : (
        <Card variant="featured" title={copy.wardsTitle}>
          <GuardianWardPanel wards={wards} />
        </Card>
      )}
    </RoomFrame>
  );
}
