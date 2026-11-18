import "server-only";

import { YETKINCV_VERTICALS } from "@/lib/career/yetkincv-options";
import { yetkinCvSkillCatalog } from "@/lib/career/yetkincv";
import { loadLatestYetkinCvCard } from "@/lib/career/yetkincv-store";
import {
  projectCareerJobMatchBoard,
  type CareerJobMatchBoard,
  type CandidateSkillScore,
  type JobMatchDraft,
} from "@/lib/career/job-matcher";
import { getPrisma } from "@/lib/kernel/db";
import {
  isKurumsalJobSlug,
  KURUMSAL_CRITERIA_MIN,
  kurumsalYetkinVertical,
  readStoredCriteria,
} from "@/lib/sales/kurumsal-screening";

function practiceHrefFor(vertical: string): string {
  const yetkin = kurumsalYetkinVertical(vertical);
  if (!yetkin) {
    return "/tezgah";
  }
  return YETKINCV_VERTICALS.find((row) => row.id === yetkin)?.practiceHref ?? "/tezgah";
}

function toDraft(job: {
  companyName: string;
  title: string;
  slug: string;
  vertical: string;
  minScore: number;
  deadlineAt: Date | null;
  criteriaWeights: unknown;
}): JobMatchDraft | null {
  if (!isKurumsalJobSlug(job.slug)) {
    return null;
  }
  const yetkin = kurumsalYetkinVertical(job.vertical);
  const allowed = yetkin ? yetkinCvSkillCatalog(yetkin) : null;
  if (!allowed) {
    return null;
  }
  const criteria = readStoredCriteria(job.criteriaWeights, allowed);
  if (criteria.length < KURUMSAL_CRITERIA_MIN) {
    return null;
  }
  const title = job.title.trim();
  const companyName = job.companyName.trim();
  if (!title || !companyName) {
    return null;
  }
  return {
    slug: job.slug,
    title,
    companyName,
    minScore: job.minScore,
    deadlineAt: job.deadlineAt,
    criteria,
    practiceHref: practiceHrefFor(job.vertical),
  };
}

export async function loadCareerJobMatchBoard(userId: string, now: Date = new Date()): Promise<CareerJobMatchBoard> {
  const prisma = getPrisma();
  const where = {
    isActive: true,
    OR: [{ deadlineAt: null }, { deadlineAt: { gt: now } }],
  };
  const [openCount, jobs, card] = await Promise.all([
    prisma.kurumsalJobPosting.count({ where }),
    prisma.kurumsalJobPosting.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        companyName: true,
        title: true,
        slug: true,
        vertical: true,
        minScore: true,
        deadlineAt: true,
        criteriaWeights: true,
      },
    }),
    loadLatestYetkinCvCard(userId),
  ]);
  const drafts = jobs.flatMap((job) => {
    const draft = toDraft(job);
    return draft ? [draft] : [];
  });
  const skillScores: CandidateSkillScore[] | null =
    card && card.skills.length > 0
      ? card.skills.map((skill) => ({ id: skill.id, label: skill.label, score: skill.score }))
      : null;
  return projectCareerJobMatchBoard({
    openCount,
    jobs: drafts,
    skillScores,
    now,
  });
}
