import { z } from "zod";

export const tetkikGenerateRequestSchema = z.strictObject({
  url: z.string().trim().min(4).max(300),
  businessName: z.string().trim().max(80).optional(),
});

export type TetkikGenerateRequest = z.infer<typeof tetkikGenerateRequestSchema>;
