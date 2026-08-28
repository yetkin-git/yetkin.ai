import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractActions } from "@/components/freelancer/contract-actions";
import { ContractChatConsole } from "@/components/freelancer/contract-chat-console";
import { DeliveryHeroCard } from "@/components/freelancer/delivery-hero-card";
import { DisputeConsole } from "@/components/freelancer/dispute-console";
import { RevisionTracker } from "@/components/freelancer/revision-tracker";
import { SquadPanel } from "@/components/freelancer/squad-panel";
import { EscrowHoldSteps } from "@/components/freelancer/escrow-hold-steps";
import { loadContractBoard } from "@/lib/freelancer/load";
import { formatMinor } from "@/lib/kernel/money/format";
import { requirePageSession } from "@/lib/kernel/auth/session";
import { SEN_VOICE } from "@/lib/copy/sen-voice";
import { PageHeader, RoomFrame } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { BreadcrumbPageLabel } from "@/components/shell/header-breadcrumb";
import {
  escrowHoldActiveStep,
  escrowHoldStatusLabel,
  freelancerContractStatusLabel,
  freelancerDisputeRoundStatusLabel,
} from "@/lib/copy/status-labels";
import { pickLatestDeliveryMessage, shouldShowDeliveryHero } from "@/lib/freelancer/delivery-hero";
import {
  DEFAULT_REVISION_ALLOWANCE,
  countRevisionRequests,
  remainingRevisions,
} from "@/lib/freelancer/revision-tracker";

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
  const hasDelivery = Boolean(latestDelivery);
  const showHero = shouldShowDeliveryHero({
    contractStatus: board.contract.status,
    hasDelivery,
  });
  const revisionRemaining = remainingRevisions(
    countRevisionRequests(board.messages),
    DEFAULT_REVISION_ALLOWANCE,
  );
  const isClient = session.id === board.contract.clientId;

  return (
    <RoomFrame>
      {board.job?.title ? (
        <BreadcrumbPageLabel href={`/freelancer/contracts/${board.contract.id}`} label={board.job.title} />
      ) : null}
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
          isClient={isClient}
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
          revisionRemaining={revisionRemaining}
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
        isClient={isClient}
        status={board.contract.status}
        showRelease={!showHero}
      />
      <ContractChatConsole
        contractId={board.contract.id}
        messages={board.messages}
        revisionRemaining={revisionRemaining}
      />
      <details
        className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] bg-[var(--surface)] p-6 shadow-sm"
        {...(board.contract.status === "DISPUTED" || board.dispute ? { open: true } : {})}
      >
        <summary className="cursor-pointer text-sm font-semibold text-[var(--foreground)]">
          {copy.contract.advancedSummary}
        </summary>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy.contract.advancedHint}</p>
        <div className="mt-4 space-y-4">
          <RevisionTracker
            contractId={board.contract.id}
            isClient={isClient}
            status={board.contract.status}
            messages={board.messages}
            hasDelivery={hasDelivery}
          />
          <DisputeConsole
            contractId={board.contract.id}
            dispute={board.dispute}
            isParty={Boolean(isParty)}
            contractStatus={board.contract.status}
          />
          {board.squad ? (
            <SquadPanel
              contractId={board.contract.id}
              freelancerId={board.contract.freelancerId}
              isFreelancer={session.id === board.contract.freelancerId}
              squad={board.squad}
              members={board.squadMembers}
            />
          ) : null}
        </div>
      </details>
    </RoomFrame>
  );
}
