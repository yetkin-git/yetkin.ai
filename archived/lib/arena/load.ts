import "server-only";

import { queryTenderBoard, type ArenaTenderBoardView } from "@/lib/arena/tender-board";
import { createPrismaArenaPorts } from "@/lib/arena/runtime";
import type { ArenaTenderRecord } from "@/lib/arena/types";

export async function loadOpenTenders(): Promise<ArenaTenderRecord[] | null> {
  try {
    const ports = createPrismaArenaPorts();
    return await ports.arena.listOpenTenders();
  } catch {
    return null;
  }
}

export async function loadTenderBoard(
  tenderId: string,
  actorUserId: string | null,
): Promise<ArenaTenderBoardView | null> {
  try {
    const ports = createPrismaArenaPorts();
    return await queryTenderBoard(ports.arena, tenderId, actorUserId);
  } catch {
    return null;
  }
}
