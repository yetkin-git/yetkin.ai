import { z } from "zod";

const shortText = z.string().trim().min(2).max(80);
const categoryHint = z.string().trim().max(80);
const note = z.string().trim().min(2).max(800);
const brief = z.string().trim().min(2).max(1500);

export const tezgahGenerateRequestSchema = z.discriminatedUnion("tool", [
  z.strictObject({
    tool: z.literal("ecommerce"),
    productName: shortText,
    category: categoryHint,
    features: note,
  }),
  z.strictObject({
    tool: z.literal("proposal"),
    jobPost: brief,
    expertise: shortText,
  }),
]);

export type TezgahGenerateRequest = z.infer<typeof tezgahGenerateRequestSchema>;
