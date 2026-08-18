import "server-only";

import { createPrismaDevLabsPorts } from "@/lib/devlabs/runtime";
import { DEVLABS_CODE_UNIT_KEY, DEVLABS_MODULE_KEY } from "@/lib/devlabs/types";
import type { DevLabsApiKeyRecord, DevLabsArtifactRecord, DevLabsProjectRecord } from "@/lib/devlabs/types";
import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { createPrismaPriceCatalogStore } from "@/lib/kernel/pricing/prisma-catalog-store";

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
  codeFloorMinor: AmountMinor | null;
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
    let codeFloorMinor: AmountMinor | null = null;
    try {
      const entry = await createPrismaPriceCatalogStore().findActiveEntry(
        DEVLABS_MODULE_KEY,
        DEVLABS_CODE_UNIT_KEY,
      );
      codeFloorMinor = entry ? toAmountMinor(entry.amountMinor) : null;
    } catch {
      codeFloorMinor = null;
    }
    return { project, keys, artifacts, codeFloorMinor };
  } catch {
    return null;
  }
}
