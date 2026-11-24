import { z } from "zod";
import { DUKKAN_SECTORS } from "@/lib/tezgah/dukkan/copy";
import { allocateReklamBudget, REKLAM_AIMS, type ReklamAim, type ReklamBudgetSplit } from "@/lib/tezgah/reklam/copy";

const shortText = z.string().trim().min(2).max(80);

function enumIds<T extends string>(ids: readonly T[]): [T, ...T[]] {
  const [first, ...rest] = ids;
  if (!first) {
    throw new Error("Reklam listesi boş.");
  }
  return [first, ...rest];
}

/** İsteğe bağlı bütçe. Boş veya geçersiz → null (yüzde gösterilir, tutar uydurulmaz). */
export function readBudgetTl(raw: string | number | null | undefined): number | null {
  if (raw == null) {
    return null;
  }
  const digits = String(raw).replace(/[^\d]/g, "");
  if (!digits) {
    return null;
  }
  const value = Number(digits);
  if (!Number.isFinite(value) || value < 1 || value > 10_000_000) {
    return null;
  }
  return Math.floor(value);
}

export const reklamGenerateRequestSchema = z.strictObject({
  businessName: shortText,
  sector: z.enum(enumIds(DUKKAN_SECTORS.map((sector) => sector.id))),
  place: shortText,
  aim: z.enum(enumIds(REKLAM_AIMS.map((aim) => aim.id))),
  offer: z.string().trim().min(2).max(400),
  budgetTl: z.union([z.string(), z.number()]).optional(),
});

export type ReklamGenerateRequest = z.infer<typeof reklamGenerateRequestSchema>;

export type ReklamDraft = {
  businessName: string;
  sector: ReklamGenerateRequest["sector"];
  place: string;
  aim: ReklamAim;
  offer: string;
  budgetTl: number | null;
  budget: ReklamBudgetSplit;
};

export function readReklamDraft(input: ReklamGenerateRequest): ReklamDraft {
  const budgetTl = readBudgetTl(input.budgetTl);
  return {
    businessName: input.businessName.trim(),
    sector: input.sector,
    place: input.place.trim(),
    aim: input.aim,
    offer: input.offer.trim(),
    budgetTl,
    budget: allocateReklamBudget(budgetTl),
  };
}
