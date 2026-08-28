import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import type { ProofReadPort, SealedProofRecord } from "@/lib/kernel/proof/port";

/**
 * Proof okuma Prisma adaptörü. Kernel dikey klasör import etmez;
 * academyCertificate (Proof) ve freelancerContract RELEASED (Marketplace)
 * satırlarını doğrudan okur. Kariyer yalnız ProofReadPort konuşur.
 */

export type AcademyCertificateProofRow = {
  sourceId: string;
  userId: string;
  title: string;
  issuedAt: Date;
  certificateHash: string | null;
  courseSlug: string | null;
};

export type ReleasedWorkProofRow = {
  sourceId: string;
  freelancerId: string;
  clientId: string;
  title: string;
  releasedAt: Date;
};

const CERTIFICATE_PROOF_INCLUDE = { course: { select: { slug: true } } } as const;

function toAcademyProof(row: {
  id: string;
  userId: string;
  title: string;
  issuedAt: Date;
  certificateHash: string | null;
  revokedAt: Date | null;
  course?: { slug: string } | null;
}): AcademyCertificateProofRow | null {
  if (row.revokedAt) {
    return null;
  }
  return {
    sourceId: row.id,
    userId: row.userId,
    title: row.title,
    issuedAt: row.issuedAt,
    certificateHash: row.certificateHash,
    courseSlug: row.course?.slug ?? null,
  };
}

export async function getAcademyCertificateProofRow(
  sourceId: string,
): Promise<AcademyCertificateProofRow | null> {
  const prisma = getPrisma();
  const row = await prisma.academyCertificate.findUnique({
    where: { id: sourceId },
    include: CERTIFICATE_PROOF_INCLUDE,
  });
  if (!row) {
    return null;
  }
  return toAcademyProof(row);
}

export async function listAcademyCertificateProofRows(
  userId: string,
): Promise<AcademyCertificateProofRow[]> {
  const prisma = getPrisma();
  const rows = await prisma.academyCertificate.findMany({
    where: { userId, revokedAt: null },
    include: CERTIFICATE_PROOF_INCLUDE,
    orderBy: { issuedAt: "asc" },
  });
  return rows
    .map((row) => toAcademyProof(row))
    .filter((row): row is AcademyCertificateProofRow => row !== null);
}

export async function getReleasedWorkProofRow(
  sourceId: string,
): Promise<ReleasedWorkProofRow | null> {
  const prisma = getPrisma();
  const contract = await prisma.freelancerContract.findUnique({
    where: { id: sourceId },
    include: { job: { select: { title: true } } },
  });
  if (!contract || contract.status !== "RELEASED" || !contract.releasedAt) {
    return null;
  }
  return {
    sourceId: contract.id,
    freelancerId: contract.freelancerId,
    clientId: contract.clientId,
    title: contract.job.title,
    releasedAt: contract.releasedAt,
  };
}

export async function listReleasedWorkProofRows(userId: string): Promise<ReleasedWorkProofRow[]> {
  const prisma = getPrisma();
  const contracts = await prisma.freelancerContract.findMany({
    where: { freelancerId: userId, status: "RELEASED" },
    include: { job: { select: { title: true } } },
    orderBy: { releasedAt: "asc" },
  });
  return contracts
    .filter((row) => row.releasedAt !== null)
    .map((row) => ({
      sourceId: row.id,
      freelancerId: row.freelancerId,
      clientId: row.clientId,
      title: row.job.title,
      releasedAt: row.releasedAt as Date,
    }));
}

function sealedFromAcademy(row: AcademyCertificateProofRow): SealedProofRecord {
  return {
    sourceKind: "ACADEMY_CERTIFICATE",
    sourceId: row.sourceId,
    userId: row.userId,
    actorUserIds: [row.userId],
    title: row.title,
    issuedAt: row.issuedAt,
    certificateHash: row.certificateHash,
    courseSlug: row.courseSlug,
  };
}

function sealedFromRelease(row: ReleasedWorkProofRow): SealedProofRecord {
  return {
    sourceKind: "FREELANCER_RELEASE",
    sourceId: row.sourceId,
    userId: row.freelancerId,
    actorUserIds: [row.freelancerId, row.clientId],
    title: row.title,
    issuedAt: row.releasedAt,
    certificateHash: null,
  };
}

export function createPrismaProofReadPort(): ProofReadPort {
  return {
    async getSealedProof(sourceKind, sourceId) {
      if (sourceKind === "ACADEMY_CERTIFICATE") {
        const row = await getAcademyCertificateProofRow(sourceId);
        if (!row) {
          return null;
        }
        return sealedFromAcademy(row);
      }
      const contract = await getReleasedWorkProofRow(sourceId);
      if (!contract) {
        return null;
      }
      return sealedFromRelease(contract);
    },
    async listSealedProofs(userId) {
      const [certificates, contracts] = await Promise.all([
        listAcademyCertificateProofRows(userId),
        listReleasedWorkProofRows(userId),
      ]);
      return [...certificates.map(sealedFromAcademy), ...contracts.map(sealedFromRelease)];
    },
  };
}
