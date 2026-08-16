export const MODULE_ID = "social" as const;

/** Faz 7B — mühürlü kanıt → meydan akışı → iç paylaşım. Boost/jüri/X yok. */
export const SOCIAL_HAPPY_PATH = ["sealed-proof", "feed", "square"] as const;

export type SocialHappyPathStep = (typeof SOCIAL_HAPPY_PATH)[number];

export type {
  ProofFeedItemDto,
  ProofFeedPageDto,
  ProofKind,
  SuccessSquareDto,
} from "@/lib/social/proof-feed.dto";
export { PROOF_FEED_DTO_KEYS, PROOF_FEED_FORBIDDEN_KEYS } from "@/lib/social/proof-feed.dto";
export { toProofFeedItemDto, assertSealedProofDto } from "@/lib/social/dto-map";
export {
  syncProofFeed,
  listProofFeedPage,
  ingestSealedProof,
  interactWithProof,
  buildSocialPulse,
} from "@/lib/social/engine";
export { isSealedCopyClean } from "@/lib/social/moderation";
export type {
  ProofFeedItemRecord,
  SealedSocialProof,
  SocialProofStore,
  SocialPulse,
  SocialStore,
} from "@/lib/social/types";
