import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BidForm } from "@/components/freelancer/bid-form";
import { AcceptBidButton } from "@/components/freelancer/accept-bid-button";
import { EscrowHoldSteps } from "@/components/freelancer/escrow-hold-steps";
import { ListingVisaScopeSign } from "@/components/career/listing-visa-scope-sign";
import { loadJobBoard } from "@/lib/freelancer/load";
import { loadListingVisaAccess } from "@/lib/career/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import { buildCitizenLoginHref } from "@/lib/kernel/auth/redirects";
import type { Route } from "next";
import {
  escrowHoldActiveStep,
  freelancerBidStatusLabel,
  freelancerContractStatusLabel,
  freelancerJobStatusLabel,
} from "@/lib/copy/status-labels";

export default async function FreelancerJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const board = await loadJobBoard(id, session?.id ?? null);
  if (!board) {
    notFound();
  }

  const isClient = board.viewerRole === "owner";
  const alreadyBid = board.viewerRole === "participant";
  const listingVisa =
    session && !isClient && board.job.status === "OPEN"
      ? await loadListingVisaAccess(session.id, {
          id: board.job.id,
          title: board.job.title,
          brief: board.job.brief,
          visaPathwayId: board.job.visaPathwayId,
        })
      : { allowed: true, code: "ok" as const, message: "" };

  const copy = SEN_VOICE.freelancer;
  const holdPercent = HOLD_BPS_DEFAULT / 100;
  const bidsEmptyCopy =
    board.viewerRole === "owner" ? copy.job.bidsEmpty : copy.job.bidsHidden;

  return (
    <RoomFrame>
      <BreadcrumbPageLabel href={`/freelancer/jobs/${board.job.id}`} label={board.job.title} />
      <PageHeader
        eyebrow={`${copy.job.eyebrow} · ${freelancerJobStatusLabel(board.job.status)}`}
        title={board.job.title}
        description={board.job.brief}
        actions={
          <LinkButton href="/freelancer" variant="outline" size="sm">
            {copy.create.backCta}
          </LinkButton>
        }
      />
      <Card>
        <p className="font-medium text-[var(--foreground)]">
          {copy.job.budgetLabel}: {formatMinor(board.job.budgetMinor, board.job.currencyCode)}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={copy.stats.barLabel}>
          <li title={copy.stats.escrowHint}>
            <Badge tone="safir" className="normal-case tracking-tight">
              {copy.stats.escrowInline}
            </Badge>
          </li>
          <li title={copy.stats.pathHint}>
            <Badge tone="emerald" className="normal-case tracking-tight">
              {copy.stats.pathInline}
            </Badge>
          </li>
          <li title={copy.stats.revisionHint}>
            <Badge tone="neutral" className="normal-case tracking-tight">
              {copy.stats.revisionInline}
            </Badge>
          </li>
        </ul>
      </Card>
      <Card title={copy.escrow.title} eyebrow={copy.escrow.eyebrow}>
        <EscrowHoldSteps
          holdPercent={holdPercent}
          active={escrowHoldActiveStep({ contractStatus: board.contract?.status })}
        />
      </Card>
      {board.contract ? (
        <Card title={copy.job.contractTitle}>
          <LinkButton href={`/freelancer/contracts/${board.contract.id}`} variant="primary" size="sm">
            {copy.job.contractCta} ({freelancerContractStatusLabel(board.contract.status)})
          </LinkButton>
        </Card>
      ) : null}
      <Card title={copy.job.bidsTitle}>
        {board.bids.length === 0 ? (
          <p>{bidsEmptyCopy}</p>
        ) : (
          <ul className="space-y-3">
            {board.bids.map((bid) => (
              <li key={bid.id} className="rounded-md border border-[var(--border)] p-3">
                <p className="font-medium text-[var(--foreground)]">
                  {formatMinor(bid.amountMinor, bid.currencyCode)} · {freelancerBidStatusLabel(bid.status)}
                </p>
                {typeof bid.coverNote === "string" ? <p>{bid.coverNote}</p> : null}
                {isClient && board.job.status === "OPEN" && bid.status === "SUBMITTED" ? (
                  <div className="mt-2">
                    <AcceptBidButton
                      jobId={board.job.id}
                      bidId={bid.id}
                      amountMinor={bid.amountMinor}
                      currencyCode={bid.currencyCode}
                      holdPercent={holdPercent}
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
      {!isClient && !alreadyBid && board.job.status === "OPEN" ? (
        <Card title={copy.job.bidTitle}>
          {session ? (
            listingVisa.allowed ? (
              <BidForm jobId={board.job.id} maxMinor={board.job.budgetMinor} />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[var(--muted)]">
                  {listingVisa.message || copy.job.visaGate}
                </p>
                <ListingVisaScopeSign
                  listing={{
                    id: board.job.id,
                    title: board.job.title,
                    brief: board.job.brief,
                    visaPathwayId: board.job.visaPathwayId,
                  }}
                />
                <LinkButton href="/career" variant="primary" size="sm">
                  {copy.job.visaCta}
                </LinkButton>
              </div>
            )
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-[var(--muted)]">{copy.job.loginLead}</p>
              <LinkButton
                href={buildCitizenLoginHref(`/freelancer/jobs/${board.job.id}`) as Route}
                variant="primary"
                size="sm"
              >
                {copy.job.loginCta}
              </LinkButton>
            </div>
          )}
        </Card>
      ) : null}
    </RoomFrame>
  );
}
