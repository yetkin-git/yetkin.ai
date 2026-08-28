import "server-only";

import { getPrisma } from "@/lib/kernel/db";

/**
 * Frozen backlog proof-export — Kurumsal Faz 1 context değildir.
 * Kariyer corporateJobPosting tablosuna doğrudan girmez.
 */
export type ReleasedCorporateFreelancerProof = {
  sourceId: string;
  awardedUserId: string;
  ownerUserId: string;
  title: string;
  releasedAt: Date;
};

export async function getReleasedCorporateFreelancerProof(
  sourceId: string,
): Promise<ReleasedCorporateFreelancerProof | null> {
  const prisma = getPrisma();
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
  return {
    sourceId: posting.id,
    awardedUserId: posting.awardedUserId,
    ownerUserId: posting.userId,
    title: posting.title,
    releasedAt: posting.releasedAt,
  };
}

export async function listReleasedCorporateFreelancerProofs(
  userId: string,
): Promise<ReleasedCorporateFreelancerProof[]> {
  const prisma = getPrisma();
  const postings = await prisma.corporateJobPosting.findMany({
    where: {
      awardedUserId: userId,
      status: "RELEASED",
      workbenchKind: "FREELANCER",
    },
    orderBy: { releasedAt: "asc" },
  });
  return postings
    .filter((row) => row.releasedAt !== null && row.awardedUserId !== null)
    .map((row) => ({
      sourceId: row.id,
      awardedUserId: row.awardedUserId as string,
      ownerUserId: row.userId,
      title: row.title,
      releasedAt: row.releasedAt as Date,
    }));
}
