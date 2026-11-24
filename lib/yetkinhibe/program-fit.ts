import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import { isGrantVerificationFresh, isMatchableGrantCall } from "@/lib/yetkinhibe/grant-catalog-core";
import {
  grantBriefCriteria,
  matchGrantProgramsForBrief,
  type GrantBriefCall,
  type GrantProgramBrief,
} from "@/lib/yetkinhibe/match-grant-programs-for-brief";
import {
  GRANT_CLOSED_WINDOW_NOTE,
  GRANT_UNVERIFIED_NOTE,
  GRANT_UPCOMING_WINDOW_NOTE,
} from "@/lib/yetkinhibe/grant-project-notes";

/**
 * Kriter uyumu. Resmî onay oranı değildir.
 * Uygun sayılan satır, `matchGrantProgramsForBrief` ile aynı kapıdan geçer.
 */

export type GrantProgramFit = {
  grantId: string;
  title: string;
  sourceLabel: string;
  officialInfoUrl: string | null;
  fitPct: number | null;
  /** Kısıtlı kriter yoksa dürüst etiket. Yüzde üretilmez. */
  scopeLabel: string | null;
  constrainedCount: number;
  passedConstrained: number;
  /** Kısıtsız kriter yüzdeye eklenmez. */
  unconstrainedCount: number;
  reasons: readonly string[];
  eligible: boolean;
  maxSupportMinor: number | null;
  ceilingLabel: string | null;
};

function text(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function ceilingLabel(amount: number | null): string | null {
  if (amount === null || !Number.isSafeInteger(amount) || amount < 0) {
    return null;
  }
  return formatAmountMinorAsWholeTry(amount);
}

export function rankGrantProgramFits(
  brief: GrantProgramBrief,
  calls: readonly GrantBriefCall[],
  now: Date = new Date(),
): readonly GrantProgramFit[] {
  const matched = matchGrantProgramsForBrief(brief, calls, now);
  const eligibleIds = new Set(matched.eligible.map((row) => row.grantId));
  const rows: GrantProgramFit[] = [];

  for (const call of calls) {
    const id = text(call.id);
    const title = text(call.title);
    const sourceLabel = text(call.sourceLabel);
    if (!id || !title || !sourceLabel || !call.eligibility) {
      continue;
    }
    const criteria = grantBriefCriteria(brief, call.eligibility);
    if (criteria.length === 0) {
      continue;
    }
    const constrained = criteria.filter((row) => !row.unconstrained);
    const passed = constrained.filter((row) => row.passed).length;
    const fitPct = constrained.length === 0 ? null : Math.round((passed / constrained.length) * 100);
    const scopeLabel = constrained.length === 0 ? "Genel kapsam — özel kısıt yok" : null;
    const unconstrainedCount = criteria.length - constrained.length;
    const failed = constrained.filter((row) => !row.passed).map((row) => row.label);
    const reasons = [...failed];
    const open = isMatchableGrantCall(call);
    const verified = isGrantVerificationFresh(text(call.sourceVerifiedAt), now);
    if (!open) {
      reasons.push(call.status === "UPCOMING" ? GRANT_UPCOMING_WINDOW_NOTE : GRANT_CLOSED_WINDOW_NOTE);
    } else if (!verified) {
      reasons.push(GRANT_UNVERIFIED_NOTE);
    }
    const url = text(call.officialInfoUrl);
    const officialInfoUrl = url && url.startsWith("https://") ? url : null;
    const amount =
      Number.isSafeInteger(call.maxSupportMinor) && call.maxSupportMinor >= 0 ? call.maxSupportMinor : null;
    rows.push({
      grantId: id,
      title,
      sourceLabel,
      officialInfoUrl,
      fitPct: fitPct !== null && Number.isInteger(fitPct) ? fitPct : null,
      scopeLabel,
      constrainedCount: constrained.length,
      passedConstrained: passed,
      unconstrainedCount,
      reasons: reasons.length > 0 ? reasons : scopeLabel ? [scopeLabel] : ["Kısıtlı kriterlerin tamamı geçti."],
      eligible: eligibleIds.has(id),
      maxSupportMinor: amount,
      ceilingLabel: ceilingLabel(amount),
    });
  }

  return rows.sort((left, right) => {
    if (left.eligible !== right.eligible) {
      return left.eligible ? -1 : 1;
    }
    return (right.fitPct ?? -1) - (left.fitPct ?? -1) || left.title.localeCompare(right.title, "tr");
  });
}

/** Uygun programlar arasında en yüksek tek tavan. Tutarlar toplanmaz. */
export function highestEligibleCeilingMinor(rows: readonly GrantProgramFit[]): number | null {
  let best: number | null = null;
  for (const row of rows) {
    if (!row.eligible || row.maxSupportMinor === null) {
      continue;
    }
    if (best === null || row.maxSupportMinor > best) {
      best = row.maxSupportMinor;
    }
  }
  return best;
}
