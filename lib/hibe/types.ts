import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import type { CurrencyCode } from "@/lib/kernel/money/currency";

export const HIBE_MODULE_KEY = "hibe" as const;

/** Katalog derlemedir; canlı devlet başvuru API’si değildir. */
export const HIBE_CATALOG_HONESTY = "catalog-not-live-government-api" as const;

export type GrantAgency = "KOSGEB" | "TUBITAK" | "OTHER";
export type GrantApplicantKind = "INDIVIDUAL" | "CORPORATE" | "BOTH";
export type GrantApplicationStatus = "GUIDE_OPEN" | "CHECKLIST_DONE";
export type GrantProfileKind = "INDIVIDUAL" | "CORPORATE";

export type GrantProgramRecord = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  agency: GrantAgency;
  jurisdiction: string;
  applicantKind: GrantApplicantKind;
  sectorTags: string[];
  requiresTaxId: boolean;
  applicationGuide: string;
  maxAwardMinor: AmountMinor | null;
  currencyCode: CurrencyCode;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GrantApplicationRecord = {
  id: string;
  userId: string;
  programId: string;
  companyHint: string | null;
  status: GrantApplicationStatus;
  openedAt: Date;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GrantMatchQuery = {
  jurisdiction: string;
  applicantKind: GrantProfileKind;
  hasTaxId: boolean;
  sectorTags: string[];
  agency?: GrantAgency;
  query?: string;
};

export type GrantMatchResult = GrantProgramRecord & {
  score: number;
  matchedTags: string[];
};

export type HibeRecommendation = {
  title: string;
  agency: GrantAgency;
  slug: string;
  score: number;
};

export type HibePulse = {
  applicationsOpen: number;
  applicationsDone: number;
  recommendations: HibeRecommendation[];
};

export type HibeStore = {
  insertProgram(program: GrantProgramRecord): Promise<GrantProgramRecord>;
  getProgram(id: string): Promise<GrantProgramRecord | null>;
  getProgramBySlug(slug: string): Promise<GrantProgramRecord | null>;
  listPublishedPrograms(): Promise<GrantProgramRecord[]>;
  insertApplication(application: GrantApplicationRecord): Promise<GrantApplicationRecord>;
  getApplication(id: string): Promise<GrantApplicationRecord | null>;
  getApplicationByUserAndProgram(userId: string, programId: string): Promise<GrantApplicationRecord | null>;
  listApplicationsForUser(userId: string): Promise<GrantApplicationRecord[]>;
  updateApplication(
    id: string,
    patch: Partial<Pick<GrantApplicationRecord, "status" | "companyHint" | "completedAt" | "updatedAt">>,
  ): Promise<GrantApplicationRecord>;
  pulseCountsForUser(userId: string): Promise<{ applicationsOpen: number; applicationsDone: number }>;
};
