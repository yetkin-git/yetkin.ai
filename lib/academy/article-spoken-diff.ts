/**
 * Compact makale kaset şeridi ↔ konuşma metni hizası.
 * El kitabı, canlı kutu ve ## başlıkları kaset dışıdır; konuşma metni o şeridi izler.
 * Karaoke / timings mühürlü kaseti izlemeye devam eder; bu katman stüdyo metnini kilitler.
 */

import { collapseAcademyLessonProse } from "@/lib/academy/lesson-body";

const EL_KITABI_HEADING = /^##\s+El kitabı/mu;

/** P0 vatandaş lisanı — konuşma metni (ekran) bu kalıpları taşımaz. */
export const ACADEMY_ARTICLE_SPOKEN_FORBIDDEN = [
  /\bscore\b/iu,
  /prompt terminali/iu,
  /özel API/iu,
  /Şirket API/iu,
] as const;

/** İlk 30 saniye / ilk paragraf — TESPES-01 T5. */
export const ACADEMY_CASSETTE_GAIN_SENTENCE = /Bu dersin sonunda .+ tek başına/u;

/** Hedefli P1 kaset hizası (P0 jargon + kapanış). */
export const ACADEMY_ARTICLE_SPOKEN_TARGET_KEYS = [
  "01_office_ai-1",
  "01_office_ai-k1",
  "01_office_ai-2",
  "01_office_ai-3",
  "01_office_ai-5",
  "01_office_ai-g1",
  "01_office_ai-w1",
  "01_office_ai-6",
] as const;

export const ACADEMY_ARTICLE_SPOKEN_JACCARD_MIN = 0.7;
export const ACADEMY_ARTICLE_SPOKEN_TARGET_JACCARD_MIN = 0.86;

export function academyCassetteTrackSource(articleMarkdown: string): string {
  const withoutComments = normalizeAcademyNewlines(articleMarkdown).replace(/<!--[\s\S]*?-->/gu, "\n\n");
  const cut = withoutComments.search(EL_KITABI_HEADING);
  return (cut >= 0 ? withoutComments.slice(0, cut) : withoutComments).trim();
}

function normalizeAcademyNewlines(text: string): string {
  return text.replace(/\r\n/gu, "\n").replace(/\r/gu, "\n");
}

function stripMarkdownInline(text: string): string {
  return collapseAcademyLessonProse(
    text
      .replace(/\*\*([^*]+)\*\*/gu, "$1")
      .replace(/\*([^*]+)\*/gu, "$1")
      .replace(/`([^`]+)`/gu, "$1"),
  );
}

export function academyCassetteTrackParagraphs(articleMarkdown: string): readonly string[] {
  return normalizeAcademyNewlines(academyCassetteTrackSource(articleMarkdown))
    .replace(/^#{1,6}\s+.*$/gmu, "")
    .split(/\n\n+/u)
    .map((part) => stripMarkdownInline(part))
    .filter((part) => part.length > 0);
}

export function academySpokenScriptDisplayParagraphs(rawMarkdown: string): readonly string[] {
  return normalizeAcademyNewlines(rawMarkdown)
    .replace(/<!--[\s\S]*?-->/gu, "\n\n")
    .replace(/^#{1,6}\s+.*$/gmu, "")
    .split(/\n\n+/u)
    .map((part) => stripMarkdownInline(part))
    .filter((part) => part.length > 0);
}

function tokenizeAcademyProse(text: string): readonly string[] {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/u)
    .filter((token) => token.length > 1);
}

export function academyProseJaccard(left: string, right: string): number {
  const a = new Set(tokenizeAcademyProse(left));
  const b = new Set(tokenizeAcademyProse(right));
  if (a.size === 0 && b.size === 0) {
    return 1;
  }
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

export type AcademyArticleSpokenDiff = {
  lessonKey: string;
  articleParagraphs: number;
  spokenParagraphs: number;
  jaccard: number;
  jargonHits: readonly string[];
  missingGainInArticle: boolean;
  missingGainInSpoken: boolean;
};

export function diffAcademyArticleSpoken(input: {
  lessonKey: string;
  articleMarkdown: string;
  spokenMarkdown: string;
}): AcademyArticleSpokenDiff {
  const articleParas = academyCassetteTrackParagraphs(input.articleMarkdown);
  const spokenParas = academySpokenScriptDisplayParagraphs(input.spokenMarkdown);
  const articleProse = articleParas.join(" ");
  const spokenProse = spokenParas.join(" ");
  const jargonHits = ACADEMY_ARTICLE_SPOKEN_FORBIDDEN.filter((pattern) => pattern.test(spokenProse)).map(
    (pattern) => String(pattern),
  );
  return {
    lessonKey: input.lessonKey,
    articleParagraphs: articleParas.length,
    spokenParagraphs: spokenParas.length,
    jaccard: academyProseJaccard(articleProse, spokenProse),
    jargonHits,
    missingGainInArticle: !ACADEMY_CASSETTE_GAIN_SENTENCE.test(articleParas[0] ?? ""),
    missingGainInSpoken: !ACADEMY_CASSETTE_GAIN_SENTENCE.test(spokenParas[0] ?? ""),
  };
}

export function academyArticleSpokenJaccardFloor(lessonKey: string): number {
  if ((ACADEMY_ARTICLE_SPOKEN_TARGET_KEYS as readonly string[]).includes(lessonKey.trim())) {
    return ACADEMY_ARTICLE_SPOKEN_TARGET_JACCARD_MIN;
  }
  return ACADEMY_ARTICLE_SPOKEN_JACCARD_MIN;
}
