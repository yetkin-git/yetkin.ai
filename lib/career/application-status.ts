/**
 * Adayın kurumsal başvuru durum kartı — SHORTLISTED / QUALIFIED_NOT_SHORTLISTED / BELOW_THRESHOLD.
 */

import "server-only";

import { getPrisma } from "@/lib/kernel/db";
import {
  rankJobApplications,
  type KurumsalApplicationBand,
} from "@/lib/sales/kurumsal-screening";

export type CandidateApplicationStatusCard = {
  applicationId: string;
  jobTitle: string;
  companyName: string;
  slug: string;
  band: Exclude<KurumsalApplicationBand, "PENDING_TEST"> | "PENDING_TEST";
  bandLabel: string;
  weightedScore: number | null;
  applyPath: string;
};

function bandLabel(band: KurumsalApplicationBand): string {
  if (band === "SHORTLISTED") {
    return "Kısa listedesin";
  }
  if (band === "QUALIFIED_NOT_SHORTLISTED") {
    return "Barajı geçti — yedek liste";
  }
  if (band === "BELOW_THRESHOLD") {
    return "Baraj altı";
  }
  return "Test bekleniyor";
}

export async function loadCandidateApplicationStatuses(
  candidateUserId: string,
): Promise<CandidateApplicationStatusCard[]> {
  const prisma = getPrisma();
  const applications = await prisma.kurumsalJobApplication.findMany({
    where: { candidateUserId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      job: {
        select: {
          title: true,
          companyName: true,
          slug: true,
          minScore: true,
          shortlistLimit: true,
          applications: {
            select: { id: true, weightedScore: true, createdAt: true },
          },
        },
      },
    },
  });
  const cards: CandidateApplicationStatusCard[] = [];
  for (const app of applications) {
    const ranked = rankJobApplications(app.job.applications, app.job.minScore, app.job.shortlistLimit);
    const self = ranked.find((row) => row.id === app.id);
    const band = self?.band ?? "PENDING_TEST";
    cards.push({
      applicationId: app.id,
      jobTitle: app.job.title,
      companyName: app.job.companyName,
      slug: app.job.slug,
      band,
      bandLabel: bandLabel(band),
      weightedScore: self?.weightedScore ?? app.weightedScore,
      applyPath: `/ilan/${app.job.slug}`,
    });
  }
  return cards;
}
