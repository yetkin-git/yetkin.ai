import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractActions } from "@/components/freelancer/contract-actions";
import { ContractMessageThread } from "@/components/freelancer/contract-message-thread";
import { DeliveryHeroCard } from "@/components/freelancer/delivery-hero-card";
import { DisputeConsole } from "@/components/freelancer/dispute-console";
import { SquadPanel } from "@/components/freelancer/squad-panel";
import { EscrowHoldSteps } from "@/components/freelancer/escrow-hold-steps";
import { loadContractBoard } from "@/lib/freelancer/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import {
  escrowHoldActiveStep,
  escrowHoldStatusLabel,
  freelancerContractStatusLabel,
  freelancerDisputeRoundStatusLabel,
} from "@/lib/copy/status-labels";
import { pickLatestDeliveryMessage, shouldShowDeliveryHero } from "@/lib/freelancer/delivery-hero";

export default async function FreelancerContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requirePageSession();
  const board = await loadContractBoard(id);
  if (!board) {
    notFound();
  }
  const isParty =
    session.id === board.contract.clientId || session.id === board.contract.freelancerId;
  if (!isParty) {
    notFound();
  }

  const split = board.hold ?? board.contract;
  const copy = SEN_VOICE.freelancer;
  const holdPercent = split.holdBps / 100;
  const contractLabel = freelancerContractStatusLabel(board.contract.status);
  const latestDelivery = pickLatestDeliveryMessage(board.messages);
  const showHero = shouldShowDeliveryHero({
    contractStatus: board.contract.status,
    hasDelivery: Boolean(latestDelivery),
  });

  return (
    <RoomFrame>
      <PageHeader
        eyebrow={`${copy.contract.eyebrow} · ${contractLabel}`}
        title={board.job?.title ?? copy.contract.fallbackTitle}
        description={copy.escrow.steps(holdPercent)[0]?.detail}
        actions={
          <LinkButton href="/freelancer" variant="outline" size="sm">
            {copy.create.backCta}
          </LinkButton>
        }
      />
      {showHero && latestDelivery ? (
        <DeliveryHeroCard
          contractId={board.contract.id}
          isClient={session.id === board.contract.clientId}
          delivery={{
            body: latestDelivery.body,
            artifactUrl: latestDelivery.artifactUrl,
            createdAt:
              latestDelivery.createdAt instanceof Date
                ? latestDelivery.createdAt.toISOString()
                : String(latestDelivery.createdAt),
          }}
          grossMinor={split.grossMinor}
          holdMinor={split.holdMinor}
          netMinor={split.netMinor}
          currencyCode={split.currencyCode}
          holdPercent={holdPercent}
        />
      ) : null}
      <Card title={copy.escrow.title} eyebrow={copy.escrow.eyebrow}>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge tone={board.contract.status === "DISPUTED" ? "rose" : "safir"}>{contractLabel}</Badge>
          <Badge tone={board.hold?.status === "PENDING" ? "amber" : "emerald"}>
            {escrowHoldStatusLabel(board.hold?.status)}
          </Badge>
          {board.dispute ? (
            <Badge tone="violet">{freelancerDisputeRoundStatusLabel(board.dispute.roundStatus)}</Badge>
          ) : null}
        </div>
        <EscrowHoldSteps
          holdPercent={holdPercent}
          active={escrowHoldActiveStep({
            contractStatus: board.contract.status,
            holdStatus: board.hold?.status,
          })}
        />
      </Card>
      <Card title={copy.contract.splitTitle}>
        <dl className="grid gap-2 text-[var(--foreground)]">
          <div className="flex justify-between">
            <dt>{copy.contract.gross}</dt>
            <dd>{formatMinor(split.grossMinor, split.currencyCode)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{copy.contract.platformShare(holdPercent)}</dt>
            <dd>{formatMinor(split.holdMinor, split.currencyCode)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{copy.contract.freelancerShare}</dt>
            <dd>{formatMinor(split.netMinor, split.currencyCode)}</dd>
          </div>
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <dt>{copy.contract.lock}</dt>
            <dd>{escrowHoldStatusLabel(board.hold?.status)}</dd>
          </div>
        </dl>
      </Card>
      <ContractActions
        contractId={board.contract.id}
        isClient={session.id === board.contract.clientId}
        status={board.contract.status}
        showRelease={!showHero}
      />
      <ContractMessageThread contractId={board.contract.id} messages={board.messages} />
      <DisputeConsole
        contractId={board.contract.id}
        dispute={board.dispute}
        isParty={Boolean(isParty)}
        contractStatus={board.contract.status}
      />
      <SquadPanel
        contractId={board.contract.id}
        freelancerId={board.contract.freelancerId}
        isFreelancer={session.id === board.contract.freelancerId}
        squad={board.squad}
        members={board.squadMembers}
      />
    </RoomFrame>
  );
}
