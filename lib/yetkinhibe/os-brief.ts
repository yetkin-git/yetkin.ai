import {
  GRANT_INVESTMENT_FOCI,
  GRANT_NACE_GROUPS,
  GRANT_PROVINCES,
  GRANT_RD_LEVELS,
  isGrantInvestmentFocus,
  isGrantNaceGroup,
  isGrantRdLevel,
  isProvinceCode,
  type GrantAudience,
  type GrantInvestmentFocus,
  type GrantRdLevel,
} from "@/lib/yetkinhibe/grant-brief-axes";
import type { GrantProgramBrief } from "@/lib/yetkinhibe/match-grant-programs-for-brief";

export const HIBE_TABS = ["analiz", "programlar", "proje", "arsiv", "basvuru", "ajans"] as const;

export type HibeTab = (typeof HIBE_TABS)[number];

export const HIBE_BUSINESS_KINDS = [
  { id: "esnaf", label: "Esnaf", audience: "mevcut_kobi" },
  { id: "kobi", label: "KOBİ", audience: "mevcut_kobi" },
  { id: "startup", label: "Startup", audience: "yeni_girisimci" },
  { id: "danismanlik", label: "Danışmanlık Firması", audience: "mevcut_kobi" },
] as const;

export type HibeBusinessKindId = (typeof HIBE_BUSINESS_KINDS)[number]["id"];

export function parseHibeTab(raw: string | undefined): HibeTab {
  return (HIBE_TABS as readonly string[]).includes(raw ?? "") ? (raw as HibeTab) : "analiz";
}

export function hibeBusinessAudience(id: string): GrantAudience | null {
  const row = HIBE_BUSINESS_KINDS.find((kind) => kind.id === id);
  return row ? row.audience : null;
}

export type HibeAnalysisInput = {
  businessKind: HibeBusinessKindId;
  audience: GrantAudience;
  naceGroup: string;
  provinceCode: string;
  investmentFocus: GrantInvestmentFocus;
  employeeCount: number;
  companyAgeYears: number;
  rdMaturityLevel: GrantRdLevel;
  exportActive: boolean;
  hasPatentOrUtilityModel: boolean;
  businessName: string;
};

function countIn(raw: string | undefined, max: number): number | null {
  if (!raw || !/^\d{1,6}$/.test(raw.trim())) {
    return null;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > max) {
    return null;
  }
  return parsed;
}

export function parseHibeAnalysis(params: {
  isletme?: string;
  nace?: string;
  il?: string;
  yatirim?: string;
  calisan?: string;
  yas?: string;
  arge?: string;
  ihracat?: string;
  patent?: string;
  ad?: string;
  hesap?: string;
}): HibeAnalysisInput | null {
  if (params.hesap !== "1") {
    return null;
  }
  const audience = hibeBusinessAudience(params.isletme ?? "");
  const kind = HIBE_BUSINESS_KINDS.find((row) => row.id === params.isletme);
  if (!audience || !kind) {
    return null;
  }
  if (!isGrantNaceGroup(params.nace ?? "") || !isProvinceCode(params.il ?? "")) {
    return null;
  }
  if (!isGrantInvestmentFocus(params.yatirim ?? "") || !isGrantRdLevel(params.arge ?? "")) {
    return null;
  }
  const employeeCount = countIn(params.calisan, 100_000);
  const companyAgeYears = countIn(params.yas, 150);
  if (employeeCount === null || companyAgeYears === null) {
    return null;
  }
  if (params.ihracat !== "evet" && params.ihracat !== "hayir") {
    return null;
  }
  if (params.patent !== "evet" && params.patent !== "hayir") {
    return null;
  }
  const businessName = (params.ad ?? "").trim().slice(0, 80);
  return {
    businessKind: kind.id,
    audience,
    naceGroup: params.nace ?? "",
    provinceCode: params.il ?? "",
    investmentFocus: params.yatirim as GrantInvestmentFocus,
    employeeCount,
    companyAgeYears,
    rdMaturityLevel: params.arge as GrantRdLevel,
    exportActive: params.ihracat === "evet",
    hasPatentOrUtilityModel: params.patent === "evet",
    businessName: businessName.length >= 2 ? businessName : "Firma profili",
  };
}

export function hibeAnalysisToBrief(input: HibeAnalysisInput): GrantProgramBrief {
  return {
    provinceCode: input.provinceCode,
    audience: input.audience,
    naceGroup: input.naceGroup,
    investmentFocus: input.investmentFocus,
    employeeCount: input.employeeCount,
    companyAgeYears: input.companyAgeYears,
    rdMaturityLevel: input.rdMaturityLevel,
    exportActive: input.exportActive,
    hasPatentOrUtilityModel: input.hasPatentOrUtilityModel,
  };
}

export const HIBE_FORM_LISTS = {
  provinces: GRANT_PROVINCES,
  nace: GRANT_NACE_GROUPS,
  foci: GRANT_INVESTMENT_FOCI,
  rd: GRANT_RD_LEVELS,
} as const;
