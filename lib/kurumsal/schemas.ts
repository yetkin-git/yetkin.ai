import { z } from "zod";

export const upsertCompanyInputSchema = z.object({
  legalName: z.string().trim().min(2).max(160),
  tradeName: z.string().trim().max(160).optional().nullable(),
  jurisdiction: z.string().trim().min(2).max(8).default("TR"),
  taxId: z.string().trim().max(32).optional().nullable(),
});

export const createJobPostingInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  brief: z.string().trim().min(8).max(4000),
  budgetMinor: z.number().int().positive(),
  workbenchKind: z.enum(["FREELANCER", "DEVLABS"]),
});

export const awardJobPostingInputSchema = z.object({
  awardedUserId: z.string().trim().min(1),
  awardedDevLabsProjectId: z.string().trim().min(1).optional().nullable(),
});

export const submitJobOfferInputSchema = z.object({
  coverNote: z.string().trim().min(4).max(2000),
});

export type UpsertCompanyInput = z.infer<typeof upsertCompanyInputSchema>;
export type CreateJobPostingInput = z.infer<typeof createJobPostingInputSchema>;
export type AwardJobPostingInput = z.infer<typeof awardJobPostingInputSchema>;
export type SubmitJobOfferInput = z.infer<typeof submitJobOfferInputSchema>;
