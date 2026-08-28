import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type {
  ProofFeedInteractionRecord,
  ProofFeedItemRecord,
  SocialPulse,
  SocialStore,
} from "@/lib/social/types";
import type { ProofKind as DtoProofKind } from "@/lib/social/proof-feed.dto";

function toKind(kind: string): DtoProofKind {
  if (
    kind === "visa" ||
    kind === "certificate" ||
    kind === "escrow-release" ||
    kind === "award" ||
    kind === "studio"
  ) {
    return kind;
  }
  throw new Error("Kanıt türü mühürsüz.");
}

function toItem(row: {
  id: string;
  userId: string;
  sourceKind: ProofFeedItemRecord["sourceKind"];
  sourceId: string;
  kind: string;
  title: string;
  body: string;
  sealedAt: Date;
  passportVisaKey: string | null;
  mediaUrl: string | null;
  visibility: ProofFeedItemRecord["visibility"];
  createdAt: Date;
}): ProofFeedItemRecord {
  return {
    ...row,
    kind: toKind(row.kind),
  };
}

function toInteraction(row: {
  id: string;
  userId: string;
  itemId: string;
  kind: ProofFeedInteractionRecord["kind"];
  createdAt: Date;
}): ProofFeedInteractionRecord {
  return { ...row };
}

export function createPrismaSocialStore(): SocialStore {
  const prisma = getPrisma();
  return {
    async insertItem(item) {
      const row = await prisma.proofFeedItem.create({
        data: {
          id: item.id,
          userId: item.userId,
          sourceKind: item.sourceKind,
          sourceId: item.sourceId,
          kind: item.kind,
          title: item.title,
          body: item.body,
          sealedAt: item.sealedAt,
          passportVisaKey: item.passportVisaKey,
          mediaUrl: item.mediaUrl,
          visibility: item.visibility,
          createdAt: item.createdAt,
        },
      });
      return toItem(row);
    },
    async getItem(id) {
      const row = await prisma.proofFeedItem.findUnique({ where: { id } });
      return row ? toItem(row) : null;
    },
    async getItemBySource(sourceKind, sourceId) {
      const row = await prisma.proofFeedItem.findUnique({
        where: { sourceKind_sourceId: { sourceKind, sourceId } },
      });
      return row ? toItem(row) : null;
    },
    async listSquareItems(limit) {
      const rows = await prisma.proofFeedItem.findMany({
        where: { visibility: "SQUARE" },
        orderBy: { sealedAt: "desc" },
        take: limit,
      });
      return rows.map(toItem);
    },
    async listItemsForUser(userId) {
      const rows = await prisma.proofFeedItem.findMany({
        where: { userId },
        orderBy: { sealedAt: "desc" },
      });
      return rows.map(toItem);
    },
    async insertInteraction(interaction) {
      const row = await prisma.proofFeedInteraction.create({
        data: {
          id: interaction.id,
          userId: interaction.userId,
          itemId: interaction.itemId,
          kind: interaction.kind,
          createdAt: interaction.createdAt,
        },
      });
      return toInteraction(row);
    },
    async getInteraction(userId, itemId, kind) {
      const row = await prisma.proofFeedInteraction.findUnique({
        where: { userId_itemId_kind: { userId, itemId, kind } },
      });
      return row ? toInteraction(row) : null;
    },
    async pulseForUser(userId) {
      const [sealedCount, squareCount, latest] = await Promise.all([
        prisma.proofFeedItem.count({ where: { userId } }),
        prisma.proofFeedItem.count({ where: { userId, visibility: "SQUARE" } }),
        prisma.proofFeedItem.findFirst({
          where: { userId, visibility: "SQUARE" },
          orderBy: { sealedAt: "desc" },
          select: { title: true },
        }),
      ]);
      const pulse: SocialPulse = {
        sealedCount,
        squareCount,
        lastTitle: latest?.title ?? null,
      };
      return pulse;
    },
  };
}
