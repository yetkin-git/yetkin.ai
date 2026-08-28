/**
 * İlan kapısı sicili — hangi müfredat kimliği pazaryeri teklifini açar.
 * Kelime kestirimi kariyer odasındadır; kapı kimliği çekirdektedir.
 */

import {
  isAcademyPathwayId,
  type AcademyPathwayId,
} from "@/lib/kernel/catalog-ids/pathway-ids";

export const YZ_ICERIK_LISTING_PATHWAY = "yz-muhendislik-agent" satisfies AcademyPathwayId;
export const YAZILIM_BULUT_LISTING_PATHWAY = "fullstack-web-api" satisfies AcademyPathwayId;
export const SIBER_AGILE_ESG_LISTING_PATHWAY = "siber-guvenlik-pentest" satisfies AcademyPathwayId;
export const UIUX_URUN_FREELANCE_LISTING_PATHWAY = "uiux-tasarim-sistemleri" satisfies AcademyPathwayId;
export const TEKNIK_URUN_AGILE_LISTING_PATHWAY = "teknik-urun-yonetimi-agile" satisfies AcademyPathwayId;

/** Organik ilan kilidi — kelime piyangosu yoksa freelancer odasının native dikeyi. */
export const FREELANCER_ROOM_DEFAULT_LISTING_PATHWAY = UIUX_URUN_FREELANCE_LISTING_PATHWAY;

/** Freelancer teklif kapıları — akademi dikeylerinin tamamı değil, ilan kilidi sicili. */
export const FREELANCER_LISTING_VISA_DOORS = [
  YZ_ICERIK_LISTING_PATHWAY,
  YAZILIM_BULUT_LISTING_PATHWAY,
  SIBER_AGILE_ESG_LISTING_PATHWAY,
  UIUX_URUN_FREELANCE_LISTING_PATHWAY,
  TEKNIK_URUN_AGILE_LISTING_PATHWAY,
] as const;

export type FreelancerListingVisaDoor = (typeof FREELANCER_LISTING_VISA_DOORS)[number];

/** Geriye dönük takma adlar — test ve arşiv importları. */
export const RAYLI_BIM_LISTING_PATHWAY = YAZILIM_BULUT_LISTING_PATHWAY;
export const AGILE_ESG_SIBER_LISTING_PATHWAY = SIBER_AGILE_ESG_LISTING_PATHWAY;
export const TASARIM_FINTEK_BULUT_LISTING_PATHWAY = UIUX_URUN_FREELANCE_LISTING_PATHWAY;

/** Tohum freelancer ilanları — hepsi YZ mühendislik dikeyi. */
export const LISTING_VISA_PATHWAY_BY_JOB_ID: Readonly<Record<string, AcademyPathwayId>> = {
  fj_rail_icon_set: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_ql_banners: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_academy_copy: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_devlabs_prompts: YZ_ICERIK_LISTING_PATHWAY,
  fj_rail_seal_social: YZ_ICERIK_LISTING_PATHWAY,
};

export function isFreelancerListingVisaDoor(value: string): value is FreelancerListingVisaDoor {
  return (FREELANCER_LISTING_VISA_DOORS as readonly string[]).includes(value);
}

export function parseListingVisaPathwayId(value: string | null | undefined): AcademyPathwayId | null {
  if (!value) {
    return null;
  }
  return isAcademyPathwayId(value) ? value : null;
}
