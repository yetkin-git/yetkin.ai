import {
  grantBriefCriteria,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import type { GrantCallWithMeta } from "@/lib/yetkinhibe/types";

/** Vitrin ön izlemesi — kısıtlı kriterlerin geçiş oranı. Kısıtsız kriter skoru şişirmez. */
const PREVIEW_BRIEF: GrantProgramBrief = {
  provinceCode: "06",
  audience: "mevcut_kobi",
  naceGroup: "28",
  investmentFocus: "makine_techizat",
  employeeCount: 25,
  companyAgeYears: 3,
  rdMaturityLevel: "EARLY",
  exportActive: false,
  hasPatentOrUtilityModel: false,
};

export function buildPreviewMatchScoresByGrantId(
  calls: readonly GrantCallWithMeta[],
): Readonly<Record<string, number>> {
  const scores: Record<string, number> = {};
  for (const call of calls) {
    const criteria = grantBriefCriteria(PREVIEW_BRIEF, call.eligibility);
    const constrained = criteria.filter((row) => !row.unconstrained);
    if (constrained.length === 0) {
      scores[call.id] = 0;
      continue;
    }
    const passed = constrained.filter((row) => row.passed).length;
    scores[call.id] = Math.round((passed / constrained.length) * 100);
  }
  return scores;
}
