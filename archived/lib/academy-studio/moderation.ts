/**
 * Akademi vatandaş metin gümrüğü — canlı soru ve mühürlü yorum.
 * Client-safe: GEMINI yok, sicil yok. Küfür / hakaret / nefret / şiddet taranır;
 * ihlal metni günlüğe yazılmaz. 03.33 üç kanallı yorum kararı (A/B/C) aynı katlamayı kullanır.
 */

import type { AcademyCourseLevel } from "@/lib/academy/course-level";
import { ACADEMY_SEN } from "@/lib/copy/sen-voice/academy";

export type AcademyModerationChannel = "question" | "review";

export type AcademyModerationVerdict =
  | { ok: true }
  | { ok: false; code: "POLICY_VIOLATION"; channel: AcademyModerationChannel };

/** Tam token — kısa argo; bitişik eğitim sözcüklerini (mühendislik, doldur) yemez. */
const TOKEN_DENY = new Set([
  "amk",
  "amq",
  "aq",
  "sik",
  "pic",
  "pust",
  "ibne",
  "kahpe",
  "salak",
  "aptal",
  "gavat",
  "manyak",
  "dangalak",
  "gerizekali",
  "yarak",
  "yarrak",
  "amcik",
  "fuck",
  "shit",
  "bitch",
  "asshole",
]);

/** Sıkıştırılmış haystack — boşluk/noktalama/leet kırılımını yakalar. */
const PHRASE_DENY = [
  "siktir",
  "sikeyim",
  "sikiyim",
  "siktigim",
  "hassiktir",
  "orospu",
  "orospucocugu",
  "aminakoyayim",
  "aminakoyim",
  "aminakoy",
  "ananisikiyim",
  "gotveren",
  "gotunu",
  "gotune",
  "pezevenk",
  "serefsiz",
  "gerizeka",
  "oldurecegim",
  "oldureyim",
  "oldurucem",
  "oldururum",
  "gebertirim",
  "gebert",
  "tecavuz",
  "kafasikes",
  "kafanikeseyim",
  "lincet",
  "motherfucker",
];

function collapseRepeatLetters(value: string): string {
  return value.replace(/(.)\1+/gu, "$1");
}

function mergeSingletonTokens(tokens: readonly string[]): string[] {
  const merged: string[] = [];
  let buffer = "";
  for (const token of tokens) {
    if (token.length === 1) {
      buffer += token;
      continue;
    }
    if (buffer) {
      merged.push(buffer);
      buffer = "";
    }
    merged.push(token);
  }
  if (buffer) {
    merged.push(buffer);
  }
  return merged;
}

function foldAcademyCitizenText(text: string): { compact: string; tokens: readonly string[] } {
  const folded = text
    .toLocaleLowerCase("tr-TR")
    .replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f]/gu, "")
    .replace(/ı/gu, "i")
    .replace(/ğ/gu, "g")
    .replace(/ü/gu, "u")
    .replace(/ş/gu, "s")
    .replace(/ç/gu, "c")
    .replace(/ö/gu, "o")
    .replace(/â/gu, "a")
    .replace(/î/gu, "i")
    .replace(/û/gu, "u")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/@/gu, "a")
    .replace(/0/gu, "o")
    .replace(/[1!|]/gu, "i")
    .replace(/3/gu, "e")
    .replace(/4/gu, "a")
    .replace(/5/gu, "s")
    .replace(/\$/gu, "s")
    .replace(/7/gu, "t");
  const rawTokens = folded
    .replace(/[^a-z]+/gu, " ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map(collapseRepeatLetters);
  const tokens = mergeSingletonTokens(rawTokens).map(collapseRepeatLetters);
  return { compact: tokens.join(""), tokens };
}

export function isAcademyCitizenTextClean(text: string): boolean {
  const trimmed = text.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return true;
  }
  const { compact, tokens } = foldAcademyCitizenText(trimmed);
  if (tokens.some((token) => TOKEN_DENY.has(token))) {
    return false;
  }
  if (TOKEN_DENY.has(compact)) {
    return false;
  }
  return !PHRASE_DENY.some((phrase) => compact.includes(phrase));
}

export function academyModeratorPolicyMessage(channel: AcademyModerationChannel): string {
  return channel === "question" ? ACADEMY_SEN.studio.policyReject : ACADEMY_SEN.review.policyReject;
}

export function scanAcademyCitizenText(
  text: string,
  channel: AcademyModerationChannel,
): AcademyModerationVerdict {
  if (isAcademyCitizenTextClean(text)) {
    return { ok: true };
  }
  return { ok: false, code: "POLICY_VIOLATION", channel };
}

export function isAcademyModeratorPolicyReject(message: string): boolean {
  return (
    message === ACADEMY_SEN.studio.policyReject || message === ACADEMY_SEN.review.policyReject
  );
}

/** 03.33 üç kanallı yorum kararı — client-safe süzgeç; LLM yok. */
export const ACADEMY_REVIEW_DECISION_A = "KULLANICI_YANILGISI" as const;
export const ACADEMY_REVIEW_DECISION_B = "KAPSAM_DISI" as const;
export const ACADEMY_REVIEW_DECISION_C = "REVİZYON_TALEBİ" as const;

export const ACADEMY_REVIEW_DECISIONS = [
  ACADEMY_REVIEW_DECISION_A,
  ACADEMY_REVIEW_DECISION_B,
  ACADEMY_REVIEW_DECISION_C,
] as const;

export type AcademyReviewDecision = (typeof ACADEMY_REVIEW_DECISIONS)[number];

export const ACADEMY_REVIEW_REVISION_TAG = ACADEMY_REVIEW_DECISION_C;

const MISCONCEPTION_NEEDLES: readonly { needle: string; correction: string }[] = [
  {
    needle: "satinalmabelge",
    correction: ACADEMY_SEN.review.misconceptionDefault,
  },
  {
    needle: "odemesertifika",
    correction:
      "Ödeme ders erişimini açar. Sertifika yalnız sınav barajından (70+) sonra basılır.",
  },
  {
    needle: "belgebasar",
    correction: "Satın alma belge basmaz. Belge kapısı müfredat sınavındadır (70+).",
  },
  {
    needle: "barajso",
    correction: "Sınav barajı 70 puandır. 50 yeterli sayılmaz.",
  },
  {
    needle: "barajelli",
    correction: "Sınav barajı 70 puandır.",
  },
  {
    needle: "fiyatkodda",
    correction: "Satış fiyatı kod sabiti değildir; canlı tutar katalog satırından okunur.",
  },
  {
    needle: "fiyatkodsabiti",
    correction: "Satış fiyatı kod sabiti değildir; canlı tutar katalog satırından okunur.",
  },
  {
    needle: "akademideemanet",
    correction: "Akademi tahsilatı cüzdandan düşer; emanet bloğu açılmaz.",
  },
  {
    needle: "emanetakademi",
    correction: "Akademi tahsilatı cüzdandan düşer; emanet bloğu açılmaz.",
  },
  {
    needle: "videocms",
    correction: "Müfredat metin tohumudur. CMS ve video üretim hattı yoktur.",
  },
  {
    needle: "youtubegom",
    correction: "Müfredat metin tohumudur. CMS ve YouTube gömüsü yoktur.",
  },
];

const MISCONCEPTION_PHRASES = [
  "saniyordum",
  "yanlismi",
  "kafakaris",
  "anlamadimgaliba",
  "degilmiydi",
] as const;

const REVISION_PHRASES = [
  "eksik",
  "hatavar",
  "yanlisanlat",
  "yanlisanlatil",
  "celiski",
  "celisiyor",
  "gunceldegil",
  "semabozuk",
  "parametretablosuyok",
  "ornekkayityok",
  "adimyanlis",
  "kiriksema",
  "calismiyor",
  "dipnotyok",
  "duzeltilmeli",
  "revizyon",
] as const;

const OUT_OF_SCOPE_PHRASES = [
  "nedenyok",
  "anlatilmaliydi",
  "kapsamdisi",
  "ileriseviye",
  "ortaseviye",
  "ustseviye",
  "budersteyok",
  "nedenanlatilmiyor",
] as const;

const SCOPE_TOPICS: readonly { token: string; owners: readonly string[] }[] = [
  { token: "kubernetes", owners: ["devops-temel", "devops-orta", "devops-ileri"] },
  { token: "terraform", owners: ["devops-temel", "devops-orta", "devops-ileri"] },
  { token: "devops", owners: ["devops-temel", "devops-orta", "devops-ileri"] },
  { token: "docker", owners: ["devops-orta", "devops-ileri"] },
  { token: "iso27001", owners: ["sec-temel", "sec-orta", "sec-ileri", "devops-ileri"] },
  { token: "flutter", owners: ["flutter-temel", "flutter-orta", "flutter-ileri"] },
  { token: "dartlang", owners: ["flutter-temel", "flutter-orta", "flutter-ileri"] },
  { token: "crossplatform", owners: ["flutter-temel", "flutter-orta", "flutter-ileri", "rn-temel", "rn-orta", "rn-ileri"] },
  { token: "reactnative", owners: ["rn-temel", "rn-orta", "rn-ileri"] },
  { token: "unity", owners: ["gam-temel", "gam-orta", "gam-ileri"] },
  { token: "addressable", owners: ["gam-ileri"] },
  { token: "iap", owners: ["gam-orta", "gam-ileri"] },
  { token: "mlflow", owners: ["mlo-temel"] },
  { token: "dvc", owners: ["mlo-temel"] },
  { token: "mlops", owners: ["mlo-temel"] },
  { token: "modelregistry", owners: ["mlo-temel"] },
  { token: "loadbalancing", owners: ["sys-temel"] },
  { token: "cacheaside", owners: ["sys-temel"] },
  { token: "sharding", owners: ["sys-temel"] },
  { token: "ratelimit", owners: ["sys-temel"] },
  { token: "fullstack", owners: ["fullstack-temel", "fullstack-orta", "fullstack-ileri"] },
  { token: "reactnode", owners: ["fullstack-temel", "fullstack-orta", "fullstack-ileri"] },
  { token: "promptmuhendis", owners: ["ai-temel", "ai-orta", "ai-ileri"] },
  { token: "freelance", owners: ["ux-temel", "ux-orta", "ux-ileri", "pm-temel"] },
  { token: "pazaryeri", owners: ["ux-temel", "ux-orta", "ux-ileri"] },
  { token: "productowner", owners: ["pm-temel", "pm-orta", "pm-ileri"] },
  { token: "isanalist", owners: ["pm-temel", "pm-orta", "pm-ileri"] },
  { token: "pentest", owners: ["sec-temel", "sec-orta", "sec-ileri"] },
  { token: "phishing", owners: ["sec-temel", "sec-orta"] },
];

export type AcademyReviewDecisionInput = {
  comment: string;
  stars: number;
  courseSlug?: string | null;
  courseLevel?: AcademyCourseLevel | null;
};

export type AcademyReviewDecisionVerdict =
  | { decision: AcademyReviewDecision; correction: string | null }
  | { decision: null; correction: null };

function countNeedleHits(compact: string, needles: readonly string[]): number {
  let hits = 0;
  for (const needle of needles) {
    if (compact.includes(needle)) {
      hits += 1;
    }
  }
  return hits;
}

function misconceptionHit(compact: string): { hits: number; correction: string | null } {
  let hits = 0;
  let correction: string | null = null;
  for (const row of MISCONCEPTION_NEEDLES) {
    if (compact.includes(row.needle)) {
      hits += 1;
      correction ??= row.correction;
    }
  }
  hits += countNeedleHits(compact, MISCONCEPTION_PHRASES);
  return { hits, correction };
}

function outOfScopeTopicHits(compact: string, courseSlug: string | null | undefined): number {
  let hits = 0;
  for (const row of SCOPE_TOPICS) {
    if (!compact.includes(row.token)) {
      continue;
    }
    if (courseSlug && row.owners.includes(courseSlug)) {
      continue;
    }
    hits += 1;
  }
  return hits;
}

export function isAcademyReviewDecision(value: string): value is AcademyReviewDecision {
  return (ACADEMY_REVIEW_DECISIONS as readonly string[]).includes(value);
}

export function classifyAcademyReviewDecision(
  input: AcademyReviewDecisionInput,
): AcademyReviewDecisionVerdict {
  const trimmed = input.comment.replace(/\s+/gu, " ").trim();
  if (!trimmed) {
    return { decision: null, correction: null };
  }
  const { compact } = foldAcademyCitizenText(trimmed);
  const misconception = misconceptionHit(compact);
  const revisionHits = countNeedleHits(compact, REVISION_PHRASES);
  const scopePhrases =
    input.courseLevel === "İleri"
      ? OUT_OF_SCOPE_PHRASES.filter((phrase) => phrase !== "ileriseviye")
      : OUT_OF_SCOPE_PHRASES;
  const scopeHits =
    countNeedleHits(compact, scopePhrases) + outOfScopeTopicHits(compact, input.courseSlug);

  let best: AcademyReviewDecision | null = null;
  let bestScore = 0;
  const consider = (decision: AcademyReviewDecision, score: number) => {
    if (score <= 0) {
      return;
    }
    if (score > bestScore) {
      best = decision;
      bestScore = score;
      return;
    }
    if (score === bestScore && best) {
      if (input.stars <= 2) {
        const rank = { REVİZYON_TALEBİ: 3, KAPSAM_DISI: 2, KULLANICI_YANILGISI: 1 } as const;
        if (rank[decision] > rank[best]) {
          best = decision;
        }
      } else {
        const rank = { KULLANICI_YANILGISI: 3, KAPSAM_DISI: 2, REVİZYON_TALEBİ: 1 } as const;
        if (rank[decision] > rank[best]) {
          best = decision;
        }
      }
    }
  };
  consider(ACADEMY_REVIEW_DECISION_C, revisionHits * 2);
  consider(ACADEMY_REVIEW_DECISION_B, scopeHits * 2);
  consider(ACADEMY_REVIEW_DECISION_A, misconception.hits * 2);

  if (best === null) {
    return { decision: null, correction: null };
  }
  const decided: AcademyReviewDecision = best;
  return {
    decision: decided,
    correction: decided === ACADEMY_REVIEW_DECISION_A ? misconception.correction : null,
  };
}
