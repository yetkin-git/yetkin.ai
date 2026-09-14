import type { Route } from "next";
import { CertificateShareActions } from "@/components/academy/certificate-share-actions";
import { CertificateVerifyQr } from "@/components/academy/certificate-verify-qr";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CopyVisaValue } from "@/components/kernel/copy-visa-value";
import { VisaPageFrame, VisaWaxSeal } from "@/components/kernel/visa-wax-seal";
import {
  careerStampCourseHref,
  careerStampVerifyHref,
} from "@/lib/career/stamp-surface";
import { publicTalentPath, type PublicTalentCard, type PublicTalentSeal } from "@/lib/career/public-talent";
import { formatPassportIssuedAt, passportSourceLabel } from "@/lib/kernel/passport/display";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

function SealRow({ seal, featured }: { seal: PublicTalentSeal; featured: boolean }) {
  const verifyHref = careerStampVerifyHref(seal);
  const courseHref = careerStampCourseHref(seal);
  const academy = seal.sourceKind === "ACADEMY_CERTIFICATE";

  return (
    <VisaPageFrame>
      <div className="flex items-start gap-4">
        <VisaWaxSeal sourceKind={seal.sourceKind} size={featured ? "lg" : "md"} />
        <div className="min-w-0 flex-1">
          {featured ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--gold)]">
              {CAREER_SEN.publicPage.featured}
            </p>
          ) : null}
          <h3 className="mt-1 font-serif text-xl tracking-tight text-[var(--foreground)]">{seal.title}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone={academy ? "safir" : "emerald"}>{passportSourceLabel(seal.sourceKind)}</Badge>
            {verifyHref ? <Badge tone="gold">{CAREER_SEN.sealed}</Badge> : null}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            {CAREER_SEN.issuedLabel}: {formatPassportIssuedAt(seal.issuedAt)}
          </p>
        </div>
      </div>
      {seal.certificateHash ? (
        <div className="mt-4">
          <CopyVisaValue value={seal.certificateHash} label={CAREER_SEN.hashLabel} />
          <p className="mt-1 text-[11px] text-[var(--muted)]">{CAREER_SEN.hashNote}</p>
        </div>
      ) : null}
      {seal.certificateHash && academy ? <CertificateVerifyQr hash={seal.certificateHash} /> : null}
      {courseHref || verifyHref ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {courseHref ? (
            <LinkButton href={courseHref as Route} variant="outline" size="sm">
              {CAREER_SEN.publicPage.openCourseCta}
            </LinkButton>
          ) : null}
          {verifyHref ? (
            <LinkButton href={verifyHref as Route} variant="primary" size="sm">
              {CAREER_SEN.publicPage.verifyCta}
            </LinkButton>
          ) : null}
        </div>
      ) : null}
      {academy && seal.certificateHash ? (
        <div className="mt-3">
          <CertificateShareActions hash={seal.certificateHash} courseTitle={seal.title} showLead />
        </div>
      ) : null}
    </VisaPageFrame>
  );
}

export function PublicTalentBoard({ card }: { card: PublicTalentCard }) {
  const copy = CAREER_SEN.publicPage;
  const otherSeals = card.seals.filter((seal) => seal.id !== card.featured.id);

  return (
    <div className="space-y-6">
      <SealRow seal={card.featured} featured />
      {otherSeals.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{copy.sealsTitle}</h2>
          <ul className="grid gap-4">
            {otherSeals.map((seal) => (
              <li key={seal.id}>
                <SealRow seal={seal} featured={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <Card title={copy.proofsTitle}>
        {card.proofs.length === 0 ? (
          <p>{copy.proofEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {card.proofs.map((proof) => (
              <li key={`${proof.visaStampId}:${proof.title}`} className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-[var(--foreground)]">{proof.title}</span>
                <LinkButton href={publicTalentPath(proof.visaStampId) as Route} variant="outline" size="sm">
                  {CAREER_SEN.scope.publicCardCta}
                </LinkButton>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <p className="text-xs text-[var(--muted)]">{copy.privacy}</p>
    </div>
  );
}
