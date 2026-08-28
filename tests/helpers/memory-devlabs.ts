import type { DevLabsSettleWritePorts, DevLabsBenchPorts } from "@/lib/devlabs/bench";
import type {
  DevLabsApiKeyRecord,
  DevLabsArtifactRecord,
  DevLabsProjectRecord,
  DevLabsPulse,
  DevLabsStore,
} from "@/lib/devlabs/types";
import { createSerializedUnitOfWork, type MemoryLedgerStore } from "./memory-money";
import type { MemoryAiTokenUsageStore } from "./memory-studio";

type DevLabsMemoryState = {
  projects: Array<[string, DevLabsProjectRecord]>;
  keys: Array<[string, DevLabsApiKeyRecord]>;
  artifacts: Array<[string, DevLabsArtifactRecord]>;
};

export type MemoryDevLabsStore = DevLabsStore & {
  failNextArtifactInsert(): void;
  capture(): DevLabsMemoryState;
  restore(state: DevLabsMemoryState): void;
};

export function createMemoryDevLabsStore(): MemoryDevLabsStore {
  const projects = new Map<string, DevLabsProjectRecord>();
  const keys = new Map<string, DevLabsApiKeyRecord>();
  const artifacts = new Map<string, DevLabsArtifactRecord>();
  let failArtifact = false;

  return {
    failNextArtifactInsert() {
      failArtifact = true;
    },
    capture() {
      return {
        projects: [...projects.entries()].map(([key, value]) => [key, { ...value }]),
        keys: [...keys.entries()].map(([key, value]) => [key, { ...value }]),
        artifacts: [...artifacts.entries()].map(([key, value]) => [key, { ...value }]),
      };
    },
    restore(state) {
      projects.clear();
      keys.clear();
      artifacts.clear();
      for (const [key, value] of state.projects) {
        projects.set(key, { ...value });
      }
      for (const [key, value] of state.keys) {
        keys.set(key, { ...value });
      }
      for (const [key, value] of state.artifacts) {
        artifacts.set(key, { ...value });
      }
    },
    async insertProject(project) {
      projects.set(project.id, project);
      return { ...project };
    },
    async getProject(id) {
      const row = projects.get(id);
      return row ? { ...row } : null;
    },
    async listProjectsByOwner(userId) {
      return [...projects.values()].filter((row) => row.userId === userId).map((row) => ({ ...row }));
    },
    async updateProject(id, patch) {
      const row = projects.get(id);
      if (!row) {
        throw new Error("Proje yok.");
      }
      const next = { ...row, ...patch };
      projects.set(id, next);
      return { ...next };
    },
    async insertApiKey(key) {
      keys.set(key.id, key);
      return { ...key };
    },
    async getApiKey(id) {
      const row = keys.get(id);
      return row ? { ...row } : null;
    },
    async listApiKeysForProject(projectId) {
      return [...keys.values()].filter((row) => row.projectId === projectId).map((row) => ({ ...row }));
    },
    async updateApiKey(id, patch) {
      const row = keys.get(id);
      if (!row) {
        throw new Error("Anahtar yok.");
      }
      const next = { ...row, ...patch };
      keys.set(id, next);
      return { ...next };
    },
    async insertArtifact(artifact) {
      if (failArtifact) {
        failArtifact = false;
        throw new Error("Artifact yazımı düştü.");
      }
      artifacts.set(artifact.id, artifact);
      return { ...artifact };
    },
    async getArtifact(id) {
      const row = artifacts.get(id);
      return row ? { ...row } : null;
    },
    async listArtifactsForProject(projectId) {
      return [...artifacts.values()]
        .filter((row) => row.projectId === projectId)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((row) => ({ ...row }));
    },
    async pulseForUser(userId) {
      const pulse: DevLabsPulse = {
        projectsCount: [...projects.values()].filter(
          (row) => row.userId === userId && row.status === "ACTIVE",
        ).length,
        activeKeysCount: [...keys.values()].filter((row) => row.userId === userId && row.revokedAt === null)
          .length,
        revokedKeysCount: [...keys.values()].filter((row) => row.userId === userId && row.revokedAt !== null)
          .length,
        artifactsCount: [...artifacts.values()].filter((row) => row.userId === userId).length,
      };
      return pulse;
    },
  };
}

export function withMemoryDevLabsAtomic<
  T extends {
    ledger: MemoryLedgerStore;
    usage: MemoryAiTokenUsageStore;
    devlabs: MemoryDevLabsStore;
  },
>(ports: T): T & Pick<DevLabsBenchPorts, "runMoneyAtomic"> {
  const uow = createSerializedUnitOfWork();
  return {
    ...ports,
    async runMoneyAtomic<R>(work: (tx: DevLabsSettleWritePorts) => Promise<R>): Promise<R> {
      return uow.run([ports.ledger, ports.usage, ports.devlabs], () =>
        work({
          ledger: ports.ledger,
          usage: ports.usage,
          devlabs: ports.devlabs,
        }),
      );
    },
  };
}
