import Link from "next/link";
import { JuniorProfileForm } from "@/components/junior/profile-form";
import { MebTrackList } from "@/components/junior/meb-track-list";
import { loadJuniorBoard } from "@/lib/junior/load";
import { getSession } from "@/lib/kernel/auth/session";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { MEB_TRACKS } from "@/lib/junior/meb-catalog";
import { GuardianShieldBanner, YouthQuestRow } from "@/components/theme/room-chrome";
import { IconShield } from "@/components/ui/icons";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

export default async function JuniorPage() {
  const session = await getSession();
  const board = session ? await loadJuniorBoard(session.id) : null;
  const copy = SEN_VOICE.junior;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href="/junior/ebeveyn" variant="outline">
            <IconShield className="h-4 w-4" />
            {copy.guardianCta}
          </LinkButton>
        }
      />
      <YouthQuestRow />
      {!session ? (
        <>
          <AuthNeeded message={copy.auth} />
          <div className="grid gap-4 md:grid-cols-2">
            {MEB_TRACKS.map((track) => (
              <Card key={track.key} variant="glass" title={track.title}>
                <Badge tone={track.band === "ortaokul" ? "emerald" : "amber"}>{track.band}</Badge>
                <p className="mt-2">{track.summary}</p>
              </Card>
            ))}
          </div>
        </>
      ) : board === null ? (
        <Card variant="glass">
          <Badge tone="amber">{copy.unboundBadge}</Badge>
          <p className="mt-2">{copy.unboundBody}</p>
        </Card>
      ) : !board.profile ? (
        <Card variant="featured" title={copy.gateTitle}>
          <JuniorProfileForm />
        </Card>
      ) : board.profile.status !== "GUARDIAN_LINKED" ? (
        <GuardianShieldBanner title={copy.pendingTitle}>
          {copy.pendingBody(board.profile.guardianUserId)}
        </GuardianShieldBanner>
      ) : (
        <MebTrackList tracks={board.tracks} allowance={board.allowance} />
      )}
      <p className="text-xs text-[var(--muted)]">
        <Link href="/junior/ebeveyn" className="font-semibold text-[var(--safir-deep)] hover:underline">
          {copy.parentLink}
        </Link>
      </p>
    </RoomFrame>
  );
}
