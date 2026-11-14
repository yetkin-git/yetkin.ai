import { z } from "zod";
import { PAZARYERI_MARKETS, PAZARYERI_MAX_INPUT, type PazaryeriId } from "@/lib/tezgah/pazaryeri/copy";

function enumIds<T extends string>(ids: readonly T[]): [T, ...T[]] {
  const [first, ...rest] = ids;
  if (!first) {
    throw new Error("Pazaryeri listesi boş.");
  }
  return [first, ...rest];
}

export const pazaryeriGenerateRequestSchema = z.strictObject({
  market: z.enum(enumIds(PAZARYERI_MARKETS.map((market) => market.id))),
  products: z.string().trim().min(2).max(PAZARYERI_MAX_INPUT),
});

export type PazaryeriGenerateRequest = z.infer<typeof pazaryeriGenerateRequestSchema>;

export type PazaryeriDraft = {
  market: PazaryeriId;
  products: string;
};
