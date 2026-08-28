import { z } from "zod";

export const createProjectInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  summary: z.string().trim().min(4).max(500),
});

export const issueApiKeyInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const generateDevLabsCodeInputSchema = z.object({
  prompt: z.string().trim().min(1).max(4_000),
  apiKeyId: z.string().trim().min(1),
});

export type CreateProjectInput = z.infer<typeof createProjectInputSchema>;
export type IssueApiKeyInput = z.infer<typeof issueApiKeyInputSchema>;
export type GenerateDevLabsCodeInput = z.infer<typeof generateDevLabsCodeInputSchema>;
