import { CAREER_SHOWCASE } from "@/lib/showcase/catalog";
import { ListingCard, Vitrine } from "@/components/showcase/listing-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconBadge } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import type { CareerPortfolioItemRecord, CareerVisaStampRecord } from "@/lib/career/types";
import {
  formatPassportIssuedAt,
  passportAcademyVerifyHref,
  passportSourceLabel,
} from "@/lib/kernel/passport/display";
import { CAREER_SEN } from "@/lib/copy/sen-voice/career";

function ProofCard({
  stamp,
  portfolioTitle,
}: {
  stamp: CareerVisaStampRecord;
  portfolioTitle: string | null;
}) {
  const verifyHref = passportAcademyVerifyHref(stamp);
  return (
    <Card variant="glass" title={stamp.title} bodyClassName="text-[var(--foreground)]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={stamp.sourceKind === "ACADEMY_CERTIFICATE" ? "safir" : "emerald"}>
          {passportSourceLabel(stamp.sourceKind)}
        </Badge>
        {verifyHref ? <Badge tone="gold">{CAREER_SEN.sealed}</Badge> : null}
      </div>
      <p className="mt-3 font-mono text-[11px] text-[var(--muted)]">{stamp.visaKey}</p>
      {stamp.certificateHash ? (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
            {CAREER_SEN.hashLabel}
          </p>
          <p className="mt-1 break-all font-mono text-xs leading-5">{stamp.certificateHash}</p>
        </div>
      ) : null}
      {portfolioTitle ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          {CAREER_SEN.proofLine}: {portfolioTitle}
        </p>
      ) : null}
      <p className="mt-2 text-xs text-[var(--muted)]">
        {CAREER_SEN.issuedLabel}: {formatPassportIssuedAt(stamp.issuedAt)}
      </p>
      {verifyHref ? (
        <div className="mt-4">
          <LinkButton href={verifyHref} variant="outline" size="sm">
            {CAREER_SEN.verifyCta}
          </LinkButton>
        </div>
      ) : null}
    </Card>
  );
}

export function ProofList({
  stamps,
  items,
  showcase = false,
}: {
  stamps: CareerVisaStampRecord[];
  items: CareerPortfolioItemRecord[];
  showcase?: boolean;
}) {
  if (stamps.length === 0) {
    if (showcase) {
      return (
        <Vitrine hint={CAREER_SEN.showcaseHint}>
          <ul className="grid gap-4 md:grid-cols-2">
            {CAREER_SHOWCASE.map((item) => (
              <li key={item.title}>
                <ListingCard
                  showcase
                  title={item.title}
                  summary={item.summary}
                  badge={item.badge}
                  meta={item.meta}
                  href="/academy"
                  cta={CAREER_SEN.academyCta}
                  icon={<IconBadge />}
                />
              </li>
            ))}
          </ul>
        </Vitrine>
      );
    }
    return (
      <Card variant="glass">
        <p>{CAREER_SEN.proofEmpty}</p>
        <div className="mt-4">
          <LinkButton href="/academy" variant="outline" size="sm">
            {CAREER_SEN.academyCta}
          </LinkButton>
        </div>
      </Card>
    );
  }

  const titleByStampId = new Map(items.map((item) => [item.visaStampId, item.title]));
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {stamps.map((stamp) => (
        <li key={stamp.id}>
          <ProofCard stamp={stamp} portfolioTitle={titleByStampId.get(stamp.id) ?? null} />
        </li>
      ))}
    </ul>
  );
}
