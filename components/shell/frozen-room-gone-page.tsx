import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import {
  FROZEN_DISK_ROOM_CATALOG,
  type FrozenShellRoomId,
} from "@/lib/kernel/compliance/circuit-breakers";

export function FrozenRoomGonePage({ roomId }: { roomId: FrozenShellRoomId }) {
  const room = FROZEN_DISK_ROOM_CATALOG.find((row) => row.id === roomId);
  const label = room?.label ?? "Bu oda";
  const copy = PUBLIC_SEN.gone;
  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={`${label} üretimde kapalı`}
        description={copy.description}
      />
      <p className="text-sm font-medium text-[var(--foreground)]">{copy.headline}</p>
      <p className="mt-2 text-sm text-[var(--muted)]">{copy.status}. Sahte vitrin basılmaz.</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <LinkButton href="/" variant="primary" size="sm">
          {copy.homeCta}
        </LinkButton>
        <LinkButton href="/academy" variant="outline" size="sm">
          {copy.academyCta}
        </LinkButton>
        <LinkButton href="/career" variant="outline" size="sm">
          {copy.careerCta}
        </LinkButton>
        <LinkButton href="/freelancer" variant="outline" size="sm">
          {copy.freelancerCta}
        </LinkButton>
      </div>
    </RoomFrame>
  );
}
