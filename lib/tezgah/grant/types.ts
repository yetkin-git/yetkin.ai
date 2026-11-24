export type GrantCriterionRow = {
  key: string;
  label: string;
  passed: boolean;
  unconstrained: boolean;
};

export type GrantEligibleProgram = {
  grantId: string;
  title: string;
  sourceLabel: string;
  officialInfoUrl: string;
  remainingDays: number;
  criteria: readonly GrantCriterionRow[];
  poolLabel: string;
  ceilingLabel: string;
  ratioLabel: string;
  /** Katalog doğrulama anı. Yoksa tutar ve oran basılmaz. */
  sourceVerifiedAt?: string | null;
  dataVersion?: number | null;
  /**
   * Şartname madde numaraları (virgülle, artan). Ş5 — satır kendi şartnamesinden
   * eşleşen **tüm** maddeleri taşır; tek maddeye indirgenmez.
   */
  madde?: string | null;
  /** Bölüm başlığı → madde. Mevzuat izi tablosunu besler. */
  sectionArticles?: readonly { title: string; article: string }[];
};

export type GrantWithheldProgram = {
  grantId: string;
  title: string;
  sourceLabel: string;
  note: string;
};

export type GrantScheduleRow = {
  id: string;
  name: string;
  windowLabel: string | null;
  draft: boolean;
};

export type GrantInvestmentRow = {
  category: string;
  label: string;
  amountLabel: string | null;
};

export type GrantDossierBudgetCategory = "PERSONEL" | "ALET_TECHIZAT" | "HIZMET_ALIMI";

export type GrantDossierWorkPackage = {
  id: string;
  name: string;
  windowLabel: string;
};

export type GrantDossierBudgetRow = {
  category: GrantDossierBudgetCategory;
  label: string;
  amountLabel: string;
};

export type GrantDossierTeamRow = {
  area: string;
  headcountLabel: string | null;
  note: string;
};

/** Kuruma özel tam dosya. Tutar ve ay aralığı başvuru sahibinin girdisidir. */
export type GrantDossier = {
  disclaimer: string;
  targetTitle: string;
  targetSourceLabel: string;
  targetInfoUrl: string;
  criterionLabels: readonly string[];
  durationMonths: 12 | 18 | 24;
  durationNote: string;
  workPackages: readonly GrantDossierWorkPackage[];
  budgetNote: string;
  budgetTotalLabel: string;
  budgetRows: readonly GrantDossierBudgetRow[];
  budgetRationale: string;
  teamHeadcount: number;
  teamRows: readonly GrantDossierTeamRow[];
  competencyNote: string;
  outputGoal: string;
  commercialization: string;
  summary: string;
  templateId?: string;
  templateTitle?: string;
  templateSections?: readonly { title: string; body: string }[];
  /** Bölüm başlığı → madde numarası (Ş5/Ş8). Adam-ay hücresi bu atfı basar. */
  sectionArticles?: readonly { title: string; article: string }[];
};

export type GrantProjectReport = {
  tool: "grant";
  disclaimer: string;
  preparedAt: string;
  businessName: string;
  freelancerName: string;
  provinceLabel: string;
  audienceLabel: string;
  naceLabel: string;
  investmentFocusLabel: string;
  employeeCount: number;
  companyAgeYears: number;
  rdLabel: string;
  exportLabel: string;
  patentLabel: string;
  eligible: readonly GrantEligibleProgram[];
  closed: readonly GrantWithheldProgram[];
  unverified: readonly GrantWithheldProgram[];
  purpose: string;
  market: string;
  schedule: readonly GrantScheduleRow[];
  investments: readonly GrantInvestmentRow[];
  risk: string;
  dossier: GrantDossier | null;
};
