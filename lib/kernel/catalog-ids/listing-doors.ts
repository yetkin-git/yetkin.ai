/**
 * İlan kapısı sicili — 6 ihtiyaç kapısı. Eski dikey takma adlar ihtiyaç id'sine yönlenir.
 */

import {
  FREELANCER_DEFAULT_NEED_ID,
  FREELANCER_NEED_IDS,
  parseListingVisaLockId,
  type FreelancerNeedId,
  type ListingVisaLockId,
} from "@/lib/kernel/catalog-ids/need-based-mapping";

export const YZ_ICERIK_LISTING_PATHWAY = "ai-agent-entegrasyon" satisfies FreelancerNeedId;
export const YAZILIM_BULUT_LISTING_PATHWAY = "web-sitesi-yazilim" satisfies FreelancerNeedId;
export const SIBER_AGILE_ESG_LISTING_PATHWAY = "siber-guvenlik-sunucu-test" satisfies FreelancerNeedId;
export const UIUX_URUN_FREELANCE_LISTING_PATHWAY = "logo-gorsel-sosyal-medya" satisfies FreelancerNeedId;
/** PM dikeyi canlı SKU taşımıyor — yazılım kapısına düşer. */
export const TEKNIK_URUN_AGILE_LISTING_PATHWAY = "web-sitesi-yazilim" satisfies FreelancerNeedId;

/** Organik ilan kilidi — kelime piyangosu yoksa ihtiyaç listesinin ilk kapısı. */
export const FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY = FREELANCER_DEFAULT_NEED_ID;

/** Freelancer teklif kapıları — işveren ihtiyaç listesi; SKU eşlemesi arka plandadır. */
export const FREELANCER_LISTING_VISA_DOORS = FREELANCER_NEED_IDS;

export type FreelancerListingVisaDoor = FreelancerNeedId;

/** Geriye dönük takma adlar — test ve arşiv importları. */
export const RAYLI_BIM_LISTING_PATHWAY = YAZILIM_BULUT_LISTING_PATHWAY;
export const AGILE_ESG_SIBER_LISTING_PATHWAY = SIBER_AGILE_ESG_LISTING_PATHWAY;
export const TASARIM_FINTEK_BULUT_LISTING_PATHWAY = UIUX_URUN_FREELANCE_LISTING_PATHWAY;

/** Tohum freelancer ilanları — AI Agent ihtiyaç kapısı. */
export const LISTING_VISA_PATHWAY_BY_JOB_ID: Readonly<Record<string, FreelancerNeedId>> = {
  fj_rail_icon_set: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_ql_banners: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_academy_copy: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_devlabs_prompts: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_seal_social: YZ_ICERIK_LISTING_PATHWAY,
};

export function isFreelancerListingVisaDoor(value: string): value is FreelancerListingVisaDoor {
  return (FREELANCER_LISTING_VISA_DOORS as readonly string[]).includes(value);
}

export function parseListingVisaPathwayId(
  value: string | null | undefined,
): ListingVisaLockId | null {
  return parseListingVisaLockId(value);
}
