import { IdentityCard } from "@/components/kernel/identity-card";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IconBadge, IconLock, IconUser } from "@/components/ui/icons";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { getSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";
import { PROFILE_UNSET_LABEL, profileDisplayName } from "@/lib/kernel/identity/display";

export default async function ProfilePage() {
  const session = await getSession();
  const board = session ? await loadIdentityBoard(session.id) : null;
  const profile = board?.user ?? null;
  const headline = profile ? profileDisplayName(profile.displayName) : PROFILE_UNSET_LABEL;
  const copy = SEN_VOICE.profil;

  return (
    <RoomFrame>
      <PageHeader eyebrow={copy.eyebrow} title={copy.title} description={copy.description} />
      <StatGrid
        columns={3}
        items={[
          {
            label: copy.stats.nameLabel,
            value: session ? headline : copy.stats.guest,
            hint: profile?.displayName?.trim() ? copy.stats.nameHintSet : copy.stats.nameHintEmpty,
            icon: <IconUser />,
          },
          {
            label: copy.stats.localeLabel,
            value: profile?.locale ?? (session ? PROFILE_UNSET_LABEL : "—"),
            hint: profile ? profile.timeZone : copy.stats.localeHint,
            icon: <IconLock />,
          },
          {
            label: copy.stats.joinedLabel,
            value: profile ? String(profile.createdAt.getFullYear()) : session ? copy.stats.waiting : "—",
            hint: profile ? copy.stats.joinedHintLive : copy.stats.joinedHintPending,
            icon: <IconBadge />,
          },
        ]}
      />
      {!session ? (
        <AuthNeeded message={copy.auth} />
      ) : board === null ? (
        <div className="space-y-3">
          <Badge tone="amber">{copy.unboundBadge}</Badge>
          <p className="text-sm text-[var(--muted)]">{copy.unboundBody}</p>
          <IdentityCard profile={null} sessionEmail={session.email} />
        </div>
      ) : profile === null ? (
        <div className="space-y-3">
          <Badge tone="amber">{copy.missingBadge}</Badge>
          <p className="text-sm text-[var(--muted)]">{copy.missingBody}</p>
          <IdentityCard profile={null} sessionEmail={session.email} />
        </div>
      ) : (
        <IdentityCard profile={profile} sessionEmail={session.email} />
      )}
      <Card variant="ink" title={copy.honestyTitle} bodyClassName="text-white/70">
        {copy.honestyBody}
      </Card>
    </RoomFrame>
  );
}
