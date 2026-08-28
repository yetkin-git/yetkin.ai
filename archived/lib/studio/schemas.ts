import { z } from "zod";

export const STUDIO_PROMPT_MAX_CHARS = 4_000;

export const generateStudioInputSchema = z.object({
  prompt: z.string().trim().min(1).max(STUDIO_PROMPT_MAX_CHARS),
  draftId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(120).optional(),
});

export const createStudioDraftInputSchema = z.object({
  prompt: z.string().trim().min(1).max(STUDIO_PROMPT_MAX_CHARS),
  title: z.string().trim().min(1).max(120).optional(),
});

export const generateStudioImageInputSchema = generateStudioInputSchema;

export const studioSignUploadInputSchema = z.object({
  generationId: z.string().trim().min(1).max(128),
  mimeType: z.string().trim().min(1).max(64),
  byteSize: z.number().int(),
  contentHash: z.string().trim().regex(/^[a-fA-F0-9]{64}$/),
});

export const studioConfirmUploadInputSchema = z.object({
  generationId: z.string().trim().min(1).max(128),
});

export type GenerateStudioInput = z.infer<typeof generateStudioInputSchema>;
export type CreateStudioDraftInput = z.infer<typeof createStudioDraftInputSchema>;
export type GenerateStudioImageInput = z.infer<typeof generateStudioImageInputSchema>;
export type StudioSignUploadInput = z.infer<typeof studioSignUploadInputSchema>;
export type StudioConfirmUploadInput = z.infer<typeof studioConfirmUploadInputSchema>;
