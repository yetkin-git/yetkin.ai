import { PassportStampList } from "@/components/kernel/passport-stamp-list";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { IconBadge, IconLock, IconPassport } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { getSession } from "@/lib/kernel/auth/session";
import {
  countPassportSourceKinds,
  latestPassportStamp,
  PASSPORT_UNSET_LABEL,
} from "@/lib/kernel/passport/display";
import { loadPassportBoard } from "@/lib/kernel/passport/load";
import {
  ACADEMY_STAMP_SURFACE_PATH,
  CAREER_STAMP_SURFACE_PATH,
  FREELANCER_STAMP_SURFACE_PATH,
} from "@/lib/kernel/passport/types";
import { SEN_VOICE } from "@/lib/copy/sen-voice";

function PassportShelterActions({ soft = false }: { soft?: boolean }) {
  const copy = SEN_VOICE.pasaport;
  const size = soft ? "sm" : "md";
  return (
    <div className="flex flex-wrap gap-2">
      <LinkButton href={CAREER_STAMP_SURFACE_PATH} variant="secondary" size={size}>
        {copy.careerCta}
      </LinkButton>
      <LinkButton href={ACADEMY_STAMP_SURFACE_PATH} variant="outline" size={size}>
        {copy.academyCta}
      </LinkButton>
      <LinkButton href="/academy/dogrula" variant="outline" size={size}>
        {copy.verifyCta}
      </LinkButton>
      <LinkButton href={FREELANCER_STAMP_SURFACE_PATH} variant="ghost" size={size}>
        {copy.freelancerCta}
      </LinkButton>
    </div>
  );
}

export default async function PassportPage() {
  const session = await getSession();
  const board = session ? await loadPassportBoard(session.id) : null;
  const stamps = board?.stamps ?? [];
  const latest = latestPassportStamp(stamps);
  const copy = SEN_VOICE.pasaport;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={<PassportShelterActions />}
      />
      <StatGrid
        columns={3}
        items={[
          {
            label: copy.stats.totalLabel,
            value: session ? (board ? String(stamps.length) : "—") : copy.stats.guest,
            hint: board ? copy.stats.totalHintLive : copy.stats.totalHintPending,
            icon: <IconPassport />,
          },
          {
            label: copy.stats.latestLabel,
            value: latest?.title ?? (session ? PASSPORT_UNSET_LABEL : "—"),
            hint: latest ? copy.stats.latestHintLive : copy.stats.latestHintEmpty,
            icon: <IconBadge />,
          },
          {
            label: copy.stats.sourceLabel,
            value: board ? String(countPassportSourceKinds(stamps)) : session ? copy.stats.waiting : "—",
            hint: copy.stats.sourceHint,
            icon: <IconLock />,
          },
        ]}
      />
      {!session ? (
        <AuthNeeded message={copy.auth} />
      ) : board === null ? (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">{copy.loadSoft}</p>
          <PassportShelterActions soft />
          <PassportStampList stamps={[]} />
        </div>
      ) : (
        <PassportStampList stamps={stamps} />
      )}
      <Card variant="ink" title={copy.honestyTitle} bodyClassName="text-white/70">
        {copy.honestyBody}
      </Card>
    </RoomFrame>
  );
}
