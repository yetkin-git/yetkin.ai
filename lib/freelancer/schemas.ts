import { z } from "zod";
import { FREELANCER_NEED_IDS } from "@/lib/kernel/catalog-ids";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/kernel/pricing/freelancer-job-band";

export { FREELANCER_JOB_MAX_MINOR, FREELANCER_JOB_MIN_MINOR };

export const createJobInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  brief: z.string().trim().min(8).max(4000),
  budgetMinor: z.number().int().min(FREELANCER_JOB_MIN_MINOR).max(FREELANCER_JOB_MAX_MINOR),
  visaPathwayId: z.enum(FREELANCER_NEED_IDS),
});

export const createDirectOfferInputSchema = z.object({
  title: z.string().trim().min(3).max(120),
  brief: z.string().trim().min(8).max(4000),
  budgetMinor: z.number().int().min(FREELANCER_JOB_MIN_MINOR).max(FREELANCER_JOB_MAX_MINOR),
  visaPathwayId: z.enum(FREELANCER_NEED_IDS),
  inviteeId: z.string().trim().min(1),
  dueDays: z.number().int().min(1).max(90),
});

export const submitBidInputSchema = z.object({
  amountMinor: z.number().int().min(FREELANCER_JOB_MIN_MINOR).max(FREELANCER_JOB_MAX_MINOR),
  coverNote: z.string().trim().min(4).max(2000),
});

export const acceptBidInputSchema = z.object({
  bidId: z.string().trim().min(1),
});

/** Accept uses job id from URL; body is optional/empty. */
export const acceptDirectOfferInputSchema = z.object({}).passthrough();

export const contractMessageKindSchema = z.enum(["TEXT", "DELIVERY", "REVISION"]);

export const postContractMessageInputSchema = z.object({
  kind: contractMessageKindSchema.default("TEXT"),
  body: z.string().trim().min(1).max(8000),
  artifactUrl: z.string().trim().max(2000).optional(),
});

export const disputeActionSchema = z.enum([
  "open",
  "rebut",
  "adjudicate",
  "approve",
  "reject",
  "human-settle",
]);

export const disputeRequestSchema = z.object({
  action: disputeActionSchema,
  contractId: z.string().trim().min(1),
  disputeId: z.string().trim().min(1).optional(),
  partyAClaim: z.string().trim().min(8).max(8000).optional(),
  partyBRebuttal: z.string().trim().min(8).max(8000).optional(),
  employerRefundBps: z.number().int().min(0).max(10_000).optional(),
});

export const squadMemberInputSchema = z.object({
  userId: z.string().trim().min(1),
  shareBps: z.number().int().min(0).max(10_000),
});

export const upsertSquadInputSchema = z.object({
  contractId: z.string().trim().min(1),
  members: z.array(squadMemberInputSchema).min(1).max(12),
});

export const SETTLEMENT_ONLY = SETTLEMENT_CURRENCY;
