import { z } from "zod";

const coverName = z.string().trim().min(2).max(80);

export const tetkikGenerateRequestSchema = z.strictObject({
  url: z.string().trim().min(12).max(300),
  businessName: coverName,
  freelancerName: coverName,
  agencyName: z.union([coverName, z.literal("")]).optional(),
});

export type TetkikGenerateRequest = z.infer<typeof tetkikGenerateRequestSchema>;
