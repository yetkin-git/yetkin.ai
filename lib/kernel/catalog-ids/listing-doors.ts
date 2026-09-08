/**
 * İlan kapısı sicili — 5 dürüst SKU kapısı + serbest pazaryeri + Açık Deneme.
 * Eski dikey takma adlar yayın ihtiyaç id'sine yönlenir.
 */

import {
  FREELANCER_DEFAULT_NEED_ID,
  FREELANCER_NEED_IDS,
  parseListingVisaLockId,
  type FreelancerNeedId,
  type ListingVisaLockId,
} from "@/lib/kernel/catalog-ids/need-based-mapping";

export const YZ_ICERIK_LISTING_PATHWAY = "chatbot-musteri-hizmetleri" satisfies FreelancerNeedId;
export const YAZILIM_BULUT_LISTING_PATHWAY = "eticaret-pazaryeri" satisfies FreelancerNeedId;
export const SIBER_AGILE_ESG_LISTING_PATHWAY = "acik-deneme" satisfies FreelancerNeedId;
export const UIUX_URUN_FREELANCE_LISTING_PATHWAY = "logo-gorsel-sosyal-medya" satisfies FreelancerNeedId;
/** PM dikeyi canlı SKU taşımıyor — e-ticaret asistanlığı kapısına düşer. */
export const TEKNIK_URUN_AGILE_LISTING_PATHWAY = "eticaret-pazaryeri" satisfies FreelancerNeedId;

/** Organik ilan kilidi — kelime piyangosu yoksa ihtiyaç listesinin varsayılanı. */
export const FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY = FREELANCER_DEFAULT_NEED_ID;

/** Freelancer teklif kapıları — işveren ihtiyaç listesi; SKU eşlemesi arka plandadır. */
export const FREELANCER_LISTING_VISA_DOORS = FREELANCER_NEED_IDS;

export type FreelancerListingVisaDoor = FreelancerNeedId;

/** Geriye dönük takma adlar — test ve arşiv importları. */
export const RAYLI_BIM_LISTING_PATHWAY = YAZILIM_BULUT_LISTING_PATHWAY;
export const AGILE_ESG_SIBER_LISTING_PATHWAY = SIBER_AGILE_ESG_LISTING_PATHWAY;
export const TASARIM_FINTEK_BULUT_LISTING_PATHWAY = UIUX_URUN_FREELANCE_LISTING_PATHWAY;

/** Tohum freelancer ilanları — Büyüme Beşlisi 1:1 + Açık Deneme. */
export const LISTING_VISA_PATHWAY_BY_JOB_ID: Readonly<Record<string, FreelancerNeedId>> = {
  fj_rail_icon_set: "excel-veri-otomasyon",
  fj_rail_ql_banners: "eticaret-pazaryeri",
  fj_rail_seal_social: "logo-gorsel-sosyal-medya",
  fj_rail_academy_copy: "chatbot-musteri-hizmetleri",
  fj_rail_devlabs_prompts: "prompt-uretkenlik",
  fj_yetkin_acik_deneme: "acik-deneme",
};

/** Hazine tohum ilanı — gerçek işveren ilanı değildir. */
export function isFreelancerSystemListing(jobId: string): boolean {
  return Object.prototype.hasOwnProperty.call(LISTING_VISA_PATHWAY_BY_JOB_ID, jobId);
}

export function isFreelancerListingVisaDoor(value: string): value is FreelancerListingVisaDoor {
  return (FREELANCER_LISTING_VISA_DOORS as readonly string[]).includes(value);
}

export function parseListingVisaPathwayId(
  value: string | null | undefined,
): ListingVisaLockId | null {
  return parseListingVisaLockId(value);
}
