import type { Metadata, Route } from "next";
import { EmployerGateway } from "@/components/career/employer-gateway";
import { SealShareGuideButtons, SealShareGuides } from "@/components/career/seal-share-guides";
import { VisaLedger } from "@/components/career/visa-ledger";
import { VisaScopeBoard } from "@/components/career/visa-scope-board";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { buildCareerVisaScopeBoard } from "@/lib/career/visa-scope-board";
import {
  careerStampPublicHref,
  careerStampVerifyHref,
} from "@/lib/career/stamp-surface";
import { loadCareerBoard } from "@/lib/career/load";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PAGE_SEO, pageMetadata } from "@/lib/copy/seo";
import { FREELANCER_PUBLIC_SURFACE_LOCKED } from "@/lib/kernel/compliance/circuit-breakers";
import {
  FREELANCER_STAMP_SURFACE_PATH,
  PASSPORT_SURFACE_PATH,
} from "@/lib/kernel/passport/types";
import { JsonLd } from "@/components/seo/json-ld";
import { LandingFaq } from "@/components/seo/landing-faq";
import { faqPageJsonLd, jsonLdDocument } from "@/lib/copy/json-ld";
import { CAREER_LANDING_FAQ } from "@/lib/copy/sem-keywords";

const ACADEMY_CERTIFICATES_SURFACE_PATH = "/academy/certificates";

export const metadata: Metadata = pageMetadata(PAGE_SEO.career);

export default async function CareerPage() {
  const session = await requirePageSession();
  const board = await loadCareerBoard(session.id);
  const stamps = board?.stamps ?? [];
  const portfolio = board?.portfolio ?? [];
  const copy = SEN_VOICE.career;
  const doors = buildCareerVisaScopeBoard(stamps, portfolio);
  const featured = stamps[0] ?? null;
  const publicTalentHref = featured ? careerStampPublicHref(featured) : null;
  const shareModel =
    featured && publicTalentHref
      ? {
          talentHref: publicTalentHref,
          verifyHref: careerStampVerifyHref(featured),
          courseTitle: featured.title,
          issuedAt: featured.issuedAt.toISOString(),
          certId: featured.certificateHash ?? featured.id,
        }
      : null;

  return (
    <RoomFrame>
      <JsonLd data={jsonLdDocument([faqPageJsonLd(CAREER_LANDING_FAQ)])} />
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {publicTalentHref ? (
              <LinkButton href={publicTalentHref as Route} variant="primary" size="sm">
                {copy.publicTalentCta}
              </LinkButton>
            ) : null}
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
      <div className="flex flex-wrap gap-2">
        <SealShareGuideButtons model={shareModel} />
      </div>
      <EmployerGateway
        doors={doors}
        publicTalentHref={publicTalentHref}
        proofCount={portfolio.length}
      />
      <VisaLedger stamps={stamps} portfolio={portfolio} />
      <VisaScopeBoard stamps={stamps} portfolio={portfolio} />
      <section id="career-seal-guides" className="scroll-mt-24">
        <SealShareGuides model={shareModel} />
      </section>
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
      <LandingFaq heading={copy.faqHeading} items={CAREER_LANDING_FAQ} />
    </RoomFrame>
  );
}
