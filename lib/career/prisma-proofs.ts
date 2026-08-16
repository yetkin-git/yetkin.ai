import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { CareerProofStore, SealedCareerProof } from "@/lib/career/types";

/**
 * Kanıt okuma Prisma üzerinden — lib/academy, lib/freelancer ve lib/kurumsal import etmez.
 * Yalnızca mühürlü satırlar: sertifika / RELEASED sözleşme / RELEASED kurumsal FREELANCER ilanı.
 */
export function createPrismaCareerProofStore(): CareerProofStore {
  const prisma = getPrisma();
  return {
    async getSealedProof(sourceKind, sourceId) {
      if (sourceKind === "ACADEMY_CERTIFICATE") {
        const row = await prisma.academyCertificate.findUnique({ where: { id: sourceId } });
        if (!row) {
          return null;
        }
        const proof: SealedCareerProof = {
          sourceKind,
          sourceId: row.id,
          userId: row.userId,
          actorUserIds: [row.userId],
          title: row.title,
          issuedAt: row.issuedAt,
          certificateHash: row.certificateHash,
        };
        return proof;
      }
      const contract = await prisma.freelancerContract.findUnique({
        where: { id: sourceId },
        include: { job: { select: { title: true } } },
      });
      if (contract && contract.status === "RELEASED" && contract.releasedAt) {
        const proof: SealedCareerProof = {
          sourceKind,
          sourceId: contract.id,
          userId: contract.freelancerId,
          actorUserIds: [contract.freelancerId, contract.clientId],
          title: contract.job.title,
          issuedAt: contract.releasedAt,
          certificateHash: null,
        };
        return proof;
      }
      const posting = await prisma.corporateJobPosting.findUnique({
        where: { id: sourceId },
      });
      if (
        !posting ||
        posting.status !== "RELEASED" ||
        posting.workbenchKind !== "FREELANCER" ||
        !posting.releasedAt ||
        !posting.awardedUserId
      ) {
        return null;
      }
      const proof: SealedCareerProof = {
        sourceKind,
        sourceId: posting.id,
        userId: posting.awardedUserId,
        actorUserIds: [posting.awardedUserId, posting.userId],
        title: posting.title,
        issuedAt: posting.releasedAt,
        certificateHash: null,
      };
      return proof;
    },
    async listSealedProofs(userId) {
      const [certificates, contracts, postings] = await Promise.all([
        prisma.academyCertificate.findMany({
          where: { userId },
          orderBy: { issuedAt: "asc" },
        }),
        prisma.freelancerContract.findMany({
          where: { freelancerId: userId, status: "RELEASED" },
          include: { job: { select: { title: true } } },
          orderBy: { releasedAt: "asc" },
        }),
        prisma.corporateJobPosting.findMany({
          where: {
            awardedUserId: userId,
            status: "RELEASED",
            workbenchKind: "FREELANCER",
          },
          orderBy: { releasedAt: "asc" },
        }),
      ]);
      const fromAcademy: SealedCareerProof[] = certificates.map((row) => ({
        sourceKind: "ACADEMY_CERTIFICATE",
        sourceId: row.id,
        userId: row.userId,
        actorUserIds: [row.userId],
        title: row.title,
        issuedAt: row.issuedAt,
        certificateHash: row.certificateHash,
      }));
      const fromFreelancer: SealedCareerProof[] = contracts
        .filter((row) => row.releasedAt !== null)
        .map((row) => ({
          sourceKind: "FREELANCER_RELEASE" as const,
          sourceId: row.id,
          userId: row.freelancerId,
          actorUserIds: [row.freelancerId, row.clientId],
          title: row.job.title,
          issuedAt: row.releasedAt as Date,
          certificateHash: null,
        }));
      const fromKurumsal: SealedCareerProof[] = postings
        .filter((row) => row.releasedAt !== null && row.awardedUserId !== null)
        .map((row) => ({
          sourceKind: "FREELANCER_RELEASE" as const,
          sourceId: row.id,
          userId: row.awardedUserId as string,
          actorUserIds: [row.awardedUserId as string, row.userId],
          title: row.title,
          issuedAt: row.releasedAt as Date,
          certificateHash: null,
        }));
      return [...fromAcademy, ...fromFreelancer, ...fromKurumsal];
    },
  };
}
