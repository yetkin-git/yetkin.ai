import { describe, expect, it } from "vitest";
import { SOCIAL_HAPPY_PATH } from "@/lib/social";
import { assertSealedProofDto, toProofFeedItemDto } from "@/lib/social/dto-map";
import {
  ingestSealedProof,
  interactWithProof,
  listProofFeedPage,
  syncProofFeed,
} from "@/lib/social/engine";
import { PROOF_FEED_FORBIDDEN_KEYS, type ProofFeedItemDto } from "@/lib/social/proof-feed.dto";
import type { SealedSocialProof } from "@/lib/social/types";
import { createMemorySocialProofStore, createMemorySocialStore } from "../helpers/memory-social";

const AUTHOR = "author-1";
const OTHER = "reader-1";
const NOW = new Date("2026-08-14T12:00:00.000Z");

function proof(partial: Partial<SealedSocialProof> & Pick<SealedSocialProof, "sourceKind" | "sourceId" | "kind" | "title">): SealedSocialProof {
  return {
    userId: AUTHOR,
    body: "Mühürlü teslim.",
    sealedAt: NOW,
    passportVisaKey: null,
    mediaUrl: null,
    ...partial,
  };
}

describe("YetkinX mühürlü kanıt feed", () => {
  it("mutlu yol mühür → akış → meydandır", () => {
    expect(SOCIAL_HAPPY_PATH).toEqual(["sealed-proof", "feed", "square"]);
  });

  it("akademi, freelancer, arena ve studio mühürlerini akışa alır; FUNDED akmaz", async () => {
    const proofs = createMemorySocialProofStore([
      proof({
        sourceKind: "CERTIFICATE",
        sourceId: "cert-1",
        kind: "certificate",
        title: "Rail temeli",
        passportVisaKey: "academy.certificate:cert-1",
      }),
      proof({
        sourceKind: "ESCROW_RELEASE",
        sourceId: "contract-1",
        kind: "escrow-release",
        title: "API mühürü",
        passportVisaKey: "freelancer.release:contract-1",
      }),
      proof({
        sourceKind: "AWARD",
        sourceId: "award-1",
        kind: "award",
        title: "Arena birincisi",
        passportVisaKey: "arena.award:award-1",
      }),
      proof({
        sourceKind: "STUDIO",
        sourceId: "gen-1",
        kind: "studio",
        title: "Metin peronu",
        body: "Taslak üretim tamam.",
        passportVisaKey: "studio.generation:gen-1",
      }),
    ]);
    const ports = { social: createMemorySocialStore(), proofs };
    const items = await syncProofFeed(ports, { userId: AUTHOR, now: NOW });
    expect(items).toHaveLength(4);
    expect(items.map((row) => row.kind).sort()).toEqual([
      "award",
      "certificate",
      "escrow-release",
      "studio",
    ]);
    const again = await syncProofFeed(ports, { userId: AUTHOR, now: NOW });
    expect(again).toHaveLength(4);
    expect((await ports.social.listItemsForUser(AUTHOR)).length).toBe(4);

    const funded = await proofs.getSealedProof("ESCROW_RELEASE", "funded-1");
    expect(funded).toBeNull();
  });

  it("siyaset/tık avı kopyayı meydana koymaz; DTO boost taşımaz", async () => {
    const proofs = createMemorySocialProofStore([
      proof({
        sourceKind: "STUDIO",
        sourceId: "gen-politics",
        kind: "studio",
        title: "Seçim kampanyası metni",
        body: "Oy verin miting çağrısı",
      }),
      proof({
        sourceKind: "CERTIFICATE",
        sourceId: "cert-clean",
        kind: "certificate",
        title: "Temiz sertifika",
      }),
    ]);
    const ports = { social: createMemorySocialStore(), proofs };
    await syncProofFeed(ports, { userId: AUTHOR, now: NOW });
    const page = await listProofFeedPage(ports);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.title).toBe("Temiz sertifika");
    expect(page.items[0]).not.toHaveProperty("boost");
    for (const key of PROOF_FEED_FORBIDDEN_KEYS) {
      expect(page.items[0]).not.toHaveProperty(key);
    }

    const dto: ProofFeedItemDto = {
      id: "p1",
      authorId: AUTHOR,
      kind: "visa",
      title: "Kariyer vizesi",
      body: "mühür",
      sealedAt: NOW.toISOString(),
      passportVisaKey: "career.portfolio",
      mediaUrl: null,
    };
    expect(assertSealedProofDto(dto).kind).toBe("visa");
    expect(() =>
      assertSealedProofDto({ ...dto, boost: 9 } as ProofFeedItemDto),
    ).toThrow(/boost|mühürsüz/);
  });

  it("iç paylaşım tık avı notunu reddeder; onay idempotenttir", async () => {
    const proofs = createMemorySocialProofStore([
      proof({
        sourceKind: "CERTIFICATE",
        sourceId: "cert-2",
        kind: "certificate",
        title: "Kanıt",
      }),
    ]);
    const ports = { social: createMemorySocialStore(), proofs };
    const [item] = await syncProofFeed(ports, { userId: AUTHOR, now: NOW });
    expect(item).toBeDefined();

    const first = await interactWithProof(ports, {
      userId: OTHER,
      itemId: item!.id,
      kind: "ACKNOWLEDGE",
      now: NOW,
    });
    expect(first.applied).toBe(true);
    const second = await interactWithProof(ports, {
      userId: OTHER,
      itemId: item!.id,
      kind: "ACKNOWLEDGE",
      now: NOW,
    });
    expect(second.applied).toBe(false);

    await expect(
      interactWithProof(ports, {
        userId: OTHER,
        itemId: item!.id,
        kind: "SHARE",
        note: "İnanılmaz şok ifşa",
        now: NOW,
      }),
    ).rejects.toThrow(/tık avı|siyaset/);

    const share = await interactWithProof(ports, {
      userId: OTHER,
      itemId: item!.id,
      kind: "SHARE",
      now: NOW,
    });
    expect(share.applied).toBe(true);
    expect(toProofFeedItemDto(item!).mediaUrl).toBeNull();
  });
});
