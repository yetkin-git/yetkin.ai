import { z } from "zod";

const shortText = z.string().trim().min(2).max(80);
const categoryHint = z.string().trim().max(80);
const note = z.string().trim().min(2).max(800);
const brief = z.string().trim().min(2).max(1500);

export const TEZGAH_PROPOSAL_MODES = ["standard", "b2b", "summary"] as const;
export type TezgahProposalMode = (typeof TEZGAH_PROPOSAL_MODES)[number];

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
    deliveryMode: z.enum(TEZGAH_PROPOSAL_MODES).default("standard"),
  }),
]);

export type TezgahGenerateRequest = z.infer<typeof tezgahGenerateRequestSchema>;
