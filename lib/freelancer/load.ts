import "server-only";

import { queryJobBoard, type FreelancerJobBoardView } from "@/lib/freelancer/job-board";
import { createPrismaFreelancerPorts } from "@/lib/freelancer/runtime";
import type {
  FreelancerContractMessageRecord,
  FreelancerContractRecord,
  FreelancerDisputeRecord,
  FreelancerJobRecord,
  FreelancerSquadMemberRecord,
  FreelancerSquadRecord,
} from "@/lib/freelancer/types";
import type { EscrowHoldRecord } from "@/lib/kernel/escrow/types";

export async function loadOpenJobs(): Promise<FreelancerJobRecord[] | null> {
  try {
    const ports = createPrismaFreelancerPorts();
    return await ports.freelancer.listOpenJobs();
  } catch {
    return null;
  }
}

export async function loadDirectOffersForInvitee(
  userId: string,
): Promise<FreelancerJobRecord[] | null> {
  try {
    const ports = createPrismaFreelancerPorts();
    return await ports.freelancer.listDirectOffersForInvitee(userId);
  } catch {
    return null;
  }
}

export async function loadJobBoard(
  jobId: string,
  actorUserId: string | null,
): Promise<FreelancerJobBoardView | null> {
  try {
    const ports = createPrismaFreelancerPorts();
    return await queryJobBoard(ports.freelancer, jobId, actorUserId);
  } catch {
    return null;
  }
}

export async function loadContractBoard(contractId: string): Promise<{
  contract: FreelancerContractRecord;
  job: FreelancerJobRecord | null;
  hold: EscrowHoldRecord | null;
  dispute: FreelancerDisputeRecord | null;
  messages: FreelancerContractMessageRecord[];
  squad: FreelancerSquadRecord | null;
  squadMembers: FreelancerSquadMemberRecord[];
} | null> {
  try {
    const ports = createPrismaFreelancerPorts();
    const contract = await ports.freelancer.getContract(contractId);
    if (!contract) {
      return null;
    }
    const [job, hold, dispute, messages, squad] = await Promise.all([
      ports.freelancer.getJob(contract.jobId),
      ports.escrow.findById(contract.escrowHoldId),
      ports.freelancer.getDisputeByContractId(contract.id),
      ports.freelancer.listMessagesForContract(contract.id),
      ports.freelancer.getSquadByContractId(contract.id),
    ]);
    const squadMembers = squad ? await ports.freelancer.listSquadMembers(squad.id) : [];
    return { contract, job, hold, dispute, messages, squad, squadMembers };
  } catch {
    return null;
  }
}
