import {
  actorFromUserId,
  authorize,
  type Actor,
  type ActorRole,
} from "@/lib/kernel/security/authorize";
import type {
  ArenaAwardRecord,
  ArenaStore,
  ArenaSubmissionRecord,
  ArenaTenderRecord,
} from "@/lib/arena/types";

export type ArenaTenderView = Omit<ArenaTenderRecord, "escrowHoldId"> & {
  escrowHoldId?: string;
};

export type ArenaTenderBoardView = {
  viewerRole: ActorRole;
  tender: ArenaTenderView;
  submissions: ArenaSubmissionRecord[];
  awards: ArenaAwardRecord[];
};

function uniqueIds(ids: readonly (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function toSubmissionDto(row: ArenaSubmissionRecord): ArenaSubmissionRecord {
  return {
    id: row.id,
    tenderId: row.tenderId,
    userId: row.userId,
    proposal: row.proposal,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toAwardDto(row: ArenaAwardRecord): ArenaAwardRecord {
  return { ...row };
}

function projectTenderRecord(
  tender: ArenaTenderRecord,
  secretsAllowed: boolean,
): ArenaTenderView {
  if (secretsAllowed) {
    return { ...tender };
  }
  const { escrowHoldId: _escrowHoldId, ...listing } = tender;
  return listing;
}

export function projectTenderBoard(input: {
  actor: Actor;
  tender: ArenaTenderRecord;
  submissions: readonly ArenaSubmissionRecord[];
  awards: readonly ArenaAwardRecord[];
}): ArenaTenderBoardView {
  const { tender, submissions, awards } = input;
  const tenderResource = {
    type: "arena.tender",
    id: tender.id,
    ownerId: tender.userId,
    participantIds: uniqueIds([
      ...submissions.map((row) => row.userId),
      ...awards.map((row) => row.userId),
    ]),
  };
  const summary = authorize(input.actor, "read.summary", tenderResource);
  const secrets = authorize(input.actor, "read.secrets", tenderResource);

  const visibleSubmissions = secrets.allowed
    ? submissions.map(toSubmissionDto)
    : submissions
        .filter((row) =>
          authorize(input.actor, "read.own_entry", {
            type: "arena.submission",
            id: row.id,
            ownerId: tender.userId,
            participantIds: [row.userId],
          }).allowed,
        )
        .map(toSubmissionDto);

  const visibleAwards = secrets.allowed
    ? awards.map(toAwardDto)
    : awards
        .filter((row) =>
          authorize(input.actor, "read.own_entry", {
            type: "arena.award",
            id: row.id,
            ownerId: tender.userId,
            participantIds: [row.userId],
          }).allowed,
        )
        .map(toAwardDto);

  return {
    viewerRole: summary.role,
    tender: projectTenderRecord(tender, secrets.allowed),
    submissions: visibleSubmissions,
    awards: visibleAwards,
  };
}

export async function queryTenderBoard(
  store: Pick<ArenaStore, "getTender" | "listSubmissionsForTender" | "listAwardsForTender">,
  tenderId: string,
  actorUserId: string | null,
): Promise<ArenaTenderBoardView | null> {
  const tender = await store.getTender(tenderId);
  if (!tender) {
    return null;
  }
  const [submissions, awards] = await Promise.all([
    store.listSubmissionsForTender(tenderId),
    store.listAwardsForTender(tenderId),
  ]);
  return projectTenderBoard({
    actor: actorFromUserId(actorUserId),
    tender,
    submissions,
    awards,
  });
}
