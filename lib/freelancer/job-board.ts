import {
  actorFromUserId,
  authorize,
  type Actor,
  type ActorRole,
} from "@/lib/kernel/security/authorize";
import type {
  FreelancerBidRecord,
  FreelancerContractRecord,
  FreelancerJobRecord,
  FreelancerStore,
} from "@/lib/freelancer/types";

export type FreelancerJobBoardView = {
  viewerRole: ActorRole;
  job: FreelancerJobRecord;
  bids: FreelancerBidRecord[];
  contract: FreelancerContractRecord | null;
};

function uniqueIds(ids: readonly (string | null | undefined)[]): string[] {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

function toBidDto(bid: FreelancerBidRecord): FreelancerBidRecord {
  return {
    id: bid.id,
    jobId: bid.jobId,
    bidderId: bid.bidderId,
    amountMinor: bid.amountMinor,
    currencyCode: bid.currencyCode,
    coverNote: bid.coverNote,
    status: bid.status,
    createdAt: bid.createdAt,
    updatedAt: bid.updatedAt,
  };
}

function toContractDto(contract: FreelancerContractRecord): FreelancerContractRecord {
  return { ...contract };
}

export function projectJobBoard(input: {
  actor: Actor;
  job: FreelancerJobRecord;
  bids: readonly FreelancerBidRecord[];
  contract: FreelancerContractRecord | null;
}): FreelancerJobBoardView {
  const { job, bids, contract } = input;
  const jobResource = {
    type: "freelancer.job",
    id: job.id,
    ownerId: job.clientId,
    participantIds: uniqueIds([
      ...bids.map((bid) => bid.bidderId),
      contract?.freelancerId,
    ]),
  };
  const summary = authorize(input.actor, "read.summary", jobResource);
  const secrets = authorize(input.actor, "read.secrets", jobResource);

  const visibleBids = secrets.allowed
    ? bids.map(toBidDto)
    : bids
        .filter((bid) =>
          authorize(input.actor, "read.own_entry", {
            type: "freelancer.bid",
            id: bid.id,
            ownerId: job.clientId,
            participantIds: [bid.bidderId],
          }).allowed,
        )
        .map(toBidDto);

  let contractView: FreelancerContractRecord | null = null;
  if (contract) {
    const party = authorize(input.actor, "read.own_entry", {
      type: "freelancer.contract",
      id: contract.id,
      ownerId: contract.clientId,
      participantIds: [contract.freelancerId],
    });
    if (secrets.allowed || party.allowed) {
      contractView = toContractDto(contract);
    }
  }

  return {
    viewerRole: summary.role,
    job: { ...job },
    bids: visibleBids,
    contract: contractView,
  };
}

export async function queryJobBoard(
  store: Pick<FreelancerStore, "getJob" | "listBidsForJob" | "getContractByJobId">,
  jobId: string,
  actorUserId: string | null,
): Promise<FreelancerJobBoardView | null> {
  const job = await store.getJob(jobId);
  if (!job) {
    return null;
  }
  if (
    job.visibility === "DIRECT" &&
    actorUserId !== job.clientId &&
    actorUserId !== job.inviteeId
  ) {
    return null;
  }
  const [bids, contract] = await Promise.all([
    store.listBidsForJob(jobId),
    store.getContractByJobId(jobId),
  ]);
  return projectJobBoard({
    actor: actorFromUserId(actorUserId),
    job,
    bids,
    contract,
  });
}
