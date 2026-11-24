import type { GrantSpecificationRules } from "@/lib/yetkinhibe/types";

/** Şartname maddesi yokken basılan mühür. İddia cümlesi değildir. */
export const SPEC_SILENCE = "Şartname maddesi yok. Bu başlıkta cümle üretilmedi.";

export type SpecChunk = {
  article: string;
  page: string | null;
  text: string;
};

export type SpecSectionCitation = {
  title: string;
  body: string;
  article: string | null;
};

const HINT_KEYS = ["supportHints", "deadlineHints", "documentHints", "eligibilityHints"] as const;
const HEADING = /^(?:madde|bölüm|bolum)\s+([0-9]+(?:\.[0-9]+)*)\b[.):\s-]*(.*)$/i;
const NUMBERED = /^([0-9]+\.[0-9]+(?:\.[0-9]+)*)\s+(\S.*)$/;
const PAGE = /^(?:sayfa|s\.)\s*(\d{1,4})\b/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function readSpecificationRules(
  value: unknown,
): { ok: true; rules: GrantSpecificationRules | null } | { ok: false } {
  if (value == null) {
    return { ok: true, rules: null };
  }
  if (!isRecord(value)) {
    return { ok: false };
  }
  const hints: Record<(typeof HINT_KEYS)[number], string[]> = {
    supportHints: [],
    deadlineHints: [],
    documentHints: [],
    eligibilityHints: [],
  };
  for (const key of HINT_KEYS) {
    const raw = value[key];
    if (raw == null) {
      continue;
    }
    if (!Array.isArray(raw) || raw.some((item) => typeof item !== "string")) {
      return { ok: false };
    }
    hints[key] = raw
      .map((item) => item.trim().replace(/\s+/g, " ").slice(0, 180))
      .filter((item) => item.length > 0)
      .slice(0, 12);
  }
  if (value.excerpt != null && typeof value.excerpt !== "string") {
    return { ok: false };
  }
  const excerpt = typeof value.excerpt === "string" ? value.excerpt.trim().replace(/\s+/g, " ").slice(0, 400) : "";
  return { ok: true, rules: { ...hints, excerpt } };
}

export function specificationHintNeedles(rules: GrantSpecificationRules | null | undefined): readonly string[] {
  if (!rules) {
    return [];
  }
  return [...rules.supportHints, ...rules.deadlineHints, ...rules.documentHints, ...rules.eligibilityHints, rules.excerpt].filter(
    (row) => row.length > 0,
  );
}

/** Şartnameyi madde ve sayfa parçalarına böler. Numarasız giriş atıf olmaz. */
export function chunkSpecification(raw: string | null | undefined): readonly SpecChunk[] {
  if (!raw) {
    return [];
  }
  const text = raw.replace(/\u0000/g, "").replace(/\r\n/g, "\n").slice(0, 200_000);
  const lines = text.split("\n");
  let page: string | null = null;
  const chunks: { article: string; page: string | null; lines: string[] }[] = [];
  let current: (typeof chunks)[number] | null = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    const pageMatch = PAGE.exec(trimmed);
    if (pageMatch?.[1]) {
      page = pageMatch[1];
      continue;
    }
    const heading = HEADING.exec(trimmed) ?? NUMBERED.exec(trimmed);
    if (heading?.[1]) {
      current = { article: heading[1], page, lines: [] };
      const rest = heading[2]?.trim() ?? "";
      if (rest) {
        current.lines.push(rest);
      }
      chunks.push(current);
      continue;
    }
    if (!current || current.article === "0") {
      continue;
    }
    current.lines.push(trimmed);
  }
  return chunks
    .map((chunk) => ({
      article: chunk.article,
      page: chunk.page,
      text: chunk.lines.join(" ").replace(/\s+/g, " ").trim().slice(0, 600),
    }))
    .filter((chunk) => chunk.article !== "0" && chunk.text.length > 0);
}

function fold(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9çğıöşüı\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreChunk(needles: readonly string[], chunk: SpecChunk): number {
  const hay = fold(`${chunk.text} ${chunk.article}`);
  let score = 0;
  for (const needle of needles) {
    for (const token of fold(needle).split(" ")) {
      if (token.length >= 4 && hay.includes(token)) {
        score += 1;
      }
    }
  }
  return score;
}

export function formatSpecCitation(chunk: SpecChunk): string {
  const page = chunk.page ? `, sayfa ${chunk.page}` : "";
  return `Madde ${chunk.article}${page}: ${chunk.text.slice(0, 180)}`;
}

/** Her başlık en fazla bir maddeye bağlanır. Eşleşme yoksa cümle üretilmez. */
export function citeTemplateSections(
  sections: readonly { id: string; title: string }[],
  specificationText: string | null | undefined,
  hints: readonly string[] = [],
): readonly SpecSectionCitation[] {
  const chunks = chunkSpecification(specificationText);
  const used = new Set<string>();
  return sections.map((section) => {
    const needles = [section.title, section.id.replace(/-/g, " "), ...hints];
    const ranked = chunks
      .map((chunk) => ({ chunk, score: scoreChunk(needles, chunk) }))
      .filter((row) => row.score > 0 && !used.has(row.chunk.article))
      .sort((left, right) => right.score - left.score || left.chunk.article.localeCompare(right.chunk.article, "tr"));
    const hit = ranked[0]?.chunk ?? null;
    if (!hit) {
      return { title: section.title, body: SPEC_SILENCE, article: null };
    }
    used.add(hit.article);
    return { title: section.title, body: formatSpecCitation(hit), article: hit.article };
  });
}
