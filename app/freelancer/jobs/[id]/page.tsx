import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { BidForm } from "@/components/freelancer/bid-form";
import { AcceptBidButton } from "@/components/freelancer/accept-bid-button";
import { EscrowHoldSteps } from "@/components/freelancer/escrow-hold-steps";
import { loadJobBoard } from "@/lib/freelancer/load";
import { loadHasAcademyCareerVisa } from "@/lib/career/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { getSession } from "@/lib/kernel/auth/session";
import { HOLD_BPS_DEFAULT } from "@/lib/kernel/pricing/hold-bps";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
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
  const board = await loadJobBoard(id);
  if (!board) {
    notFound();
  }
  const session = await getSession();
  const isClient = session?.id === board.job.clientId;
  const hasAcademyVisa =
    session && !isClient && board.job.status === "OPEN"
      ? await loadHasAcademyCareerVisa(session.id)
      : true;
  const copy = SEN_VOICE.freelancer;
  const holdPercent = HOLD_BPS_DEFAULT / 100;

  return (
    <RoomFrame>
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
      </Card>
      <Card title={copy.escrow.title} eyebrow={copy.escrow.eyebrow}>
        <EscrowHoldSteps
          holdPercent={holdPercent}
          active={escrowHoldActiveStep({ contractStatus: board.contract?.status })}
        />
      </Card>
      {board.contract ? (
        <Card title={copy.job.contractTitle}>
          <Link href={`/freelancer/contracts/${board.contract.id}`} className="text-[var(--safir)] hover:underline">
            {copy.job.contractCta} ({freelancerContractStatusLabel(board.contract.status)})
          </Link>
        </Card>
      ) : null}
      <Card title={copy.job.bidsTitle}>
        {board.bids.length === 0 ? (
          <p>{copy.job.bidsEmpty}</p>
        ) : (
          <ul className="space-y-3">
            {board.bids.map((bid) => (
              <li key={bid.id} className="rounded-md border border-[var(--border)] p-3">
                <p className="font-medium text-[var(--foreground)]">
                  {formatMinor(bid.amountMinor, bid.currencyCode)} · {freelancerBidStatusLabel(bid.status)}
                </p>
                <p>{bid.coverNote}</p>
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
      {!isClient && board.job.status === "OPEN" ? (
        <Card title={copy.job.bidTitle}>
          {session ? (
            hasAcademyVisa ? (
              <BidForm jobId={board.job.id} maxMinor={board.job.budgetMinor} />
            ) : (
              <p>
                {copy.job.visaGate}{" "}
                <Link href="/career" className="text-[var(--safir)] hover:underline">
                  {copy.job.visaCta}
                </Link>
                .
              </p>
            )
          ) : (
            <p>
              {copy.job.loginLead}{" "}
              <Link href="/login" className="text-[var(--safir)] hover:underline">
                {copy.job.loginCta}
              </Link>
              .
            </p>
          )}
        </Card>
      ) : null}
    </RoomFrame>
  );
}
