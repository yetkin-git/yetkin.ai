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
};
