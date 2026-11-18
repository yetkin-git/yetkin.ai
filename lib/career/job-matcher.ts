/**
 * Kurumsal ilan ↔ YetkinCV eşlemesi.
 * Puan, eleme motorundaki round(Σ altPuan × ağırlık / 100) formülüdür.
 * Açık ilan yoksa kart üretilmez. Sahte ilan yoktur.
 */

import { buildJobGapRoadmap, type RoadmapWindow } from "@/lib/career/roadmap";
import { weightedScreeningScore, type ScreeningCriterion } from "@/lib/sales/kurumsal-screening";

export const JOB_MATCH_READY_STATUS = "Doğrudan Başvuruya Uygun" as const;
export const JOB_MATCH_COACH_STATUS = "Geliştirilebilir / Koçluk Fırsatı" as const;
export const JOB_MATCH_COACH_BAND = 20 as const;
export const CAREER_JOB_MATCH_EMPTY =
  "Şu an açık kurumsal ilan bulunmuyor; yeni ilan açıldığında YetkinCV puanınla otomatik eşleşecek" as const;
export const CAREER_JOB_MATCH_NEEDS_SCORE =
  "Açık kurumsal ilan var. Eşleşme, YetkinCV alt beceri puanın yazılınca hesaplanır. Sahte puan basılmaz." as const;
export const CAREER_JOB_MATCH_NONE =
  "Açık kurumsal ilan var. Puanın baraja yetmiyor ve kapanış tarihi olan 20 puanlık koçluk bandına da girmiyor." as const;
export const CAREER_JOB_MATCH_UNREAD = "Kurumsal ilanlar şu an okunamadı. Sahte ilan basılmaz." as const;

const DAY_MS = 86_400_000;

export type CandidateSkillScore = {
  id: string;
  label: string;
  score: number;
};

export type JobMatchDraft = {
  slug: string;
  title: string;
  companyName: string;
  minScore: number;
  deadlineAt: Date | null;
  criteria: readonly ScreeningCriterion[];
  practiceHref: string;
};

export type CareerJobMatchCard =
  | {
      kind: "ready";
      status: typeof JOB_MATCH_READY_STATUS;
      slug: string;
      title: string;
      companyName: string;
      weightedScore: number;
      minScore: number;
      applyPath: string;
      badge: string;
    }
  | {
      kind: "coach";
      status: typeof JOB_MATCH_COACH_STATUS;
      slug: string;
      title: string;
      companyName: string;
      weightedScore: number;
      minScore: number;
      pointsToBar: number;
      daysRemaining: number;
      gapLine: string;
      skillLabel: string;
      points: number;
      badge: string;
      roadmap: readonly [RoadmapWindow, RoadmapWindow, RoadmapWindow];
    };

export type CareerJobMatchBoard =
  | { state: "empty"; message: typeof CAREER_JOB_MATCH_EMPTY }
  | { state: "unread"; message: typeof CAREER_JOB_MATCH_UNREAD }
  | { state: "needs-score"; message: typeof CAREER_JOB_MATCH_NEEDS_SCORE; openCount: number }
  | { state: "none-in-range"; message: typeof CAREER_JOB_MATCH_NONE; openCount: number }
  | { state: "matches"; openCount: number; cards: CareerJobMatchCard[] };

export const UNREAD_CAREER_JOB_MATCH_BOARD: CareerJobMatchBoard = {
  state: "unread",
  message: CAREER_JOB_MATCH_UNREAD,
};

export function daysUntilDeadline(deadline: Date, now: Date): number {
  const ms = deadline.getTime() - now.getTime();
  if (ms <= 0) {
    return 0;
  }
  return Math.ceil(ms / DAY_MS);
}

export function readyMatchBadge(weightedScore: number, minScore: number): string {
  return `YetkinCV Puanın Uygun (${weightedScore}/${minScore})`;
}

export function coachMatchBadge(pointsToBar: number, daysRemaining: number): string {
  return `Baraja ${pointsToBar} Puan Kaldı · Son ${daysRemaining} Gün`;
}

function measuredScore(value: number | undefined): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return 0;
  }
  return Math.min(100, value);
}

function scoresForCriteria(
  criteria: readonly ScreeningCriterion[],
  skillScores: readonly CandidateSkillScore[],
): Record<string, number> {
  const byId = new Map(skillScores.map((row) => [row.id, row.score]));
  const scores: Record<string, number> = {};
  for (const row of criteria) {
    scores[row.key] = measuredScore(byId.get(row.key));
  }
  return scores;
}

function pointsToClearBar(
  criteria: readonly ScreeningCriterion[],
  scores: Record<string, number>,
  key: string,
  minScore: number,
): { points: number; closesBar: boolean } {
  const current = scores[key] ?? 0;
  const room = 100 - current;
  if (room <= 0) {
    return { points: 0, closesBar: false };
  }
  for (let delta = 1; delta <= room; delta += 1) {
    const next = { ...scores, [key]: current + delta };
    const weighted = weightedScreeningScore(criteria, next);
    if (weighted !== null && weighted >= minScore) {
      return { points: delta, closesBar: true };
    }
  }
  return { points: room, closesBar: false };
}

function highestWeightGap(
  criteria: readonly ScreeningCriterion[],
  scores: Record<string, number>,
  minScore: number,
): ScreeningCriterion | null {
  const short = criteria
    .filter((row) => (scores[row.key] ?? 0) < minScore)
    .slice()
    .sort((left, right) => {
      const weightGap = right.weight - left.weight;
      if (weightGap !== 0) {
        return weightGap;
      }
      const scoreGap = (scores[left.key] ?? 0) - (scores[right.key] ?? 0);
      if (scoreGap !== 0) {
        return scoreGap;
      }
      return left.key.localeCompare(right.key);
    });
  return short[0] ?? null;
}

export function matchCandidateToJob(
  job: JobMatchDraft,
  skillScores: readonly CandidateSkillScore[],
  now: Date,
): CareerJobMatchCard | null {
  if (!Number.isInteger(job.minScore) || job.minScore < 0 || job.minScore > 100) {
    return null;
  }
  if (job.deadlineAt && job.deadlineAt.getTime() <= now.getTime()) {
    return null;
  }
  const scores = scoresForCriteria(job.criteria, skillScores);
  const weightedScore = weightedScreeningScore(job.criteria, scores);
  if (weightedScore === null) {
    return null;
  }
  if (weightedScore >= job.minScore) {
    return {
      kind: "ready",
      status: JOB_MATCH_READY_STATUS,
      slug: job.slug,
      title: job.title,
      companyName: job.companyName,
      weightedScore,
      minScore: job.minScore,
      applyPath: `/ilan/${job.slug}`,
      badge: readyMatchBadge(weightedScore, job.minScore),
    };
  }
  const daysRemaining = job.deadlineAt ? daysUntilDeadline(job.deadlineAt, now) : 0;
  if (weightedScore < job.minScore - JOB_MATCH_COACH_BAND || daysRemaining <= 0) {
    return null;
  }
  const gap = highestWeightGap(job.criteria, scores, job.minScore);
  if (!gap) {
    return null;
  }
  const raise = pointsToClearBar(job.criteria, scores, gap.key, job.minScore);
  if (raise.points <= 0) {
    return null;
  }
  const gapLine = `${gap.label} puanını +${raise.points} artırmalısın`;
  return {
    kind: "coach",
    status: JOB_MATCH_COACH_STATUS,
    slug: job.slug,
    title: job.title,
    companyName: job.companyName,
    weightedScore,
    minScore: job.minScore,
    pointsToBar: job.minScore - weightedScore,
    daysRemaining,
    gapLine,
    skillLabel: gap.label,
    points: raise.points,
    badge: coachMatchBadge(job.minScore - weightedScore, daysRemaining),
    roadmap: buildJobGapRoadmap({
      skillLabel: gap.label,
      points: raise.points,
      jobTitle: job.title,
      companyName: job.companyName,
      practiceHref: job.practiceHref,
      daysRemaining,
      closesBar: raise.closesBar,
    }),
  };
}

function compareCards(left: CareerJobMatchCard, right: CareerJobMatchCard): number {
  if (left.kind !== right.kind) {
    return left.kind === "ready" ? -1 : 1;
  }
  if (left.kind === "ready" && right.kind === "ready") {
    return right.weightedScore - left.weightedScore || left.slug.localeCompare(right.slug);
  }
  if (left.kind === "coach" && right.kind === "coach") {
    return left.pointsToBar - right.pointsToBar || left.daysRemaining - right.daysRemaining || left.slug.localeCompare(right.slug);
  }
  return 0;
}

export function projectCareerJobMatchBoard(input: {
  openCount: number;
  jobs: readonly JobMatchDraft[];
  skillScores: readonly CandidateSkillScore[] | null;
  now: Date;
}): CareerJobMatchBoard {
  if (input.openCount <= 0) {
    return { state: "empty", message: CAREER_JOB_MATCH_EMPTY };
  }
  const scores = input.skillScores;
  if (!scores || scores.length === 0) {
    return {
      state: "needs-score",
      message: CAREER_JOB_MATCH_NEEDS_SCORE,
      openCount: input.openCount,
    };
  }
  const cards = input.jobs
    .map((job) => matchCandidateToJob(job, scores, input.now))
    .filter((card): card is CareerJobMatchCard => card !== null)
    .sort(compareCards);
  if (cards.length === 0) {
    return { state: "none-in-range", message: CAREER_JOB_MATCH_NONE, openCount: input.openCount };
  }
  return { state: "matches", openCount: input.openCount, cards };
}
