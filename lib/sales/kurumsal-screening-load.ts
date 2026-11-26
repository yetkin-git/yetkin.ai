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
import { isConfirmedAccountEmail } from "@/lib/kernel/auth/super-admin";
import { getPrisma } from "@/lib/kernel/db";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  PaymentRequiredError,
} from "@/lib/kernel/http/errors";
import {
  assertKurumsalScreeningEntitlement,
  KURUMSAL_SCREENING_PURCHASE_PATH,
  readKurumsalScreeningCatalogGate,
} from "@/lib/sales/kurumsal-screening-entitlement";
import {
  KURUMSAL_QUOTA_LOCK_NAMESPACE,
  KURUMSAL_TAX_LOCK_NAMESPACE,
} from "@/lib/sales/kurumsal-screening-purpose";
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

/** Kokpit hafif yük tavanları (O-01 / F2.6). */
export const KURUMSAL_COCKPIT_JOB_TAKE = 40 as const;
export const KURUMSAL_COCKPIT_APPLICANT_TAKE = 80 as const;
/** Liste yüzeyinde CV gövdesi kısaltması; ayrıntı için satır açılır. */
export const KURUMSAL_COCKPIT_CV_PREVIEW_CHARS = 200 as const;

export const KURUMSAL_EMAIL_CONFIRM_REQUIRED =
  "Başvurmadan önce e-posta adresini doğrula." as const;

type GradeWithEngine = (
  questions: readonly { id: string; prompt: string; choices: string[]; correctIndex: number }[],
  answers: readonly YetkinCvAnswer[],
) => {
  score: number;
  correctCount: number;
};

function previewCvSummary(raw: string): string {
  if (raw.length <= KURUMSAL_COCKPIT_CV_PREVIEW_CHARS) {
    return raw;
  }
  return `${raw.slice(0, KURUMSAL_COCKPIT_CV_PREVIEW_CHARS)}…`;
}

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

/**
 * Aynı sahibin kota sayımı + ilan yazımı tek advisory kilit altında yapılır.
 * `count` ile `insert` arasında kilit yoksa eşzamanlı iki istek de kotayı boş görür
 * ve ikisi de satır açar (kota aşımı). Kilit `ownerUserId`'ye bağlıdır ve
 * transaction bitince kendiliğinden düşer (`_xact_`).
 */
export type KurumsalQuotaLockDb = {
  $executeRaw(query: TemplateStringsArray, ...values: readonly unknown[]): Promise<number>;
};

export async function lockKurumsalQuotaForOwner(
  db: KurumsalQuotaLockDb,
  ownerUserId: string,
): Promise<void> {
  await db.$executeRaw`
    SELECT pg_advisory_xact_lock(${KURUMSAL_QUOTA_LOCK_NAMESPACE}::int, hashtext(${ownerUserId})::int)
  `;
}

/**
 * Vergi numarası sahipliği kilidi (Y-07 / F2.3 yarışı).
 *
 * Kotadan **sonra**, numaradan önce alınır: sıra `sahip → numara` olduğu sürece
 * iki işveren birbirini beklemez, yalnız **aynı numarayı** aynı anda deneyen
 * ikinci istek sıraya girer. Sıra tersine çevrilirse (numara → sahip) iki istek
 * farklı numaralarla birbirinin kilidini bekleyip kilitlenebilir.
 */
export async function lockKurumsalTaxNumber(
  db: KurumsalQuotaLockDb,
  taxNumber: string,
): Promise<void> {
  await db.$executeRaw`
    SELECT pg_advisory_xact_lock(${KURUMSAL_TAX_LOCK_NAMESPACE}::int, hashtext(${taxNumber})::int)
  `;
}

export async function createKurumsalJobPosting(input: {
  ownerUserId: string;
  body: unknown;
}): Promise<{ id: string; slug: string; applyPath: string }> {
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
  /**
   * Katalog kapısı **transaction'dan önce** okunur. Sebep: katalog okuması global
   * `getPrisma()` istemcisini kullanır. Açık bir `$transaction` bloğunun içinde
   * çağrılırsa ikinci bağlantı ister; Vercel serverless havuzu `max: 1` olduğu için
   * bağlantı hiç açılmaz ve istek `pool_timeout` ile 500'e düşer (ölçüldü:
   * `POST /api/kurumsal/ilanlar` üretimde her seferinde başarısız oluyordu).
   * Paket satışta mı sorusu ilan sayımıyla aynı anlık görüntüde olmak zorunda değil.
   */
  const catalog = await readKurumsalScreeningCatalogGate();
  /**
   * Kota sayımı, sahiplik/numara kontrolü ve ilan yazımı **tek** transaction'da ve
   * advisory kilit altındadır. Kilit olmadan iki eşzamanlı `POST /api/kurumsal/ilanlar`
   * isteği de kotayı boş görüp iki satır açardı (F2.1 yarışı).
   */
  const row = await prisma.$transaction(async (tx) => {
    await lockKurumsalQuotaForOwner(tx, input.ownerUserId);
    const entitlement = await assertKurumsalScreeningEntitlement(input.ownerUserId, tx, catalog);
    if (!entitlement.ok) {
      const message =
        entitlement.reason === "catalog-inactive"
          ? "Kurumsal ilan paketi katalogda aktif değil. Satın alma / tanımlama için kurumsal sayfaya git."
          : entitlement.reason === "quota-exhausted"
            ? `İlan kotası doldu (${entitlement.jobCount}/${entitlement.jobQuota}). Yeni paket satın al.`
            : "Aktif kurumsal ilan lisansı yok. Önce job-screening-pack paketini tanımla veya satın al.";
      throw new PaymentRequiredError(
        message,
        entitlement.purchasePath || KURUMSAL_SCREENING_PURCHASE_PATH,
      );
    }
    // Hesap düzeyinde vergi/TCKN sahipliği: başka owner aynı numarayı kullanamaz (Y-07).
    // Numara kilidi iki **farklı** işverenin aynı anda aynı numarayı açmasını sıraya sokar;
    // owner kilidi yalnız aynı sahibin isteklerini sıralar. Sıra sahip → numara.
    await lockKurumsalTaxNumber(tx, parsed.value.taxNumber);
    const foreignClaim = await tx.kurumsalJobPosting.findFirst({
      where: {
        taxNumber: parsed.value.taxNumber,
        ownerUserId: { not: input.ownerUserId },
      },
      select: { id: true },
    });
    if (foreignClaim) {
      throw new ConflictError(
        "Bu vergi / TCKN numarası başka bir işveren hesabına bağlı. Farklı numara kullan veya hesabını birleştir.",
      );
    }
    // Doğrulama mirası: aynı owner + taxNumber için daha önce mühürlenmiş ilan varsa taşı (Y-03).
    const priorVerified = await tx.kurumsalJobPosting.findFirst({
      where: {
        ownerUserId: input.ownerUserId,
        taxNumber: parsed.value.taxNumber,
        verifiedEmployerAt: { not: null },
      },
      orderBy: { verifiedEmployerAt: "desc" },
      select: { verifiedEmployerAt: true },
    });
    return tx.kurumsalJobPosting.create({
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
        verifiedEmployerAt: priorVerified?.verifiedEmployerAt ?? null,
        isActive: true,
      },
      select: { id: true, slug: true },
    });
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
    take: KURUMSAL_COCKPIT_JOB_TAKE,
    select: {
      id: true,
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
      applications: {
        orderBy: { createdAt: "asc" },
        take: KURUMSAL_COCKPIT_APPLICANT_TAKE,
        select: {
          id: true,
          candidateName: true,
          candidateEmail: true,
          // Liste hafif: tam gövde yerine önizleme (O-01).
          cvSummary: true,
          testScore: true,
          skillScores: true,
          weightedScore: true,
          certificateCode: true,
          createdAt: true,
        },
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
      applicants: ranked.map((row) =>
        toApplicant(
          { ...row, cvSummary: previewCvSummary(row.cvSummary) },
          criteria,
          row.band,
          row.rank,
        ),
      ),
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
  await prisma.$transaction(async (tx) => {
    const job = await tx.kurumsalJobPosting.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        minScore: true,
        shortlistLimit: true,
        applications: {
          select: {
            id: true,
            status: true,
            weightedScore: true,
            createdAt: true,
          },
        },
      },
    });
    if (!job) {
      return;
    }
    const ranked = rankJobApplications(job.applications, job.minScore, job.shortlistLimit);
    const byStatus = new Map<ReturnType<typeof statusForBand>, string[]>();
    for (const row of ranked) {
      const status = statusForBand(row.band);
      const current = job.applications.find((item) => item.id === row.id);
      if (!current || current.status === status) {
        continue;
      }
      const bucket = byStatus.get(status) ?? [];
      bucket.push(row.id);
      byStatus.set(status, bucket);
    }
    for (const [status, ids] of byStatus) {
      if (ids.length === 0) {
        continue;
      }
      await tx.kurumsalJobApplication.updateMany({
        where: { id: { in: ids }, jobId },
        data: { status },
      });
    }
  });
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
  /** Supabase `email_confirmed_at` — yoksa başvuru 403 (O-02 / F2.7). */
  emailConfirmedAt?: string | null;
  body: unknown;
  now?: Date;
}): Promise<KurumsalExamStart> {
  if (!isConfirmedAccountEmail(input.emailConfirmedAt)) {
    throw new ForbiddenError(KURUMSAL_EMAIL_CONFIRM_REQUIRED);
  }
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

export type PublicKurumsalDirectoryJob = {
  slug: string;
  title: string;
  companyName: string;
  verticalLabel: string;
  deadlineLabel: string | null;
  employerVerified: boolean;
  applyPath: string;
};

/**
 * Kamu ilan dizini. Yalnız aktif ve süresi geçmemiş ilanlar.
 * Doğrulanmamış işveren listelenir ama sitemap'e girmez (noindex ayrı yüzeyde).
 */
export async function listPublicOpenKurumsalJobs(input?: {
  query?: string;
  vertical?: string;
}): Promise<PublicKurumsalDirectoryJob[]> {
  const prisma = getPrisma();
  const now = new Date();
  const q = input?.query?.trim().toLocaleLowerCase("tr-TR") ?? "";
  const vertical = input?.vertical?.trim().toUpperCase() ?? "";
  const verticalOk = vertical.length > 0 && Boolean(kurumsalJobVertical(vertical));
  const rows = await prisma.kurumsalJobPosting.findMany({
    where: {
      isActive: true,
      OR: [{ deadlineAt: null }, { deadlineAt: { gt: now } }],
      ...(verticalOk ? { vertical: vertical as KurumsalJobVerticalId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      slug: true,
      title: true,
      companyName: true,
      vertical: true,
      description: true,
      deadlineAt: true,
      verifiedEmployerAt: true,
    },
  });
  return rows
    .filter((row) => {
      if (!q) {
        return true;
      }
      const haystack = `${row.title} ${row.companyName} ${row.description}`.toLocaleLowerCase("tr-TR");
      return haystack.includes(q);
    })
    .map((row) => ({
      slug: row.slug,
      title: row.title,
      companyName: row.companyName,
      verticalLabel: kurumsalVerticalLabel(row.vertical),
      deadlineLabel: row.deadlineAt ? formatIstanbulDate(row.deadlineAt) : null,
      employerVerified: Boolean(row.verifiedEmployerAt),
      applyPath: `/ilan/${row.slug}`,
    }));
}

/** Sitemap: yalnız doğrulanmış + aktif + süresi geçmemiş ilanlar. */
export async function listSitemapKurumsalJobSlugs(): Promise<
  { slug: string; updatedAt: Date }[]
> {
  try {
    const prisma = getPrisma();
    const now = new Date();
    const rows = await prisma.kurumsalJobPosting.findMany({
      where: {
        isActive: true,
        verifiedEmployerAt: { not: null },
        OR: [{ deadlineAt: null }, { deadlineAt: { gt: now } }],
      },
      orderBy: { createdAt: "desc" },
      take: 2_000,
      select: { slug: true, createdAt: true, verifiedEmployerAt: true },
    });
    return rows.map((row) => ({
      slug: row.slug,
      updatedAt: row.verifiedEmployerAt ?? row.createdAt,
    }));
  } catch {
    return [];
  }
}

/**
 * İlan sahibinin kendi ilanını kapatması / yeniden açması.
 * Yeniden açma yalnız son başvuru tarihi geçmemişse (veya deadline yoksa) mümkündür.
 *
 * `db` enjekte edilebilir: çapraz işveren reddi (IDOR) gerçek birim testiyle
 * **çalıştırılarak** doğrulanır, kaynak metni aranarak değil.
 */
export type KurumsalJobMutationDb = {
  kurumsalJobPosting: {
    findFirst(args: {
      where: { id: string; ownerUserId: string };
      select: { id: true; slug: true; isActive: true; deadlineAt: true };
    }): Promise<{ id: string; slug: string; isActive: boolean; deadlineAt: Date | null } | null>;
    update(args: {
      where: { id: string };
      data: { isActive: boolean };
      select: { id: true; isActive: true; slug: true };
    }): Promise<{ id: string; isActive: boolean; slug: string }>;
  };
};

export async function setKurumsalJobActive(
  input: {
    ownerUserId: string;
    jobId: string;
    isActive: boolean;
  },
  db: KurumsalJobMutationDb = getPrisma(),
): Promise<{ id: string; isActive: boolean; applyPath: string }> {
  const job = await db.kurumsalJobPosting.findFirst({
    where: { id: input.jobId, ownerUserId: input.ownerUserId },
    select: { id: true, slug: true, isActive: true, deadlineAt: true },
  });
  if (!job) {
    throw new NotFoundError("İlan bulunamadı.");
  }
  if (input.isActive) {
    if (job.deadlineAt && job.deadlineAt.getTime() <= Date.now()) {
      throw new BadRequestError("Son başvuru tarihi geçmiş ilan yeniden açılamaz.");
    }
  }
  const updated = await db.kurumsalJobPosting.update({
    where: { id: job.id },
    data: { isActive: input.isActive },
    select: { id: true, isActive: true, slug: true },
  });
  return {
    id: updated.id,
    isActive: updated.isActive,
    applyPath: `/ilan/${updated.slug}`,
  };
}

export type KurumsalShortlistCsvRow = {
  candidateName: string;
  candidateEmail: string;
  weightedScore: number | null;
  band: KurumsalApplicationBand;
  certificateCode: string | null;
  appliedAt: Date;
};

/**
 * Kısa liste CSV satırları. Ham `cvSummary` **dahil edilmez** (dürüstlük / KVKK).
 * Çapraz işveren: sahip filtresi yoksa satır dönmez.
 *
 * `db` enjekte edilebilir — çapraz işveren reddi gerçek birim testinde çalıştırılır.
 */
export type KurumsalShortlistDb = {
  kurumsalJobPosting: {
    findFirst(args: {
      where: { id: string; ownerUserId: string };
      include: { applications: { orderBy: { createdAt: "asc" } } };
    }): Promise<{
      title: string;
      minScore: number;
      shortlistLimit: number;
      applications: {
        id: string;
        candidateName: string;
        candidateEmail: string;
        weightedScore: number | null;
        createdAt: Date;
        certificateCode: string | null;
      }[];
    } | null>;
  };
};

export async function loadKurumsalShortlistCsvRows(
  input: { ownerUserId: string; jobId: string },
  db: KurumsalShortlistDb = getPrisma(),
): Promise<{ title: string; rows: KurumsalShortlistCsvRow[] }> {
  const job = await db.kurumsalJobPosting.findFirst({
    where: { id: input.jobId, ownerUserId: input.ownerUserId },
    include: { applications: { orderBy: { createdAt: "asc" } } },
  });
  if (!job) {
    throw new NotFoundError("İlan bulunamadı.");
  }
  const ranked = rankJobApplications(job.applications, job.minScore, job.shortlistLimit);
  return {
    title: job.title,
    rows: ranked.map((row) => ({
      candidateName: row.candidateName,
      candidateEmail: row.candidateEmail,
      weightedScore: row.weightedScore,
      band: row.band,
      certificateCode: row.certificateCode,
      appliedAt: row.createdAt,
    })),
  };
}
