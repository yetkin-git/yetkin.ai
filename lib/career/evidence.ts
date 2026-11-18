import "server-only";

import { loadLatestYetkinCvEvidence } from "@/lib/career/yetkincv-store";
import type { CareerEvidence } from "@/lib/career/swot";
import { getPrisma } from "@/lib/kernel/db";

export async function loadCareerEvidence(userId: string): Promise<CareerEvidence> {
  const prisma = getPrisma();
  const [stamps, certificates, outputs, yetkinCv] = await Promise.all([
    prisma.careerVisaStamp.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      take: 8,
      select: { title: true },
    }),
    prisma.academyCertificate.findMany({
      where: { userId, revokedAt: null },
      orderBy: { issuedAt: "desc" },
      take: 6,
      select: { title: true },
    }),
    prisma.tezgahOutput.groupBy({
      by: ["toolKey"],
      where: { userId },
      _count: { _all: true },
    }),
    loadLatestYetkinCvEvidence(userId).catch(() => null),
  ]);
  const tezgahToolCounts: Record<string, number> = {};
  for (const row of outputs) {
    tezgahToolCounts[row.toolKey] = row._count._all;
  }
  return {
    stampTitles: stamps.map((row) => row.title),
    certificateTitles: certificates.map((row) => row.title),
    tezgahToolCounts,
    yetkinCv,
  };
}
