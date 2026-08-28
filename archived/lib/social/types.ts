import type { ProofKind } from "@/lib/social/proof-feed.dto";

export const SOCIAL_MODULE_KEY = "social" as const;
export const SOCIAL_FEED_PAGE_SIZE = 30;

export type ProofFeedSourceKind = "CERTIFICATE" | "ESCROW_RELEASE" | "AWARD" | "STUDIO";
export type ProofFeedVisibility = "SQUARE" | "PRIVATE";
export type ProofFeedInteractionKind = "ACKNOWLEDGE" | "SHARE";

export type ProofFeedItemRecord = {
  id: string;
  userId: string;
  sourceKind: ProofFeedSourceKind;
  sourceId: string;
  kind: ProofKind;
  title: string;
  body: string;
  sealedAt: Date;
  passportVisaKey: string | null;
  mediaUrl: string | null;
  visibility: ProofFeedVisibility;
  createdAt: Date;
};

export type ProofFeedInteractionRecord = {
  id: string;
  userId: string;
  itemId: string;
  kind: ProofFeedInteractionKind;
  createdAt: Date;
};

export type SealedSocialProof = {
  sourceKind: ProofFeedSourceKind;
  sourceId: string;
  userId: string;
  title: string;
  body: string;
  sealedAt: Date;
  passportVisaKey: string | null;
  mediaUrl: string | null;
  kind: ProofKind;
};

export type SocialPulse = {
  sealedCount: number;
  squareCount: number;
  lastTitle: string | null;
};

export type SocialProofStore = {
  getSealedProof(sourceKind: ProofFeedSourceKind, sourceId: string): Promise<SealedSocialProof | null>;
  listSealedProofs(userId: string): Promise<SealedSocialProof[]>;
};

export type SocialStore = {
  insertItem(item: ProofFeedItemRecord): Promise<ProofFeedItemRecord>;
  getItem(id: string): Promise<ProofFeedItemRecord | null>;
  getItemBySource(
    sourceKind: ProofFeedSourceKind,
    sourceId: string,
  ): Promise<ProofFeedItemRecord | null>;
  listSquareItems(limit: number): Promise<ProofFeedItemRecord[]>;
  listItemsForUser(userId: string): Promise<ProofFeedItemRecord[]>;
  insertInteraction(interaction: ProofFeedInteractionRecord): Promise<ProofFeedInteractionRecord>;
  getInteraction(
    userId: string,
    itemId: string,
    kind: ProofFeedInteractionKind,
  ): Promise<ProofFeedInteractionRecord | null>;
  pulseForUser(userId: string): Promise<SocialPulse>;
};

export function sourceKindToDtoKind(sourceKind: ProofFeedSourceKind): ProofKind {
  switch (sourceKind) {
    case "CERTIFICATE":
      return "certificate";
    case "ESCROW_RELEASE":
      return "escrow-release";
    case "AWARD":
      return "award";
    case "STUDIO":
      return "studio";
  }
}

export function passportVisaKeyFor(proof: SealedSocialProof): string {
  return proof.passportVisaKey ?? `${proof.kind}:${proof.sourceId}`;
}
