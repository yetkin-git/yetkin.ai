import type { AmountMinor } from "@/lib/kernel/money/amount-minor";
import { formatAmountMinorAsWholeTry } from "@/lib/yetkinhibe/format-amount";
import { isMatchableGrantCall } from "@/lib/yetkinhibe/grant-catalog-core";
import { buildPreviewMatchScoresByGrantId } from "@/lib/yetkinhibe/preview-match-score";
import type { GrantCallWithMeta } from "@/lib/yetkinhibe/types";

/**
 * Vitrin ön izlemesi — fikir metninden en uygun hibe programını simüle eder.
 * Kural tabanlı önizleme motoru (AI yok). Katalog parametre olarak gelir.
 */

export type PreviewIdeaValidationResult = {
  grantId: string;
  programLabel: string;
  matchScorePct: number;
  estimatedSupportLabel: string;
};

const MIN_IDEA_LENGTH = 12;

/** Katalog kimlikleri — F2 kataloğu ile sözleşme. */
const TUBITAK_1501_GRANT_ID = "tubitak-1501-sanayi-arge";
const KOSGEB_ARGE_GRANT_ID = "kosgeb-arge-inovasyon-2026";

const SHORT_PROGRAM_LABELS: Readonly<Record<string, string>> = {
  "tubitak-1501-sanayi-arge": "TÜBİTAK 1501",
  "kosgeb-arge-inovasyon-2026": "KOSGEB Ar-Ge ve İnovasyon",
  "kosgeb-kobigel-2026": "KOSGEB KOBİGEL",
  "ticaret-bakanligi-turquality-2026": "Ticaret Bakanlığı Turquality",
  "kalkinma-ajansi-mali-destek-2026": "Kalkınma Ajansı Bölgesel Destek",
};

const IDEA_KEYWORD_BOOSTS: Readonly<Record<string, readonly string[]>> = {
  "tubitak-1501-sanayi-arge": [
    "yapay zeka",
    "ai",
    "ar-ge",
    "arge",
    "teknoloji",
    "inovasyon",
    "otomasyon",
    "yazılım",
    "prototip",
    "algoritma",
    "makine öğren",
    "sensör",
    "iot",
  ],
  "kosgeb-arge-inovasyon-2026": [
    "inovasyon",
    "kobi",
    "üretim",
    "süreç",
    "endüstriyel",
    "imalat",
    "fabrika",
  ],
  "kosgeb-kobigel-2026": [
    "dijital",
    "dijitalleş",
    "yeşil",
    "kobi",
    "dönüşüm",
    "verimlilik",
  ],
  "ticaret-bakanligi-turquality-2026": [
    "ihracat",
    "marka",
    "pazara",
    "turquality",
    "global",
  ],
  "kalkinma-ajansi-mali-destek-2026": [
    "tarım",
    "tarımsal",
    "sulama",
    "bölgesel",
    "istihdam",
    "turizm",
    "kırsal",
  ],
};

function normalizeIdeaText(raw: string): string {
  return raw
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function keywordBoostForGrant(normalizedIdea: string, grantId: string): number {
  const keywords = IDEA_KEYWORD_BOOSTS[grantId];
  if (!keywords) return 0;
  let hits = 0;
  for (const keyword of keywords) {
    const normalizedKeyword = normalizeIdeaText(keyword);
    if (normalizedIdea.includes(normalizedKeyword)) {
      hits += 1;
    }
  }
  return Math.min(hits * 6, 24);
}

function shortProgramLabel(call: GrantCallWithMeta): string {
  return SHORT_PROGRAM_LABELS[call.id] ?? call.sourceLabel;
}

function buildProgramLabel(
  primary: GrantCallWithMeta,
  secondary: GrantCallWithMeta | null,
  primaryScore: number,
  secondaryScore: number,
): string {
  const primaryLabel = shortProgramLabel(primary);
  if (!secondary) return primaryLabel;
  const gap = primaryScore - secondaryScore;
  if (gap <= 8) {
    return `${primaryLabel} / ${shortProgramLabel(secondary)}`;
  }
  return primaryLabel;
}

function scoreForCall(
  call: GrantCallWithMeta,
  normalizedIdea: string,
  previewScores: Readonly<Record<string, number>>,
): number {
  const baseScore = previewScores[call.id] ?? 0;
  const boost = keywordBoostForGrant(normalizedIdea, call.id);
  const lengthBonus = normalizedIdea.length >= 40 ? 4 : normalizedIdea.length >= 20 ? 2 : 0;
  return Math.min(baseScore + boost + lengthBonus, 98);
}

function buildEstimatedSupportLabel(amountMinor: AmountMinor): string {
  return `Program üst limiti: ${formatAmountMinorAsWholeTry(amountMinor)}`;
}

/**
 * Fikir metnini analiz ederek en uygun aktif hibe programını döndürür.
 * Yalnız ACTIVE ve CLOSING_SOON çağrılar değerlendirilir.
 */
export function validatePreviewIdea(
  ideaText: string,
  calls: readonly GrantCallWithMeta[],
): PreviewIdeaValidationResult | null {
  const trimmed = ideaText.trim();
  if (trimmed.length < MIN_IDEA_LENGTH) return null;

  const activeCalls = calls.filter(isMatchableGrantCall);
  if (activeCalls.length === 0) return null;

  const normalizedIdea = normalizeIdeaText(trimmed);
  const previewScores = buildPreviewMatchScoresByGrantId(activeCalls);

  const ranked = activeCalls
    .map((call) => ({
      call,
      score: scoreForCall(call, normalizedIdea, previewScores),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best) return null;

  const runnerUp = ranked[1] ?? null;
  const programLabel = buildProgramLabel(
    best.call,
    runnerUp?.call ?? null,
    best.score,
    runnerUp?.score ?? 0,
  );

  return {
    grantId: best.call.id,
    programLabel,
    matchScorePct: best.score,
    estimatedSupportLabel: buildEstimatedSupportLabel(best.call.maxSupportMinor),
  };
}

/**
 * Önizleme yedeği — fikir metni yokken vitrine örnek sonuç verir.
 * Skor, varsayılan önizleme profiliyle hesaplanır (sabit değer yoktur).
 * Aktif çağrı yoksa `null` döner; hibe tavanı olmayan bir çağrı için tutar üretilmez.
 */
export function getPreviewIdeaValidatorFallback(
  calls: readonly GrantCallWithMeta[],
): PreviewIdeaValidationResult | null {
  const activeCalls = calls.filter(isMatchableGrantCall);
  const tubitak = activeCalls.find((call) => call.id === TUBITAK_1501_GRANT_ID) ?? activeCalls[0];
  if (!tubitak) return null;

  const kosgeb =
    activeCalls.find((call) => call.id === KOSGEB_ARGE_GRANT_ID && call.id !== tubitak.id) ?? null;
  const programLabel = kosgeb
    ? `${shortProgramLabel(tubitak)} / ${shortProgramLabel(kosgeb)}`
    : shortProgramLabel(tubitak);
  const matchScorePct = buildPreviewMatchScoresByGrantId(activeCalls)[tubitak.id] ?? 0;

  return {
    grantId: tubitak.id,
    programLabel,
    matchScorePct,
    estimatedSupportLabel: buildEstimatedSupportLabel(tubitak.maxSupportMinor),
  };
}
