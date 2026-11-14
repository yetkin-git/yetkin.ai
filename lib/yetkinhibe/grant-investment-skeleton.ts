import type { GrantBudgetLineCategory } from "@/lib/yetkinhibe/types";

/**
 * Yatırım kalemi ve iş adımı iskeleti. Tutar ve ay aralığı burada yoktur;
 * yalnız kullanıcının girdiği satırda doldurulur. `calculateGrantBudget` çağrılmaz.
 */

export const GRANT_INVESTMENT_SKELETON: readonly {
  category: GrantBudgetLineCategory;
  label: string;
}[] = [
  { category: "PERSONEL", label: "Personel" },
  { category: "ALET_TECHIZAT", label: "Makine ve teçhizat" },
  { category: "HIZMET_ALIMI", label: "Hizmet alımı" },
  { category: "SEYAHAT", label: "Seyahat" },
  { category: "GENEL_GIDER", label: "Genel gider" },
];

export const GRANT_SCHEDULE_STEPS = [
  { id: "hazirlik", name: "Hazırlık" },
  { id: "uygulama", name: "Uygulama" },
  { id: "dogrulama", name: "Doğrulama" },
  { id: "teslim", name: "Teslim" },
] as const;

export type GrantScheduleStepId = (typeof GRANT_SCHEDULE_STEPS)[number]["id"];

export function grantInvestmentSkeleton(
  amounts: Partial<Record<GrantBudgetLineCategory, number | null>> = {},
): readonly { category: GrantBudgetLineCategory; label: string; amountMinor: number | null }[] {
  return GRANT_INVESTMENT_SKELETON.map((row) => ({
    category: row.category,
    label: row.label,
    amountMinor: amounts[row.category] ?? null,
  }));
}

export function grantScheduleSkeleton(
  windows: Partial<Record<GrantScheduleStepId, string | null>> = {},
): readonly { id: GrantScheduleStepId; name: string; windowLabel: string | null }[] {
  return GRANT_SCHEDULE_STEPS.map((step) => ({
    id: step.id,
    name: step.name,
    windowLabel: windows[step.id] ?? null,
  }));
}
