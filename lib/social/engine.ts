import { randomUUID } from "node:crypto";
import { isSealedCopyClean, truncateSealedBody } from "@/lib/social/moderation";
import { toProofFeedItemDto, toProofFeedPageDto, toSuccessSquareDto } from "@/lib/social/dto-map";
import type { ProofFeedItemDto, ProofFeedPageDto, SuccessSquareDto } from "@/lib/social/proof-feed.dto";
import {
  SOCIAL_FEED_PAGE_SIZE,
  passportVisaKeyFor,
  sourceKindToDtoKind,
  type ProofFeedInteractionKind,
  type ProofFeedItemRecord,
  type ProofFeedVisibility,
  type SealedSocialProof,
  type SocialProofStore,
  type SocialPulse,
  type SocialStore,
} from "@/lib/social/types";

export type SocialEnginePorts = {
  social: SocialStore;
  proofs: SocialProofStore;
};

export type SyncProofFeedCommand = {
  userId: string;
  now?: Date;
};

export type InteractProofCommand = {
  userId: string;
  itemId: string;
  kind: ProofFeedInteractionKind;
  note?: string;
  now?: Date;
};

function visibilityFor(proof: SealedSocialProof): ProofFeedVisibility {
  return isSealedCopyClean(proof.title, proof.body) ? "SQUARE" : "PRIVATE";
}

function toItem(proof: SealedSocialProof, now: Date): ProofFeedItemRecord {
  const kind = proof.kind ?? sourceKindToDtoKind(proof.sourceKind);
  return {
    id: randomUUID(),
    userId: proof.userId,
    sourceKind: proof.sourceKind,
    sourceId: proof.sourceId,
    kind,
    title: proof.title.trim(),
    body: truncateSealedBody(proof.body),
    sealedAt: proof.sealedAt,
    passportVisaKey: passportVisaKeyFor({ ...proof, kind }),
    mediaUrl: null,
    visibility: visibilityFor(proof),
    createdAt: now,
  };
}

export async function ingestSealedProof(
  ports: SocialEnginePorts,
  proof: SealedSocialProof,
  now = new Date(),
): Promise<{ applied: boolean; item: ProofFeedItemRecord }> {
  const existing = await ports.social.getItemBySource(proof.sourceKind, proof.sourceId);
  if (existing) {
    return { applied: false, item: existing };
  }
  const item = await ports.social.insertItem(toItem(proof, now));
  return { applied: true, item };
}

export async function syncProofFeed(
  ports: SocialEnginePorts,
  command: SyncProofFeedCommand,
): Promise<ProofFeedItemRecord[]> {
  const proofs = await ports.proofs.listSealedProofs(command.userId);
  const items: ProofFeedItemRecord[] = [];
  for (const proof of proofs) {
    const result = await ingestSealedProof(ports, proof, command.now);
    items.push(result.item);
  }
  return items;
}

export async function listProofFeedPage(
  ports: SocialEnginePorts,
  limit = SOCIAL_FEED_PAGE_SIZE,
): Promise<ProofFeedPageDto> {
  const items = await ports.social.listSquareItems(limit);
  return toProofFeedPageDto(items);
}

export async function getProofFeedItemDto(
  ports: SocialEnginePorts,
  itemId: string,
): Promise<ProofFeedItemDto> {
  const item = await ports.social.getItem(itemId);
  if (!item) {
    throw new Error("Kanıt bulunamadı.");
  }
  if (item.visibility !== "SQUARE") {
    throw new Error("Bu kanıt meydanda görünmez.");
  }
  return toProofFeedItemDto(item);
}

export async function interactWithProof(
  ports: SocialEnginePorts,
  command: InteractProofCommand,
): Promise<{ applied: boolean }> {
  const item = await ports.social.getItem(command.itemId);
  if (!item || item.visibility !== "SQUARE") {
    throw new Error("Kanıt bulunamadı.");
  }
  if (command.note && !isSealedCopyClean(command.note, "")) {
    throw new Error("Mühürlü kopya tık avı veya siyaset taşıyamaz.");
  }
  const existing = await ports.social.getInteraction(command.userId, command.itemId, command.kind);
  if (existing) {
    return { applied: false };
  }
  const now = command.now ?? new Date();
  await ports.social.insertInteraction({
    id: randomUUID(),
    userId: command.userId,
    itemId: command.itemId,
    kind: command.kind,
    createdAt: now,
  });
  return { applied: true };
}

export async function buildSuccessSquare(
  ports: SocialEnginePorts,
  userId: string,
): Promise<SuccessSquareDto> {
  await syncProofFeed(ports, { userId });
  const items = await ports.social.listItemsForUser(userId);
  return toSuccessSquareDto(userId, items);
}

export async function buildSocialPulse(
  ports: SocialEnginePorts,
  userId: string,
): Promise<SocialPulse> {
  await syncProofFeed(ports, { userId });
  return ports.social.pulseForUser(userId);
}
