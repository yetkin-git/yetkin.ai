import { GRANT_SCHEDULE_STEPS } from "@/lib/yetkinhibe/grant-investment-skeleton";
import {
  GRANT_DOSSIER_BUDGET_NOTE,
  GRANT_DOSSIER_DISCLAIMER,
  GRANT_DOSSIER_SCHEDULE_NOTE,
} from "@/lib/yetkinhibe/grant-project-notes";
import { GRANT_DETAIL_BUDGET_LINES, GRANT_DETAIL_DURATIONS } from "@/lib/tezgah/grant/details-input";
import type { GrantDossier } from "@/lib/tezgah/grant/types";

function contiguousWindows(duration: number, labels: readonly string[]): boolean {
  let cursor = 1;
  for (const label of labels) {
    const match = /^(\d{1,2})-(\d{1,2})$/.exec(label);
    if (!match) {
      return false;
    }
    const start = Number(match[1]);
    const end = Number(match[2]);
    if (start !== cursor || end < start) {
      return false;
    }
    cursor = end + 1;
  }
  return cursor - 1 === duration;
}

/** İstemcinin kabul ettiği tam dosya. Çağrı kodu ve katalog tavanı alanı yoktur. */
export function isGrantDossierPayload(value: unknown): value is GrantDossier {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as Partial<GrantDossier> & Record<string, unknown>;
  if (
    "grantId" in row ||
    "callCode" in row ||
    "poolAmountMinor" in row ||
    "supportRatioBps" in row ||
    "amountMinor" in row
  ) {
    return false;
  }
  const duration = row.durationMonths;
  if (duration !== 12 && duration !== 18 && duration !== 24) {
    return false;
  }
  if (!(GRANT_DETAIL_DURATIONS as readonly number[]).includes(duration)) {
    return false;
  }
  if (
    row.disclaimer !== GRANT_DOSSIER_DISCLAIMER ||
    row.durationNote !== GRANT_DOSSIER_SCHEDULE_NOTE ||
    row.budgetNote !== GRANT_DOSSIER_BUDGET_NOTE ||
    typeof row.summary !== "string" ||
    row.summary.length < 12 ||
    typeof row.budgetRationale !== "string" ||
    row.budgetRationale.length < 12 ||
    typeof row.competencyNote !== "string" ||
    row.competencyNote.length < 12 ||
    typeof row.commercialization !== "string" ||
    row.commercialization.length < 12 ||
    typeof row.outputGoal !== "string" ||
    row.outputGoal.length < 12 ||
    typeof row.targetTitle !== "string" ||
    row.targetTitle.length < 2 ||
    typeof row.targetSourceLabel !== "string" ||
    row.targetSourceLabel.length < 2 ||
    typeof row.targetInfoUrl !== "string" ||
    !row.targetInfoUrl.startsWith("https://") ||
    typeof row.budgetTotalLabel !== "string" ||
    !row.budgetTotalLabel.includes("₺") ||
    row.budgetTotalLabel.includes("%") ||
    typeof row.teamHeadcount !== "number" ||
    !Number.isInteger(row.teamHeadcount) ||
    row.teamHeadcount < 1 ||
    row.teamHeadcount > 5_000 ||
    !Array.isArray(row.criterionLabels) ||
    row.criterionLabels.length < 1 ||
    !row.criterionLabels.every((label) => typeof label === "string" && label.length >= 2 && label.length <= 120) ||
    !Array.isArray(row.workPackages) ||
    row.workPackages.length !== GRANT_SCHEDULE_STEPS.length ||
    !Array.isArray(row.budgetRows) ||
    row.budgetRows.length !== GRANT_DETAIL_BUDGET_LINES.length ||
    !Array.isArray(row.teamRows) ||
    row.teamRows.length < 2 ||
    row.teamRows.length > 9
  ) {
    return false;
  }
  const windows = row.workPackages.map((item, index) => {
    const step = GRANT_SCHEDULE_STEPS[index];
    if (!item || !step || item.id !== step.id || item.name !== step.name || typeof item.windowLabel !== "string") {
      return null;
    }
    return item.windowLabel;
  });
  if (windows.some((label) => label === null) || !contiguousWindows(duration, windows as string[])) {
    return false;
  }
  const budgetsOk = row.budgetRows.every((item, index) => {
    const expected = GRANT_DETAIL_BUDGET_LINES[index];
    return (
      !!item &&
      !!expected &&
      item.category === expected.category &&
      item.label === expected.label &&
      typeof item.amountLabel === "string" &&
      item.amountLabel.includes("₺") &&
      !item.amountLabel.includes("%") &&
      !("amountMinor" in item) &&
      !("poolAmountMinor" in item)
    );
  });
  if (!budgetsOk) {
    return false;
  }
  return row.teamRows.every(
    (item) =>
      !!item &&
      typeof item.area === "string" &&
      item.area.length >= 2 &&
      item.area.length <= 160 &&
      typeof item.note === "string" &&
      item.note.length >= 2 &&
      item.note.length <= 800 &&
      (item.headcountLabel === null ||
        (typeof item.headcountLabel === "string" && /^\d{1,4}$/.test(item.headcountLabel))),
  );
}
