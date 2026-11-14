import { z } from "zod";
import { DUKKAN_SECTORS } from "@/lib/tezgah/dukkan/copy";
import { REKLAM_AIMS, type ReklamAim } from "@/lib/tezgah/reklam/copy";

const shortText = z.string().trim().min(2).max(80);

function enumIds<T extends string>(ids: readonly T[]): [T, ...T[]] {
  const [first, ...rest] = ids;
  if (!first) {
    throw new Error("Reklam listesi boş.");
  }
  return [first, ...rest];
}

export const reklamGenerateRequestSchema = z.strictObject({
  businessName: shortText,
  sector: z.enum(enumIds(DUKKAN_SECTORS.map((sector) => sector.id))),
  place: shortText,
  aim: z.enum(enumIds(REKLAM_AIMS.map((aim) => aim.id))),
  offer: z.string().trim().min(2).max(400),
});

export type ReklamGenerateRequest = z.infer<typeof reklamGenerateRequestSchema>;

export type ReklamDraft = {
  businessName: string;
  sector: ReklamGenerateRequest["sector"];
  place: string;
  aim: ReklamAim;
  offer: string;
};

export function readReklamDraft(input: ReklamGenerateRequest): ReklamDraft {
  return {
    businessName: input.businessName.trim(),
    sector: input.sector,
    place: input.place.trim(),
    aim: input.aim,
    offer: input.offer.trim(),
  };
}
