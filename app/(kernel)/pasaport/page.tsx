import { PassportStampList } from "@/components/kernel/passport-stamp-list";
import { LegalColophonStrip } from "@/components/legal/legal-colophon-strip";
import { Card } from "@/components/ui/card";
import { IconBadge, IconLock, IconPassport } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { StatGrid } from "@/components/ui/stat-grid";
import { requirePageSession } from "@/lib/kernel/auth/session";
import {
  countPassportSourceKinds,
  latestPassportStamp,
  PASSPORT_UNSET_LABEL,
} from "@/lib/kernel/passport/display";
import { loadPassportBoard } from "@/lib/kernel/passport/load";
import {
  ACADEMY_CERTIFICATES_SURFACE_PATH,
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
      <LinkButton href={ACADEMY_CERTIFICATES_SURFACE_PATH} variant="outline" size={size}>
        {copy.certificatesCta}
      </LinkButton>
      <LinkButton href={FREELANCER_STAMP_SURFACE_PATH} variant="outline" size={size}>
        {copy.freelancerBoardCta}
      </LinkButton>
    </div>
  );
}

export default async function PassportPage() {
  const session = await requirePageSession();
  const board = await loadPassportBoard(session.id);
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
            value: board ? String(stamps.length) : "—",
            hint: board ? copy.stats.totalHintLive : copy.stats.totalHintPending,
            icon: <IconPassport />,
          },
          {
            label: copy.stats.latestLabel,
            value: latest?.title ?? PASSPORT_UNSET_LABEL,
            hint: latest ? copy.stats.latestHintLive : copy.stats.latestHintEmpty,
            icon: <IconBadge />,
          },
          {
            label: copy.stats.sourceLabel,
            value: board ? String(countPassportSourceKinds(stamps)) : copy.stats.waiting,
            hint: copy.stats.sourceHint,
            icon: <IconLock />,
          },
        ]}
      />
      {board === null ? (
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
      <p className="flex flex-wrap gap-2">
        <LinkButton href={ACADEMY_STAMP_SURFACE_PATH} variant="ghost" size="sm">
          {copy.academyCta}
        </LinkButton>
        <LinkButton href="/academy/dogrula" variant="ghost" size="sm">
          {copy.verifyCta}
        </LinkButton>
      </p>
      <LegalColophonStrip />
    </RoomFrame>
  );
}
