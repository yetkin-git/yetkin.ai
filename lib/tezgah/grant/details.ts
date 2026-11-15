import { toAmountMinor, type AmountMinor } from "@/lib/kernel/money/amount-minor";
import { GRANT_SCHEDULE_STEPS } from "@/lib/yetkinhibe/grant-investment-skeleton";
import {
  GRANT_DETAIL_BUDGET_LINES,
  type GrantDetailDuration,
  type GrantDetailsInput,
} from "@/lib/tezgah/grant/details-input";
import type { GrantDossierTeamRow, GrantDossierWorkPackage } from "@/lib/tezgah/grant/types";

const MAX_LIRA = 1_000_000_000;
const COUNT_LINE = /^(.{2,80}?)\s+(\d{1,4})$/;

const WINDOWS: Record<GrantDetailDuration, readonly [string, string, string, string]> = {
  12: ["1-2", "3-8", "9-11", "12-12"],
  18: ["1-3", "4-12", "13-16", "17-18"],
  24: ["1-4", "5-16", "17-22", "23-24"],
};

export const GRANT_DETAILS_BUDGET_MISMATCH = "Kalemler toplam bütçeyle aynı olmalı.";
export const GRANT_DETAILS_BUDGET_EMPTY = "Toplam bütçe sıfırdan büyük olmalı.";
export const GRANT_DETAILS_AMOUNT_RANGE = "Tutar sınırı aşıldı.";
export const GRANT_DETAILS_TEAM_UNREADABLE = "Ekip özeti okunamadı.";
export const GRANT_DETAILS_TEAM_OVER = "Uzmanlık satırlarındaki kişi sayısı ekip toplamını aşıyor.";
export const GRANT_DETAILS_OUTPUT_SHORT = "Çıktı ifadesi kısa.";

export type GrantDossierPlan = {
  targetGrantId: string;
  durationMonths: GrantDetailDuration;
  workPackages: readonly GrantDossierWorkPackage[];
  budgetRows: readonly { category: GrantDossierTeamBudget; label: string; amountMinor: AmountMinor }[];
  totalMinor: AmountMinor;
  teamHeadcount: number;
  teamRows: readonly GrantDossierTeamRow[];
  expertiseText: string;
  outputGoal: string;
};

type GrantDossierTeamBudget = (typeof GRANT_DETAIL_BUDGET_LINES)[number]["category"];

export type GrantDossierRead =
  | { ok: true; plan: GrantDossierPlan }
  | { ok: false; error: string };

export function grantDetailWorkPackages(duration: GrantDetailDuration): readonly GrantDossierWorkPackage[] {
  const windows = WINDOWS[duration];
  return GRANT_SCHEDULE_STEPS.map((step, index) => {
    const windowLabel = windows[index];
    if (!windowLabel) {
      throw new Error("Hibe süre bölmesi eksik.");
    }
    return {
      id: step.id,
      name: step.name,
      windowLabel,
    };
  });
}

function cleanPiece(value: string): string {
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, " ").replace(/[ \t]+/g, " ").trim();
}

function cleanParagraph(value: string, max: number): string | null {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length < 12 || clean.length > max) {
    return null;
  }
  return clean;
}

function readLira(value: string): number | null {
  if (!/^\d{1,10}$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function readTeamRows(
  headcount: number,
  expertise: string,
): { ok: true; rows: GrantDossierTeamRow[]; text: string } | { ok: false; error: string } {
  const lines = expertise
    .split(/\r?\n/)
    .map((line) => cleanPiece(line))
    .filter((line) => line.length > 0);
  if (lines.length === 0 || lines.length > 8) {
    return { ok: false, error: GRANT_DETAILS_TEAM_UNREADABLE };
  }
  const rows: GrantDossierTeamRow[] = [
    {
      area: "Proje ekibi",
      headcountLabel: String(headcount),
      note: "Başvuru sahibinin girdiği toplam",
    },
  ];
  if (lines.length === 1 && !COUNT_LINE.test(lines[0] ?? "")) {
    const paragraph = lines[0] ?? "";
    if (paragraph.length < 12 || paragraph.length > 800) {
      return { ok: false, error: GRANT_DETAILS_TEAM_UNREADABLE };
    }
    rows.push({ area: "Uzmanlık özeti", headcountLabel: null, note: paragraph });
    return { ok: true, rows, text: paragraph };
  }
  let explicit = 0;
  for (const line of lines) {
    if (line.length > 160) {
      return { ok: false, error: GRANT_DETAILS_TEAM_UNREADABLE };
    }
    const match = COUNT_LINE.exec(line);
    if (match) {
      const area = match[1]?.trim() ?? "";
      const count = Number(match[2]);
      if (area.length < 2 || !Number.isInteger(count) || count < 1) {
        return { ok: false, error: GRANT_DETAILS_TEAM_UNREADABLE };
      }
      explicit += count;
      rows.push({ area, headcountLabel: String(count), note: "Girilen uzmanlık" });
      continue;
    }
    if (line.length < 2) {
      return { ok: false, error: GRANT_DETAILS_TEAM_UNREADABLE };
    }
    rows.push({ area: line, headcountLabel: null, note: "Girilen uzmanlık" });
  }
  if (explicit > headcount) {
    return { ok: false, error: GRANT_DETAILS_TEAM_OVER };
  }
  return { ok: true, rows, text: lines.join(" | ") };
}

/**
 * Kuruma özel ayrıntı. Tutarlar toplanır; eksik kalem uydurulmaz.
 * Seçilen programın uygunluğu burada bilinmez.
 */
export function readGrantDossierPlan(input: GrantDetailsInput): GrantDossierRead {
  const amounts = GRANT_DETAIL_BUDGET_LINES.map((line) => readLira(input[line.field]));
  const total = readLira(input.totalBudgetLira);
  if (amounts.some((amount) => amount === null) || total === null) {
    return { ok: false, error: GRANT_DETAILS_AMOUNT_RANGE };
  }
  const lines = amounts as number[];
  const totalLira = total;
  if (lines.some((amount) => amount > MAX_LIRA) || totalLira > MAX_LIRA) {
    return { ok: false, error: GRANT_DETAILS_AMOUNT_RANGE };
  }
  const sum = lines.reduce((acc, amount) => acc + amount, 0);
  if (!Number.isSafeInteger(sum)) {
    return { ok: false, error: GRANT_DETAILS_AMOUNT_RANGE };
  }
  if (totalLira < 1) {
    return { ok: false, error: GRANT_DETAILS_BUDGET_EMPTY };
  }
  if (sum !== totalLira) {
    return { ok: false, error: GRANT_DETAILS_BUDGET_MISMATCH };
  }
  const headcount = Number(input.teamHeadcount);
  if (!Number.isInteger(headcount) || headcount < 1 || headcount > 5_000) {
    return { ok: false, error: GRANT_DETAILS_TEAM_UNREADABLE };
  }
  const team = readTeamRows(headcount, input.teamExpertise);
  if (!team.ok) {
    return team;
  }
  const outputGoal = cleanParagraph(input.outputGoal, 800);
  if (!outputGoal) {
    return { ok: false, error: GRANT_DETAILS_OUTPUT_SHORT };
  }
  const budgetRows = GRANT_DETAIL_BUDGET_LINES.map((line, index) => ({
    category: line.category,
    label: line.label,
    amountMinor: toAmountMinor((lines[index] ?? 0) * 100),
  }));
  return {
    ok: true,
    plan: {
      targetGrantId: input.targetGrantId.trim(),
      durationMonths: input.durationMonths,
      workPackages: grantDetailWorkPackages(input.durationMonths),
      budgetRows,
      totalMinor: toAmountMinor(totalLira * 100),
      teamHeadcount: headcount,
      teamRows: team.rows,
      expertiseText: team.text,
      outputGoal,
    },
  };
}
