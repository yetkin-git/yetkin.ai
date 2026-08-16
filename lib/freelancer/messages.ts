import { randomUUID } from "node:crypto";
import type { FreelancerEnginePorts } from "@/lib/freelancer/types";
import type {
  FreelancerContractMessageKind,
  FreelancerContractMessageRecord,
} from "@/lib/freelancer/types";

export type PostContractMessageCommand = {
  contractId: string;
  actorUserId: string;
  kind?: FreelancerContractMessageKind;
  body: string;
  artifactUrl?: string | null;
  now?: Date;
};

function normalizeArtifactUrl(raw: string | null | undefined): string | null {
  const value = raw?.trim() ?? "";
  if (!value) {
    return null;
  }
  if (!/^https?:\/\//i.test(value)) {
    throw new Error("Artifact adresi http(s) ile başlamalıdır.");
  }
  return value;
}

export async function postFreelancerContractMessage(
  ports: FreelancerEnginePorts,
  command: PostContractMessageCommand,
): Promise<FreelancerContractMessageRecord> {
  const contract = await ports.freelancer.getContract(command.contractId);
  if (!contract) {
    throw new Error("Sözleşme bulunamadı.");
  }
  if (command.actorUserId !== contract.clientId && command.actorUserId !== contract.freelancerId) {
    throw new Error("Yalnız sözleşme tarafları mesaj yazabilir.");
  }
  if (contract.status === "REFUNDED") {
    throw new Error("İade edilmiş sözleşmeye mesaj yazılamaz.");
  }
  const body = command.body.trim();
  if (!body) {
    throw new Error("Mesaj boş olamaz.");
  }
  const kind = command.kind ?? "TEXT";
  const artifactUrl = normalizeArtifactUrl(command.artifactUrl);
  if (kind === "DELIVERY" && !artifactUrl && body.length < 8) {
    throw new Error("Teslim kanıtı metin veya artifact ister.");
  }
  const now = command.now ?? new Date();
  return ports.freelancer.insertMessage({
    id: randomUUID(),
    contractId: contract.id,
    userId: command.actorUserId,
    clientId: contract.clientId,
    freelancerId: contract.freelancerId,
    kind,
    body,
    artifactUrl,
    createdAt: now,
  });
}

export async function listFreelancerContractMessages(
  ports: FreelancerEnginePorts,
  command: { contractId: string; actorUserId: string },
): Promise<FreelancerContractMessageRecord[]> {
  const contract = await ports.freelancer.getContract(command.contractId);
  if (!contract) {
    throw new Error("Sözleşme bulunamadı.");
  }
  if (command.actorUserId !== contract.clientId && command.actorUserId !== contract.freelancerId) {
    throw new Error("Yalnız sözleşme tarafları mesaj okuyabilir.");
  }
  return ports.freelancer.listMessagesForContract(contract.id);
}
