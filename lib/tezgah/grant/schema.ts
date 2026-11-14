import { z } from "zod";
import {
  GRANT_AUDIENCES,
  GRANT_INVESTMENT_FOCI,
  GRANT_NACE_GROUPS,
  GRANT_PROVINCES,
  GRANT_RD_LEVELS,
} from "@/lib/yetkinhibe/grant-brief-axes";

const shortText = z.string().trim().min(2).max(80);
const projectText = z.string().trim().min(2).max(1500);

function enumIds<T extends string>(ids: readonly T[]): [T, ...T[]] {
  const [first, ...rest] = ids;
  if (!first) {
    throw new Error("Hibe listesi boş.");
  }
  return [first, ...rest];
}

function countText(maxDigits: number, max: number) {
  return z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{1,${maxDigits}}$`))
    .refine((value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 0 && parsed <= max;
    });
}

export const grantGenerateRequestSchema = z.strictObject({
  businessName: shortText,
  freelancerName: shortText,
  provinceCode: z.enum(enumIds(GRANT_PROVINCES.map((row) => row.code))),
  audience: z.enum(enumIds(GRANT_AUDIENCES.map((row) => row.id))),
  naceGroup: z.enum(enumIds(GRANT_NACE_GROUPS.map((row) => row.id))),
  investmentFocus: z.enum(enumIds(GRANT_INVESTMENT_FOCI.map((row) => row.id))),
  employeeCount: countText(6, 100_000),
  companyAgeYears: countText(3, 150),
  rdMaturityLevel: z.enum(enumIds(GRANT_RD_LEVELS.map((row) => row.id))),
  exportActive: z.enum(["evet", "hayir"]),
  patent: z.enum(["evet", "hayir"]),
  project: projectText,
  scheduleWindows: z.string().trim().min(2).max(500).optional(),
  investmentAmounts: z.string().trim().min(2).max(400).optional(),
});

export type GrantGenerateRequest = z.infer<typeof grantGenerateRequestSchema>;
