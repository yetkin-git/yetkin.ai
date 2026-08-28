import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import { truncateSealedBody } from "@/lib/social/moderation";
import {
  sourceKindToDtoKind,
  type ProofFeedSourceKind,
  type SealedSocialProof,
  type SocialProofStore,
} from "@/lib/social/types";

/**
 * Kanıt okuma Prisma üzerinden — lib/academy, lib/freelancer, lib/arena, lib/studio import etmez.
 * Yalnız mühürlü satırlar: sertifika, RELEASED sözleşme, arena ödülü, başarılı Studio üretimi.
 */
export function createPrismaSocialProofStore(): SocialProofStore {
  const prisma = getPrisma();

  async function fromCertificate(sourceId: string): Promise<SealedSocialProof | null> {
    const row = await prisma.academyCertificate.findUnique({ where: { id: sourceId } });
    if (!row || row.revokedAt) {
      return null;
    }
    return {
      sourceKind: "CERTIFICATE",
      sourceId: row.id,
      userId: row.userId,
      title: row.title,
      body: `Akademi sertifikası · ${row.serialKey}`,
      sealedAt: row.issuedAt,
      passportVisaKey: `academy.certificate:${row.id}`,
      mediaUrl: null,
      kind: sourceKindToDtoKind("CERTIFICATE"),
    };
  }

  async function fromEscrowRelease(sourceId: string): Promise<SealedSocialProof | null> {
    const row = await prisma.freelancerContract.findUnique({
      where: { id: sourceId },
      include: { job: { select: { title: true } } },
    });
    if (!row || row.status !== "RELEASED" || !row.releasedAt) {
      return null;
    }
    return {
      sourceKind: "ESCROW_RELEASE",
      sourceId: row.id,
      userId: row.freelancerId,
      title: row.job.title,
      body: "Freelancer emanet serbest bırakıldı.",
      sealedAt: row.releasedAt,
      passportVisaKey: `freelancer.release:${row.id}`,
      mediaUrl: null,
      kind: sourceKindToDtoKind("ESCROW_RELEASE"),
    };
  }

  async function fromAward(sourceId: string): Promise<SealedSocialProof | null> {
    const row = await prisma.arenaAward.findUnique({
      where: { id: sourceId },
      include: { tender: { select: { title: true } } },
    });
    if (!row) {
      return null;
    }
    return {
      sourceKind: "AWARD",
      sourceId: row.id,
      userId: row.userId,
      title: row.tender.title,
      body: "Arena ödülü mühürlendi.",
      sealedAt: row.createdAt,
      passportVisaKey: `arena.award:${row.id}`,
      mediaUrl: null,
      kind: sourceKindToDtoKind("AWARD"),
    };
  }

  async function fromStudio(sourceId: string): Promise<SealedSocialProof | null> {
    const row = await prisma.studioGeneration.findUnique({
      where: { id: sourceId },
      include: { draft: { select: { title: true } } },
    });
    if (!row || row.status !== "SUCCEEDED" || !row.completedAt) {
      return null;
    }
    return {
      sourceKind: "STUDIO",
      sourceId: row.id,
      userId: row.userId,
      title: row.draft.title,
      body: truncateSealedBody(row.outputText ?? "Studio üretimi tamamlandı."),
      sealedAt: row.completedAt,
      passportVisaKey: `studio.generation:${row.id}`,
      mediaUrl: null,
      kind: sourceKindToDtoKind("STUDIO"),
    };
  }

  return {
    async getSealedProof(sourceKind: ProofFeedSourceKind, sourceId: string) {
      if (sourceKind === "CERTIFICATE") {
        return fromCertificate(sourceId);
      }
      if (sourceKind === "ESCROW_RELEASE") {
        return fromEscrowRelease(sourceId);
      }
      if (sourceKind === "AWARD") {
        return fromAward(sourceId);
      }
      return fromStudio(sourceId);
    },
    async listSealedProofs(userId) {
      const [certificates, contracts, awards, generations] = await Promise.all([
        prisma.academyCertificate.findMany({
          where: { userId, revokedAt: null },
          orderBy: { issuedAt: "asc" },
        }),
        prisma.freelancerContract.findMany({
          where: { freelancerId: userId, status: "RELEASED" },
          include: { job: { select: { title: true } } },
          orderBy: { releasedAt: "asc" },
        }),
        prisma.arenaAward.findMany({
          where: { userId },
          include: { tender: { select: { title: true } } },
          orderBy: { createdAt: "asc" },
        }),
        prisma.studioGeneration.findMany({
          where: { userId, status: "SUCCEEDED" },
          include: { draft: { select: { title: true } } },
          orderBy: { completedAt: "asc" },
        }),
      ]);
      const fromAcademy: SealedSocialProof[] = certificates.map((row) => ({
        sourceKind: "CERTIFICATE",
        sourceId: row.id,
        userId: row.userId,
        title: row.title,
        body: `Akademi sertifikası · ${row.serialKey}`,
        sealedAt: row.issuedAt,
        passportVisaKey: `academy.certificate:${row.id}`,
        mediaUrl: null,
        kind: sourceKindToDtoKind("CERTIFICATE"),
      }));
      const fromFreelancer: SealedSocialProof[] = contracts
        .filter((row) => row.releasedAt !== null)
        .map((row) => ({
          sourceKind: "ESCROW_RELEASE" as const,
          sourceId: row.id,
          userId: row.freelancerId,
          title: row.job.title,
          body: "Freelancer emanet serbest bırakıldı.",
          sealedAt: row.releasedAt as Date,
          passportVisaKey: `freelancer.release:${row.id}`,
          mediaUrl: null,
          kind: sourceKindToDtoKind("ESCROW_RELEASE"),
        }));
      const fromArena: SealedSocialProof[] = awards.map((row) => ({
        sourceKind: "AWARD",
        sourceId: row.id,
        userId: row.userId,
        title: row.tender.title,
        body: "Arena ödülü mühürlendi.",
        sealedAt: row.createdAt,
        passportVisaKey: `arena.award:${row.id}`,
        mediaUrl: null,
        kind: sourceKindToDtoKind("AWARD"),
      }));
      const fromStudioList: SealedSocialProof[] = generations
        .filter((row) => row.completedAt !== null)
        .map((row) => ({
          sourceKind: "STUDIO" as const,
          sourceId: row.id,
          userId: row.userId,
          title: row.draft.title,
          body: truncateSealedBody(row.outputText ?? "Studio üretimi tamamlandı."),
          sealedAt: row.completedAt as Date,
          passportVisaKey: `studio.generation:${row.id}`,
          mediaUrl: null,
          kind: sourceKindToDtoKind("STUDIO"),
        }));
      return [...fromAcademy, ...fromFreelancer, ...fromArena, ...fromStudioList];
    },
  };
}
