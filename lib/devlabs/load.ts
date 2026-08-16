import "server-only";

import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";
import type { DevLabsApiKeyRecord, DevLabsArtifactRecord, DevLabsProjectRecord } from "@/lib/devlabs/types";

export async function loadOwnerProjects(userId: string): Promise<DevLabsProjectRecord[] | null> {
  try {
    const ports = createPrismaDevLabsPorts();
    return await ports.devlabs.listProjectsByOwner(userId);
  } catch {
    return null;
  }
}

export async function loadProjectBoard(projectId: string): Promise<{
  project: DevLabsProjectRecord;
  keys: DevLabsApiKeyRecord[];
  artifacts: DevLabsArtifactRecord[];
} | null> {
  try {
    const ports = createPrismaDevLabsPorts();
    const project = await ports.devlabs.getProject(projectId);
    if (!project) {
      return null;
    }
    const [keys, artifacts] = await Promise.all([
      ports.devlabs.listApiKeysForProject(projectId),
      ports.devlabs.listArtifactsForProject(projectId),
    ]);
    return { project, keys, artifacts };
  } catch {
    return null;
  }
}
