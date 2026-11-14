import { z } from "zod";

const section = z.string().trim().min(12).max(1200);

const narrativeSchema = z.object({
  purpose: section,
  market: section,
  risk: section,
});

const BANNED =
  /₺|\b(?:tl|try|usd|eur)\b|%|\b(?:onay|destek|uygunluk)\s+oran\w*|\bpazar\s+pay\w*|\b(?:milyon|milyar)\b|\d{4,}|resm[iî]\s+onay|hibe\s+tutar/iu;

export type GrantNarrative = {
  purpose: string;
  market: string;
  risk: string;
};

function extractJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/u, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) {
    return null;
  }
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as unknown;
  } catch {
    return null;
  }
}

function cleanSection(value: string): string | null {
  const cleaned = value
    .replace(/\u0000/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !BANNED.test(line))
    .join("\n")
    .trim();
  if (cleaned.length < 12 || cleaned.length > 1200) {
    return null;
  }
  return cleaned;
}

export function readGrantNarrative(text: string): GrantNarrative | null {
  const parsed = narrativeSchema.safeParse(extractJson(text));
  if (!parsed.success) {
    return null;
  }
  const purpose = cleanSection(parsed.data.purpose);
  const market = cleanSection(parsed.data.market);
  const risk = cleanSection(parsed.data.risk);
  if (!purpose || !market || !risk) {
    return null;
  }
  return { purpose, market, risk };
}
