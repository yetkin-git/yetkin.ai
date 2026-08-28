import { randomUUID } from "node:crypto";
import { emitCitizenNotice } from "@/lib/kernel/notice/emit";
import { ForbiddenError, NotFoundError } from "@/lib/kernel/http/errors";
import {
  RAIL_V1_DELIVERY_FORBIDDEN,
  RAIL_V1_DELIVERY_NOT_FUNDED,
  type RailV1DeliveryMessage,
} from "@/lib/kernel/http/v1-contract";
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
    throw new NotFoundError("Sözleşme bulunamadı.");
  }
  if (command.actorUserId !== contract.clientId && command.actorUserId !== contract.freelancerId) {
    throw new ForbiddenError("Yalnız sözleşme tarafları mesaj yazabilir.");
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
  const message = await ports.freelancer.insertMessage({
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
  if (kind === "DELIVERY") {
    const recipient =
      command.actorUserId === contract.clientId ? contract.freelancerId : contract.clientId;
    emitCitizenNotice({
      kind: "delivery_posted",
      userId: recipient,
      reference: contract.id,
      applied: true,
    });
  }
  return message;
}

export async function listFreelancerContractMessages(
  ports: FreelancerEnginePorts,
  command: { contractId: string; actorUserId: string },
): Promise<FreelancerContractMessageRecord[]> {
  const contract = await ports.freelancer.getContract(command.contractId);
  if (!contract) {
    throw new NotFoundError("Sözleşme bulunamadı.");
  }
  if (command.actorUserId !== contract.clientId && command.actorUserId !== contract.freelancerId) {
    throw new ForbiddenError("Yalnız sözleşme tarafları mesaj okuyabilir.");
  }
  return ports.freelancer.listMessagesForContract(contract.id);
}

export type PostDeliveryProofCommand = {
  contractId: string;
  actorUserId: string;
  body: string;
  artifactUrl?: string | null;
  now?: Date;
};

/**
 * v1 dar teslim: yalnız usta, yalnız FUNDED, kind kilitli DELIVERY.
 * Web sohbet (TEXT/REVISION, işveren) bu kapıdan geçmez.
 */
export async function postFreelancerDeliveryProof(
  ports: FreelancerEnginePorts,
  command: PostDeliveryProofCommand,
): Promise<FreelancerContractMessageRecord> {
  const contract = await ports.freelancer.getContract(command.contractId);
  if (!contract) {
    throw new NotFoundError("Sözleşme bulunamadı.");
  }
  if (command.actorUserId !== contract.freelancerId) {
    throw new ForbiddenError(RAIL_V1_DELIVERY_FORBIDDEN);
  }
  if (contract.status !== "FUNDED") {
    throw new Error(RAIL_V1_DELIVERY_NOT_FUNDED);
  }
  return postFreelancerContractMessage(ports, {
    contractId: command.contractId,
    actorUserId: command.actorUserId,
    kind: "DELIVERY",
    body: command.body,
    artifactUrl: command.artifactUrl,
    now: command.now,
  });
}

/** Yayınlanmış teslim DTO. Gövde / artifact / userId yok. */
export function toFreelancerDeliveryMessageWire(
  message: FreelancerContractMessageRecord,
): RailV1DeliveryMessage {
  if (message.kind !== "DELIVERY") {
    throw new Error("Teslimat görünümü üretilemedi.");
  }
  return {
    id: message.id,
    contractId: message.contractId,
    kind: "DELIVERY",
    createdAt: message.createdAt.toISOString(),
  };
}
