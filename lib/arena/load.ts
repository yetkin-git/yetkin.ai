import "server-only";

import { createPrismaArenaPorts } from "@/lib/arena/runtime";
import type {
  ArenaAwardRecord,
  ArenaSubmissionRecord,
  ArenaTenderRecord,
} from "@/lib/arena/types";

export async function loadOpenTenders(): Promise<ArenaTenderRecord[] | null> {
  try {
    const ports = createPrismaArenaPorts();
    return await ports.arena.listOpenTenders();
  } catch {
    return null;
  }
}

export async function loadTenderBoard(tenderId: string): Promise<{
  tender: ArenaTenderRecord;
  submissions: ArenaSubmissionRecord[];
  awards: ArenaAwardRecord[];
} | null> {
  try {
    const ports = createPrismaArenaPorts();
    const tender = await ports.arena.getTender(tenderId);
    if (!tender) {
      return null;
    }
    const [submissions, awards] = await Promise.all([
      ports.arena.listSubmissionsForTender(tenderId),
      ports.arena.listAwardsForTender(tenderId),
    ]);
    return { tender, submissions, awards };
  } catch {
    return null;
  }
}
