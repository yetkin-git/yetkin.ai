import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import {
  grantScheduleSkeleton,
  grantInvestmentSkeleton,
  type GrantScheduleStepId,
} from "@/lib/yetkinhibe/grant-investment-skeleton";
import type { GrantBudgetLineCategory } from "@/lib/yetkinhibe/types";
import type { GrantGenerateRequest } from "@/lib/tezgah/grant/schema";

const MAX_LIRA = 1_000_000_000;
const STEP_LINE = /^(hazirlik|uygulama|dogrulama|teslim)\s+(\d{1,2})-(\d{1,2})$/;
const MONEY_LINE = /^(PERSONEL|ALET_TECHIZAT|HIZMET_ALIMI|SEYAHAT|GENEL_GIDER)\s+(\d{1,10})$/;

export type GrantDraft = {
  businessName: string;
  freelancerName: string;
  provinceCode: GrantGenerateRequest["provinceCode"];
  audience: GrantGenerateRequest["audience"];
  naceGroup: GrantGenerateRequest["naceGroup"];
  investmentFocus: GrantGenerateRequest["investmentFocus"];
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: GrantGenerateRequest["rdMaturityLevel"];
  exportActive: boolean;
  hasPatentOrUtilityModel: boolean;
  project: string;
  schedule: ReturnType<typeof grantScheduleSkeleton>;
  investments: ReturnType<typeof grantInvestmentSkeleton>;
};

function lines(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function readSchedule(value: string | undefined): ReturnType<typeof grantScheduleSkeleton> | null {
  const windows: Partial<Record<GrantScheduleStepId, string>> = {};
  for (const line of lines(value)) {
    const match = STEP_LINE.exec(line);
    if (!match) {
      return null;
    }
    const id = match[1] as GrantScheduleStepId;
    if (windows[id]) {
      return null;
    }
    const start = Number(match[2]);
    const end = Number(match[3]);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start || end > 36) {
      return null;
    }
    windows[id] = `${start}-${end}`;
  }
  return grantScheduleSkeleton(windows);
}

function readInvestments(value: string | undefined): ReturnType<typeof grantInvestmentSkeleton> | null {
  const amounts: Partial<Record<GrantBudgetLineCategory, number>> = {};
  for (const line of lines(value)) {
    const match = MONEY_LINE.exec(line);
    if (!match) {
      return null;
    }
    const category = match[1] as GrantBudgetLineCategory;
    if (amounts[category] !== undefined) {
      return null;
    }
    const lira = Number(match[2]);
    const minor = lira * 100;
    if (!Number.isSafeInteger(lira) || lira < 0 || lira > MAX_LIRA || !Number.isSafeInteger(minor)) {
      return null;
    }
    amounts[category] = toAmountMinor(minor);
  }
  return grantInvestmentSkeleton(amounts);
}

export function readGrantDraft(input: GrantGenerateRequest): GrantDraft | null {
  const schedule = readSchedule(input.scheduleWindows);
  const investments = readInvestments(input.investmentAmounts);
  if (!schedule || !investments) {
    return null;
  }
  return {
    businessName: input.businessName.trim(),
    freelancerName: input.freelancerName.trim(),
    provinceCode: input.provinceCode,
    audience: input.audience,
    naceGroup: input.naceGroup,
    investmentFocus: input.investmentFocus,
    employeeCount: Number(input.employeeCount),
    companyAgeYears: Number(input.companyAgeYears),
    rdMaturityLevel: input.rdMaturityLevel,
    exportActive: input.exportActive === "evet",
    hasPatentOrUtilityModel: input.patent === "evet",
    project: input.project.trim(),
    schedule,
    investments,
  };
}
