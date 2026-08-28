import { z } from "zod";

export const createTenderInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  brief: z.string().trim().min(8).max(4000),
  prizePoolMinor: z.number().int().positive(),
  companyId: z.string().trim().min(1).optional().nullable(),
  submissionWindowMs: z.number().int().positive().optional(),
  evaluationWindowMs: z.number().int().positive().optional(),
});

export const submitProposalInputSchema = z.object({
  proposal: z.string().trim().min(8).max(8000),
});

export const awardTenderInputSchema = z.object({
  winners: z
    .array(
      z.object({
        submissionId: z.string().trim().min(1),
        amountMinor: z.number().int().positive(),
      }),
    )
    .min(1)
    .max(16),
});

export type CreateTenderInput = z.infer<typeof createTenderInputSchema>;
export type SubmitProposalInput = z.infer<typeof submitProposalInputSchema>;
export type AwardTenderInput = z.infer<typeof awardTenderInputSchema>;
