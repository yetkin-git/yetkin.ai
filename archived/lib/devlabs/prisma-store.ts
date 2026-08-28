import "server-only";

import type { PrismaClient } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/kernel/db";
import type {
  DevLabsApiKeyRecord,
  DevLabsArtifactRecord,
  DevLabsProjectRecord,
  DevLabsPulse,
  DevLabsStore,
} from "@/lib/devlabs/types";

function toProject(row: {
  id: string;
  userId: string;
  name: string;
  summary: string;
  status: DevLabsProjectRecord["status"];
  sandboxKind: DevLabsProjectRecord["sandboxKind"];
  createdAt: Date;
  updatedAt: Date;
}): DevLabsProjectRecord {
  return { ...row };
}

function toKey(row: {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  revokedAt: Date | null;
  createdAt: Date;
}): DevLabsApiKeyRecord {
  return { ...row };
}

function toArtifact(row: {
  id: string;
  projectId: string;
  userId: string;
  apiKeyId: string;
  prompt: string;
  outputCode: string;
  linterOk: boolean;
  linterScore: number;
  linterReportJson: string;
  contentHash: string;
  roleKey: string;
  provider: string | null;
  model: string | null;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costMinor: number;
  debitMinor: number;
  currencyCode: string;
  usageId: string | null;
  ledgerDebitKey: string | null;
  createdAt: Date;
}): DevLabsArtifactRecord {
  return { ...row };
}

export type DevLabsWriteDb = Pick<
  PrismaClient,
  "devLabsProject" | "devLabsApiKey" | "devLabsArtifact"
>;

export function bindDevLabsStore(db: DevLabsWriteDb): DevLabsStore {
  return {
    async insertProject(project) {
      const row = await db.devLabsProject.create({
        data: {
          id: project.id,
          userId: project.userId,
          name: project.name,
          summary: project.summary,
          status: project.status,
          sandboxKind: project.sandboxKind,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
        },
      });
      return toProject(row);
    },
    async getProject(id) {
      const row = await db.devLabsProject.findUnique({ where: { id } });
      return row ? toProject(row) : null;
    },
    async listProjectsByOwner(userId) {
      const rows = await db.devLabsProject.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toProject);
    },
    async updateProject(id, patch) {
      const row = await db.devLabsProject.update({ where: { id }, data: patch });
      return toProject(row);
    },
    async insertApiKey(key) {
      const row = await db.devLabsApiKey.create({
        data: {
          id: key.id,
          projectId: key.projectId,
          userId: key.userId,
          name: key.name,
          keyPrefix: key.keyPrefix,
          keyHash: key.keyHash,
          revokedAt: key.revokedAt,
          createdAt: key.createdAt,
        },
      });
      return toKey(row);
    },
    async getApiKey(id) {
      const row = await db.devLabsApiKey.findUnique({ where: { id } });
      return row ? toKey(row) : null;
    },
    async listApiKeysForProject(projectId) {
      const rows = await db.devLabsApiKey.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toKey);
    },
    async updateApiKey(id, patch) {
      const row = await db.devLabsApiKey.update({ where: { id }, data: patch });
      return toKey(row);
    },
    async insertArtifact(artifact) {
      const row = await db.devLabsArtifact.create({
        data: {
          id: artifact.id,
          projectId: artifact.projectId,
          userId: artifact.userId,
          apiKeyId: artifact.apiKeyId,
          prompt: artifact.prompt,
          outputCode: artifact.outputCode,
          linterOk: artifact.linterOk,
          linterScore: artifact.linterScore,
          linterReportJson: artifact.linterReportJson,
          contentHash: artifact.contentHash,
          roleKey: artifact.roleKey,
          provider: artifact.provider,
          model: artifact.model,
          promptTokens: artifact.promptTokens,
          completionTokens: artifact.completionTokens,
          totalTokens: artifact.totalTokens,
          costMinor: artifact.costMinor,
          debitMinor: artifact.debitMinor,
          currencyCode: artifact.currencyCode,
          usageId: artifact.usageId,
          ledgerDebitKey: artifact.ledgerDebitKey,
          createdAt: artifact.createdAt,
        },
      });
      return toArtifact(row);
    },
    async getArtifact(id) {
      const row = await db.devLabsArtifact.findUnique({ where: { id } });
      return row ? toArtifact(row) : null;
    },
    async listArtifactsForProject(projectId) {
      const rows = await db.devLabsArtifact.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
      });
      return rows.map(toArtifact);
    },
    async pulseForUser(userId) {
      const [projectsCount, activeKeysCount, revokedKeysCount, artifactsCount] = await Promise.all([
        db.devLabsProject.count({ where: { userId, status: "ACTIVE" } }),
        db.devLabsApiKey.count({ where: { userId, revokedAt: null } }),
        db.devLabsApiKey.count({ where: { userId, revokedAt: { not: null } } }),
        db.devLabsArtifact.count({ where: { userId } }),
      ]);
      const pulse: DevLabsPulse = { projectsCount, activeKeysCount, revokedKeysCount, artifactsCount };
      return pulse;
    },
  };
}

export function createPrismaDevLabsStore(): DevLabsStore {
  return bindDevLabsStore(getPrisma());
}
