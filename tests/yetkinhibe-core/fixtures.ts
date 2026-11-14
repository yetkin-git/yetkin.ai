import { toAmountMinor } from "@/lib/kernel/money/amount-minor";
import type {
  CompanyGrantProfile,
  GrantCallWithMeta,
  GrantEligibilityCriteria,
} from "@/lib/yetkinhibe/types";

/** Hiçbir kısıtı olmayan çağrı — her kriter baştan sağlanır. */
export const OPEN_CRITERIA: GrantEligibilityCriteria = {
  eligibleSectorCodes: null,
  minEmployeeCount: null,
  maxEmployeeCount: null,
  minCompanyAgeYears: null,
  maxCompanyAgeYears: null,
  requiresRdActivity: false,
  requiresExportActivity: false,
  requiresKobiStatus: false,
  requiresPatentOrUtilityModel: false,
};

export function makeGrantCall(overrides: Partial<GrantCallWithMeta> = {}): GrantCallWithMeta {
  return {
    id: "test-grant",
    source: "KOSGEB",
    sourceLabel: "KOSGEB",
    title: "Test Çağrısı",
    summary: "Test özeti",
    poolAmountMinor: toAmountMinor(10_000_000_000),
    minSupportMinor: toAmountMinor(1_000_00),
    maxSupportMinor: toAmountMinor(500_000_00),
    supportRatioBps: 5000,
    applicationOpensAt: "2026-01-01T00:00:00.000Z",
    applicationDeadline: "2026-12-31T00:00:00.000Z",
    eligibility: { ...OPEN_CRITERIA },
    requiredDocuments: [],
    tags: [],
    officialInfoUrl: "https://example.test/cagri",
    status: "ACTIVE",
    remainingDays: 30,
    ...overrides,
  };
}

export function makeProfile(overrides: Partial<CompanyGrantProfile> = {}): CompanyGrantProfile {
  return {
    companyId: "company-1",
    sectorCode: "uretim",
    employeeCount: 25,
    companyAgeYears: 3,
    annualRevenueMinor: toAmountMinor(5_000_000_00),
    rdMaturityLevel: "EARLY",
    exportActive: false,
    isKobi: true,
    hasPatentOrUtilityModel: false,
    region: "TR",
    ...overrides,
  };
}
