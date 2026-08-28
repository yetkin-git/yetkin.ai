import { z } from "zod";

export const marketplaceProductKindSchema = z.enum(["DIGITAL_GOOD", "SERVICE"]);
export const marketplaceProductCategorySchema = z.enum([
  "DIGITAL_GOOD",
  "SERVICE",
  "REAL_ESTATE",
  "VEHICLE",
]);

export const createProductInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(8).max(4000),
  kind: marketplaceProductKindSchema.optional(),
  category: marketplaceProductCategorySchema.optional(),
  amountMinor: z.number().int().positive(),
  isOfferAllowed: z.boolean().optional(),
  tkgmBlockParcel: z.string().trim().min(1).max(80).optional().nullable(),
  insuranceQuoteHook: z.string().trim().min(1).max(200).optional().nullable(),
});

export const purchaseProductInputSchema = z.object({
  lockId: z.string().trim().min(1).optional(),
});

export const createOfferInputSchema = z.object({
  productId: z.string().trim().min(1),
  amountMinor: z.number().int().positive(),
});

export const decideOfferInputSchema = z.object({
  offerId: z.string().trim().min(1),
  decision: z.enum(["accept", "reject"]),
});

export const pazaryeriOfferInputSchema = z.union([createOfferInputSchema, decideOfferInputSchema]);

export const pazaryeriDopingInputSchema = z.object({
  productId: z.string().trim().min(1),
});

export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type PurchaseProductInput = z.infer<typeof purchaseProductInputSchema>;
export type CreateOfferInput = z.infer<typeof createOfferInputSchema>;
export type DecideOfferInput = z.infer<typeof decideOfferInputSchema>;
export type PazaryeriDopingInput = z.infer<typeof pazaryeriDopingInputSchema>;
