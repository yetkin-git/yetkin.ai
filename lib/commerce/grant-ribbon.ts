/**
 * E-ticaret hibe şeridi. Doğrulanmamış satır şeride girmez.
 */

import { isGrantVerificationFresh, isMatchableGrantCall } from "@/lib/yetkinhibe/grant-catalog-core";
import type { GrantCallStatus } from "@/lib/yetkinhibe/types";

export type CommerceGrantRibbonInput = {
  title: string;
  sourceLabel: string;
  remainingDays: number;
  status: GrantCallStatus;
  sourceVerifiedAt: string | null;
};

export type CommerceGrantRibbonLine = {
  title: string;
  source: string;
  remainingDays: number;
  statusLabel: string;
};

export function selectVerifiedGrantRibbon(
  rows: readonly CommerceGrantRibbonInput[],
  now: Date,
  limit = 3,
): CommerceGrantRibbonLine[] {
  const lines: CommerceGrantRibbonLine[] = [];
  for (const row of rows) {
    if (row.sourceVerifiedAt == null) {
      continue;
    }
    if (!isMatchableGrantCall(row) || !isGrantVerificationFresh(row.sourceVerifiedAt, now)) {
      continue;
    }
    lines.push({
      title: row.title,
      source: row.sourceLabel,
      remainingDays: row.remainingDays,
      statusLabel: row.status === "CLOSING_SOON" ? "Son günler" : "Açık",
    });
    if (lines.length === limit) {
      break;
    }
  }
  return lines;
}
