import type {
  DevLabsApiKeyRecord,
  DevLabsArtifactRecord,
  DevLabsProjectRecord,
  DevLabsPulse,
  DevLabsStore,
} from "@/lib/devlabs/types";

export function createMemoryDevLabsStore(): DevLabsStore {
  const projects = new Map<string, DevLabsProjectRecord>();
  const keys = new Map<string, DevLabsApiKeyRecord>();
  const artifacts = new Map<string, DevLabsArtifactRecord>();

  return {
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
