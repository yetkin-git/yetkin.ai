import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import { isMatchableGrantCall } from "@/lib/yetkinhibe/match-grants-for-profile";
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
  fitPct: number;
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
): readonly GrantProgramFit[] {
  const matched = matchGrantProgramsForBrief(brief, calls);
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
    const passed = criteria.filter((row) => row.passed).length;
    const fitPct = Math.round((passed / criteria.length) * 100);
    const failed = criteria.filter((row) => !row.passed).map((row) => row.label);
    const reasons = [...failed];
    const open = isMatchableGrantCall(call);
    const verified = text(call.sourceVerifiedAt) !== null;
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
      fitPct: Number.isInteger(fitPct) ? fitPct : 0,
      reasons: reasons.length > 0 ? reasons : ["Kriterlerin tamamı geçti."],
      eligible: eligibleIds.has(id),
      maxSupportMinor: amount,
      ceilingLabel: ceilingLabel(amount),
    });
  }

  return rows.sort((left, right) => {
    if (left.eligible !== right.eligible) {
      return left.eligible ? -1 : 1;
    }
    return right.fitPct - left.fitPct || left.title.localeCompare(right.title, "tr");
  });
}

export function sumEligibleCeilingMinor(rows: readonly GrantProgramFit[]): number | null {
  let total = 0;
  for (const row of rows) {
    if (!row.eligible || row.maxSupportMinor === null) {
      continue;
    }
    if (!Number.isSafeInteger(total + row.maxSupportMinor)) {
      return null;
    }
    total += row.maxSupportMinor;
  }
  return total > 0 ? total : null;
}
