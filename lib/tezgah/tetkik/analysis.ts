import { z } from "zod";
import { guardTetkikNarrative } from "@/lib/tezgah/tetkik/narrative";

const scoreSchema = z.number().int().min(0).max(100);

const categorySchema = z.object({
  score: scoreSchema,
  comment: z.string().trim().min(4).max(240),
});

const findingSchema = z.object({
  severity: z.enum(["critical", "warning", "good"]),
  title: z.string().trim().min(2).max(120),
  detail: z.string().trim().min(4).max(500),
  actionFix: z.string().trim().min(4).max(500),
});

const rewriteSchema = z.object({
  current: z.string().trim().min(1).max(300),
  suggested: z.string().trim().min(1).max(300),
  target: z.enum(["h1", "cta"]).optional(),
});

export const tetkikAnalysisCardSchema = z.object({
  detectedBrand: z.string().trim().min(1).max(120),
  overallScore: scoreSchema,
  summary: z.string().trim().min(12).max(600),
  categories: z.object({
    seo: categorySchema,
    copywriting: categorySchema,
    conversion: categorySchema,
    trust: categorySchema,
  }),
  findings: z.array(findingSchema).min(4).max(12),
  copyRewrites: z.array(rewriteSchema).min(2).max(4),
});

export type TetkikAnalysisCard = z.infer<typeof tetkikAnalysisCardSchema>;

export type TetkikCategoryKey = keyof TetkikAnalysisCard["categories"];

export const TETKIK_CATEGORY_LABELS: Record<TetkikCategoryKey, string> = {
  seo: "SEO",
  copywriting: "İkna / Metin",
  conversion: "Dönüşüm",
  trust: "Güven",
};

export const TETKIK_SEVERITY_LABELS = {
  critical: "Kritik",
  warning: "Geliştirilmeli",
  good: "Güçlü",
} as const;

function plain(value: string, max: number): string {
  const clean = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

function stripJsonFence(raw: string): string {
  const trimmed = raw.replace(/^\uFEFF/, "").trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  const body = fenced?.[1];
  return body ? body.trim() : trimmed;
}

/**
 * Hydrogen JSON kartını doğrular. overallScore kod skoruna kilitlenir.
 * Trafik/fiyat iddiası taşıyan bulgu satırları ayıklanır.
 */
export function parseTetkikAnalysisCard(
  raw: string,
  frozenScore: number,
): TetkikAnalysisCard | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(raw));
  } catch {
    return null;
  }
  const result = tetkikAnalysisCardSchema.safeParse(parsed);
  if (!result.success) {
    return null;
  }
  const card = result.data;
  const findings = card.findings.filter((finding) =>
    analysisTextAllowed(`${finding.title} ${finding.detail} ${finding.actionFix}`, frozenScore),
  );
  const rewrites = card.copyRewrites.filter((row) =>
    analysisTextAllowed(`${row.current} ${row.suggested}`, frozenScore),
  );
  if (findings.length < 4 || rewrites.length < 2) {
    return null;
  }
  const summary = plain(guardTetkikNarrative(card.summary, frozenScore) || card.summary, 600);
  if (summary.length < 12) {
    return null;
  }
  return {
    ...card,
    detectedBrand: plain(card.detectedBrand, 120),
    overallScore: frozenScore,
    summary,
    findings: findings.slice(0, 12).map((finding) => ({
      ...finding,
      title: plain(finding.title, 120),
      detail: plain(finding.detail, 500),
      actionFix: plain(finding.actionFix, 500),
    })),
    copyRewrites: rewrites.slice(0, 4).map((row) => ({
      ...row,
      current: plain(row.current, 300),
      suggested: plain(row.suggested, 300),
    })),
    categories: {
      seo: { score: card.categories.seo.score, comment: plain(card.categories.seo.comment, 240) },
      copywriting: {
        score: card.categories.copywriting.score,
        comment: plain(card.categories.copywriting.comment, 240),
      },
      conversion: {
        score: card.categories.conversion.score,
        comment: plain(card.categories.conversion.comment, 240),
      },
      trust: { score: card.categories.trust.score, comment: plain(card.categories.trust.comment, 240) },
    },
  };
}

function analysisTextAllowed(text: string, frozenScore?: number): boolean {
  if (/\d+\s*(müşteri|ziyaretçi)/i.test(text) || /\bayda\s+\d+/i.test(text)) {
    return false;
  }
  if (/₺|\bfiyat\b|\btutar\b|\b\d[\d.\s]*\s*tl\b/i.test(text)) {
    return false;
  }
  if (typeof frozenScore === "number") {
    const slash = /\b(\d{1,3})\s*\/\s*100\b/.exec(text);
    if (slash && Number(slash[1]) !== frozenScore) {
      return false;
    }
  }
  return true;
}

export function scoreTone(score: number): "good" | "warn" | "bad" {
  if (score >= 70) {
    return "good";
  }
  if (score >= 40) {
    return "warn";
  }
  return "bad";
}
