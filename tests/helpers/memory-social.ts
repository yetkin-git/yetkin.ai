import type {
  ProofFeedInteractionRecord,
  ProofFeedItemRecord,
  SealedSocialProof,
  SocialProofStore,
  SocialStore,
} from "@/lib/social/types";

export function createMemorySocialStore(): SocialStore {
  const items = new Map<string, ProofFeedItemRecord>();
  const interactions = new Map<string, ProofFeedInteractionRecord>();

  return {
    async insertItem(item) {
      items.set(item.id, { ...item });
      return { ...item };
    },
    async getItem(id) {
      const row = items.get(id);
      return row ? { ...row } : null;
    },
    async getItemBySource(sourceKind, sourceId) {
      const found = [...items.values()].find(
        (row) => row.sourceKind === sourceKind && row.sourceId === sourceId,
      );
      return found ? { ...found } : null;
    },
    async listSquareItems(limit) {
      return [...items.values()]
        .filter((row) => row.visibility === "SQUARE")
        .sort((a, b) => b.sealedAt.getTime() - a.sealedAt.getTime())
        .slice(0, limit)
        .map((row) => ({ ...row }));
    },
    async listItemsForUser(userId) {
      return [...items.values()]
        .filter((row) => row.userId === userId)
        .sort((a, b) => b.sealedAt.getTime() - a.sealedAt.getTime())
        .map((row) => ({ ...row }));
    },
    async insertInteraction(interaction) {
      interactions.set(interaction.id, { ...interaction });
      return { ...interaction };
    },
    async getInteraction(userId, itemId, kind) {
      const found = [...interactions.values()].find(
        (row) => row.userId === userId && row.itemId === itemId && row.kind === kind,
      );
      return found ? { ...found } : null;
    },
    async pulseForUser(userId) {
      const own = [...items.values()].filter((row) => row.userId === userId);
      const square = own.filter((row) => row.visibility === "SQUARE");
      const latest = [...square].sort((a, b) => b.sealedAt.getTime() - a.sealedAt.getTime())[0];
      return {
        sealedCount: own.length,
        squareCount: square.length,
        lastTitle: latest?.title ?? null,
      };
    },
  };
}

export function createMemorySocialProofStore(seed: SealedSocialProof[] = []): SocialProofStore & {
  add(proof: SealedSocialProof): void;
} {
  const proofs = [...seed];
  return {
    add(proof) {
      proofs.push(proof);
    },
    async getSealedProof(sourceKind, sourceId) {
      return proofs.find((row) => row.sourceKind === sourceKind && row.sourceId === sourceId) ?? null;
    },
    async listSealedProofs(userId) {
      return proofs.filter((row) => row.userId === userId).map((row) => ({ ...row }));
    },
  };
}
