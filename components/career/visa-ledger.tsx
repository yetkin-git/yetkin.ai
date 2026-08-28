import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { CopyVisaValue } from "@/components/kernel/copy-visa-value";
import { VisaWaxSeal } from "@/components/kernel/visa-wax-seal";
import type { CareerPortfolioItemRecord, CareerVisaStampRecord } from "@/lib/career/types";
import {
  careerStampContractHref,
  careerStampCourseHref,
  careerStampVerifyHref,
} from "@/lib/career/stamp-surface";
import {
  formatPassportIssuedAt,
  passportSourceLabel,
} from "@/lib/kernel/passport/display";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

function VisaLedgerCard({
  stamp,
  portfolioTitle,
}: {
  stamp: CareerVisaStampRecord;
  portfolioTitle: string | null;
}) {
  const verifyHref = careerStampVerifyHref(stamp);
  const courseHref = careerStampCourseHref(stamp);
  const contractHref = careerStampContractHref(stamp);
  const academy = stamp.sourceKind === "ACADEMY_CERTIFICATE";
  const hasSeal = Boolean(verifyHref || contractHref);
  return (
    <Card variant="default" title={stamp.title} bodyClassName="text-[var(--foreground)]" className="shadow-sm">
      <div className="flex items-start gap-4">
        <VisaWaxSeal sourceKind={stamp.sourceKind} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={academy ? "safir" : "emerald"}>
              {passportSourceLabel(stamp.sourceKind)}
            </Badge>
            {hasSeal ? <Badge tone="gold">{CAREER_SEN.sealed}</Badge> : null}
          </div>
          <p className="mt-3 text-sm font-medium text-[var(--safir-deep)]">{CAREER_SEN.doorHint}</p>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {CAREER_SEN.issuedLabel}: {formatPassportIssuedAt(stamp.issuedAt)}
          </p>
          {portfolioTitle ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {CAREER_SEN.proofLine}: {portfolioTitle}
            </p>
          ) : null}
        </div>
      </div>
      <CopyVisaValue value={stamp.visaKey} label={CAREER_SEN.copyVisa} />
      {stamp.certificateHash ? (
        <div className="mt-1">
          <CopyVisaValue value={stamp.certificateHash} label={CAREER_SEN.hashLabel} />
          <p className="mt-1 text-[11px] text-[var(--muted)]">{CAREER_SEN.hashNote}</p>
        </div>
      ) : null}
      {courseHref || contractHref || verifyHref ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {courseHref ? (
            <LinkButton href={courseHref} variant="primary" size="sm">
              {CAREER_SEN.openCourseCta}
            </LinkButton>
          ) : null}
          {contractHref ? (
            <LinkButton href={contractHref} variant="primary" size="sm">
              {CAREER_SEN.openContractCta}
            </LinkButton>
          ) : null}
          {verifyHref ? (
            <LinkButton href={verifyHref} variant="outline" size="sm">
              {CAREER_SEN.verifyCta}
            </LinkButton>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function EmptyVisaLedger({ message }: { message: string }) {
  return (
    <Card variant="default" className="shadow-sm">
      <p>{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <LinkButton href="/academy" variant="outline" size="sm">
          {CAREER_SEN.academyCta}
        </LinkButton>
        <LinkButton href="/freelancer" variant="secondary" size="sm">
          {CAREER_SEN.freelancerCta}
        </LinkButton>
      </div>
    </Card>
  );
}

/** Akademi sertifikaları + Freelancer teslim mühürleri — Quiet Luxury liyakat defteri. */
export function VisaLedger({
  stamps,
  items,
}: {
  stamps: CareerVisaStampRecord[];
  items: CareerPortfolioItemRecord[];
}) {
  if (stamps.length === 0) {
    return <EmptyVisaLedger message={CAREER_SEN.proofEmpty} />;
  }

  const titleByStampId = new Map(items.map((item) => [item.visaStampId, item.title]));
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {stamps.map((stamp) => (
        <li key={stamp.id}>
          <VisaLedgerCard stamp={stamp} portfolioTitle={titleByStampId.get(stamp.id) ?? null} />
        </li>
      ))}
    </ul>
  );
}
