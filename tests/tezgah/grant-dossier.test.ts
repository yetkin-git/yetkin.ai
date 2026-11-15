import { describe, expect, it } from "vitest";
import { grantGenerateRequestSchema } from "@/lib/tezgah/grant/schema";
import {
  GRANT_DETAILS_BUDGET_MISMATCH,
  GRANT_DETAILS_TEAM_OVER,
  grantDetailWorkPackages,
  readGrantDossierPlan,
} from "@/lib/tezgah/grant/details";
import type { GrantDetailDuration } from "@/lib/tezgah/grant/details-input";

const BRIEF = {
  businessName: "Karaoğlu Soğuk Zincir",
  freelancerName: "Ayşe Yılmaz",
  provinceCode: "34" as const,
  audience: "mevcut_kobi" as const,
  naceGroup: "10" as const,
  investmentFocus: "makine_techizat" as const,
  employeeCount: "10",
  companyAgeYears: "3",
  rdMaturityLevel: "EARLY" as const,
  exportActive: "hayir" as const,
  patent: "hayir" as const,
  project: "Soğuk zincir deposu kendi satış kanalına bağlanacak.",
};

const DETAILS = {
  targetGrantId: "kosgeb-is-gelistirme-2026-3",
  durationMonths: 12 as const,
  totalBudgetLira: "100",
  personnelLira: "40",
  equipmentLira: "40",
  serviceLira: "20",
  teamHeadcount: "3",
  teamExpertise: "Soğuk zincir operasyonu ve kanal yazılımı",
  outputGoal: "Depo kendi satış kanalına bağlanır ve bölgesel dağıtım başlar.",
};

function span(label: string): number {
  const match = /^(\d{1,2})-(\d{1,2})$/.exec(label);
  if (!match) {
    return 0;
  }
  return Number(match[2]) - Number(match[1]) + 1;
}

describe("hibe kuruma özel ayrıntı", () => {
  it("ön taslağı bozmaz, fazla alanı reddeder", () => {
    expect(grantGenerateRequestSchema.safeParse(BRIEF).success).toBe(true);
    expect(grantGenerateRequestSchema.safeParse({ ...BRIEF, details: DETAILS }).success).toBe(true);
    expect(
      grantGenerateRequestSchema.safeParse({ ...BRIEF, details: { ...DETAILS, callCode: "X-1" } }).success,
    ).toBe(false);
  });

  it("süreyi dört iş paketine böler ve tutarı uydurmaz", () => {
    for (const duration of [12, 18, 24] as const satisfies readonly GrantDetailDuration[]) {
      const rows = grantDetailWorkPackages(duration);
      expect(rows).toHaveLength(4);
      expect(rows.reduce((sum, row) => sum + span(row.windowLabel), 0)).toBe(duration);
      expect(rows[0]?.windowLabel.startsWith("1-")).toBe(true);
      expect(rows[3]?.windowLabel.endsWith(`-${duration}`)).toBe(true);
    }
    const plan = readGrantDossierPlan({ ...DETAILS, durationMonths: 24 });
    expect(plan.ok).toBe(true);
    if (!plan.ok) {
      return;
    }
    expect(plan.plan.budgetRows).toHaveLength(3);
    expect(plan.plan.totalMinor).toBe(10_000);
    expect(plan.plan.teamRows[0]).toMatchObject({ area: "Proje ekibi", headcountLabel: "3" });
    expect(plan.plan.teamRows[1]?.area).toBe("Uzmanlık özeti");
  });

  it("kalem toplamı ve ekip satırı tutmazsa dosya kurmaz", () => {
    expect(readGrantDossierPlan({ ...DETAILS, serviceLira: "10" })).toMatchObject({
      ok: false,
      error: GRANT_DETAILS_BUDGET_MISMATCH,
    });
    expect(
      readGrantDossierPlan({
        ...DETAILS,
        teamHeadcount: "3",
        teamExpertise: "Soğuk zincir 2\nKanal yazılımı 2",
      }),
    ).toMatchObject({ ok: false, error: GRANT_DETAILS_TEAM_OVER });
  });
});
