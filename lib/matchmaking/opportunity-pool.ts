import pool from "@/lib/matchmaking/opportunity-pool.json";

export const OPPORTUNITY_AXES = [
  "analytical",
  "practical",
  "communicative",
  "creative",
  "collaborative",
] as const;

export type OpportunityAxis = (typeof OPPORTUNITY_AXES)[number];

export type OpportunityTemplate = {
  slug: string;
  title: string;
  summary: string;
  rewardHint: string;
  durationHint: string;
  primaryAxis: OpportunityAxis;
  secondaryAxes: OpportunityAxis[];
  developmentCategory: string;
};

const AXIS_TOOL = {
  analytical: "tetkik",
  practical: "dukkan",
  communicative: "proposal",
  creative: "reklam",
  collaborative: "proposal",
} as const;

export function opportunityCatalog(): readonly OpportunityTemplate[] {
  return pool.opportunities as OpportunityTemplate[];
}

/** Haftanın fırsatı. Sıra İstanbul gününden türer; model çağrılmaz. */
export function opportunityForInstant(now = new Date(), list = opportunityCatalog()): OpportunityTemplate {
  if (list.length === 0) {
    throw new Error("Fırsat kataloğu boş.");
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const utc = Date.UTC(year, month - 1, day);
  const week = Math.floor(utc / (7 * 24 * 60 * 60 * 1000));
  const index = ((week % list.length) + list.length) % list.length;
  const row = list[index];
  if (!row) {
    throw new Error("Fırsat kataloğu boş.");
  }
  return row;
}

export function opportunityToolKey(row: Pick<OpportunityTemplate, "primaryAxis">): string {
  return AXIS_TOOL[row.primaryAxis];
}

export function opportunityWeekKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const utc = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const week = Math.floor(utc / (7 * 24 * 60 * 60 * 1000));
  return `${year}-W${week}`;
}
