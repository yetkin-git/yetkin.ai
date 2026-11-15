import type { GrantDossierBudgetCategory } from "@/lib/tezgah/grant/types";

/** Sihirbazın süre seçenekleri. Aralık kodda bu üç değere bölünür. */
export const GRANT_DETAIL_DURATIONS = [12, 18, 24] as const;

export type GrantDetailDuration = (typeof GRANT_DETAIL_DURATIONS)[number];

export const GRANT_DETAIL_BUDGET_LINES: readonly {
  category: GrantDossierBudgetCategory;
  label: string;
  field: "personnelLira" | "equipmentLira" | "serviceLira";
}[] = [
  { category: "PERSONEL", label: "Personel", field: "personnelLira" },
  { category: "ALET_TECHIZAT", label: "Makine-Teçhizat", field: "equipmentLira" },
  { category: "HIZMET_ALIMI", label: "Yazılım/Hizmet Alımı", field: "serviceLira" },
];

export type GrantDetailsInput = {
  targetGrantId: string;
  durationMonths: GrantDetailDuration;
  totalBudgetLira: string;
  personnelLira: string;
  equipmentLira: string;
  serviceLira: string;
  teamHeadcount: string;
  teamExpertise: string;
  outputGoal: string;
};
