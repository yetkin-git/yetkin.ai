import { VisaLedger } from "@/components/career/visa-ledger";
import { VisaScopeBoard } from "@/components/career/visa-scope-board";
import { AuthNeeded } from "@/components/ui/auth-needed";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { loadCareerBoard } from "@/lib/career/load";
import { getSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PASSPORT_SURFACE_PATH } from "@/lib/kernel/passport/types";

export default async function CareerPage() {
  const session = await getSession();
  const board = session ? await loadCareerBoard(session.id) : null;
  const stamps = board?.stamps ?? [];
  const portfolio = board?.portfolio ?? [];
  const copy = SEN_VOICE.career;

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary">
            {copy.passportCta}
          </LinkButton>
        }
      />
      {!session ? <AuthNeeded message={copy.auth} /> : null}
      {session && board === null ? (
        <p className="text-sm text-[var(--muted)]">{copy.loadSoft}</p>
      ) : null}
      <VisaLedger stamps={stamps} portfolio={portfolio} />
      <VisaScopeBoard stamps={stamps} />
      <Card variant="default" className="shadow-sm">
        <p>{copy.footnote}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary" size="sm">
            {copy.footnotePassportCta}
          </LinkButton>
          <LinkButton href="/academy/dogrula" variant="outline" size="sm">
            {copy.footnoteVerifyCta}
          </LinkButton>
          <LinkButton href="/academy" variant="outline" size="sm">
            {copy.footnoteAcademyCta}
          </LinkButton>
        </div>
      </Card>
    </RoomFrame>
  );
}
