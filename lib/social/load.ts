import "server-only";

import { createPrismaSocialPorts } from "@/lib/social/runtime";
import { listProofFeedPage, syncProofFeed } from "@/lib/social/engine";
import type { ProofFeedItemDto } from "@/lib/social/proof-feed.dto";
import { toProofFeedItemDto } from "@/lib/social/dto-map";

export async function loadProofFeedPage(): Promise<ProofFeedItemDto[] | null> {
  try {
    const ports = createPrismaSocialPorts();
    const page = await listProofFeedPage(ports);
    return page.items;
  } catch {
    return null;
  }
}

export async function loadProofItem(id: string): Promise<ProofFeedItemDto | null> {
  try {
    const ports = createPrismaSocialPorts();
    const item = await ports.social.getItem(id);
    if (!item || item.visibility !== "SQUARE") {
      return null;
    }
    return toProofFeedItemDto(item);
  } catch {
    return null;
  }
}

export async function loadAndSyncAuthorSquare(userId: string): Promise<ProofFeedItemDto[] | null> {
  try {
    const ports = createPrismaSocialPorts();
    await syncProofFeed(ports, { userId });
    const items = await ports.social.listItemsForUser(userId);
    return items.filter((row) => row.visibility === "SQUARE").map(toProofFeedItemDto);
  } catch {
    return null;
  }
}
