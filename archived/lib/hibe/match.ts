import type { GrantMatchQuery, GrantMatchResult, GrantProgramRecord } from "@/lib/hibe/types";

function normalizeTag(value: string): string {
  return value.trim().toLocaleLowerCase("tr-TR");
}

function uniqueTags(values: readonly string[]): string[] {
  return [...new Set(values.map(normalizeTag).filter((tag) => tag.length > 0))];
}

function textHaystack(program: GrantProgramRecord): string {
  return `${program.title} ${program.summary} ${program.agency} ${program.slug}`.toLocaleLowerCase("tr-TR");
}

/**
 * Deterministik eşleştirme. LLM yok. Scraper/canlı devlet API iddiası yok.
 */
export function matchGrantPrograms(
  programs: readonly GrantProgramRecord[],
  query: GrantMatchQuery,
): GrantMatchResult[] {
  const jurisdiction = query.jurisdiction.trim().toUpperCase();
  const wantedTags = uniqueTags(query.sectorTags);
  const needle = query.query?.trim().toLocaleLowerCase("tr-TR") ?? "";

  const results: GrantMatchResult[] = [];
  for (const program of programs) {
    if (!program.isPublished) {
      continue;
    }
    if (program.jurisdiction.toUpperCase() !== jurisdiction) {
      continue;
    }
    if (program.applicantKind !== "BOTH" && program.applicantKind !== query.applicantKind) {
      continue;
    }
    if (program.requiresTaxId && !query.hasTaxId && query.applicantKind === "CORPORATE") {
      continue;
    }
    if (query.agency && program.agency !== query.agency) {
      continue;
    }

    const programTags = uniqueTags(program.sectorTags);
    const matchedTags = wantedTags.filter((tag) => programTags.includes(tag));
    const haystack = textHaystack(program);
    const textHit = needle.length > 0 && haystack.includes(needle);

    if (needle.length > 0 && !textHit && matchedTags.length === 0) {
      continue;
    }

    let score = 10;
    score += matchedTags.length * 5;
    if (textHit) {
      score += 3;
    }
    if (program.applicantKind === query.applicantKind) {
      score += 2;
    }

    results.push({ ...program, score, matchedTags });
  }

  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.title.localeCompare(b.title, "tr");
  });
}

export const DEFAULT_GRANT_MATCH_QUERY: GrantMatchQuery = {
  jurisdiction: "TR",
  applicantKind: "INDIVIDUAL",
  hasTaxId: false,
  sectorTags: [],
};
