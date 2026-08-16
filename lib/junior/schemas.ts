import { z } from "zod";

export const juniorDateOfBirthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Doğum tarihi YYYY-AA-GG olmalıdır.");

export const upsertJuniorProfileInputSchema = z.object({
  dateOfBirth: juniorDateOfBirthSchema,
  guardianUserId: z.string().trim().min(1).max(64),
});

export const juniorConsentInputSchema = z.object({
  childUserId: z.string().trim().min(1).max(64),
});

export const setJuniorWeeklyCapInputSchema = z.object({
  childUserId: z.string().trim().min(1).max(64),
  weeklyCapMinor: z.number().int().positive().max(2_000_000),
});

export const grantJuniorAllowanceInputSchema = z.object({
  childUserId: z.string().trim().min(1).max(64),
  amountMinor: z.number().int().positive().max(2_000_000),
});

export type UpsertJuniorProfileInput = z.infer<typeof upsertJuniorProfileInputSchema>;
export type JuniorConsentInput = z.infer<typeof juniorConsentInputSchema>;
export type SetJuniorWeeklyCapInput = z.infer<typeof setJuniorWeeklyCapInputSchema>;
export type GrantJuniorAllowanceInput = z.infer<typeof grantJuniorAllowanceInputSchema>;
