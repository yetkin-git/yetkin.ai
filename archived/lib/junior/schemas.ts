import { z } from "zod";
import { GUARDIAN_INVITE_PLAINTEXT_PATTERN } from "@/lib/junior/invite-format";

export const juniorDateOfBirthSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Doğum tarihi YYYY-AA-GG olmalıdır.");

/** Profil gövdesi guardianUserId kabul etmez; extra key 400. */
export const upsertJuniorProfileInputSchema = z
  .object({
    dateOfBirth: juniorDateOfBirthSchema,
  })
  .strict();

export const guardianInviteTokenSchema = z
  .string()
  .trim()
  .regex(GUARDIAN_INVITE_PLAINTEXT_PATTERN, "Davet token'ı geçersiz.");

export const createGuardianInviteInputSchema = z.object({}).strict();

export const acceptGuardianInviteInputSchema = z
  .object({
    token: guardianInviteTokenSchema,
  })
  .strict();

export const setJuniorWeeklyCapInputSchema = z.object({
  childUserId: z.string().trim().min(1).max(64),
  weeklyCapMinor: z.number().int().positive().max(2_000_000),
});

export const grantJuniorAllowanceInputSchema = z.object({
  childUserId: z.string().trim().min(1).max(64),
  amountMinor: z.number().int().positive().max(2_000_000),
});

export type UpsertJuniorProfileInput = z.infer<typeof upsertJuniorProfileInputSchema>;
export type AcceptGuardianInviteInput = z.infer<typeof acceptGuardianInviteInputSchema>;
export type SetJuniorWeeklyCapInput = z.infer<typeof setJuniorWeeklyCapInputSchema>;
export type GrantJuniorAllowanceInput = z.infer<typeof grantJuniorAllowanceInputSchema>;
