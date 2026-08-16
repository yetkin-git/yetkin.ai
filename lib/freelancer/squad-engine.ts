import { randomUUID } from "node:crypto";
import { SHARE_BPS_TOTAL } from "@/lib/kernel/escrow/share-bps";
import type { FreelancerEnginePorts } from "@/lib/freelancer/types";
import type {
  FreelancerSquadMemberRecord,
  FreelancerSquadRecord,
} from "@/lib/freelancer/types";

export const FREELANCER_SQUAD_KIND = "PROJECT_EPHEMERAL" as const;

export type UpsertSquadCommand = {
  contractId: string;
  actorUserId: string;
  members: Array<{ userId: string; shareBps: number }>;
  now?: Date;
};

export async function upsertFreelancerSquad(
  ports: FreelancerEnginePorts,
  command: UpsertSquadCommand,
): Promise<{ squad: FreelancerSquadRecord; members: FreelancerSquadMemberRecord[] }> {
  const contract = await ports.freelancer.getContract(command.contractId);
  if (!contract) {
    throw new Error("Sözleşme bulunamadı.");
  }
  if (command.actorUserId !== contract.freelancerId) {
    throw new Error("Yalnız kazanan freelancer takım kurabilir.");
  }
  if (contract.status !== "FUNDED") {
    throw new Error("Takım yalnız fonlanmış sözleşmede kurulur.");
  }

  const seen = new Set<string>();
  let totalBps = 0;
  for (const member of command.members) {
    if (!member.userId.trim()) {
      throw new Error("Üye kimliği boş olamaz.");
    }
    if (seen.has(member.userId)) {
      throw new Error("Aynı üye iki kez yazılamaz.");
    }
    if (member.userId === contract.clientId) {
      throw new Error("İşveren takım üyesi olamaz.");
    }
    seen.add(member.userId);
    totalBps += member.shareBps;
  }
  if (!seen.has(contract.freelancerId)) {
    throw new Error("Kazanan freelancer takımda pay sahibi olmalıdır.");
  }
  if (totalBps !== SHARE_BPS_TOTAL) {
    throw new Error(`Üye payları toplamı ${totalBps} ≠ ${SHARE_BPS_TOTAL} bps.`);
  }

  const now = command.now ?? new Date();
  const existing = await ports.freelancer.getSquadByContractId(contract.id);
  if (existing && existing.status === "DISBANDED") {
    throw new Error("Dağılmış takım yeniden kurulamaz.");
  }

  const squad =
    existing ??
    (await ports.freelancer.insertSquad({
      id: randomUUID(),
      contractId: contract.id,
      userId: contract.freelancerId,
      clientId: contract.clientId,
      kind: FREELANCER_SQUAD_KIND,
      status: "ACTIVE",
      createdAt: now,
      updatedAt: now,
    }));

  const active =
    squad.status === "ACTIVE"
      ? squad
      : await ports.freelancer.updateSquad(squad.id, { status: "ACTIVE", updatedAt: now });

  const members = await ports.freelancer.replaceSquadMembers(
    active.id,
    command.members.map((member) => ({
      id: randomUUID(),
      squadId: active.id,
      userId: member.userId,
      shareBps: member.shareBps,
      createdAt: now,
    })),
  );

  return { squad: active, members };
}

export async function loadActiveSquadMembers(
  ports: FreelancerEnginePorts,
  contractId: string,
): Promise<Array<{ userId: string; shareBps: number }> | null> {
  const squad = await ports.freelancer.getSquadByContractId(contractId);
  if (!squad || squad.status !== "ACTIVE") {
    return null;
  }
  const members = await ports.freelancer.listSquadMembers(squad.id);
  if (members.length === 0) {
    return null;
  }
  return members.map((member) => ({ userId: member.userId, shareBps: member.shareBps }));
}

export async function disbandFreelancerSquad(
  ports: FreelancerEnginePorts,
  contractId: string,
  now: Date,
): Promise<void> {
  const squad = await ports.freelancer.getSquadByContractId(contractId);
  if (!squad || squad.status === "DISBANDED") {
    return;
  }
  await ports.freelancer.updateSquad(squad.id, { status: "DISBANDED", updatedAt: now });
}
