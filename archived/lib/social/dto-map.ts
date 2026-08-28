import {
  PROOF_FEED_DTO_KEYS,
  PROOF_FEED_FORBIDDEN_KEYS,
  type ProofFeedItemDto,
  type ProofFeedPageDto,
  type SuccessSquareDto,
} from "@/lib/social/proof-feed.dto";
import type { ProofFeedItemRecord } from "@/lib/social/types";

export function toProofFeedItemDto(item: ProofFeedItemRecord): ProofFeedItemDto {
  return {
    id: item.id,
    authorId: item.userId,
    kind: item.kind,
    title: item.title,
    body: item.body,
    sealedAt: item.sealedAt.toISOString(),
    passportVisaKey: item.passportVisaKey,
    mediaUrl: item.mediaUrl,
  };
}

export function toProofFeedPageDto(items: ProofFeedItemRecord[]): ProofFeedPageDto {
  return {
    items: items.map(toProofFeedItemDto),
    nextCursor: null,
  };
}

export function toSuccessSquareDto(userId: string, items: ProofFeedItemRecord[]): SuccessSquareDto {
  const square = items.filter((row) => row.visibility === "SQUARE");
  return {
    userId,
    headline: square[0]?.title ?? "Mühürlü başarı meydanı",
    sealedCount: square.length,
    items: square.map(toProofFeedItemDto),
  };
}

export function assertSealedProofDto(dto: ProofFeedItemDto): ProofFeedItemDto {
  const record = dto as unknown as Record<string, unknown>;
  for (const key of PROOF_FEED_FORBIDDEN_KEYS) {
    if (Object.prototype.hasOwnProperty.call(record, key) && record[key] != null) {
      throw new Error("Kanıt DTO boost/jüri/tık avı alanı taşıyamaz.");
    }
  }
  for (const key of Object.keys(record)) {
    if (!(PROOF_FEED_DTO_KEYS as readonly string[]).includes(key)) {
      throw new Error("Kanıt DTO mühürsüz alan taşıyamaz.");
    }
  }
  return dto;
}
