import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { CopyVisaValue } from "@/components/kernel/copy-visa-value";
import { VisaWaxSeal } from "@/components/kernel/visa-wax-seal";
import {
  careerStampContractHref,
  careerStampCourseHref,
  careerStampVerifyHref,
} from "@/lib/career/stamp-surface";
import type { LiveCareerStamp } from "@/lib/career/live";
import type { CareerPortfolioItemRecord } from "@/lib/career/types";
import { formatPassportIssuedAt, passportSourceLabel } from "@/lib/kernel/passport/display";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

function StampCard({
  stamp,
  portfolioTitle,
}: {
  stamp: LiveCareerStamp;
  portfolioTitle: string | null;
}) {
  const academy = stamp.sourceKind === "ACADEMY_CERTIFICATE";
  const verifyHref = careerStampVerifyHref(stamp);
  const courseHref = careerStampCourseHref(stamp);
  const contractHref = careerStampContractHref(stamp);
  const hasSeal = Boolean(verifyHref || contractHref);

  return (
    <Card variant="default" title={stamp.title} bodyClassName="text-[var(--foreground)]" className="shadow-sm">
      <div className="flex items-start gap-4">
        <VisaWaxSeal sourceKind={stamp.sourceKind} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={academy ? "safir" : "emerald"}>{passportSourceLabel(stamp.sourceKind)}</Badge>
            {hasSeal ? <Badge tone="gold">{CAREER_SEN.sealed}</Badge> : null}
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            {CAREER_SEN.issuedLabel}: {formatPassportIssuedAt(stamp.issuedAt)}
          </p>
          {portfolioTitle ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {CAREER_SEN.proofLine}: {portfolioTitle}
            </p>
          ) : null}
        </div>
      </div>
      {stamp.certificateHash ? (
        <div className="mt-1">
          <CopyVisaValue value={stamp.certificateHash} label={CAREER_SEN.hashLabel} />
          <p className="mt-1 text-[11px] text-[var(--muted)]">{CAREER_SEN.hashNote}</p>
        </div>
      ) : null}
      {courseHref || contractHref || verifyHref ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {courseHref ? (
            <LinkButton href={courseHref as Route} variant="primary" size="sm">
              {CAREER_SEN.openCourseCta}
            </LinkButton>
          ) : null}
          {contractHref ? (
            <LinkButton href={contractHref as Route} variant="primary" size="sm">
              {CAREER_SEN.openContractCta}
            </LinkButton>
          ) : null}
          {verifyHref ? (
            <LinkButton href={verifyHref as Route} variant="outline" size="sm">
              {CAREER_SEN.verifyCta}
            </LinkButton>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function EmptyLedger() {
  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] px-4 py-4">
      <p>{CAREER_SEN.proofEmpty}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <LinkButton href="/academy" variant="outline" size="sm">
          {CAREER_SEN.academyCta}
        </LinkButton>
        <LinkButton href="/freelancer" variant="secondary" size="sm">
          {CAREER_SEN.freelancerCta}
        </LinkButton>
      </div>
    </div>
  );
}

export function VisaLedger({
  stamps,
  portfolio,
}: {
  stamps: readonly LiveCareerStamp[];
  portfolio?: readonly CareerPortfolioItemRecord[];
}) {
  const copy = CAREER_SEN.ledger;
  const titleByStampId = new Map((portfolio ?? []).map((item) => [item.visaStampId, item.title]));

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{copy.eyebrow}</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-[var(--foreground)]">{copy.title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.lead}</p>
      </div>
      {stamps.length === 0 ? (
        <EmptyLedger />
      ) : (
        <ul className="grid gap-4">
          {stamps.map((stamp) => (
            <li key={stamp.id}>
              <StampCard stamp={stamp} portfolioTitle={titleByStampId.get(stamp.id) ?? null} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
