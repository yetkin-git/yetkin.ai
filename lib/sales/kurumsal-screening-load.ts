import "server-only";

import { randomBytes } from "node:crypto";
import {
  sealYetkinCvSitting,
  startYetkinCvSitting,
  type YetkinCvStartResult,
} from "@/lib/career/yetkincv-store";
import {
  readYetkinCvChoiceOrder,
  yetkinCvPublicQuestions,
  yetkinCvQuestionsByIds,
  yetkinCvSkillCatalog,
  type YetkinCvAnswer,
} from "@/lib/career/yetkincv";
import { getPrisma } from "@/lib/kernel/db";
import { BadRequestError, NotFoundError, PaymentRequiredError } from "@/lib/kernel/http/errors";
import {
  assertKurumsalScreeningEntitlement,
  KURUMSAL_SCREENING_PURCHASE_PATH,
} from "@/lib/sales/kurumsal-screening-entitlement";
import {
  formatCriteriaWeightLine,
  formatIstanbulDate,
  formatSkillScoreLine,
  isKurumsalJobOpen,
  kurumsalJobSlugBase,
  kurumsalJobVertical,
  kurumsalVerifyPath,
  kurumsalVerticalLabel,
  kurumsalYetkinVertical,
  isKurumsalJobSlug,
  KURUMSAL_CRITERIA_MIN,
  KURUMSAL_JOB_VERTICALS,
  parseKurumsalApplyDraft,
  parseKurumsalJobDraft,
  rankJobApplications,
  readSkillScoreMap,
  readStoredCriteria,
  weightedScreeningScore,
  type KurumsalApplicationBand,
  type KurumsalJobVerticalId,
  type KurumsalSkillCatalog,
  type KurumsalSkillOption,
  type OwnerApplicantView,
  type OwnerJobView,
  type PublicKurumsalJobView,
  type ScreeningCriterion,
} from "@/lib/sales/kurumsal-screening";

const SCREENING_ROLE = "corporate" as const;

type GradeWithEngine = (
  questions: readonly { id: string; prompt: string; choices: string[]; correctIndex: number }[],
  answers: readonly YetkinCvAnswer[],
) => {
  score: number;
  correctCount: number;
};

function isUniqueConflict(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002");
}

export function kurumsalSkillCatalog(): KurumsalSkillCatalog {
  const catalog = {} as Record<KurumsalJobVerticalId, KurumsalSkillOption[]>;
  for (const row of KURUMSAL_JOB_VERTICALS) {
    const skills = yetkinCvSkillCatalog(row.yetkinCvVerticalId);
    if (!skills || skills.length < KURUMSAL_CRITERIA_MIN) {
      throw new Error(`YetkinCV alt testi eksik: ${row.yetkinCvVerticalId}`);
    }
    catalog[row.id] = skills;
  }
  return catalog;
}

function skillsForVertical(vertical: string): readonly KurumsalSkillOption[] {
  const row = kurumsalJobVertical(vertical);
  if (!row) {
    return [];
  }
  return yetkinCvSkillCatalog(row.yetkinCvVerticalId) ?? [];
}

function criteriaForVertical(vertical: string, raw: unknown): ScreeningCriterion[] {
  return readStoredCriteria(raw, skillsForVertical(vertical));
}

function readQuestionIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((row): row is string => typeof row === "string" && row.trim().length > 0);
}

function statusForBand(
  band: KurumsalApplicationBand,
): "PENDING_TEST" | "SHORTLISTED" | "QUALIFIED_NOT_SHORTLISTED" | "REJECTED" {
  if (band === "BELOW_THRESHOLD") {
    return "REJECTED";
  }
  return band;
}

async function uniqueSlug(title: string): Promise<string> {
  const prisma = getPrisma();
  const base = kurumsalJobSlugBase(title);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const slug = `${base}-${randomBytes(3).toString("hex")}`;
    const taken = await prisma.kurumsalJobPosting.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) {
      return slug;
    }
  }
  throw new BadRequestError("Başvuru adresi üretilemedi. Pozisyon adını değiştirip yeniden dene.");
}

export async function createKurumsalJobPosting(input: {
  ownerUserId: string;
  body: unknown;
}): Promise<{ id: string; slug: string; applyPath: string }> {
  const entitlement = await assertKurumsalScreeningEntitlement(input.ownerUserId);
  if (!entitlement.ok) {
    throw new PaymentRequiredError(
      entitlement.reason === "catalog-inactive"
        ? "Kurumsal ilan paketi katalogda aktif değil. Satın alma / tanımlama için kurumsal sayfaya git."
        : "Aktif kurumsal ilan lisansı yok. Önce job-screening-pack paketini tanımla veya satın al.",
      entitlement.purchasePath || KURUMSAL_SCREENING_PURCHASE_PATH,
    );
  }
  const parsed = parseKurumsalJobDraft(
    input.body,
    (vertical) => {
      const row = kurumsalJobVertical(vertical);
      return row ? yetkinCvSkillCatalog(row.yetkinCvVerticalId) : null;
    },
    new Date(),
  );
  if (!parsed.ok) {
    throw new BadRequestError(parsed.error);
  }
  const slug = await uniqueSlug(parsed.value.title);
  const prisma = getPrisma();
  const row = await prisma.kurumsalJobPosting.create({
    data: {
      ownerUserId: input.ownerUserId,
      companyName: parsed.value.companyName,
      title: parsed.value.title,
      slug,
      vertical: parsed.value.vertical,
      description: parsed.value.description,
      criteriaWeights: parsed.value.criteriaWeights,
      minScore: parsed.value.minScore,
      shortlistLimit: parsed.value.shortlistLimit,
      deadlineAt: parsed.value.deadlineAt,
      taxNumber: parsed.value.taxNumber,
      // Doğrulama ops mühürüdür; ilan açılışında otomatik doğrulanmaz.
      verifiedEmployerAt: null,
      isActive: true,
    },
    select: { id: true, slug: true },
  });
  return { id: row.id, slug: row.slug, applyPath: `/ilan/${row.slug}` };
}

function toApplicant(
  row: {
    id: string;
    candidateName: string;
    candidateEmail: string;
    cvSummary: string;
    testScore: number | null;
    skillScores: unknown;
    weightedScore: number | null;
    certificateCode: string | null;
    createdAt: Date;
  },
  criteria: readonly ScreeningCriterion[],
  band: KurumsalApplicationBand,
  rank: number | null,
): OwnerApplicantView {
  const scores = readSkillScoreMap(row.skillScores);
  return {
    id: row.id,
    candidateName: row.candidateName,
    candidateEmail: row.candidateEmail,
    cvSummary: row.cvSummary,
    testScore: row.testScore,
    weightedScore: row.weightedScore,
    skillLine: formatSkillScoreLine(criteria, scores),
    certificateCode: row.certificateCode,
    verifyPath: kurumsalVerifyPath(row.certificateCode),
    band,
    rank,
  };
}

function publicJobFields(job: {
  companyName: string;
  title: string;
  slug: string;
  vertical: string;
  description: string;
  criteriaWeights: unknown;
  minScore: number;
  shortlistLimit: number;
  deadlineAt: Date | null;
  createdAt?: Date;
  verifiedEmployerAt?: Date | null;
}): PublicKurumsalJobView {
  const criteria = criteriaForVertical(job.vertical, job.criteriaWeights);
  return {
    companyName: job.companyName,
    title: job.title,
    slug: job.slug,
    verticalLabel: kurumsalVerticalLabel(job.vertical),
    description: job.description,
    criteria,
    criteriaLine: formatCriteriaWeightLine(criteria),
    minScore: job.minScore,
    shortlistLimit: job.shortlistLimit,
    deadlineLabel: job.deadlineAt ? formatIstanbulDate(job.deadlineAt) : null,
    employerVerified: Boolean(job.verifiedEmployerAt),
    datePosted: (job.createdAt ?? new Date(0)).toISOString(),
    validThrough: job.deadlineAt ? job.deadlineAt.toISOString() : null,
  };
}

export async function loadOwnerKurumsalBoard(ownerUserId: string): Promise<OwnerJobView[]> {
  const prisma = getPrisma();
  const jobs = await prisma.kurumsalJobPosting.findMany({
    where: { ownerUserId },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return jobs.map((job) => {
    const criteria = criteriaForVertical(job.vertical, job.criteriaWeights);
    const ranked = rankJobApplications(job.applications, job.minScore, job.shortlistLimit);
    return {
      ...publicJobFields(job),
      id: job.id,
      isActive: job.isActive,
      applyPath: `/ilan/${job.slug}`,
      applicants: ranked.map((row) => toApplicant(row, criteria, row.band, row.rank)),
    };
  });
}

export async function loadPublicKurumsalJob(slug: string): Promise<PublicKurumsalJobView | null> {
  if (!isKurumsalJobSlug(slug)) {
    return null;
  }
  const prisma = getPrisma();
  const job = await prisma.kurumsalJobPosting.findUnique({
    where: { slug },
    select: {
      companyName: true,
      title: true,
      slug: true,
      vertical: true,
      description: true,
      criteriaWeights: true,
      minScore: true,
      shortlistLimit: true,
      isActive: true,
      deadlineAt: true,
      createdAt: true,
      verifiedEmployerAt: true,
    },
  });
  if (!job || !isKurumsalJobOpen(job, new Date())) {
    return null;
  }
  return publicJobFields(job);
}

async function persistBands(jobId: string): Promise<void> {
  const prisma = getPrisma();
  const job = await prisma.kurumsalJobPosting.findUnique({
    where: { id: jobId },
    include: { applications: true },
  });
  if (!job) {
    return;
  }
  const ranked = rankJobApplications(job.applications, job.minScore, job.shortlistLimit);
  const writes = ranked.flatMap((row) => {
    const status = statusForBand(row.band);
    const current = job.applications.find((item) => item.id === row.id);
    if (!current || current.status === status) {
      return [];
    }
    return [
      prisma.kurumsalJobApplication.update({
        where: { id: row.id },
        data: { status },
      }),
    ];
  });
  if (writes.length > 0) {
    await prisma.$transaction(writes);
  }
}

function sittingPayload(sitting: {
  id: string;
  expiresAt: Date;
  verticalKey: string;
  questionIds: unknown;
  choiceOrder?: unknown;
}): YetkinCvStartResult {
  const questions = yetkinCvQuestionsByIds(sitting.verticalKey, readQuestionIds(sitting.questionIds));
  if (!questions) {
    throw new BadRequestError("Sınav soruları çözülemedi.");
  }
  return {
    sittingId: sitting.id,
    expiresAt: sitting.expiresAt.toISOString(),
    questions: yetkinCvPublicQuestions(questions, readYetkinCvChoiceOrder(sitting.choiceOrder)),
  };
}

export type KurumsalExamScore = {
  score: number;
  weightedScore: number | null;
  skillLine: string | null;
  certificateCode: string;
  verifyPath: string | null;
  passedBar: boolean;
};

export type KurumsalExamStart = ({ kind: "sitting" } & YetkinCvStartResult) | ({ kind: "scored" } & KurumsalExamScore);

export async function startKurumsalJobExam(input: {
  slug: string;
  userId: string;
  /** Oturumdaki doğrulanmış e-posta. Form e-postası bunu geçemez (Y1). */
  sessionEmail: string;
  body: unknown;
  now?: Date;
}): Promise<KurumsalExamStart> {
  const parsed = parseKurumsalApplyDraft(input.body);
  if (!parsed.ok) {
    throw new BadRequestError(parsed.error);
  }
  const sessionEmail = input.sessionEmail.trim().toLowerCase();
  if (!sessionEmail || parsed.value.candidateEmail !== sessionEmail) {
    throw new BadRequestError(
      "Başvuru e-postası oturumundaki doğrulanmış e-posta ile aynı olmalıdır.",
    );
  }
  if (!isKurumsalJobSlug(input.slug)) {
    throw new NotFoundError("İlan bulunamadı.");
  }
  const now = input.now ?? new Date();
  const prisma = getPrisma();
  const job = await prisma.kurumsalJobPosting.findUnique({ where: { slug: input.slug } });
  if (!job?.isActive) {
    throw new NotFoundError("İlan bulunamadı.");
  }
  if (job.deadlineAt && job.deadlineAt.getTime() <= now.getTime()) {
    throw new NotFoundError("İlanın son başvuru tarihi geçti.");
  }
  const verticalId = kurumsalYetkinVertical(job.vertical);
  if (!verticalId) {
    throw new BadRequestError("İlanın uzmanlığı sınav bankasına bağlı değil.");
  }
  const criteria = criteriaForVertical(job.vertical, job.criteriaWeights);
  if (criteria.length < KURUMSAL_CRITERIA_MIN) {
    throw new BadRequestError("İlanın yetkinlik ağırlığı tanımlı değil.");
  }
  const existing = await prisma.kurumsalJobApplication.findFirst({
    where: { jobId: job.id, candidateUserId: input.userId },
  });
  if (existing?.testScore !== null && existing?.testScore !== undefined && existing.certificateCode) {
    const scores = readSkillScoreMap(existing.skillScores);
    const weighted = existing.weightedScore;
    return {
      kind: "scored",
      score: existing.testScore,
      weightedScore: weighted,
      skillLine: formatSkillScoreLine(criteria, scores),
      certificateCode: existing.certificateCode,
      verifyPath: kurumsalVerifyPath(existing.certificateCode),
      passedBar: (weighted ?? existing.testScore) >= job.minScore,
    };
  }
  if (existing?.sittingId) {
    const sitting = await prisma.yetkinCvSitting.findUnique({ where: { id: existing.sittingId } });
    if (
      sitting &&
      sitting.userId === input.userId &&
      !sitting.consumedAt &&
      sitting.expiresAt.getTime() > now.getTime()
    ) {
      const open = sittingPayload(sitting);
      return { kind: "sitting", ...open };
    }
  }
  const started = await startYetkinCvSitting({
    userId: input.userId,
    roleId: SCREENING_ROLE,
    verticalId,
    cvText: parsed.value.cvSummary,
    skillIds: criteria.map((row) => row.key),
    now,
  });
  const profile = {
    candidateName: parsed.value.candidateName,
    candidateEmail: parsed.value.candidateEmail,
    cvSummary: parsed.value.cvSummary,
    sittingId: started.sittingId,
    status: "PENDING_TEST" as const,
  };
  if (existing) {
    await prisma.kurumsalJobApplication.update({
      where: { id: existing.id },
      data: profile,
    });
  } else {
    try {
      await prisma.kurumsalJobApplication.create({
        data: {
          jobId: job.id,
          candidateUserId: input.userId,
          ...profile,
        },
      });
    } catch (error) {
      if (!isUniqueConflict(error)) {
        throw error;
      }
      const raced = await prisma.kurumsalJobApplication.findFirst({
        where: { jobId: job.id, candidateUserId: input.userId },
      });
      if (!raced?.sittingId) {
        throw new BadRequestError("Başvuru kaydı çakıştı. Yeniden dene.");
      }
      const sitting = await prisma.yetkinCvSitting.findUnique({ where: { id: raced.sittingId } });
      if (!sitting || sitting.userId !== input.userId) {
        throw new BadRequestError("Başvuru kaydı çakıştı. Yeniden dene.");
      }
      const open = sittingPayload(sitting);
      return { kind: "sitting", ...open };
    }
  }
  return { kind: "sitting", ...started };
}

export async function submitKurumsalJobExam(input: {
  slug: string;
  userId: string;
  sittingId: string;
  answers: readonly YetkinCvAnswer[];
  gradeWithEngine: GradeWithEngine;
  now?: Date;
}): Promise<KurumsalExamScore> {
  if (!isKurumsalJobSlug(input.slug)) {
    throw new NotFoundError("İlan bulunamadı.");
  }
  const prisma = getPrisma();
  const application = await prisma.kurumsalJobApplication.findFirst({
    where: {
      sittingId: input.sittingId,
      candidateUserId: input.userId,
      job: { slug: input.slug, isActive: true },
    },
    include: { job: true },
  });
  if (!application) {
    throw new NotFoundError("Başvuru bulunamadı.");
  }
  const now = input.now ?? new Date();
  if (application.job.deadlineAt && application.job.deadlineAt.getTime() <= now.getTime()) {
    throw new NotFoundError("İlanın son başvuru tarihi geçti.");
  }
  const criteria = criteriaForVertical(application.job.vertical, application.job.criteriaWeights);
  if (criteria.length < KURUMSAL_CRITERIA_MIN) {
    throw new BadRequestError("İlanın yetkinlik ağırlığı tanımlı değil.");
  }
  const card = await sealYetkinCvSitting({
    userId: input.userId,
    sittingId: input.sittingId,
    answers: input.answers,
    gradeWithEngine: input.gradeWithEngine,
    now,
  });
  const skillScores: Record<string, number> = {};
  for (const skill of card.skills) {
    skillScores[skill.id] = skill.score;
  }
  const weightedScore = weightedScreeningScore(criteria, skillScores);
  if (weightedScore === null) {
    throw new BadRequestError("Ağırlıklı puan alt test kırılımından hesaplanamadı.");
  }
  const storedScores = Object.fromEntries(criteria.map((row) => [row.key, skillScores[row.key]!]));
  await prisma.kurumsalJobApplication.update({
    where: { id: application.id },
    data: {
      testScore: card.score,
      skillScores: storedScores,
      weightedScore,
      certificateCode: card.certificateHash,
      status: "TESTED",
    },
  });
  await persistBands(application.jobId);
  return {
    score: card.score,
    weightedScore,
    skillLine: formatSkillScoreLine(criteria, storedScores),
    certificateCode: card.certificateHash,
    verifyPath: kurumsalVerifyPath(card.certificateHash),
    passedBar: weightedScore >= application.job.minScore,
  };
}
