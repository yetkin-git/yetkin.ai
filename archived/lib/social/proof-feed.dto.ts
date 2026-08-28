/**
 * YetkinX mühürlü kanıt feed'i — mobil DTO (S2-A).
 * Boost / jüri / dış senkron bu sözleşmede yoktur.
 */
export type ProofKind = "visa" | "certificate" | "escrow-release" | "award" | "studio";

export type ProofFeedItemDto = {
  id: string;
  authorId: string;
  kind: ProofKind;
  title: string;
  body: string;
  sealedAt: string;
  passportVisaKey: string | null;
  mediaUrl: string | null;
};

export type ProofFeedPageDto = {
  items: ProofFeedItemDto[];
  nextCursor: string | null;
};

export type SuccessSquareDto = {
  userId: string;
  headline: string;
  sealedCount: number;
  items: ProofFeedItemDto[];
};

export const PROOF_FEED_DTO_KEYS = [
  "id",
  "authorId",
  "kind",
  "title",
  "body",
  "sealedAt",
  "passportVisaKey",
  "mediaUrl",
] as const;

export const PROOF_FEED_FORBIDDEN_KEYS = [
  "boost",
  "jury",
  "likeCount",
  "impressionCount",
  "xSync",
  "politics",
] as const;
