import { z } from "zod";

const callFields = {
  id: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  sourceKey: z.string().trim().min(2).max(40),
  title: z.string().trim().min(3).max(300),
  summary: z.string().trim().min(3).max(1000),
  poolAmountMinor: z.number().int().nonnegative().nullable(),
  minSupportMinor: z.number().int().nonnegative(),
  maxSupportMinor: z.number().int().nonnegative(),
  supportRatioBps: z.number().int().min(0).max(10_000),
  applicationOpensAt: z.string().datetime(),
  applicationDeadline: z.string().datetime(),
  eligibility: z.record(z.string(), z.unknown()),
  requiredDocuments: z.array(z.string().trim().min(1).max(200)).max(20),
  tags: z.array(z.string().trim().min(1).max(40)).max(20),
  officialInfoUrl: z.string().url().startsWith("https://"),
  publicationUrl: z.string().url().startsWith("https://").nullable().optional(),
  sourceVerifiedAt: z.string().datetime().nullable().optional(),
  specificationText: z.string().trim().max(200_000).nullable().optional(),
  rulesJson: z.record(z.string(), z.unknown()).nullable().optional(),
  isPublished: z.boolean().optional(),
};

export const grantCallWriteSchema = z.object(callFields);

export const grantCallPatchSchema = z.object(callFields).partial().refine((value) => Object.keys(value).length > 0, {
  message: "Boş yama yok.",
});
