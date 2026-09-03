import { IdentityCard } from "@/components/kernel/identity-card";
import { IdentityMeritSummary } from "@/components/kernel/identity-merit-summary";
import { ProfileBillingForm } from "@/components/kernel/profile-billing-form";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { IconBadge, IconLock, IconUser } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { getSession } from "@/lib/kernel/auth/session";
import { loadIdentityBoard } from "@/lib/kernel/identity/load";
import { PROFILE_UNSET_LABEL, profileDisplayName } from "@/lib/kernel/identity/display";
import { WALLET_SURFACE_PATH } from "@/lib/kernel/identity/types";
import { loadPassportBoard } from "@/lib/kernel/passport/load";
import { CAREER_STAMP_SURFACE_PATH, PASSPORT_SURFACE_PATH } from "@/lib/kernel/passport/types";

function ProfileShelterActions({ size = "sm" }: { size?: "sm" | "md" }) {
  const copy = SEN_VOICE.profil;
  return (
    <>
      <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary" size={size}>
        {copy.passportCta}
      </LinkButton>
      <LinkButton href={WALLET_SURFACE_PATH} variant="outline" size={size}>
        {copy.walletCta}
      </LinkButton>
      <LinkButton href={CAREER_STAMP_SURFACE_PATH} variant="ghost" size={size}>
        {copy.careerCta}
      </LinkButton>
    </>
  );
}

export default async function ProfilePage() {
  const session = await getSession();
  const [board, passportBoard] = session
    ? await Promise.all([loadIdentityBoard(session.id), loadPassportBoard(session.id)])
    : [null, null];
  const profile = board?.user ?? null;
  const headline = profile ? profileDisplayName(profile.displayName) : PROFILE_UNSET_LABEL;
  const copy = SEN_VOICE.profil;
  const stamps = passportBoard?.stamps ?? [];
  const meritSoft = Boolean(session && passportBoard === null);

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={<ProfileShelterActions />}
      />
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
          <p className="text-sm text-[var(--muted)]">{copy.loadSoft}</p>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/dashboard" variant="outline" size="sm">
              {copy.dashboardCta}
            </LinkButton>
            <ProfileShelterActions />
          </div>
          <IdentityMeritSummary stamps={[]} soft />
          <IdentityCard profile={null} sessionEmail={session.email} />
        </div>
      ) : profile === null ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">{copy.missingSoft}</p>
          <div className="flex flex-wrap gap-2">
            <ProfileShelterActions />
          </div>
          <IdentityMeritSummary stamps={stamps} soft={meritSoft} />
          <IdentityCard profile={null} sessionEmail={session.email} />
        </div>
      ) : (
        <div className="space-y-6">
          <IdentityMeritSummary stamps={stamps} soft={meritSoft} />
          <IdentityCard profile={profile} sessionEmail={session.email} />
          <ProfileBillingForm />
        </div>
      )}
      <Card variant="ink" title={copy.honestyTitle} bodyClassName="text-white/70">
        {copy.honestyBody}
      </Card>
    </RoomFrame>
  );
}
