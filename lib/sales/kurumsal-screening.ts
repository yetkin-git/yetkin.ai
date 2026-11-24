/**
 * Kurumsal ilan eleme kuralları.
 * Alt test puanı burada üretilmez. Sıra, sunucuda yazılmış weighted_score alanını okur.
 * Ağırlık formülü hazır alt puanları toplar. Soru bankası ve doğru şık bu dosyada yoktur.
 */

import type { YetkinCvVerticalId } from "@/lib/career/yetkincv-options";

export const KURUMSAL_SCREENING_MODULE = "kurumsal" as const;
export const KURUMSAL_SCREENING_UNIT = "job-screening-pack" as const;
export const KURUMSAL_DEFAULT_MIN_SCORE = 70 as const;
export const KURUMSAL_DEFAULT_SHORTLIST = 5 as const;
export const KURUMSAL_SHORTLIST_MAX = 50 as const;
export const KURUMSAL_CV_MIN = 40 as const;
export const KURUMSAL_CV_MAX = 6000 as const;
export const KURUMSAL_CRITERIA_MIN = 3 as const;
export const KURUMSAL_CRITERIA_MAX = 5 as const;

export const KURUMSAL_JOB_VERTICALS = [
  { id: "ECOMMERCE", label: "E-Ticaret", yetkinCvVerticalId: "ecommerce" },
  { id: "GRANT", label: "Hibe & Proje", yetkinCvVerticalId: "grant" },
  { id: "MARKETING", label: "Dijital Pazarlama", yetkinCvVerticalId: "marketing" },
  { id: "OFFICE", label: "Ofis & Operasyon", yetkinCvVerticalId: "office" },
  { id: "SOFTWARE", label: "Yazılım/AI", yetkinCvVerticalId: "software" },
] as const;

export type KurumsalJobVerticalId = (typeof KURUMSAL_JOB_VERTICALS)[number]["id"];
/** Eleme bandı. REJECTED DB'de baraj altı için kalır; yüzey BELOW_THRESHOLD okur. */
export type KurumsalApplicationBand =
  | "PENDING_TEST"
  | "SHORTLISTED"
  | "QUALIFIED_NOT_SHORTLISTED"
  | "BELOW_THRESHOLD";

export type KurumsalSkillOption = {
  key: string;
  label: string;
};

export type KurumsalSkillCatalog = Record<KurumsalJobVerticalId, readonly KurumsalSkillOption[]>;

export type ScreeningCriterion = {
  key: string;
  label: string;
  weight: number;
};

export type PublicKurumsalJobView = {
  companyName: string;
  title: string;
  slug: string;
  verticalLabel: string;
  description: string;
  criteria: ScreeningCriterion[];
  criteriaLine: string | null;
  minScore: number;
  shortlistLimit: number;
  deadlineLabel: string | null;
  /** Kurumsal kimlik doğrulanmış mı? False → noindex + uyarı şeridi. */
  employerVerified: boolean;
  /** ISO — JobPosting datePosted. */
  datePosted: string;
  /** ISO veya null — JobPosting validThrough. */
  validThrough: string | null;
};

export type OwnerApplicantView = {
  id: string;
  candidateName: string;
  candidateEmail: string;
  cvSummary: string;
  testScore: number | null;
  weightedScore: number | null;
  skillLine: string | null;
  certificateCode: string | null;
  verifyPath: string | null;
  band: KurumsalApplicationBand;
  rank: number | null;
};

export type OwnerJobView = PublicKurumsalJobView & {
  id: string;
  isActive: boolean;
  applyPath: string;
  applicants: OwnerApplicantView[];
};

export type RankableApplication = {
  id: string;
  weightedScore: number | null;
  createdAt: Date;
};

export type RankedApplication<T extends RankableApplication> = T & {
  band: KurumsalApplicationBand;
  rank: number | null;
};

const SLUG_FOLDS: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SKILL_KEY_RE = /^[a-z][a-z0-9-]{0,31}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function kurumsalJobVertical(id: string): (typeof KURUMSAL_JOB_VERTICALS)[number] | null {
  return KURUMSAL_JOB_VERTICALS.find((row) => row.id === id) ?? null;
}

export function kurumsalVerticalLabel(id: string): string {
  return kurumsalJobVertical(id)?.label ?? id;
}

export function kurumsalYetkinVertical(id: string): YetkinCvVerticalId | null {
  return kurumsalJobVertical(id)?.yetkinCvVerticalId ?? null;
}

export function normalizeScreeningText(raw: string): string {
  return raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

export function kurumsalJobSlugBase(title: string): string {
  const folded = normalizeScreeningText(title)
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (char) => SLUG_FOLDS[char] ?? char)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return folded.length >= 3 ? folded : "ilan";
}

export function isKurumsalJobSlug(value: string): boolean {
  return SLUG_RE.test(value) && value.length <= 80;
}

export function kurumsalVerifyPath(code: string | null | undefined): string | null {
  if (!code || !/^[a-f0-9]{64}$/.test(code)) {
    return null;
  }
  return `/vize/${code}`;
}

export function sumCriteriaWeights(rows: readonly { weight: number }[]): number {
  return rows.reduce((sum, row) => sum + row.weight, 0);
}

/** Math.round(Σ(altPuan × ağırlık / 100)). Alt puan bu fonksiyona hazır gelir. */
export function weightedScreeningScore(
  criteria: readonly Pick<ScreeningCriterion, "key" | "weight">[],
  skillScores: Readonly<Record<string, number>>,
): number | null {
  if (criteria.length < KURUMSAL_CRITERIA_MIN || criteria.length > KURUMSAL_CRITERIA_MAX) {
    return null;
  }
  if (sumCriteriaWeights(criteria) !== 100) {
    return null;
  }
  let sum = 0;
  for (const row of criteria) {
    const score = skillScores[row.key];
    if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100) {
      return null;
    }
    if (!Number.isInteger(row.weight) || row.weight < 1 || row.weight > 100) {
      return null;
    }
    sum += (score * row.weight) / 100;
  }
  const rounded = Math.round(sum);
  if (rounded < 0 || rounded > 100) {
    return null;
  }
  return rounded;
}

export function formatCriteriaWeightLine(
  criteria: readonly Pick<ScreeningCriterion, "label" | "weight">[],
): string | null {
  if (criteria.length === 0) {
    return null;
  }
  const parts = criteria.map((row) => `${row.label} %${row.weight}`);
  return `${parts.join(" + ")} = %${sumCriteriaWeights(criteria)}`;
}

export function formatSkillScoreLine(
  criteria: readonly Pick<ScreeningCriterion, "key" | "label">[],
  skillScores: Readonly<Record<string, number>> | null,
): string | null {
  if (!skillScores || criteria.length === 0) {
    return null;
  }
  const parts: string[] = [];
  for (const row of criteria) {
    const score = skillScores[row.key];
    if (typeof score !== "number" || !Number.isInteger(score)) {
      return null;
    }
    parts.push(`${row.label}: ${score}`);
  }
  return parts.join(" · ");
}

export function readSkillScoreMap(value: unknown): Record<string, number> | null {
  if (!isRecord(value)) {
    return null;
  }
  const scores: Record<string, number> = {};
  for (const [key, score] of Object.entries(value)) {
    if (!SKILL_KEY_RE.test(key)) {
      return null;
    }
    if (typeof score !== "number" || !Number.isInteger(score) || score < 0 || score > 100) {
      return null;
    }
    scores[key] = score;
  }
  return scores;
}

export function parseCriteriaWeights(
  raw: unknown,
  allowed: readonly KurumsalSkillOption[],
): { ok: true; value: ScreeningCriterion[] } | { ok: false; error: string } {
  if (!Array.isArray(raw)) {
    return { ok: false, error: "Yetkinlik ağırlığı listesi gerekli." };
  }
  if (raw.length < KURUMSAL_CRITERIA_MIN || raw.length > KURUMSAL_CRITERIA_MAX) {
    return { ok: false, error: "3 ile 5 yetkinlik seçilmeli." };
  }
  const byKey = new Map(allowed.map((row) => [row.key, row.label]));
  const seen = new Set<string>();
  const value: ScreeningCriterion[] = [];
  for (const row of raw) {
    if (!isRecord(row) || typeof row.key !== "string") {
      return { ok: false, error: "Yetkinlik satırı geçersiz." };
    }
    const key = row.key.trim();
    const label = byKey.get(key);
    if (!SKILL_KEY_RE.test(key) || !label) {
      return { ok: false, error: "Yetkinlik bu uzmanlığın vaka bankasından seçilir." };
    }
    if (seen.has(key)) {
      return { ok: false, error: "Aynı yetkinlik iki kez seçilemez." };
    }
    seen.add(key);
    const weight = row.weight;
    if (typeof weight !== "number" || !Number.isInteger(weight) || weight < 1 || weight > 100) {
      return { ok: false, error: "Ağırlık 1 ile 100 arasında tam sayı olmalı." };
    }
    value.push({ key, label, weight });
  }
  if (sumCriteriaWeights(value) !== 100) {
    return { ok: false, error: "Ağırlıkların toplamı %100 olmalı." };
  }
  return { ok: true, value };
}

export function readStoredCriteria(
  raw: unknown,
  allowed: readonly KurumsalSkillOption[],
): ScreeningCriterion[] {
  const parsed = parseCriteriaWeights(raw, allowed);
  return parsed.ok ? parsed.value : [];
}

export function rankJobApplications<T extends RankableApplication>(
  rows: readonly T[],
  minScore: number,
  shortlistLimit: number,
): RankedApplication<T>[] {
  const bar = Number.isInteger(minScore) && minScore >= 0 && minScore <= 100 ? minScore : KURUMSAL_DEFAULT_MIN_SCORE;
  const limit =
    Number.isInteger(shortlistLimit) && shortlistLimit >= 1 && shortlistLimit <= KURUMSAL_SHORTLIST_MAX
      ? shortlistLimit
      : KURUMSAL_DEFAULT_SHORTLIST;
  const pending = rows.filter((row) => row.weightedScore === null);
  const tested = rows
    .filter((row) => row.weightedScore !== null)
    .slice()
    .sort((left, right) => {
      const scoreGap = (right.weightedScore ?? 0) - (left.weightedScore ?? 0);
      if (scoreGap !== 0) {
        return scoreGap;
      }
      return left.createdAt.getTime() - right.createdAt.getTime();
    });
  let taken = 0;
  const ranked: RankedApplication<T>[] = tested.map((row, index) => {
    const score = row.weightedScore ?? 0;
    let band: KurumsalApplicationBand;
    if (score < bar) {
      band = "BELOW_THRESHOLD";
    } else if (taken < limit) {
      taken += 1;
      band = "SHORTLISTED";
    } else {
      band = "QUALIFIED_NOT_SHORTLISTED";
    }
    return {
      ...row,
      band,
      rank: index + 1,
    };
  });
  const waiting: RankedApplication<T>[] = pending.map((row) => ({
    ...row,
    band: "PENDING_TEST",
    rank: null,
  }));
  return [...ranked, ...waiting];
}

export type KurumsalJobDraft = {
  companyName: string;
  title: string;
  vertical: KurumsalJobVerticalId;
  description: string;
  criteriaWeights: ScreeningCriterion[];
  minScore: number;
  shortlistLimit: number;
  deadlineAt: Date | null;
  /** Vergi / MERSİS. Doğrulama ayrı mühürdür; bu alan yalnız kimlik kaydıdır. */
  taxNumber: string;
};

const TAX_NUMBER_RE = /^[0-9]{10,11}$/;

export function normalizeTaxNumber(raw: string): string {
  return raw.replace(/\s+/g, "").replace(/[^0-9]/g, "").slice(0, 20);
}

export function isKurumsalTaxNumber(value: string): boolean {
  return TAX_NUMBER_RE.test(value);
}

export function isKurumsalJobOpen(
  job: { isActive: boolean; deadlineAt: Date | null },
  now: Date,
): boolean {
  if (!job.isActive) {
    return false;
  }
  if (!job.deadlineAt) {
    return true;
  }
  return job.deadlineAt.getTime() > now.getTime();
}

export function formatIstanbulDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function istanbulEndOfDay(isoDate: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return null;
  }
  const deadline = new Date(`${isoDate}T23:59:59.999+03:00`);
  if (Number.isNaN(deadline.getTime())) {
    return null;
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(deadline);
  if (parts !== isoDate) {
    return null;
  }
  return deadline;
}

export function parseKurumsalDeadline(
  raw: unknown,
  now: Date,
): { ok: true; value: Date | null } | { ok: false; error: string } {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: null };
  }
  if (typeof raw !== "string") {
    return { ok: false, error: "Son başvuru tarihi YYYY-AA-GG biçiminde olmalı." };
  }
  const deadline = istanbulEndOfDay(raw);
  if (!deadline) {
    return { ok: false, error: "Son başvuru tarihi okunamadı." };
  }
  if (deadline.getTime() <= now.getTime()) {
    return { ok: false, error: "Son başvuru tarihi geçmiş bir gün olamaz." };
  }
  return { ok: true, value: deadline };
}

export function parseKurumsalJobDraft(
  raw: unknown,
  skillsFor: (vertical: KurumsalJobVerticalId) => readonly KurumsalSkillOption[] | null,
  now: Date,
): { ok: true; value: KurumsalJobDraft } | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: false, error: "İstek gövdesi okunamadı." };
  }
  const companyName = normalizeScreeningText(typeof raw.companyName === "string" ? raw.companyName : "");
  const title = normalizeScreeningText(typeof raw.title === "string" ? raw.title : "");
  const vertical = kurumsalJobVertical(typeof raw.vertical === "string" ? raw.vertical : "");
  const description = normalizeScreeningText(typeof raw.description === "string" ? raw.description : "");
  const taxNumber = normalizeTaxNumber(typeof raw.taxNumber === "string" ? raw.taxNumber : "");
  const minScore = raw.minScore;
  const shortlistLimit = raw.shortlistLimit;
  if (companyName.length < 2 || companyName.length > 120) {
    return { ok: false, error: "Şirket adı 2 ile 120 karakter arasında olmalı." };
  }
  if (title.length < 3 || title.length > 160) {
    return { ok: false, error: "Pozisyon adı 3 ile 160 karakter arasında olmalı." };
  }
  if (!vertical) {
    return { ok: false, error: "Uzmanlık listeden seçilir." };
  }
  const allowed = skillsFor(vertical.id);
  if (!allowed || allowed.length < KURUMSAL_CRITERIA_MIN) {
    return { ok: false, error: "Uzmanlığın vaka becerisi tanımlı değil." };
  }
  const criteria = parseCriteriaWeights(raw.criteriaWeights, allowed);
  if (!criteria.ok) {
    return criteria;
  }
  if (description.length < 40 || description.length > 4000) {
    return { ok: false, error: "İş tanımı 40 ile 4000 karakter arasında olmalı." };
  }
  if (taxNumber.length > 0 && !isKurumsalTaxNumber(taxNumber)) {
    return { ok: false, error: "Vergi / MERSİS numarası 10 veya 11 rakam olmalı." };
  }
  if (typeof minScore !== "number" || !Number.isInteger(minScore) || minScore < 0 || minScore > 100) {
    return { ok: false, error: "Baraj puanı 0 ile 100 arasında tam sayı olmalı." };
  }
  if (
    typeof shortlistLimit !== "number" ||
    !Number.isInteger(shortlistLimit) ||
    shortlistLimit < 1 ||
    shortlistLimit > KURUMSAL_SHORTLIST_MAX
  ) {
    return { ok: false, error: "Mülakat kontenjanı 1 ile 50 arasında tam sayı olmalı." };
  }
  const deadline = parseKurumsalDeadline(raw.deadlineAt, now);
  if (!deadline.ok) {
    return deadline;
  }
  return {
    ok: true,
    value: {
      companyName,
      title,
      vertical: vertical.id,
      description,
      criteriaWeights: criteria.value,
      minScore,
      shortlistLimit,
      deadlineAt: deadline.value,
      taxNumber,
    },
  };
}

export type KurumsalApplyDraft = {
  candidateName: string;
  candidateEmail: string;
  cvSummary: string;
};

export function parseKurumsalApplyDraft(
  raw: unknown,
): { ok: true; value: KurumsalApplyDraft } | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: false, error: "İstek gövdesi okunamadı." };
  }
  const candidateName = normalizeScreeningText(typeof raw.candidateName === "string" ? raw.candidateName : "");
  const candidateEmail = normalizeScreeningText(typeof raw.candidateEmail === "string" ? raw.candidateEmail : "").toLowerCase();
  const cvSummary = normalizeScreeningText(typeof raw.cvSummary === "string" ? raw.cvSummary : "");
  if (candidateName.length < 2 || candidateName.length > 120) {
    return { ok: false, error: "Ad 2 ile 120 karakter arasında olmalı." };
  }
  if (!EMAIL_RE.test(candidateEmail) || candidateEmail.length > 160) {
    return { ok: false, error: "E-posta adresi geçersiz." };
  }
  if (cvSummary.length < KURUMSAL_CV_MIN || cvSummary.length > KURUMSAL_CV_MAX) {
    return { ok: false, error: "CV özeti 40 ile 6000 karakter arasında olmalı." };
  }
  return { ok: true, value: { candidateName, candidateEmail, cvSummary } };
}
