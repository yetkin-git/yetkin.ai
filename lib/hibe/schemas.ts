import { z } from "zod";

export const grantAgencySchema = z.enum(["KOSGEB", "TUBITAK", "OTHER"]);
export const grantProfileKindSchema = z.enum(["INDIVIDUAL", "CORPORATE"]);

export const grantMatchInputSchema = z.object({
  jurisdiction: z.string().trim().min(2).max(8).default("TR"),
  applicantKind: grantProfileKindSchema.default("INDIVIDUAL"),
  hasTaxId: z.boolean().default(false),
  sectorTags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  agency: grantAgencySchema.optional(),
  query: z.string().trim().max(120).optional(),
});

export const openGrantApplicationInputSchema = z.object({
  programId: z.string().trim().min(1),
  companyHint: z.string().trim().max(160).optional().nullable(),
  completeChecklist: z.boolean().optional(),
});

export type GrantMatchInput = z.infer<typeof grantMatchInputSchema>;
export type OpenGrantApplicationInput = z.infer<typeof openGrantApplicationInputSchema>;
