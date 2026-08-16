import { randomUUID } from "node:crypto";
import {
  ARENA_EVALUATION_WINDOW_MS,
  ARENA_SUBMISSION_WINDOW_MS,
  ARENA_MODULE_KEY,
  ARENA_TENDER_FLOOR_UNIT_KEY,
  type ArenaAwardRecord,
  type ArenaStore,
  type ArenaSubmissionRecord,
  type ArenaTenderRecord,
  type ArenaWinnerShare,
} from "@/lib/arena/types";
import {
  arenaTenderReferenceKey,
  canAwardTender,
  canRefundTender,
  canSubmitToTender,
} from "@/lib/arena/fsm";
import {
  createEscrowHold,
  refundEscrowHold,
  releaseEscrowHoldToPayees,
  resolvePlatformTreasuryUserId,
  type EscrowStore,
} from "@/lib/kernel/escrow";
import type { LedgerStore } from "@/lib/kernel/ledger/types";
import { SETTLEMENT_CURRENCY, type CurrencyCode } from "@/lib/kernel/money/currency";
import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import { HOLD_BPS_DEFAULT, resolveHoldBps } from "@/lib/kernel/pricing/hold-bps";
import type { PriceCatalogStore } from "@/lib/kernel/pricing/catalog";
import {
  assertAmountWithinCatalogBand,
  requireActiveCatalogEntry,
} from "@/lib/kernel/pricing/catalog-band";

export type ArenaEnginePorts = {
  ledger: LedgerStore;
  escrow: EscrowStore;
  catalog: PriceCatalogStore;
  arena: ArenaStore;
};

export type OpenTenderCommand = {
  sponsorUserId: string;
  title: string;
  brief: string;
  prizePoolMinor: number;
  companyId?: string | null;
  holdBps?: number;
  currencyCode?: CurrencyCode;
  submissionWindowMs?: number;
  evaluationWindowMs?: number;
  now?: Date;
};

export type SubmitProposalCommand = {
  tenderId: string;
  submitterId: string;
  proposal: string;
  now?: Date;
};

export type AwardTenderCommand = {
  tenderId: string;
  actorUserId: string;
  winners: ArenaWinnerShare[];
  platformUserId?: string;
  now?: Date;
};

export type TenderActorCommand = {
  tenderId: string;
  actorUserId?: string;
  platformUserId?: string;
  now?: Date;
};

export async function openArenaTender(
  ports: ArenaEnginePorts,
  command: OpenTenderCommand,
): Promise<ArenaTenderRecord> {
  const catalog = await requireActiveCatalogEntry(
    ports.catalog,
    ARENA_MODULE_KEY,
    ARENA_TENDER_FLOOR_UNIT_KEY,
  );
  const prizePoolMinor = assertAmountWithinCatalogBand(command.prizePoolMinor, catalog);
  const currencyCode = command.currencyCode ?? SETTLEMENT_CURRENCY;
  if (currencyCode !== SETTLEMENT_CURRENCY || catalog.currencyCode !== SETTLEMENT_CURRENCY) {
    throw new Error("Gün 0 settlement yalnızca TRY.");
  }

  const now = command.now ?? new Date();
  const submissionWindowMs = command.submissionWindowMs ?? ARENA_SUBMISSION_WINDOW_MS;
  const evaluationWindowMs = command.evaluationWindowMs ?? ARENA_EVALUATION_WINDOW_MS;
  const submissionClosesAt = new Date(now.getTime() + submissionWindowMs);
  const evaluationClosesAt = new Date(submissionClosesAt.getTime() + evaluationWindowMs);
  const tenderId = randomUUID();
  const holdBps = resolveHoldBps(command.holdBps ?? HOLD_BPS_DEFAULT);

  const { hold } = await createEscrowHold(
    { ledger: ports.ledger, escrow: ports.escrow },
    {
      userId: command.sponsorUserId,
      referenceKey: arenaTenderReferenceKey(tenderId),
      grossMinor: prizePoolMinor,
      holdBps,
      currencyCode,
      expiresAt: evaluationClosesAt,
      now,
    },
  );

  return ports.arena.insertTender({
    id: tenderId,
    userId: command.sponsorUserId,
    companyId: command.companyId?.trim() ? command.companyId.trim() : null,
    title: command.title.trim(),
    brief: command.brief.trim(),
    prizePoolMinor,
    currencyCode,
    escrowHoldId: hold.id,
    status: "OPEN",
    round: "SUBMISSION",
    holdBps: hold.holdBps,
    grossMinor: hold.grossMinor,
    holdMinor: hold.holdMinor,
    netMinor: hold.netMinor,
    submissionClosesAt,
    evaluationClosesAt,
    awardedAt: null,
    refundedAt: null,
    createdAt: now,
    updatedAt: now,
  });
}

export async function submitArenaProposal(
  ports: ArenaEnginePorts,
  command: SubmitProposalCommand,
): Promise<ArenaSubmissionRecord> {
  const tender = await ports.arena.getTender(command.tenderId);
  if (!tender) {
    throw new Error("İhale bulunamadı.");
  }
  if (!canSubmitToTender(tender.status, tender.round)) {
    throw new Error("İhale teslime kapalı.");
  }
  if (command.submitterId === tender.userId) {
    throw new Error("Sponsor kendi ihalesine teslim edemez.");
  }
  const duplicate = await ports.arena.getSubmissionByTenderAndUser(tender.id, command.submitterId);
  if (duplicate) {
    throw new Error("Bu ihaleye zaten teslim ettiniz.");
  }
  const now = command.now ?? new Date();
  if (now.getTime() >= tender.submissionClosesAt.getTime()) {
    throw new Error("Teslim penceresi kapandı.");
  }

  return ports.arena.insertSubmission({
    id: randomUUID(),
    tenderId: tender.id,
    userId: command.submitterId,
    proposal: command.proposal.trim(),
    status: "SUBMITTED",
    createdAt: now,
    updatedAt: now,
  });
}

export async function awardArenaTender(
  ports: ArenaEnginePorts,
  command: AwardTenderCommand,
): Promise<{ tender: ArenaTenderRecord; awards: ArenaAwardRecord[] }> {
  const tender = await ports.arena.getTender(command.tenderId);
  if (!tender) {
    throw new Error("İhale bulunamadı.");
  }
  if (command.actorUserId !== tender.userId) {
    throw new Error("Yalnız sponsor ödül dağıtabilir.");
  }
  const existingAwards = await ports.arena.listAwardsForTender(tender.id);
  if (tender.status === "AWARDED") {
    return { tender, awards: existingAwards };
  }
  if (!canAwardTender(tender.status)) {
    throw new Error("İhale ödüllendirmeye kapalı.");
  }
  if (command.winners.length === 0) {
    throw new Error("En az bir kazanan gerekir.");
  }

  const submissions = await ports.arena.listSubmissionsForTender(tender.id);
  const byId = new Map(submissions.map((row) => [row.id, row]));
  const winnerIds: string[] = [];
  const payees: Array<{ userId: string; amountMinor: number }> = [];

  for (const winner of command.winners) {
    const submission = byId.get(winner.submissionId);
    if (!submission || submission.tenderId !== tender.id) {
      throw new Error("Kazanan teslimi bulunamadı.");
    }
    if (submission.status !== "SUBMITTED" && existingAwards.length === 0) {
      throw new Error("Yalnız teslim edilmiş çözüm ödüllendirilir.");
    }
    if (winnerIds.includes(submission.id)) {
      throw new Error("Aynı teslim iki kez ödüllendirilemez.");
    }
    winnerIds.push(submission.id);
    payees.push({ userId: submission.userId, amountMinor: winner.amountMinor });
  }

  const now = command.now ?? new Date();
  await releaseEscrowHoldToPayees(
    { ledger: ports.ledger, escrow: ports.escrow },
    {
      referenceKey: arenaTenderReferenceKey(tender.id),
      payees,
      platformUserId: command.platformUserId ?? resolvePlatformTreasuryUserId(),
      now,
    },
  );

  const awards: ArenaAwardRecord[] = [...existingAwards];
  if (awards.length === 0) {
    for (const winner of command.winners) {
      const submission = byId.get(winner.submissionId);
      if (!submission) {
        throw new Error("Kazanan teslimi bulunamadı.");
      }
      const award = await ports.arena.insertAward({
        id: randomUUID(),
        tenderId: tender.id,
        submissionId: submission.id,
        userId: submission.userId,
        amountMinor: toAmountMinor(winner.amountMinor),
        currencyCode: tender.currencyCode,
        createdAt: now,
      });
      awards.push(award);
      await ports.arena.updateSubmission(submission.id, { status: "AWARDED", updatedAt: now });
    }
    await ports.arena.rejectOtherSubmissions(tender.id, winnerIds, now);
  }

  const updated = await ports.arena.updateTender(tender.id, {
    status: "AWARDED",
    round: "CLOSED",
    awardedAt: now,
    updatedAt: now,
  });
  return { tender: updated, awards };
}

export async function refundArenaTender(
  ports: ArenaEnginePorts,
  command: TenderActorCommand,
): Promise<ArenaTenderRecord> {
  const tender = await ports.arena.getTender(command.tenderId);
  if (!tender) {
    throw new Error("İhale bulunamadı.");
  }
  if (command.actorUserId && command.actorUserId !== tender.userId) {
    throw new Error("Yalnız sponsor ihaleyi iade edebilir.");
  }
  if (!canRefundTender(tender.status)) {
    if (tender.status === "REFUNDED") {
      return tender;
    }
    throw new Error("İhale iade edilemez.");
  }

  const now = command.now ?? new Date();
  await refundEscrowHold(
    { ledger: ports.ledger, escrow: ports.escrow },
    {
      referenceKey: arenaTenderReferenceKey(tender.id),
      now,
    },
  );

  return ports.arena.updateTender(tender.id, {
    status: "REFUNDED",
    round: "CLOSED",
    refundedAt: now,
    updatedAt: now,
  });
}

export async function advanceArenaTenderRound(
  ports: ArenaEnginePorts,
  command: TenderActorCommand,
): Promise<ArenaTenderRecord> {
  const tender = await ports.arena.getTender(command.tenderId);
  if (!tender) {
    throw new Error("İhale bulunamadı.");
  }
  if (tender.status === "AWARDED" || tender.status === "REFUNDED") {
    return tender;
  }

  const now = command.now ?? new Date();
  if (now.getTime() >= tender.evaluationClosesAt.getTime()) {
    return refundArenaTender(ports, { tenderId: tender.id, now });
  }
  if (
    tender.status === "OPEN" &&
    tender.round === "SUBMISSION" &&
    now.getTime() >= tender.submissionClosesAt.getTime()
  ) {
    return ports.arena.updateTender(tender.id, {
      status: "EVALUATING",
      round: "EVALUATION",
      updatedAt: now,
    });
  }
  return tender;
}

export async function advanceDueArenaTenders(
  ports: ArenaEnginePorts,
  command: { now?: Date } = {},
): Promise<ArenaTenderRecord[]> {
  const now = command.now ?? new Date();
  const due = await ports.arena.listTendersDue(now);
  const next: ArenaTenderRecord[] = [];
  for (const tender of due) {
    next.push(await advanceArenaTenderRound(ports, { tenderId: tender.id, now }));
  }
  return next;
}
