import { z } from "zod";

export const socialSyncInputSchema = z.object({}).strict();

export const socialShareNoteSchema = z
  .string()
  .trim()
  .max(160)
  .optional();

export const socialInteractionInputSchema = z.object({
  note: socialShareNoteSchema,
});

export type SocialInteractionInput = z.infer<typeof socialInteractionInputSchema>;
