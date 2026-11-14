import { z } from "zod";

const shortText = z.string().trim().min(2).max(80);
const note = z.string().trim().min(2).max(800);
const brief = z.string().trim().min(2).max(1500);

export const tezgahGenerateRequestSchema = z.discriminatedUnion("tool", [
  z.strictObject({
    tool: z.literal("ecommerce"),
    productName: shortText,
    category: shortText,
    features: note,
  }),
  z.strictObject({
    tool: z.literal("proposal"),
    jobPost: brief,
    expertise: shortText,
  }),
  z.strictObject({
    tool: z.literal("grant"),
    sector: shortText,
    businessStatus: z.string().trim().min(2).max(200),
    project: brief,
  }),
]);

export type TezgahGenerateRequest = z.infer<typeof tezgahGenerateRequestSchema>;
