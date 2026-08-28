import { randomUUID } from "node:crypto";
import {
  DEVLABS_SANDBOX_KIND,
  type DevLabsApiKeyRecord,
  type DevLabsProjectRecord,
  type DevLabsStore,
  type IssuedDevLabsApiKey,
} from "@/lib/devlabs/types";
import {
  devLabsKeyPrefix,
  generateDevLabsApiKeyPlaintext,
  hashDevLabsApiKey,
} from "@/lib/devlabs/keys";

export type DevLabsEnginePorts = {
  devlabs: DevLabsStore;
};

export type CreateProjectCommand = {
  ownerUserId: string;
  name: string;
  summary: string;
  now?: Date;
};

export type IssueApiKeyCommand = {
  projectId: string;
  actorUserId: string;
  name: string;
  now?: Date;
};

export type RevokeApiKeyCommand = {
  keyId: string;
  actorUserId: string;
  now?: Date;
};

export async function createDevLabsProject(
  ports: DevLabsEnginePorts,
  command: CreateProjectCommand,
): Promise<DevLabsProjectRecord> {
  const now = command.now ?? new Date();
  return ports.devlabs.insertProject({
    id: randomUUID(),
    userId: command.ownerUserId,
    name: command.name.trim(),
    summary: command.summary.trim(),
    status: "ACTIVE",
    sandboxKind: DEVLABS_SANDBOX_KIND,
    createdAt: now,
    updatedAt: now,
  });
}

export async function issueDevLabsApiKey(
  ports: DevLabsEnginePorts,
  command: IssueApiKeyCommand,
): Promise<IssuedDevLabsApiKey> {
  const project = await ports.devlabs.getProject(command.projectId);
  if (!project) {
    throw new Error("Proje bulunamadı.");
  }
  if (project.userId !== command.actorUserId) {
    throw new Error("Yalnız proje sahibi anahtar basabilir.");
  }
  if (project.status !== "ACTIVE") {
    throw new Error("Arşivlenmiş projeye anahtar basılamaz.");
  }

  const now = command.now ?? new Date();
  const plaintext = generateDevLabsApiKeyPlaintext();
  const record = await ports.devlabs.insertApiKey({
    id: randomUUID(),
    projectId: project.id,
    userId: command.actorUserId,
    name: command.name.trim(),
    keyPrefix: devLabsKeyPrefix(plaintext),
    keyHash: hashDevLabsApiKey(plaintext),
    revokedAt: null,
    createdAt: now,
  });
  return { record, plaintext };
}

export async function revokeDevLabsApiKey(
  ports: DevLabsEnginePorts,
  command: RevokeApiKeyCommand,
): Promise<DevLabsApiKeyRecord> {
  const key = await ports.devlabs.getApiKey(command.keyId);
  if (!key) {
    throw new Error("Anahtar bulunamadı.");
  }
  if (key.userId !== command.actorUserId) {
    throw new Error("Yalnız anahtar sahibi iptal edebilir.");
  }
  if (key.revokedAt) {
    return key;
  }
  const now = command.now ?? new Date();
  return ports.devlabs.updateApiKey(key.id, { revokedAt: now });
}
