import type { Metadata } from "next";
import { VisaLedger } from "@/components/career/visa-ledger";
import { VisaScopeBoard } from "@/components/career/visa-scope-board";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { loadCareerBoard } from "@/lib/career/load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { FREELANCER_PUBLIC_SURFACE_LOCKED } from "@/lib/kernel/compliance/circuit-breakers";
import {
  FREELANCER_STAMP_SURFACE_PATH,
  PASSPORT_SURFACE_PATH,
} from "@/lib/kernel/passport/types";

const ACADEMY_CERTIFICATES_SURFACE_PATH = "/academy/certificates";

export const metadata: Metadata = pageMetadata(PAGE_SEO.career);

export default async function CareerPage() {
  const session = await requirePageSession();
  const board = await loadCareerBoard(session.id);
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
          <div className="flex flex-wrap gap-2">
            <LinkButton href={PASSPORT_SURFACE_PATH} variant="secondary" size="sm">
              {copy.passportCta}
            </LinkButton>
            <LinkButton href={ACADEMY_CERTIFICATES_SURFACE_PATH} variant="outline" size="sm">
              {copy.certificatesCta}
            </LinkButton>
            {FREELANCER_PUBLIC_SURFACE_LOCKED ? null : (
              <LinkButton href={FREELANCER_STAMP_SURFACE_PATH} variant="outline" size="sm">
                {copy.freelancerBoardCta}
              </LinkButton>
            )}
          </div>
        }
      />
      {board === null ? (
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
