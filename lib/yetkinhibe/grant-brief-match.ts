import { z } from "zod";

import type { GrantBriefCriterion, GrantEligibleProgramMatch } from "@/lib/yetkinhibe/match-grant-programs-for-brief";

/** Gövde üst sınırı (bayt, UTF-8). */
export const GRANT_MATCH_MAX_BODY_BYTES = 8_192;

export async function readGrantMatchBodyText(
  request: Request,
  maxBytes: number = GRANT_MATCH_MAX_BODY_BYTES,
): Promise<string | null> {
  if (request.body === null) {
    return "";
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

export const grantBriefMatchRequestSchema = z.strictObject({
  provinceCode: z.string().trim().regex(/^\d{2}$/),
  audience: z.enum(["yeni_girisimci", "mevcut_kobi"]),
  naceGroup: z.string().trim().regex(/^\d{2}$/),
  investmentFocus: z.enum(["makine_techizat", "yazilim_dijital", "arge", "ihracat"]),
  employeeCount: z.number().int().min(0).max(100_000),
  companyAgeYears: z.number().int().min(0).max(150),
  rdMaturityLevel: z.enum(["NONE", "EARLY", "ESTABLISHED", "ADVANCED"]),
  exportActive: z.boolean(),
  hasPatentOrUtilityModel: z.boolean(),
});

export type GrantBriefMatchWire = {
  grantId: string;
  grantTitle: string;
  sourceLabel: string;
  fitPct: number | null;
  scopeLabel: string | null;
  constrainedCount: number;
  passedConstrained: number;
  unconstrainedCount: number;
  remainingDays: number;
  maxSupportMinor: number;
  criteria: readonly GrantBriefCriterion[];
};

export function toGrantBriefMatchWire(match: GrantEligibleProgramMatch): GrantBriefMatchWire {
  const constrained = match.criteria.filter((row) => !row.unconstrained);
  const passed = constrained.filter((row) => row.passed).length;
  return {
    grantId: match.grantId,
    grantTitle: match.title,
    sourceLabel: match.sourceLabel,
    fitPct: constrained.length === 0 ? null : Math.round((passed / constrained.length) * 100),
    scopeLabel: constrained.length === 0 ? "Genel kapsam — özel kısıt yok" : null,
    constrainedCount: constrained.length,
    passedConstrained: passed,
    unconstrainedCount: match.criteria.length - constrained.length,
    remainingDays: match.remainingDays,
    maxSupportMinor: match.maxSupportMinor,
    criteria: match.criteria,
  };
}
