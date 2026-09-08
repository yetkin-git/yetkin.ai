import {
  ACADEMY_ONBOARDING_COURSE_SLUG,
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  LISTING_VISA_PATHWAY_BY_JOB_ID,
  UIUX_URUN_FREELANCE_LISTING_PATHWAY,
  YAZILIM_BULUT_LISTING_PATHWAY,
  YZ_ICERIK_LISTING_PATHWAY,
  academySlugFromCourseTitle,
  catalogPathwayRingSlugs,
  isFreelancerNeedId,
  qualifyingCourseSlugsForNeed,
  type FreelancerNeedId,
  type ListingVisaLockId,
} from "@/lib/kernel/catalog-ids";

export {
  AGILE_ESG_SIBER_LISTING_PATHWAY,
  FREELANCER_LISTING_VISA_DOORS,
  FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY,
  LISTING_VISA_PATHWAY_BY_JOB_ID,
  RAYLI_BIM_LISTING_PATHWAY,
  SIBER_AGILE_ESG_LISTING_PATHWAY,
  TASARIM_FINTEK_BULUT_LISTING_PATHWAY,
  TEKNIK_URUN_AGILE_LISTING_PATHWAY,
  UIUX_URUN_FREELANCE_LISTING_PATHWAY,
  YAZILIM_BULUT_LISTING_PATHWAY,
  YZ_ICERIK_LISTING_PATHWAY,
  parseListingVisaPathwayId,
} from "@/lib/kernel/catalog-ids";

/** İlan kapısının okuduğu yüzey — motor tutar/BPS taşımaz. */
export type ListingVisaSubject = {
  id?: string;
  title: string;
  brief: string;
  /** Kilitli ihtiyaç veya eski dikey. Varsa regex/kelime tahmini kullanılmaz. */
  visaPathwayId?: ListingVisaLockId | null;
};

export type ListingVisaPathwaySource = "explicit" | "job-id" | "phrase" | "none";

export type ListingVisaPathwayResolution = {
  pathwayId: ListingVisaLockId | null;
  source: ListingVisaPathwaySource;
};

export const YZ_LISTING_VISA_SUBJECT: ListingVisaSubject = {
  title: "Chatbot kurulumu",
  brief: "WhatsApp ve web chatbot; Voiceflow ve Botpress. Teklif Kariyer Vizesi ister.",
};

/** Freelancer örnek ilanı — sosyal içerik & görsel üretim. */
export const FREELANCE_LISTING_VISA_SUBJECT: ListingVisaSubject = {
  title: "Nitelikli freelance teslimi",
  brief: "Dikey: sosyal medya içerik ve görsel üretim. Teklif Kariyer belgesi ister.",
};

/** @deprecated Eski BIM konusu; yeni freelance öznesine yönlendir. */
export const BIM_LISTING_VISA_SUBJECT = FREELANCE_LISTING_VISA_SUBJECT;

export function qualifyingCourseSlugsForListingPathway(
  lockId: ListingVisaLockId,
): readonly string[] {
  const slugs = isFreelancerNeedId(lockId)
    ? qualifyingCourseSlugsForNeed(lockId)
    : catalogPathwayRingSlugs(lockId);
  if (ACADEMY_ONBOARDING_COURSE_SLUG === null) {
    return slugs;
  }
  return slugs.filter((slug) => slug !== ACADEMY_ONBOARDING_COURSE_SLUG);
}

type ListingVisaPhraseRule = {
  pathwayId: FreelancerNeedId;
  phrases: readonly string[];
  weight: number;
};

/**
 * Kelime kataloğu — yayın 5 SKU ile dürüst. Siber/sızma ve fullstack
 * ifadeleri kapı açmaz (fail-closed); pentest belgesi vitrinde yoktur.
 */
const LISTING_VISA_PHRASE_RULES: readonly ListingVisaPhraseRule[] = [
  {
    pathwayId: "excel-veri-otomasyon",
    weight: 3,
    phrases: ["excel", "ofis yapay zeka", "word otomasyon", "e-posta otomasyon"],
  },
  {
    pathwayId: YAZILIM_BULUT_LISTING_PATHWAY,
    weight: 3,
    phrases: ["trendyol", "hepsiburada", "shopify", "e-ticaret", "eticaret", "pazaryeri asistan"],
  },
  {
    pathwayId: UIUX_URUN_FREELANCE_LISTING_PATHWAY,
    weight: 3,
    phrases: ["sosyal medya", "gorsel uretim", "midjourney", "capcut", "figma", "ui ux", "uiux"],
  },
  {
    pathwayId: UIUX_URUN_FREELANCE_LISTING_PATHWAY,
    weight: 1,
    phrases: ["freelance"],
  },
  {
    pathwayId: YZ_ICERIK_LISTING_PATHWAY,
    weight: 3,
    phrases: ["chatbot", "whatsapp", "voiceflow", "botpress", "kodsuz bot"],
  },
  {
    pathwayId: "prompt-uretkenlik",
    weight: 3,
    phrases: ["prompt", "chatgpt", "claude", "perplexity"],
  },
];

function foldListingText(value: string): string {
  return value
    .replaceAll("İ", "i")
    .replaceAll("I", "i")
    .toLowerCase()
    .replaceAll("ı", "i")
    .replaceAll("â", "a")
    .replaceAll("î", "i")
    .replaceAll("û", "u")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("ç", "c");
}

function listingVisaHaystack(listing: ListingVisaSubject): string {
  const folded = foldListingText(`${listing.title}\n${listing.brief}`)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return ` ${folded} `;
}

function listingVisaNeedle(phrase: string): string {
  const folded = foldListingText(phrase)
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return ` ${folded} `;
}

function scoreListingVisaPhrases(listing: ListingVisaSubject): Map<FreelancerNeedId, number> {
  const haystack = listingVisaHaystack(listing);
  const scores = new Map<FreelancerNeedId, number>();
  for (const rule of LISTING_VISA_PHRASE_RULES) {
    for (const phrase of rule.phrases) {
      if (!haystack.includes(listingVisaNeedle(phrase))) {
        continue;
      }
      scores.set(rule.pathwayId, (scores.get(rule.pathwayId) ?? 0) + rule.weight);
    }
  }
  return scores;
}

function winningListingVisaPathway(scores: Map<FreelancerNeedId, number>): FreelancerNeedId | null {
  let winner: FreelancerNeedId | null = null;
  let best = 0;
  let tied = false;
  for (const [pathwayId, score] of scores) {
    if (score > best) {
      winner = pathwayId;
      best = score;
      tied = false;
      continue;
    }
    if (score === best && score > 0 && pathwayId !== winner) {
      tied = true;
    }
  }
  if (tied || best === 0) {
    return null;
  }
  return winner;
}

export function inspectListingVisaPathway(listing: ListingVisaSubject): ListingVisaPathwayResolution {
  if (listing.visaPathwayId) {
    return { pathwayId: listing.visaPathwayId, source: "explicit" };
  }
  if (listing.id && LISTING_VISA_PATHWAY_BY_JOB_ID[listing.id]) {
    return { pathwayId: LISTING_VISA_PATHWAY_BY_JOB_ID[listing.id] ?? null, source: "job-id" };
  }
  const pathwayId = winningListingVisaPathway(scoreListingVisaPhrases(listing));
  if (!pathwayId) {
    return { pathwayId: null, source: "none" };
  }
  return { pathwayId, source: "phrase" };
}

export function resolveListingVisaPathway(listing: ListingVisaSubject): ListingVisaLockId | null {
  return inspectListingVisaPathway(listing).pathwayId;
}

/** İlan yazım kilidi: açık id → kestirim → oda varsayılanı. Hiçbir zaman null. */
export function lockListingVisaPathway(listing: ListingVisaSubject): ListingVisaLockId {
  return inspectListingVisaPathway(listing).pathwayId ?? FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY;
}

export function listingVisaCourseSlugFromStampTitle(title: string): string | null {
  return academySlugFromCourseTitle(title);
}

export function listingVisaCourseSlugFromStamp(input: {
  title: string;
  courseSlug?: string | null;
}): string | null {
  const fromCourse = input.courseSlug?.trim();
  if (fromCourse) {
    return fromCourse;
  }
  return listingVisaCourseSlugFromStampTitle(input.title);
}
